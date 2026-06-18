from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.inventory import MovementType
from app.repositories.inventory import InventoryRepository
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, StockAdjustment
from app.utils.pagination import paginate_query


class ProductService:
    def __init__(self, db: Session):
        self.repo = ProductRepository(db)
        self.inventory_repo = InventoryRepository(db)
        self.db = db

    def create(self, data: ProductCreate):
        if self.repo.get_by_sku(data.sku):
            raise AppException("SKU already exists", 409)
        product = self.repo.create(data.model_dump())
        if product.stock_quantity > 0:
            self.inventory_repo.create(
                product.id, MovementType.STOCK_IN, product.stock_quantity, "Initial stock"
            )
        self.db.commit()
        self.db.refresh(product)
        return product

    def get(self, product_id: int):
        product = self.repo.get_by_id(product_id)
        if not product:
            raise AppException("Product not found", 404)
        return product

    def update(self, product_id: int, data: ProductUpdate):
        product = self.repo.get_by_id(product_id, active_only=False)
        if not product or not product.is_active:
            raise AppException("Product not found", 404)
        payload = data.model_dump(exclude_unset=True)
        if "sku" in payload and payload["sku"] != product.sku:
            if self.repo.get_by_sku(payload["sku"]):
                raise AppException("SKU already exists", 409)
        old_stock = product.stock_quantity
        product = self.repo.update(product, payload)
        if "stock_quantity" in payload and payload["stock_quantity"] != old_stock:
            diff = payload["stock_quantity"] - old_stock
            self.inventory_repo.create(
                product.id, MovementType.ADJUSTMENT, diff, "Manual stock update"
            )
        self.db.commit()
        self.db.refresh(product)
        return product

    def delete(self, product_id: int):
        product = self.repo.get_by_id(product_id)
        if not product:
            raise AppException("Product not found", 404)
        self.repo.soft_delete(product)
        self.db.commit()
        return product

    def list(
        self,
        page: int,
        page_size: int,
        search: str | None,
        category: str | None,
        is_active: bool | None,
        low_stock: bool | None,
        sort_by: str,
        sort_order: str,
    ):
        q = self.repo.list_query(search, category, is_active, low_stock, sort_by, sort_order)
        return paginate_query(q, page, page_size)

    def adjust_stock(self, product_id: int, data: StockAdjustment):
        product = self.repo.get_for_update(product_id)
        if not product:
            raise AppException("Product not found", 404)
        new_stock = product.stock_quantity + data.quantity
        if new_stock < 0:
            raise AppException("Stock cannot be negative", 400)
        product.stock_quantity = new_stock
        mtype = MovementType.STOCK_IN if data.quantity > 0 else MovementType.STOCK_OUT
        self.inventory_repo.create(product.id, mtype, abs(data.quantity), data.reference)
        self.db.commit()
        self.db.refresh(product)
        return product
