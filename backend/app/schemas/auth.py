from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional
from datetime import datetime

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
    photo: Optional[str] = None

class ArtistProfileOut(BaseModel):
    id: int
    user_id: int
    stage_name: Optional[str] = None
    bio: Optional[str] = None
    genres: Optional[str] = None
    social_links: Optional[str] = None
    min_price: Optional[float] = None
    photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ArtistProfileResponse(BaseModel):
    user_id: int
    stage_name: Optional[str] = ""
    bio: Optional[str] = ""
    genres: Optional[str] = ""
    social_links: Optional[str] = "{}"
    min_price: Optional[float] = 0
    photo: Optional[str] = ""

    class Config:
        orm_mode = True
