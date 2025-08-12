from pydantic import BaseModel, EmailStr, HttpUrl, field_serializer , field_validator
from typing import List, Optional
from datetime import datetime, date, time
from typing import List, Optional, Dict, Any
import json




# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    sub: Optional[int] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None

class UserCreate(UserBase):
    password: str


class UserResponse(BaseModel):
    id: int
    email: str 
    name: str   
    role: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Auth request schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(UserCreate):
    pass

# Google OAuth codes
class GoogleAuthCode(BaseModel):
    code: str


# Artist profile schemas


class ArtistProfileUpdate(BaseModel):
    stage_name: Optional[str] = None
    bio: Optional[str] = None
    genres: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None 
    min_price: Optional[float] = None
    currency: Optional[str] = None
    photo: Optional[str] = None


class ArtistProfileOut(BaseModel):
    id: int
    user_id: int
    stage_name: Optional[str] = None
    bio: Optional[str] = None
    genres: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None
    min_price: Optional[float] = None
    currency: Optional[str] = None
    photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    # 👇 זה החלק הקריטי: המרה לפני וולידציה
    @field_validator("social_links", mode="before")
    @classmethod
    def parse_social_links(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                # אם המחרוזת לא JSON תקין – תן None או זרוק שגיאה לפי הצורך
                return None
        return v





    



# Booking schemas



class BookingRequestCreate(BaseModel):
    event_date: str  # YYYY-MM-DD format
    event_time: str  # HH:MM format
    time_zone: str
    budget: float
    currency: str = "USD"
    venue_name: str
    city: str
    country: str
    performance_duration: int  # in minutes
    participant_count: int
    includes_travel: bool = False
    includes_accommodation: bool = False
    includes_ground_transportation: bool = False
    client_first_name: str
    client_last_name: str
    client_email: str
    client_phone: Optional[str] = None
    client_company: Optional[str] = None
    client_message: Optional[str] = None

class BookingRequestResponse(BaseModel):
    id: int
    artist_id: int
    event_date: date
    event_time: time
    time_zone: str
    budget: float
    currency: str
    venue_name: str
    city: str
    country: str
    performance_duration: int
    participant_count: int
    includes_travel: bool
    includes_accommodation: bool
    includes_ground_transportation: bool
    client_first_name: str
    client_last_name: str
    client_email: str
    client_phone: Optional[str]
    client_company: Optional[str]
    client_message: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    artist_stage_name: Optional[str] = None
    

    class Config:
        from_attributes = True

    @field_serializer('event_date')
    def serialize_event_date(self, value: date) -> str:
        return value.strftime('%Y-%m-%d') if value else None

    @field_serializer('event_time')
    def serialize_event_time(self, value: time) -> str:
        return value.strftime('%H:%M') if value else None

class BookingStatusUpdate(BaseModel):
    status: str  # accepted, rejected, cancelled


class BookingRequestUpdate(BaseModel):
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    performance_duration: Optional[int] = None 
    budget: Optional[float] = None


class ArtistDashboardStats(BaseModel):
    total_requests: int
    active_bookings: int
    pending: int
    accepted: int
    cancelled: int
    total_earnings: float
    this_month_earnings: float
    avg_booking_fee: float
    total_bookings: int

    class Config:
        from_attributes = True


## Artist dashboard schemas


class ArtistDashboardResponse(BaseModel):
    profile: ArtistProfileOut
    bookings: List[BookingRequestResponse]
    stats: ArtistDashboardStats
    
    class Config:
        from_attributes = True




###  Chat schemas


class MessageCreate(BaseModel):
    message: str

class MessageResponse(BaseModel):
    id: int
    booking_request_id: int
    sender_user_id: Optional[int] = None   # <-- במקום sender_id
    sender_type: str                       # 'artist' | 'booker'
    message: str
    timestamp: datetime
    is_read: bool
    sender_name: str = ""                  # ימולא מה-relationship/שאילתה

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    messages: List[MessageResponse]
    total_count: int