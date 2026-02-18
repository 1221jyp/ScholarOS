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
