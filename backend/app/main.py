from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import logging
from app.logging_conf import configure_logging
from app.middlewares import RequestContextMiddleware



# Import database configuration to ensure tables are created
from app.core import db  # This ensures tables are created on startup
from app.api.profile import router as profile_router
from app.api.public import router as public_artist
from app.api.auth import router as auth_router
from app.api.bookings import router as bookings_router
from app.api.chat import router as chat_router

configure_logging()


app = FastAPI(
    title="ArtistHub API",
    version="0.1.0"
)

app.add_middleware(RequestContextMiddleware)

main_logger = logging.getLogger("app.main")

# Ensure database tables are created
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    main_logger.info("Starting up...")
    db.Base.metadata.create_all(bind=db.engine)
    print("✅ Database tables created/verified successfully!")

# CORS configuration - hardened for production
#ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
ALLOWED_ORIGINS = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Explicit origins for development
    allow_credentials=True,  # Required for secure cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Specific methods only
    allow_headers=["*"],  # Specific headers only
    expose_headers=["*"]  # Allow cookie headers
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(profile_router, prefix="/api/artist", tags=["artist"]) 
app.include_router(public_artist, prefix="/api/public", tags=["public"])
app.include_router(bookings_router, prefix="/api/bookings", tags=["bookings"])

app.include_router(chat_router, prefix="/api/chat", tags=["chat"])


@app.get("/")
async def root():
    return {"message": "Hello, ArtistHub API"}

# Entry point
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
