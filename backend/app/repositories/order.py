from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: int) -> Order | None:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def create(self, order: Order) -> Order:
        self.db.add(order)
        self.db.flush()
        return order

    def list_query(self, status: OrderStatus | None, customer_id: int | None):
        q = self.db.query(Order)
        if status:
            q = q.filter(Order.status == status)
        if customer_id:
            q = q.filter(Order.customer_id == customer_id)
        return q.order_by(Order.created_at.desc())

    def generate_order_number(self) -> str:
        ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        count = self.db.query(Order).count() + 1
        return f"ORD-{ts}-{count:04d}"

    def count_all(self) -> int:
        return self.db.query(Order).count()

    def recent(self, limit: int = 5) -> list[Order]:
        return self.db.query(Order).order_by(Order.created_at.desc()).limit(limit).all()

    def add_item(self, item: OrderItem) -> OrderItem:
        self.db.add(item)
        self.db.flush()
        return item
