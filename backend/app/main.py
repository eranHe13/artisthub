from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.auth import router as auth_router
from app.api.artists import router as artists_router
from app.api.bookings import router as bookings_router
from app.api.chat import router as chat_router
from app.api.calendar import router as calendar_router
from app.api.earnings import router as earnings_router
from app.api.notifications import router as notifications_router

app = FastAPI(
    title="Doron API",
    version="0.1.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(artists_router, prefix="/artist", tags=["artist"])
app.include_router(bookings_router, prefix="/bookings", tags=["bookings"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(calendar_router, prefix="/calendar", tags=["calendar"])
app.include_router(earnings_router, prefix="/earnings", tags=["earnings"])
app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])

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
