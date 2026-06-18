from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.customer import Customer


class CustomerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, customer_id: int) -> Customer | None:
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def get_by_email(self, email: str) -> Customer | None:
        return self.db.query(Customer).filter(Customer.email == email).first()

    def create(self, data: dict) -> Customer:
        customer = Customer(**data)
        self.db.add(customer)
        self.db.flush()
        return customer

    def update(self, customer: Customer, data: dict) -> Customer:
        for key, value in data.items():
            if value is not None:
                setattr(customer, key, value)
        self.db.flush()
        return customer

    def delete(self, customer: Customer) -> None:
        self.db.delete(customer)

    def list_query(self, search: str | None):
        q = self.db.query(Customer)
        if search:
            term = f"%{search}%"
            q = q.filter(
                or_(
                    Customer.first_name.ilike(term),
                    Customer.last_name.ilike(term),
                    Customer.email.ilike(term),
                )
            )
        return q.order_by(Customer.created_at.desc())

    def count_all(self) -> int:
        return self.db.query(Customer).count()
