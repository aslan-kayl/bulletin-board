from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(64), unique=True)
    icon: Mapped[str] = mapped_column(String(8), default="📦")
    slug: Mapped[str] = mapped_column(String(64), unique=True)

    listings: Mapped[list["Listing"]] = relationship("Listing", back_populates="category")
