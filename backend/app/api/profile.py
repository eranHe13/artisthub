from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi import Form
from sqlalchemy.orm import Session
import json
from typing import List

from app.core.db import get_db
from app.models.models import ArtistProfile, User, BookingRequest
from app.schemas.auth import ArtistProfileUpdate, ArtistProfileResponse, ArtistDashboardResponse, BookingRequestResponse
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
                photo="",
                currency="USD"
            )
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/dashboard", response_model=ArtistDashboardResponse, status_code=200, summary="Get artist dashboard data")
async def get_artist_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete artist dashboard data including profile and all bookings
    """
    try:
        # Get artist profile
        profile = db.query(ArtistProfile).filter(ArtistProfile.user_id == current_user.id).first()
        if not profile:
            
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Get all bookings for this artist
        bookings = db.query(BookingRequest).filter(
            BookingRequest.artist_id == current_user.id
        ).order_by(BookingRequest.event_date.desc()).all()
        
        # Calculate dashboard statistics
        total_requests = len(bookings)
        pending = len([b for b in bookings if b.status == 'pending'])
        accepted = len([b for b in bookings if b.status == 'accepted'])
        cancelled = len([b for b in bookings if b.status == 'cancelled'])
        
        # Calculate active bookings (accepted and future dates)
        from datetime import date
        active_bookings = len([b for b in bookings if b.status == 'accepted' and b.event_date >= date.today()])
        
        # Calculate total earnings from accepted bookings
        total_earnings = sum([b.budget for b in bookings if b.status == 'accepted'])
        
        # Calculate this month's earnings
        from datetime import datetime
        current_month = datetime.now().month
        current_year = datetime.now().year
        this_month_earnings = sum([
            b.budget for b in bookings 
            if b.status == 'accepted' and 
            b.event_date.month == current_month and 
            b.event_date.year == current_year
        ])
        
        # Calculate average booking fee
        avg_fee = total_earnings / accepted if accepted > 0 else 0
        
        stats = {
            "total_requests": total_requests,
            "active_bookings": active_bookings,
            "pending": pending,
            "accepted": accepted,
            "cancelled": cancelled,
            "total_earnings": total_earnings,
            "this_month_earnings": this_month_earnings,
            "avg_booking_fee": round(avg_fee, 2),
            "total_bookings": accepted
        }
        
        # Convert bookings to use the from_orm method for proper serialization
        serialized_bookings = [BookingRequestResponse.from_orm(booking) for booking in bookings]
        
        # Convert profile to proper format
        profile_response = ArtistProfileResponse(
            user_id=profile.user_id,
            stage_name=profile.stage_name or "",
            bio=profile.bio or "",
            genres=profile.genres or "",
            social_links=profile.social_links or "{}",
            min_price=profile.min_price or 0,
            currency=profile.currency or "USD",
            photo=profile.photo or ""
        )

        return ArtistDashboardResponse(
            profile=profile_response,
            bookings=serialized_bookings,
            stats=stats
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

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