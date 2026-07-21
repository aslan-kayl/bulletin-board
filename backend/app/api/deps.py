from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import verify_telegram_init_data
from app.models.user import User


async def get_current_user(
    x_init_data: str = Header(..., alias="X-Init-Data"),
    db: AsyncSession = Depends(get_db),
) -> User:
    user_data = verify_telegram_init_data(x_init_data)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid Telegram auth data")

    tg_id = user_data["id"]
    result = await db.execute(select(User).where(User.id == tg_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=tg_id,
            username=user_data.get("username"),
            first_name=user_data.get("first_name", ""),
            last_name=user_data.get("last_name"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
