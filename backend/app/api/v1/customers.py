from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import Permission, require_permissions
from app.schemas.common import MessageResponse, PaginatedResponse, PaginationMeta, ResponseModel
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from app.services.customer import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=ResponseModel[CustomerResponse])
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_CUSTOMERS)),
):
    customer = CustomerService(db).create(data)
    return ResponseModel(message="Customer created", data=CustomerResponse.model_validate(customer))


@router.get("", response_model=PaginatedResponse[CustomerResponse])
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_CUSTOMERS)),
):
    items, meta = CustomerService(db).list(page, page_size, search)
    return PaginatedResponse(
        data=[CustomerResponse.model_validate(i) for i in items],
        meta=PaginationMeta(**meta),
    )


@router.get("/{customer_id}", response_model=ResponseModel[CustomerResponse])
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_CUSTOMERS)),
):
    customer = CustomerService(db).get(customer_id)
    return ResponseModel(data=CustomerResponse.model_validate(customer))


@router.put("/{customer_id}", response_model=ResponseModel[CustomerResponse])
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_CUSTOMERS)),
):
    customer = CustomerService(db).update(customer_id, data)
    return ResponseModel(message="Customer updated", data=CustomerResponse.model_validate(customer))


@router.delete("/{customer_id}", response_model=MessageResponse)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_permissions(Permission.MANAGE_CUSTOMERS)),
):
    CustomerService(db).delete(customer_id)
    return MessageResponse(message="Customer deleted")
