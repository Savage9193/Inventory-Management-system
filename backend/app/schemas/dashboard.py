from decimal import Decimal

from pydantic import BaseModel

from app.schemas.order import OrderResponse


class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    low_stock_count: int


class MonthlySales(BaseModel):
    month: str
    revenue: Decimal
    orders: int


class TopProduct(BaseModel):
    product_id: int
    product_name: str
    total_quantity: int
    total_revenue: Decimal


class InventoryTrend(BaseModel):
    month: str
    stock_in: int
    stock_out: int


class DashboardCharts(BaseModel):
    monthly_sales: list[MonthlySales]
    top_products: list[TopProduct]
    inventory_trends: list[InventoryTrend]


class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_orders: list[OrderResponse]
    charts: DashboardCharts
