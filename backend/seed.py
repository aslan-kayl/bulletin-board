"""Seed initial categories into the database."""
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.category import Category

CATEGORIES = [
    {"name": "Электроника", "icon": "📱", "slug": "electronics"},
    {"name": "Авто", "icon": "🚗", "slug": "auto"},
    {"name": "Недвижимость", "icon": "🏠", "slug": "realty"},
    {"name": "Одежда", "icon": "👕", "slug": "clothes"},
    {"name": "Мебель", "icon": "🪑", "slug": "furniture"},
    {"name": "Животные", "icon": "🐾", "slug": "animals"},
    {"name": "Спорт", "icon": "⚽", "slug": "sport"},
    {"name": "Работа", "icon": "💼", "slug": "jobs"},
    {"name": "Услуги", "icon": "🔧", "slug": "services"},
    {"name": "Разное", "icon": "📦", "slug": "misc"},
]


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        for cat in CATEGORIES:
            exists = (await db.execute(select(Category).where(Category.slug == cat["slug"]))).scalar_one_or_none()
            if not exists:
                db.add(Category(**cat))
        await db.commit()
        print("Categories seeded.")


if __name__ == "__main__":
    asyncio.run(main())
