from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi import Form
from sqlalchemy.orm import Session
import json

from app.core.db import get_db
from app.models.models import ArtistProfile, User
from app.schemas.auth import ArtistProfileUpdate, ArtistProfileResponse
router = APIRouter()


@router.get("/artist/{user_id}", response_model=ArtistProfileResponse)
def get_public_artist_profile(user_id: int, db: Session = Depends(get_db)):
    print(f"Getting public artist profile for user_id: {user_id}")
    profile = db.query(ArtistProfile).filter(ArtistProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Artist not found")
    return profile
