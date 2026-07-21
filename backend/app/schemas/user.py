from datetime import datetime
from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    username: str | None
    first_name: str
    last_name: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TelegramAuthPayload(BaseModel):
    init_data: str
