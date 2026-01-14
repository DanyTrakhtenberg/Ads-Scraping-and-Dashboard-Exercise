"""SQLAlchemy models for ads database"""
from sqlalchemy import Column, String, Integer, Date, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .connection import Base
import enum


class AdStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class AssetType(enum.Enum):
    IMAGE = "image"
    VIDEO = "video"


class Ad(Base):
    """Main ads table"""
    __tablename__ = "ads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ad_id = Column(String(100), unique=True, nullable=False, index=True)  # Facebook Library ID
    status = Column(SQLEnum(AdStatus), nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True, index=True)
    page_name = Column(String(255), nullable=False)
    page_profile_uri = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    versions = relationship("AdVersion", back_populates="ad", cascade="all, delete-orphan")
    platforms = relationship("AdPlatform", back_populates="ad", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Ad(ad_id='{self.ad_id}', status='{self.status.value}')>"


class AdVersion(Base):
    """Ad versions/variations table"""
    __tablename__ = "ad_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ad_id = Column(String(36), ForeignKey("ads.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    ad_copy = Column(Text, nullable=True)
    title = Column(String(500), nullable=True)
    image_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    asset_type = Column(SQLEnum(AssetType), nullable=True)
    link_url = Column(Text, nullable=True)
    link_description = Column(Text, nullable=True)
    cta_text = Column(String(100), nullable=True)
    cta_type = Column(String(50), nullable=True)
    caption = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())

    # Relationship
    ad = relationship("Ad", back_populates="versions")

    def __repr__(self):
        return f"<AdVersion(ad_id='{self.ad_id}', version_number={self.version_number})>"


class AdPlatform(Base):
    """Junction table for ad platforms (many-to-many)"""
    __tablename__ = "ad_platforms"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ad_id = Column(String(36), ForeignKey("ads.id"), nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())

    # Relationship
    ad = relationship("Ad", back_populates="platforms")

    def __repr__(self):
        return f"<AdPlatform(ad_id='{self.ad_id}', platform='{self.platform}')>"
