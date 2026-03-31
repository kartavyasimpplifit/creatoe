import os
from pathlib import Path
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "creator_intel.db"


class Settings(BaseSettings):
    youtube_api_key: str = ""
    youtube_api_daily_quota: int = 10000
    youtube_api_safety_buffer: int = 500
    database_url: str = f"sqlite+aiosqlite:///{DB_PATH}"

    model_config = {"env_file": str(PROJECT_ROOT / ".env"), "extra": "ignore"}


settings = Settings()
