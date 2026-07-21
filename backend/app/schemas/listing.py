from datetime import datetime
from pydantic import BaseModel, field_validator

from app.models.listing import ListingStatus
from app.schemas.category import CategoryOut
from app.schemas.user import UserOut


class ListingImageOut(BaseModel):
    id: int
    path: str
    order: int

    model_config = {"from_attributes": True}


class ListingCreate(BaseModel):
    title: str
    description: str
    price: float | None = None
    is_negotiable: bool = False
    category_id: int

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()


class ListingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    is_negotiable: bool | None = None
    category_id: int | None = None
    status: ListingStatus | None = None


class ListingOut(BaseModel):
    id: int
    title: str
    description: str
    price: float | None
    is_negotiable: bool
    status: ListingStatus
    user_id: int
    category: CategoryOut
    images: list[ListingImageOut]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ListingListOut(BaseModel):
    id: int
    title: str
    price: float | None
    is_negotiable: bool
    status: ListingStatus
    category: CategoryOut
    cover: str | None  # first image path
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedListings(BaseModel):
    items: list[ListingListOut]
    total: int
    page: int
    pages: int
