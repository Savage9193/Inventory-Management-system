from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import Permission, require_permissions
from app.models.order import OrderStatus
from app.schemas.common import PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=ResponseModel[OrderResponse])
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.CREATE_ORDERS)),
):
    order = OrderService(db).create(data)
    return ResponseModel(message="Order created", data=OrderResponse.model_validate(order))


@router.get("", response_model=PaginatedResponse[OrderResponse])
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: OrderStatus | None = None,
    customer_id: int | None = None,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_ORDERS, Permission.CREATE_ORDERS)),
):
    items, meta = OrderService(db).list(page, page_size, status, customer_id)
    return PaginatedResponse(
        data=[OrderResponse.model_validate(i) for i in items],
        meta=PaginationMeta(**meta),
    )


@router.get("/{order_id}", response_model=ResponseModel[OrderResponse])
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_ORDERS, Permission.CREATE_ORDERS)),
):
    order = OrderService(db).get(order_id)
    return ResponseModel(data=OrderResponse.model_validate(order))


@router.post("/{order_id}/cancel", response_model=ResponseModel[OrderResponse])
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_ORDERS)),
):
    order = OrderService(db).cancel(order_id)
    return ResponseModel(message="Order cancelled", data=OrderResponse.model_validate(order))


@router.post("/{order_id}/complete", response_model=ResponseModel[OrderResponse])
def complete_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_ORDERS)),
):
    order = OrderService(db).complete(order_id)
    return ResponseModel(message="Order completed", data=OrderResponse.model_validate(order))
