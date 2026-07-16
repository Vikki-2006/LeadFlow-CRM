from typing import List, Union
from pydantic import AnyHttpUrl, BeforeValidator, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated

def any_http_url_to_str(v: Union[str, AnyHttpUrl]) -> str:
    if isinstance(v, str):
        return v
    return str(v)

class Settings(BaseSettings):
    PROJECT_NAME: str = "LeadFlow CRM"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-in-production-12345678"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for ease of development
    
    # Database
    DATABASE_URL: str = "sqlite:///./leadflow.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # First Superuser
    FIRST_SUPERUSER_EMAIL: str = "admin@leadflow.com"
    FIRST_SUPERUSER_PASSWORD: str = "AdminPassword123"
    FIRST_SUPERUSER_NAME: str = "LeadFlow Admin"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
