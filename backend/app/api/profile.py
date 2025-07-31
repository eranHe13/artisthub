from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi import Form
from sqlalchemy.orm import Session
import json

from app.core.db import get_db
from app.models.models import ArtistProfile, User
from app.schemas.auth import ArtistProfileUpdate, ArtistProfileResponse
from app.api.auth import get_current_user
router = APIRouter()

@router.get("/me", response_model=ArtistProfileResponse, status_code=200, summary="Get artist profile")
async def get_artist_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        profile = db.query(ArtistProfile).filter(ArtistProfile.user_id == current_user.id).first()
        if not profile:
            # Return empty profile if none exists
            return ArtistProfileResponse(
                user_id=current_user.id,
                stage_name="",
                bio="",
                genres="",
                social_links="{}",
                min_price=0,
                photo=""
            )
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.put("/me", response_model=ArtistProfileResponse, status_code=200, summary="Update artist profile")
async def update_artist_profile(
    profile_in: ArtistProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        profile = db.query(ArtistProfile).filter(ArtistProfile.user_id == current_user.id).first()
        if not profile:
            profile = ArtistProfile(user_id=current_user.id)
            db.add(profile)

        if profile_in.stage_name is not None:
            profile.stage_name = profile_in.stage_name
        if profile_in.bio is not None:
            profile.bio = profile_in.bio
        if profile_in.genres is not None:
            profile.genres = profile_in.genres
        if profile_in.social_links is not None:
            profile.social_links = json.dumps(profile_in.social_links)
        if profile_in.min_price is not None:
            profile.min_price = profile_in.min_price
        if profile_in.photo is not None:
            profile.photo = profile_in.photo

        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Serve an HTML form for inputting artist profile details
@router.get("/form", response_class=HTMLResponse)
async def get_artist_form():
    return """
    <html>
        <body>
            <h2>Artist Profile Form</h2>
            <form action="/artist/form" method="post">
                <label for="stage_name">Stage Name:</label><br>
                <input type="text" id="stage_name" name="stage_name"><br>
                <label for="bio">Bio:</label><br>
                <input type="text" id="bio" name="bio"><br>
                <label for="genres">Genres (comma separated):</label><br>
                <input type="text" id="genres" name="genres"><br>
                <label for="social_links">Social Links (JSON format):</label><br>
                <input type="text" id="social_links" name="facebook"><br>
                <input type="text" id="social_links" name="instagram"><br>
                <input type="text" id="social_links" name="soundcloud"><br>
                <label for="min_price">Minimum Price:</label><br>
                <input type="number" id="min_price" name="min_price" step="0.01"><br>
                <label for="photo">Photo URL:</label><br>
                <input type="text" id="photo" name="photo"><br><br>
                <input type="submit" value="Submit">
            </form>
        </body>
    </html>
    """

# Handle form submissions to update the artist profile
@router.post("/form")
async def submit_artist_form(
    stage_name: str = Form(...),
    bio: str = Form(...),
    genres: str = Form(...),
    facebook: str = Form(...),
    instagram: str = Form(...),
    soundcloud: str = Form(...),
    min_price: float = Form(...),
    photo: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(stage_name, bio, genres, facebook, instagram, soundcloud, min_price, photo)
    profile_in = ArtistProfileUpdate(
        stage_name=stage_name,
        bio=bio,
        genres=genres.split(","),
        social_links=[facebook, instagram, soundcloud],
        min_price=min_price,
        photo=photo
    )
    return await update_artist_profile(profile_in, current_user, db) 