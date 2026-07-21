from pydantic import BaseModel


class CategoryOut(BaseModel):
    id: int
    name: str
    icon: str
    slug: str

    model_config = {"from_attributes": True}
