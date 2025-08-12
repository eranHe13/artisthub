from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean,
    ForeignKey, Numeric, Text, Date, Time , Index, func
)
from sqlalchemy.orm import relationship
from app.core.db import Base  # שים לב: מייבא מ-app.core.db את Base



import uuid

def generate_uuid():
    return str(uuid.uuid4())

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
    currency = Column(String(10), default="USD")  # Default currency for the artist
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
    event_date = Column(Date, nullable=False)
    event_time = Column(Time, nullable=False)
    time_zone = Column(String(100), nullable=False)
    budget = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="USD")
    venue_name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    performance_duration = Column(Integer, nullable=False)  # in minutes
    participant_count = Column(Integer, nullable=False)
    includes_travel = Column(Boolean, default=False)
    includes_accommodation = Column(Boolean, default=False)
    includes_ground_transportation = Column(Boolean, default=False)
    client_first_name = Column(String(100), nullable=False)
    client_last_name = Column(String(100), nullable=False)
    client_email = Column(String(255), nullable=False)
    client_phone = Column(String(50), nullable=True)
    client_company = Column(String(255), nullable=True)
    client_message = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, accepted, rejected, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    chat_token = Column(String, unique=True, default=generate_uuid, index=True)

    artist = relationship("ArtistProfile", back_populates="bookings")
    messages = relationship("ChatMessage", back_populates="booking", cascade="all, delete-orphan")



    def to_pdf_dict(self) -> dict:
        return {
            "Event Date": self.event_date.strftime("%Y-%m-%d"),
            "Event Time": self.event_time.strftime("%H:%M"),
            "Time Zone": self.time_zone,
            "Budget": f"{self.budget} {self.currency}",
            "Venue": self.venue_name,
            "City": self.city,
            "Country": self.country,
            "Performance Duration": f"{self.performance_duration} minutes",
            "Participants": self.participant_count,
            "Includes Travel": "Yes" if self.includes_travel else "No",
            "Includes Accommodation": "Yes" if self.includes_accommodation else "No",
            "Includes Ground Transportation": "Yes" if self.includes_ground_transportation else "No",
            "Client Name": f"{self.client_first_name} {self.client_last_name}",
            "Client Email": self.client_email,
            "Client Phone": self.client_phone or "N/A",
            "Client Company": self.client_company or "N/A",
            "Message": self.client_message or "—"
        }




class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    booking_request_id = Column(
        Integer, ForeignKey("booking_requests.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    sender_user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True, index=True
    )
    sender_type = Column(String(16), nullable=False)  # 'artist' | 'booker'

    message = Column(Text, nullable=False)
    # עדיף לתת ברירת מחדל מהדאטהבייס, לא רק מהאפליקציה:
    timestamp = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)

    # קשרים
    booking = relationship(
        "BookingRequest",
        back_populates="messages",
        passive_deletes=True,
    )
    sender = relationship(
        "User",
        foreign_keys=[sender_user_id],   # <<< חשוב לחד-משמעיות
        passive_deletes=True,
    )

    __table_args__ = (
        Index("ix_chat_messages_booking_ts", "booking_request_id", "timestamp"),
    )


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
