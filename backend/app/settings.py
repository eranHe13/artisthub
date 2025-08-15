# app/settings.py
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    LOG_LEVEL: str = Field(default="DEBUG")         # DEBUG/INFO/WARNING/ERROR
    LOG_FORMAT: str = Field(default="json")       # plain | json
    LOG_FILE: str | None = Field(default="logs/app.log")
    LOG_ROTATE: bool = Field(default=True)
    LOG_MAX_BYTES: int = Field(default=10_000_000)
    LOG_BACKUPS: int = Field(default=5)

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()