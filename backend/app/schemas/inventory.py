from datetime import datetime

from app.models.inventory import MovementType
from app.schemas.common import BaseSchema
from app.schemas.product import ProductResponse


class InventoryMovementResponse(BaseSchema):
    id: int
    product_id: int
    type: MovementType
    quantity: int
    reference: str
    created_at: datetime
    product: ProductResponse | None = None


class InventoryReport(BaseSchema):
    total_movements: int
    stock_in: int
    stock_out: int
    adjustments: int
