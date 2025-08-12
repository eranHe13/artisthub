from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.models import User, ArtistProfile, BookingRequest, ChatMessage, CalendarBlock
import logging

logger = logging.getLogger(__name__)

def print_all_tables_data():
    """Print all data from all tables in the database"""
    try:
        db = next(get_db())
        
        # Print Users
        users = db.query(User).all()
        logger.info("=== Users ===")
        for user in users:
            logger.info(f"User ID: {user.id}, Name: {user.name}, Email: {user.email}")

        # Print Artist Profiles
        artists = db.query(ArtistProfile).all() 
        logger.info("\n=== Artist Profiles ===")
        for artist in artists:
            logger.info(f"Artist ID: {artist.id}, User ID: {artist.user_id}, Stage Name: {artist.stage_name}")

        # Print Booking Requests
        bookings = db.query(BookingRequest).all()
        logger.info("\n=== Booking Requests ===")
        for booking in bookings:
            logger.info(f"Booking ID: {booking.id}, Artist ID: {booking.artist_id}, Status: {booking.status}")
            logger.info(f"Client: {booking.client_first_name} {booking.client_last_name}")
            logger.info(f"Event Date: {booking.event_date}, Time: {booking.event_time}")

        # Print Chat Messages
        messages = db.query(ChatMessage).all()
        logger.info("\n=== Chat Messages ===")
        for msg in messages:
            logger.info(f"Message ID: {msg.id}, Booking ID: {msg.booking_request_id}")
            logger.info(f"Sender ID: {msg.sender_id}, Message: {msg.message}")
            logger.info(f"Timestamp: {msg.timestamp}, Read: {msg.is_read}")

        # Print Calendar Blocks
        blocks = db.query(CalendarBlock).all()
        logger.info("\n=== Calendar Blocks ===")
        for block in blocks:
            logger.info(f"Block ID: {block.id}, Artist ID: {block.artist_id}")
            logger.info(f"Date: {block.block_date}, Time: {block.start_time} - {block.end_time}")

    except Exception as e:
        logger.error(f"Error printing table data: {str(e)}")
        raise Exception(f"Failed to print table data: {str(e)}")

def main():
    print_all_tables_data()

main()