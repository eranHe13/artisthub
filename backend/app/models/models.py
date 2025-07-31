from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean,
    ForeignKey, Numeric, Text, Date, Time
)
from sqlalchemy.orm import relationship
from app.core.db import Base  # שים לב: מייבא מ-app.core.db את Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default="artist")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("ArtistProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(500), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")

class ArtistProfile(Base):
    __tablename__ = 'artist_profiles'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    stage_name = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    genres = Column(String, nullable=True)  # Store as comma-separated string
    social_links = Column(Text, nullable=True)  # JSON-encoded
    min_price = Column(Numeric, nullable=True)
    photo = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="profile")
    bookings = relationship("BookingRequest", back_populates="artist", cascade="all, delete-orphan")
    blocks = relationship("CalendarBlock", back_populates="artist", cascade="all, delete-orphan")
    earnings = relationship("Earning", back_populates="artist", cascade="all, delete-orphan")

class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artist_profiles.user_id"), nullable=False, index=True)
    event_date = Column(Date)
    event_time = Column(Time)
    time_zone = Column(String(100))
    budget = Column(Numeric)
    currency = Column(String(10))
    venue_name = Column(String(255))
    city = Column(String(100))
    country = Column(String(100))
    performance_duration = Column(Integer)
    participant_count = Column(Integer)
    includes_travel = Column(Boolean, default=False)
    includes_accommodation = Column(Boolean, default=False)
    client_first_name = Column(String(100))
    client_last_name = Column(String(100))
    client_email = Column(String(255))
    client_phone = Column(String(50))
    client_company = Column(String(255))
    client_message = Column(Text)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    artist = relationship("ArtistProfile", back_populates="bookings")
    messages = relationship("ChatMessage", back_populates="booking", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    booking_request_id = Column(Integer, ForeignKey("booking_requests.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    booking = relationship("BookingRequest", back_populates="messages")
    sender = relationship("User")

class CalendarBlock(Base):
    __tablename__ = "calendar_blocks"

    id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artist_profiles.user_id"), nullable=False, index=True)
    block_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    reason = Column(Text)

    artist = relationship("ArtistProfile", back_populates="blocks")

class Earning(Base):
    __tablename__ = "earnings"

    id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artist_profiles.user_id"), nullable=False, index=True)
    amount = Column(Numeric)
    currency = Column(String(10))
    date = Column(Date)

    artist = relationship("ArtistProfile", back_populates="earnings")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50))
    content = Column(Text)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
