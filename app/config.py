from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str = "postgresql://scholarios_user:password@localhost:5432/scholarios_db"

    # Application Settings
    APP_NAME: str = "ScholarOS"
    DEBUG: bool = False

    # CORS Settings
    ALLOWED_ORIGINS: str = '["http://localhost:3000","http://localhost:8080"]'

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Timezone
    TIMEZONE: str = "Asia/Seoul"

    # JWT Authentication
    JWT_SECRET_KEY: str = "change-this-to-a-long-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24시간

    # Initial Admin Account (서버 첫 실행 시 자동 생성)
    INITIAL_ADMIN_USERNAME: str = "admin"
    INITIAL_ADMIN_PASSWORD: str = "admin1234"
    INITIAL_ADMIN_NAME: str = "원장"

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS JSON string to list"""
        try:
            return json.loads(self.ALLOWED_ORIGINS)
        except json.JSONDecodeError:
            return ["http://localhost:3000"]


settings = Settings()
