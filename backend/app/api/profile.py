from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi import Form
from sqlalchemy.orm import Session
import json
from typing import List
from datetime import date, datetime
from decimal import Decimal
from fastapi.encoders import jsonable_encoder

from app.core.db import get_db
from app.models.models import ArtistProfile, User, BookingRequest
from app.schemas.auth import ArtistProfileUpdate, ArtistProfileOut, ArtistDashboardResponse, BookingRequestResponse  , ArtistDashboardStats
from app.api.auth import get_current_user
router = APIRouter()



@router.get("/me", response_model=ArtistProfileOut, status_code=200, summary="Get artist profile")
async def get_artist_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(ArtistProfile)
          .filter(ArtistProfile.user_id == current_user.id)
          .first()
    )
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    # אפשר להחזיר את ה־ORM ישירות, ה־response_model ידאג להמרה (from_attributes=True)
    return profile

# עדיף מודל מפורש לסטטיסטיקות


@router.get("/dashboard", response_model=ArtistDashboardResponse, status_code=200, summary="Get artist dashboard data")
async def get_artist_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # פרופיל אמן
        profile = db.query(ArtistProfile).filter(ArtistProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # כל הבקינגים לאמן
        bookings = (
            db.query(BookingRequest)
            .filter(BookingRequest.artist_id == current_user.id)
            .order_by(BookingRequest.event_date.desc())
            .all()
        )

        # סטטיסטיקות
        total_requests = len(bookings)
        pending = sum(1 for b in bookings if b.status == "pending")
        accepted = sum(1 for b in bookings if b.status == "accepted")
        cancelled = sum(1 for b in bookings if b.status == "cancelled")

        today = date.today()
        active_bookings = sum(1 for b in bookings if b.status == "accepted" and b.event_date >= today)

        def to_float(x) -> float:
            if x is None:
                return 0.0
            if isinstance(x, Decimal):
                return float(x)
            return float(x)

        total_earnings = to_float(sum((b.budget or 0) for b in bookings if b.status == "accepted"))
        now = datetime.now()
        this_month_earnings = to_float(sum(
            (b.budget or 0) for b in bookings
            if b.status == "accepted" and b.event_date.month == now.month and b.event_date.year == now.year
        ))
        avg_fee = total_earnings / accepted if accepted > 0 else 0.0

        stats = ArtistDashboardStats(
            total_requests=total_requests,
            active_bookings=active_bookings,
            pending=pending,
            accepted=accepted,
            cancelled=cancelled,
            total_earnings=total_earnings,
            this_month_earnings=this_month_earnings,
            avg_booking_fee=round(avg_fee, 2),
            total_bookings=accepted,
        )

        # המרת BOOKINGS לפידנטיק (v2): model_validate(..., from_attributes=True)
        serialized_bookings: List[BookingRequestResponse] = [
            BookingRequestResponse.model_validate(b, from_attributes=True) for b in bookings
        ]

        # חשוב: למלא גם id/created_at/updated_at — שדות חובה בסכמה שלך
        profile_response = ArtistProfileOut(
            id=profile.id,
            user_id=profile.user_id,
            stage_name=profile.stage_name or None,
            bio=profile.bio or None,
            genres=profile.genres or None,
            social_links=profile.social_links or None,  # הוולידטור יטפל אם זו מחרוזת JSON
            min_price=to_float(profile.min_price) if profile.min_price is not None else None,
            currency=profile.currency or None,
            photo=profile.photo or None,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

        # אפשר להחזיר את האובייקט ישירות; אם עדיין יש שדה בעייתי, עטוף ב-jsonable_encoder
        return ArtistDashboardResponse(
            profile=profile_response,
            bookings=serialized_bookings,
            stats=stats
        )

        # לחלופין, למקרה של ספק סיריאליזציה:
        # return JSONResponse(content=jsonable_encoder(ArtistDashboardResponse(
        #     profile=profile_response,
        #     bookings=serialized_bookings,
        #     stats=stats
        # )))

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")







@router.put("/me", response_model=ArtistProfileOut, status_code=200, summary="Update artist profile")
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
        if profile_in.currency is not None:
            profile.currency = profile_in.currency
        if profile_in.photo is not None:
            profile.photo = profile_in.photo

        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal Server Error")


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