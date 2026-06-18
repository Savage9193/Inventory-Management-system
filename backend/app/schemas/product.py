from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import BaseSchema


class ProductCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    category: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(gt=0)
    cost_price: Decimal = Field(ge=0, default=0)
    stock_quantity: int = Field(ge=0, default=0)
    reorder_level: int = Field(ge=0, default=10)


class ProductUpdate(BaseModel):
    sku: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    category: str | None = Field(default=None, min_length=1, max_length=100)
    price: Decimal | None = Field(default=None, gt=0)
    cost_price: Decimal | None = Field(default=None, ge=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    reorder_level: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductResponse(BaseSchema):
    id: int
    sku: str
    name: str
    description: str | None
    category: str
    price: Decimal
    cost_price: Decimal
    stock_quantity: int
    reorder_level: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class StockAdjustment(BaseModel):
    quantity: int
    reference: str = Field(min_length=1, max_length=255)

    @field_validator("quantity")
    @classmethod
    def non_zero(cls, v: int) -> int:
        if v == 0:
            raise ValueError("Quantity cannot be zero")
        return v
