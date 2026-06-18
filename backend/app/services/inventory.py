from sqlalchemy.orm import Session

from app.repositories.inventory import InventoryRepository
from app.repositories.product import ProductRepository
from app.utils.pagination import paginate_query


class InventoryService:
    def __init__(self, db: Session):
        self.repo = InventoryRepository(db)
        self.product_repo = ProductRepository(db)

    def history(self, page: int, page_size: int, product_id: int | None, movement_type):
        q = self.repo.list_query(product_id, movement_type)
        return paginate_query(q, page, page_size)

    def low_stock(self, page: int, page_size: int):
        q = self.product_repo.list_query(None, None, True, True, "stock_quantity", "asc")
        return paginate_query(q, page, page_size)

    def report(self):
        return self.repo.report_summary()

    def trends(self):
        return self.repo.monthly_trends()
