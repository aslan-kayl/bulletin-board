from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import BigInteger, Integer, String, Text, Numeric, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ListingStatus(str, PyEnum):
    active = "active"
    sold = "sold"
    archived = "archived"


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(256))
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[float | None] = mapped_column(Numeric(12, 2))
    is_negotiable: Mapped[bool] = mapped_column(default=False)
    status: Mapped[ListingStatus] = mapped_column(
        Enum(ListingStatus), default=ListingStatus.active
    )
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"))
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship("User", back_populates="listings")
    category: Mapped["Category"] = relationship("Category", back_populates="listings")
    images: Mapped[list["ListingImage"]] = relationship(
        "ListingImage", back_populates="listing", cascade="all, delete-orphan"
    )


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(Integer, ForeignKey("listings.id"))
    path: Mapped[str] = mapped_column(String(512))
    order: Mapped[int] = mapped_column(Integer, default=0)

    listing: Mapped["Listing"] = relationship("Listing", back_populates="images")
