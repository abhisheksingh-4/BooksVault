from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "BooksVault"
    SECRET_KEY: str = "libraflow-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 1
    DATABASE_URL: str = "mysql+pymysql://root:root@localhost:3306/libraflow?charset=utf8mb4"
    DATABASE_ECHO: bool = False
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        env_prefix="LIBRAFLOW_",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
