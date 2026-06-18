from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import Permission, require_permissions
from app.models.inventory import MovementType
from app.schemas.common import PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.inventory import InventoryMovementResponse, InventoryReport
from app.schemas.product import ProductResponse
from app.services.inventory import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/history", response_model=PaginatedResponse[InventoryMovementResponse])
def inventory_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    product_id: int | None = None,
    movement_type: MovementType | None = None,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_INVENTORY, Permission.READ_PRODUCTS)),
):
    items, meta = InventoryService(db).history(page, page_size, product_id, movement_type)
    return PaginatedResponse(
        data=[InventoryMovementResponse.model_validate(i) for i in items],
        meta=PaginationMeta(**meta),
    )


@router.get("/low-stock", response_model=PaginatedResponse[ProductResponse])
def low_stock(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.READ_PRODUCTS, Permission.MANAGE_INVENTORY)),
):
    items, meta = InventoryService(db).low_stock(page, page_size)
    return PaginatedResponse(
        data=[ProductResponse.model_validate(i) for i in items],
        meta=PaginationMeta(**meta),
    )


@router.get("/report", response_model=ResponseModel[InventoryReport])
def inventory_report(
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_INVENTORY)),
):
    report = InventoryService(db).report()
    return ResponseModel(data=InventoryReport(**report))
