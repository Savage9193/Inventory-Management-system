from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.repositories.customer import CustomerRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.utils.pagination import paginate_query


class CustomerService:
    def __init__(self, db: Session):
        self.repo = CustomerRepository(db)
        self.db = db

    def create(self, data: CustomerCreate):
        if self.repo.get_by_email(data.email):
            raise AppException("Email already exists", 409)
        customer = self.repo.create(data.model_dump())
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def get(self, customer_id: int):
        customer = self.repo.get_by_id(customer_id)
        if not customer:
            raise AppException("Customer not found", 404)
        return customer

    def update(self, customer_id: int, data: CustomerUpdate):
        customer = self.repo.get_by_id(customer_id)
        if not customer:
            raise AppException("Customer not found", 404)
        payload = data.model_dump(exclude_unset=True)
        if "email" in payload and payload["email"] != customer.email:
            if self.repo.get_by_email(payload["email"]):
                raise AppException("Email already exists", 409)
        customer = self.repo.update(customer, payload)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete(self, customer_id: int):
        customer = self.repo.get_by_id(customer_id)
        if not customer:
            raise AppException("Customer not found", 404)
        self.repo.delete(customer)
        self.db.commit()

    def list(self, page: int, page_size: int, search: str | None):
        q = self.repo.list_query(search)
        return paginate_query(q, page, page_size)
