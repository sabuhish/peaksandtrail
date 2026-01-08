import os
import urllib.parse


class Settings:

    @property
    def _db_user(self) -> str:
        return os.getenv("DB_USER", "postgres")

    @property
    def _db_password(self) -> str:
        password = urllib.parse.quote(
            r"{}".format(os.getenv("DB_PASSWORD", "postgres"))
        )
        return password

    @property
    def _db_host(self) -> str:
        return os.getenv("DB_HOST", "localhost")

    @property
    def _db_port(self) -> str:
        return os.getenv("DB_PORT", "5432")

    @property
    def _db_name(self) -> str:
        return os.getenv("DB_NAME", "postgres")

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://"
            f"{self._db_user}:{self._db_password}@"
            f"{self._db_host}:{self._db_port}/{self._db_name}"
        )

    @property
    def secret_key(self) -> str:
        return os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")

    @property
    def algo(self) -> str:
        return os.getenv("ALGORITHM", "HS256")

    @property
    def access_token_expire_min(self) -> int:
        return 60 * 24 * 7  # 7 days

    @property
    def auth_username(self) -> str:
        return os.getenv("AUTH_USERNAME", "admin")

    @property
    def auth_password(self) -> str:
        return os.getenv("AUTH_PASSWORD", "admin123")

    @property
    def environment(self) -> str:
        return os.getenv("ENVIRONMENT", "development")


settings = Settings()
