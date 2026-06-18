from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.inventory import InventoryMovement, MovementType


class InventoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, product_id: int, movement_type: MovementType, quantity: int, reference: str) -> InventoryMovement:
        movement = InventoryMovement(
            product_id=product_id,
            type=movement_type,
            quantity=quantity,
            reference=reference,
        )
        self.db.add(movement)
        self.db.flush()
        return movement

    def list_query(self, product_id: int | None, movement_type: MovementType | None):
        q = self.db.query(InventoryMovement)
        if product_id:
            q = q.filter(InventoryMovement.product_id == product_id)
        if movement_type:
            q = q.filter(InventoryMovement.type == movement_type)
        return q.order_by(InventoryMovement.created_at.desc())

    def report_summary(self) -> dict:
        total = self.db.query(InventoryMovement).count()
        stock_in = (
            self.db.query(func.coalesce(func.sum(InventoryMovement.quantity), 0))
            .filter(InventoryMovement.type == MovementType.STOCK_IN)
            .scalar()
        )
        stock_out = (
            self.db.query(func.coalesce(func.sum(InventoryMovement.quantity), 0))
            .filter(InventoryMovement.type == MovementType.STOCK_OUT)
            .scalar()
        )
        adjustments = (
            self.db.query(func.coalesce(func.sum(func.abs(InventoryMovement.quantity)), 0))
            .filter(InventoryMovement.type == MovementType.ADJUSTMENT)
            .scalar()
        )
        return {
            "total_movements": total,
            "stock_in": int(stock_in or 0),
            "stock_out": int(stock_out or 0),
            "adjustments": int(adjustments or 0),
        }

    def monthly_trends(self, months: int = 6) -> list[dict]:
        rows = (
            self.db.query(
                func.to_char(InventoryMovement.created_at, "YYYY-MM").label("month"),
                InventoryMovement.type,
                func.sum(InventoryMovement.quantity).label("qty"),
            )
            .group_by("month", InventoryMovement.type)
            .order_by("month")
            .limit(months * 5)
            .all()
        )
        trends: dict[str, dict] = {}
        for row in rows:
            if row.month not in trends:
                trends[row.month] = {"month": row.month, "stock_in": 0, "stock_out": 0}
            if row.type in (MovementType.STOCK_IN, MovementType.ORDER_CANCELLED):
                trends[row.month]["stock_in"] += int(row.qty or 0)
            elif row.type in (MovementType.STOCK_OUT, MovementType.ORDER_CREATED):
                trends[row.month]["stock_out"] += int(row.qty or 0)
        return list(trends.values())
