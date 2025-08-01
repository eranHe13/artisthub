from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Import database configuration to ensure tables are created
from app.core import db  # This ensures tables are created on startup
from app.api.profile import router as profile_router
from app.api.public import router as public_artist
from app.api.auth import router as auth_router
# TODO: Uncomment these imports when the corresponding router files are created
# from app.api.artists import router as artists_router
# from app.api.bookings import router as bookings_router
# from app.api.chat import router as chat_router
# from app.api.calendar import router as calendar_router
# from app.api.earnings import router as earnings_router
# from app.api.notifications import router as notifications_router

app = FastAPI(
    title="ArtistHub API",
    version="0.1.0"
)

# Ensure database tables are created
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    db.Base.metadata.create_all(bind=db.engine)
    print("✅ Database tables created/verified successfully!")

# CORS configuration - hardened for production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://yourdomain.com,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,  # Required for secure cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Specific methods only
    allow_headers=["Content-Type", "Authorization"],  # Specific headers only
    expose_headers=["Set-Cookie"]  # Allow cookie headers
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])  # Add API prefix for frontend
app.include_router(profile_router, prefix="/artist", tags=["artist"])
app.include_router(profile_router, prefix="/api/artist", tags=["artist"]) 
app.include_router(public_artist, prefix="/public", tags=["public"])  # Add API prefix for frontend
app.include_router(public_artist, prefix="/api/public", tags=["public"])  # Add API prefix for frontend
# TODO: Uncomment these router inclusions when the corresponding router files are created
#app.include_router(artists_router, prefix="/artist", tags=["artist"])
# app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
# app.include_router(chat_router, prefix="/chat", tags=["chat"])
# app.include_router(calendar_router, prefix="/calendar", tags=["calendar"])
# app.include_router(earnings_router, prefix="/earnings", tags=["earnings"])
# app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])

@app.get("/")
async def root():
    return {"message": "Hello, Doron API"}

# Entry point
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
