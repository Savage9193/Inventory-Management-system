from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ResponseModel(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: T | None = None


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: list[T]
    meta: PaginationMeta


class MessageResponse(BaseModel):
    success: bool = True
    message: str
    data: dict | None = None


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
