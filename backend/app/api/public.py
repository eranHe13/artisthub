from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi import Form
from sqlalchemy.orm import Session
import json
import logging
from app.core.db import get_db
from app.models.models import ArtistProfile, User
from app.schemas.auth import ArtistProfileOut

public_logger = logging.getLogger("app.public")
router = APIRouter()

@router.get("/artist/{user_id}", response_model=ArtistProfileOut)
def get_public_artist_profile(user_id: int, db: Session = Depends(get_db)):
    public_logger.debug("Getting public artist profile" , extra={"user_id": user_id})
    profile = db.query(ArtistProfile).filter(ArtistProfile.user_id == user_id).first()
    if not profile:
        public_logger.error("Artist not found" , extra={"user_id": user_id})
        raise HTTPException(status_code=404, detail="Artist not found")
    return profile




