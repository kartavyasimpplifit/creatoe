from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, JSON,
    create_engine, Index,
)
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone

from backend.app.config import DB_PATH

DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Creator(Base):
    __tablename__ = "creators"

    id = Column(Integer, primary_key=True, autoincrement=True)
    channel_id = Column(String(64), unique=True, nullable=False, index=True)
    channel_title = Column(String(256), nullable=False)
    description = Column(Text, default="")
    subscriber_count = Column(Integer, default=0)
    video_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    thumbnail_url = Column(String(512), default="")
    country = Column(String(10), default="")
    custom_url = Column(String(256), default="")
    published_at = Column(String(64), default="")
    primary_language = Column(String(32), default="")
    category_affinity = Column(String(64), default="smartphone")
    tier = Column(String(16), default="")  # nano/micro/mid/macro/mega
    engagement_rate = Column(Float, default=0.0)
    estimated_cost_min = Column(Integer, default=0)
    estimated_cost_max = Column(Integer, default=0)
    audience_fit_score = Column(Float, default=0.0)
    content_proof_score = Column(Float, default=0.0)
    combined_score = Column(Float, default=0.0)
    phone_video_count = Column(Integer, default=0)
    last_phone_video_date = Column(String(64), default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_combined_score", "combined_score"),
        Index("idx_tier", "tier"),
        Index("idx_language", "primary_language"),
    )


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(String(64), unique=True, nullable=False, index=True)
    channel_id = Column(String(64), nullable=False, index=True)
    title = Column(String(512), nullable=False)
    description = Column(Text, default="")
    published_at = Column(String(64), default="")
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    duration = Column(String(32), default="")
    thumbnail_url = Column(String(512), default="")
    tags = Column(JSON, default=list)
    has_caption = Column(Boolean, default=False)
    caption_text = Column(Text, default="")
    is_analyzed = Column(Boolean, default=False)
    analysis = Column(JSON, default=dict)
    engagement_rate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ProductCache(Base):
    __tablename__ = "product_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String(1024), unique=True, nullable=False, index=True)
    platform = Column(String(32), default="")  # flipkart/amazon/myntra
    product_name = Column(String(512), default="")
    brand = Column(String(128), default="")
    category = Column(String(128), default="")
    subcategory = Column(String(128), default="")
    price = Column(Integer, default=0)
    price_band = Column(String(32), default="")
    key_features = Column(JSON, default=list)
    image_url = Column(String(1024), default="")
    rating = Column(Float, default=0.0)
    archetype = Column(String(256), default="")
    scraped_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


def init_db():
    Base.metadata.create_all(engine)


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
