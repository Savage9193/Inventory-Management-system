from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import Permission, require_permissions
from app.schemas.common import MessageResponse, PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate, StockAdjustment
from app.services.product import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ResponseModel[ProductResponse])
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_PRODUCTS)),
):
    product = ProductService(db).create(data)
    return ResponseModel(message="Product created", data=ProductResponse.model_validate(product))


@router.get("", response_model=PaginatedResponse[ProductResponse])
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    category: str | None = None,
    is_active: bool | None = None,
    low_stock: bool | None = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.READ_PRODUCTS)),
):
    items, meta = ProductService(db).list(page, page_size, search, category, is_active, low_stock, sort_by, sort_order)
    return PaginatedResponse(
        data=[ProductResponse.model_validate(i) for i in items],
        meta=PaginationMeta(**meta),
    )


@router.get("/{product_id}", response_model=ResponseModel[ProductResponse])
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.READ_PRODUCTS)),
):
    product = ProductService(db).get(product_id)
    return ResponseModel(data=ProductResponse.model_validate(product))


@router.put("/{product_id}", response_model=ResponseModel[ProductResponse])
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_PRODUCTS)),
):
    product = ProductService(db).update(product_id, data)
    return ResponseModel(message="Product updated", data=ProductResponse.model_validate(product))


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_PRODUCTS)),
):
    ProductService(db).delete(product_id)
    return MessageResponse(message="Product deleted")


@router.post("/{product_id}/adjust-stock", response_model=ResponseModel[ProductResponse])
def adjust_stock(
    product_id: int,
    data: StockAdjustment,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_INVENTORY)),
):
    product = ProductService(db).adjust_stock(product_id, data)
    return ResponseModel(message="Stock adjusted", data=ProductResponse.model_validate(product))
