from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/bulletinboard"
    secret_key: str = "change-me"
    bot_token: str = ""
    allowed_origins: str = "http://localhost:5173"
    uploads_dir: str = "uploads"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
