from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order import Order, OrderItem, OrderStatus
from app.repositories.customer import CustomerRepository
from app.repositories.inventory import InventoryRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.dashboard import DashboardCharts, DashboardResponse, DashboardStats, MonthlySales, TopProduct
from app.schemas.order import OrderResponse


class DashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.order_repo = OrderRepository(db)
        self.inventory_repo = InventoryRepository(db)

    def get_dashboard(self) -> DashboardResponse:
        revenue = (
            self.db.query(func.coalesce(func.sum(Order.total_amount), 0))
            .filter(Order.status.in_([OrderStatus.CONFIRMED, OrderStatus.COMPLETED]))
            .scalar()
        )
        stats = DashboardStats(
            total_products=self.product_repo.count_active(),
            total_customers=self.customer_repo.count_all(),
            total_orders=self.order_repo.count_all(),
            total_revenue=Decimal(str(revenue or 0)),
            low_stock_count=self.product_repo.count_low_stock(),
        )
        recent = [OrderResponse.model_validate(o) for o in self.order_repo.recent(5)]
        charts = self._get_charts()
        return DashboardResponse(stats=stats, recent_orders=recent, charts=charts)

    def _get_charts(self) -> DashboardCharts:
        sales_rows = (
            self.db.query(
                func.to_char(Order.created_at, "YYYY-MM").label("month"),
                func.sum(Order.total_amount).label("revenue"),
                func.count(Order.id).label("orders"),
            )
            .filter(Order.status.in_([OrderStatus.CONFIRMED, OrderStatus.COMPLETED]))
            .group_by("month")
            .order_by("month")
            .limit(12)
            .all()
        )
        monthly_sales = [
            MonthlySales(month=r.month, revenue=Decimal(str(r.revenue or 0)), orders=r.orders)
            for r in sales_rows
        ]

        top_rows = (
            self.db.query(
                OrderItem.product_id,
                func.sum(OrderItem.quantity).label("qty"),
                func.sum(OrderItem.subtotal).label("rev"),
            )
            .join(Order)
            .filter(Order.status.in_([OrderStatus.CONFIRMED, OrderStatus.COMPLETED]))
            .group_by(OrderItem.product_id)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(5)
            .all()
        )
        top_products = []
        for row in top_rows:
            product = self.product_repo.get_by_id(row.product_id)
            top_products.append(
                TopProduct(
                    product_id=row.product_id,
                    product_name=product.name if product else "Unknown",
                    total_quantity=int(row.qty or 0),
                    total_revenue=Decimal(str(row.rev or 0)),
                )
            )

        trends = self.inventory_repo.monthly_trends()
        from app.schemas.dashboard import InventoryTrend

        inventory_trends = [InventoryTrend(**t) for t in trends]

        return DashboardCharts(
            monthly_sales=monthly_sales,
            top_products=top_products,
            inventory_trends=inventory_trends,
        )
