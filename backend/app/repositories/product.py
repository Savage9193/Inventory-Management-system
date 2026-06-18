from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session

from app.models.product import Product


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: int, active_only: bool = True) -> Product | None:
        q = self.db.query(Product).filter(Product.id == product_id)
        if active_only:
            q = q.filter(Product.is_active.is_(True))
        return q.first()

    def get_by_sku(self, sku: str) -> Product | None:
        return self.db.query(Product).filter(Product.sku == sku).first()

    def get_for_update(self, product_id: int) -> Product | None:
        return (
            self.db.query(Product)
            .filter(Product.id == product_id, Product.is_active.is_(True))
            .with_for_update()
            .first()
        )

    def create(self, data: dict) -> Product:
        product = Product(**data)
        self.db.add(product)
        self.db.flush()
        return product

    def update(self, product: Product, data: dict) -> Product:
        for key, value in data.items():
            if value is not None:
                setattr(product, key, value)
        self.db.flush()
        return product

    def soft_delete(self, product: Product) -> Product:
        product.is_active = False
        self.db.flush()
        return product

    def list_query(
        self,
        search: str | None,
        category: str | None,
        is_active: bool | None,
        low_stock: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        q = self.db.query(Product)
        if is_active is not None:
            q = q.filter(Product.is_active.is_(is_active))
        else:
            q = q.filter(Product.is_active.is_(True))
        if search:
            term = f"%{search}%"
            q = q.filter(or_(Product.name.ilike(term), Product.sku.ilike(term)))
        if category:
            q = q.filter(Product.category == category)
        if low_stock:
            q = q.filter(Product.stock_quantity <= Product.reorder_level)
        sort_col = getattr(Product, sort_by, Product.created_at)
        q = q.order_by(desc(sort_col) if sort_order == "desc" else asc(sort_col))
        return q

    def count_low_stock(self) -> int:
        return (
            self.db.query(Product)
            .filter(Product.is_active.is_(True), Product.stock_quantity <= Product.reorder_level)
            .count()
        )

    def count_active(self) -> int:
        return self.db.query(Product).filter(Product.is_active.is_(True)).count()
