from pydantic import BaseModel, EmailStr, HttpUrl, field_serializer
from typing import List, Optional
from datetime import datetime, date, time

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

class UserResponse(UserBase):
    id: int
    email: str 
    name: str   
    role: str
    created_at: datetime
    

class UserResponse(BaseModel):
    id: int
    email: str 
    name: str   
    role: str

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

class ArtistProfileUpdate(BaseModel):
    stage_name: Optional[str] = None
    bio: Optional[str] = None
    genres: Optional[str] = None
    social_links: Optional[dict] = None
    min_price: Optional[float] = None
    currency: Optional[str] = None
    photo: Optional[str] = None

class ArtistProfileOut(BaseModel):
    id: int
    user_id: int
    stage_name: Optional[str] = None
    bio: Optional[str] = None
    genres: Optional[str] = None
    social_links: Optional[str] = None
    min_price: Optional[float] = None
    currency: Optional[str] = None
    photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BookingRequestUpdate(BaseModel):
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    duration : Optional[int] = None
    budget: Optional[float] = None
    
    



class ArtistProfileResponse(BaseModel):
    user_id: int
    stage_name: Optional[str] = ""
    bio: Optional[str] = ""
    genres: Optional[str] = ""
    social_links: Optional[str] = "{}"
    min_price: Optional[float] = 0
    currency: Optional[str] = "USD"
    photo: Optional[str] = ""

    class Config:
        from_attributes = True

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
    client_first_name: str
    client_last_name: str
    client_email: str
    client_phone: Optional[str]
    client_company: Optional[str]
    client_message: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

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

class ArtistDashboardResponse(BaseModel):
    profile: ArtistProfileResponse
    bookings: List[BookingRequestResponse]
    stats: dict  # Dashboard statistics
    
    class Config:
        from_attributes = True
