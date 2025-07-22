from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Float, DateTime, Boolean, JSON
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from typing import List, Optional
from datetime import datetime

app = FastAPI()

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./test.db"  # Change to PostgreSQL in production
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)  # artist/admin
    full_name = Column(String)
    phone = Column(String)
    timezone = Column(String)
    artist_profile = relationship("ArtistProfile", back_populates="user", uselist=False)

class ArtistProfile(Base):
    __tablename__ = "artist_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    bio = Column(String)
    min_price = Column(Float)
    profile_image = Column(String)
    social_links = Column(JSON)
    media = Column(JSON)
    user = relationship("User", back_populates="artist_profile")

class BookingRequest(Base):
    __tablename__ = "booking_requests"
    id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artist_profiles.id"))
    event_info = Column(JSON)
    requester_info = Column(JSON)
    status = Column(String)
    budget = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    travel_details = relationship("TravelDetails", back_populates="booking", uselist=False)
    accommodation_details = relationship("AccommodationDetails", back_populates="booking", uselist=False)
    chat_messages = relationship("ChatMessage", back_populates="booking")
    payment_record = relationship("PaymentRecord", back_populates="booking", uselist=False)

class TravelDetails(Base):
    __tablename__ = "travel_details"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("booking_requests.id"))
    from_location = Column(String)
    to_location = Column(String)
    transport_type = Column(String)
    seat_pref = Column(String)
    allergies = Column(String)
    bags = Column(String)
    booking = relationship("BookingRequest", back_populates="travel_details")

class AccommodationDetails(Base):
    __tablename__ = "accommodation_details"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("booking_requests.id"))
    stars = Column(Integer)
    smoking = Column(Boolean)
    rooms = Column(Integer)
    requests = Column(String)
    booking = relationship("BookingRequest", back_populates="accommodation_details")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("booking_requests.id"))
    sender = Column(String)  # artist/client
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    booking = relationship("BookingRequest", back_populates="chat_messages")

class PaymentRecord(Base):
    __tablename__ = "payment_records"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("booking_requests.id"))
    amount = Column(Float)
    currency = Column(String)
    manual_override = Column(Boolean, default=False)
    booking = relationship("BookingRequest", back_populates="payment_record")

class CalendarBlock(Base):
    __tablename__ = "calendar_blocks"
    id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artist_profiles.id"))
    blocked_date = Column(DateTime)

class AdminLog(Base):
    __tablename__ = "admin_logs"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(String)

Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Mock endpoints (to be implemented)
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/login")
def login():
    return {"token": "mock-jwt-token"}

@app.post("/booking")
def create_booking():
    return {"booking_id": 1, "status": "pending"}

@app.get("/booking/{booking_id}")
def get_booking(booking_id: int):
    return {"booking_id": booking_id, "status": "pending"}

@app.post("/chat/{booking_id}")
def send_message(booking_id: int):
    return {"message_id": 1, "status": "sent"}

@app.get("/chat/{booking_id}")
def get_chat(booking_id: int):
    return {"messages": []}

@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    return {"filename": file.filename, "url": f"/uploads/{file.filename}"}

@app.post("/generate-pdf/{booking_id}")
def generate_pdf(booking_id: int):
    return {"pdf_url": f"/pdfs/{booking_id}.pdf"}

@app.post("/send-email/{booking_id}")
def send_email(booking_id: int):
    print(f"Simulated email for booking {booking_id}")
    return {"status": "email sent"}
