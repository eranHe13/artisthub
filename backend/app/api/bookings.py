from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, time
from typing import List
import logging

from app.core.db import get_db
from app.models.models import BookingRequest, ArtistProfile, User, CalendarBlock
from app.schemas.auth import BookingRequestCreate, BookingRequestResponse, BookingStatusUpdate , BookingRequestUpdate
from app.api.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

def validate_booking_data(booking_data: BookingRequestCreate, db: Session, artist_id: int) -> None:
    """Validate booking data and business rules"""
    
    # Check if artist exists
    artist = db.query(ArtistProfile).filter(ArtistProfile.user_id == artist_id).first()
    if not artist:
        raise HTTPException(
            status_code=404, 
            detail="Artist not found"
        )
    ##TODO -- MOVE THE VALIDATION TO THE FRONTEND
    # Check if event date is in the future
    try:
        event_date = datetime.strptime(booking_data.event_date, "%Y-%m-%d").date()
        if event_date <= date.today():
            raise HTTPException(
                status_code=400,
                detail="Event date must be in the future"
            )
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid event date format. Use YYYY-MM-DD"
        )
    
    # Check if event time is valid
    try:
        event_time = datetime.strptime(booking_data.event_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid event time format. Use HH:MM"
        )
        
    ##TODO -- MOVE THE VALIDATION TO THE FRONTEND
    # Check if artist is available (no calendar blocks)
    existing_block = db.query(CalendarBlock).filter(
        CalendarBlock.artist_id == artist_id,
        CalendarBlock.block_date == event_date,
        CalendarBlock.start_time <= event_time,
        CalendarBlock.end_time >= event_time
    ).first()
    
    if existing_block:
        raise HTTPException(
            status_code=409,
            detail="Artist is not available at the requested time"
        )
    ##TODO -- MOVE THE VALIDATION TO THE FRONTEND
    # Check if budget meets minimum price
    if artist.min_price and booking_data.budget < float(artist.min_price):
        raise HTTPException(
            status_code=400,
            detail=f"Budget must be at least {artist.min_price} {artist.currency or 'USD'}"
        )
    
    # Check for duplicate bookings (same artist, date, time)
    existing_booking = db.query(BookingRequest).filter(
        BookingRequest.artist_id == artist_id,
        BookingRequest.event_date == event_date,
        BookingRequest.event_time == event_time,
        BookingRequest.status.in_(["pending", "accepted"])
    ).first()
    
    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail="A booking already exists for this artist at the requested time"
        )

@router.post("/", response_model=BookingRequestResponse, status_code=201)
async def create_booking(
    booking_data: BookingRequestCreate,
    artist_id: int,
    db: Session = Depends(get_db)
):
    """
    Create a new booking request for an artist
    
    - **artist_id**: ID of the artist to book
    - **booking_data**: Complete booking information
    """
    try:
        # Validate booking data and business rules
        validate_booking_data(booking_data, db, artist_id)
        
        # Parse date and time
        ## HOWT TO PARSE IT BACK 
        event_date = datetime.strptime(booking_data.event_date, "%Y-%m-%d").date()
        event_time = datetime.strptime(booking_data.event_time, "%H:%M").time()
        
        # Create booking request
        booking = BookingRequest(
            artist_id=artist_id,
            event_date=event_date,
            event_time=event_time,
            time_zone=booking_data.time_zone,
            budget=booking_data.budget,
            currency=booking_data.currency,
            venue_name=booking_data.venue_name,
            city=booking_data.city,
            country=booking_data.country,
            performance_duration=booking_data.performance_duration,
            participant_count=booking_data.participant_count,
            includes_travel=booking_data.includes_travel,
            includes_accommodation=booking_data.includes_accommodation,
            client_first_name=booking_data.client_first_name,
            client_last_name=booking_data.client_last_name,
            client_email=booking_data.client_email,
            client_phone=booking_data.client_phone,
            client_company=booking_data.client_company,
            client_message=booking_data.client_message,
            status="pending"
        )
        
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        logger.info(f"Booking created: ID {booking.id} for artist {artist_id}")
        
        return booking
        
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating booking: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while creating booking"
        )

@router.put("/{booking_id}", response_model=BookingRequestResponse)
async def update_booking(
    booking_id: int,
    booking_data: BookingRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a booking request
    """
    booking = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )
    if booking.artist_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own bookings"
        )
    if booking_data.event_date:
        booking.event_date = datetime.strptime(booking_data.event_date, "%Y-%m-%d").date()
    if booking_data.event_time:
        booking.event_time = datetime.strptime(booking_data.event_time, "%H:%M").time()
    if booking_data.duration:
        booking.duration = booking_data.duration
    if booking_data.budget:
        booking.budget = booking_data.budget

    db.commit()
    db.refresh(booking)

    return booking



## UPDATE - SEND TOKEN BY COOKIE
@router.get("/artist/{artist_id}", response_model=List[BookingRequestResponse])
async def get_artist_bookings(
    artist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all bookings for an artist (artist must be authenticated)
    """
    # Verify the authenticated user is the artist
    if current_user.id != artist_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own bookings"
        )
    
    bookings = db.query(BookingRequest).filter(
        BookingRequest.artist_id == artist_id
    ).order_by(BookingRequest.event_date.desc()).all()
    
    return bookings

@router.get("/{booking_id}", response_model=BookingRequestResponse)
async def get_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific booking by ID
    """
    booking = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )
    
    # Check if user has permission to view this booking
    if booking.artist_id != current_user.id and booking.client_email != current_user.email:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to view this booking"
        )
    
    return booking

@router.put("/{booking_id}/status", response_model=BookingRequestResponse)
async def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update booking status (only artist can update status)
    """
    booking = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )
    
    # Only the artist can update booking status
    if booking.artist_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the artist can update booking status"
        )
    
    # Validate status
    valid_statuses = ["pending", "accepted", "rejected", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Update status
    booking.status = status_update.status
    booking.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(booking)
    
    logger.info(f"Booking {booking_id} status updated to {status_update.status}")
    
    return booking

@router.delete("/{booking_id}", status_code=204)
async def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a booking (only artist can cancel)
    """
    booking = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    
    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )
    
    # Only the artist can cancel bookings
    if booking.artist_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the artist can cancel bookings"
        )
    
    # Only pending or accepted bookings can be cancelled
    if booking.status not in ["pending", "accepted"]:
        raise HTTPException(
            status_code=400,
            detail="Only pending or accepted bookings can be cancelled"
        )
    
    booking.status = "cancelled"
    booking.updated_at = datetime.utcnow()
    
    db.commit()
    
    logger.info(f"Booking {booking_id} cancelled by artist {current_user.id}")
    
    return None 