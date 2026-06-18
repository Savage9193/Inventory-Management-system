from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.inventory import MovementType
from app.models.order import Order, OrderItem, OrderStatus
from app.repositories.customer import CustomerRepository
from app.repositories.inventory import InventoryRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.order import OrderCreate
from app.utils.pagination import paginate_query


class OrderService:
    def __init__(self, db: Session):
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.inventory_repo = InventoryRepository(db)
        self.db = db

    def create(self, data: OrderCreate):
        if not data.items:
            raise AppException("Order must contain at least one item", 400)

        customer = self.customer_repo.get_by_id(data.customer_id)
        if not customer:
            raise AppException("Customer not found", 404)

        try:
            order = Order(
                order_number=self.order_repo.generate_order_number(),
                customer_id=data.customer_id,
                status=OrderStatus.PENDING,
                total_amount=Decimal("0"),
            )
            self.order_repo.create(order)
            total = Decimal("0")

            for item_data in data.items:
                product = self.product_repo.get_for_update(item_data.product_id)
                if not product:
                    raise AppException(f"Product {item_data.product_id} not found", 404)
                if product.stock_quantity < item_data.quantity:
                    raise AppException(
                        f"Insufficient stock for {product.name}. Available: {product.stock_quantity}",
                        400,
                    )

                subtotal = product.price * item_data.quantity
                item = OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=item_data.quantity,
                    unit_price=product.price,
                    subtotal=subtotal,
                )
                self.order_repo.add_item(item)
                product.stock_quantity -= item_data.quantity
                self.inventory_repo.create(
                    product.id,
                    MovementType.ORDER_CREATED,
                    item_data.quantity,
                    f"Order {order.order_number}",
                )
                total += subtotal

            order.total_amount = total
            order.status = OrderStatus.CONFIRMED
            self.db.commit()
            self.db.refresh(order)
            return order
        except AppException:
            self.db.rollback()
            raise
        except Exception:
            self.db.rollback()
            raise

    def get(self, order_id: int):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise AppException("Order not found", 404)
        return order

    def list(self, page: int, page_size: int, status: OrderStatus | None, customer_id: int | None):
        q = self.order_repo.list_query(status, customer_id)
        return paginate_query(q, page, page_size)

    def cancel(self, order_id: int):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise AppException("Order not found", 404)
        if order.status == OrderStatus.CANCELLED:
            raise AppException("Order already cancelled", 400)
        if order.status == OrderStatus.COMPLETED:
            raise AppException("Cannot cancel completed order", 400)

        try:
            for item in order.items:
                product = self.product_repo.get_for_update(item.product_id)
                if product:
                    product.stock_quantity += item.quantity
                    self.inventory_repo.create(
                        product.id,
                        MovementType.ORDER_CANCELLED,
                        item.quantity,
                        f"Cancelled {order.order_number}",
                    )
            order.status = OrderStatus.CANCELLED
            self.db.commit()
            self.db.refresh(order)
            return order
        except Exception:
            self.db.rollback()
            raise

    def complete(self, order_id: int):
        order = self.order_repo.get_by_id(order_id)
        if not order:
            raise AppException("Order not found", 404)
        if order.status != OrderStatus.CONFIRMED:
            raise AppException("Only confirmed orders can be completed", 400)
        order.status = OrderStatus.COMPLETED
        self.db.commit()
        self.db.refresh(order)
        return order
