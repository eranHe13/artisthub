# app/api/chat.py — גרסה מעודכנת

from datetime import datetime
from typing import List, Tuple, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.api.auth import get_current_user
from app.models.models import BookingRequest, ChatMessage, User, ArtistProfile
from app.schemas.auth import MessageCreate, MessageResponse, ChatResponse

import logging
chat_logger = logging.getLogger("app.chat")

router = APIRouter()

# ---------- Validators / helpers ----------

def validate_chat_token(booking_id: int, chat_token: str, db: Session) -> BookingRequest:
    booking = db.query(BookingRequest).filter(
        BookingRequest.id == booking_id,
        BookingRequest.chat_token == chat_token
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or invalid chat token")
    return booking

def validate_artist_access(booking_id: int, current_user: User, db: Session) -> BookingRequest:
    booking = db.query(BookingRequest).filter(BookingRequest.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.artist_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return booking

def resolve_sender_name_and_id(
    msg: ChatMessage,
    booking: BookingRequest,
    fallback_artist_name: Optional[str] = None
) -> Tuple[str, Optional[int]]:
    """מחזיר (sender_name, sender_user_id_for_response) בהתאם ל-sender_type"""
    if msg.sender_type == "booker":
        name = f"{booking.client_first_name} {booking.client_last_name}".strip()
        return name, None  # למזמין אין User ID
    # artist
    name = (msg.sender.name if msg.sender else None) or fallback_artist_name or "Artist"
    return name, msg.sender_user_id

# ---------- Send message: artist ----------

def send_artist_message_func(
    booking_id: int,
    message_data: MessageCreate,
    current_user: User,
    db: Session
) -> MessageResponse:
    chat_logger.debug("Sending message from artist" , extra={"booking_id": booking_id , "current_user_id": current_user.id})
    booking = validate_artist_access(booking_id, current_user, db)

    chat_message = ChatMessage(
        booking_request_id=booking_id,
        sender_user_id=current_user.id,
        sender_type="artist",
        message=message_data.message,
        timestamp=datetime.utcnow(),
        is_read=False,
    )
    chat_logger.debug("Chat message created" , extra={"chat_message": chat_message})
    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)

    sender_name, sender_user_id = resolve_sender_name_and_id(
        chat_message, booking, fallback_artist_name=current_user.name
    )
    chat_logger.debug("Sender name and user id resolved" , extra={"sender_name": sender_name , "sender_user_id": sender_user_id})
    return MessageResponse(
        id=chat_message.id,
        booking_request_id=chat_message.booking_request_id,
        sender_user_id=sender_user_id,
        sender_type= 'artist' ,
  
        message=chat_message.message,
        timestamp=chat_message.timestamp,
        is_read=chat_message.is_read,
        sender_name=sender_name,
    )

@router.post("/{booking_id}/messages/artist", response_model=MessageResponse)
async def send_message_from_artist(
    booking_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat_logger.debug(
        "Sending message from artist",
        extra={
            "booking_id": booking_id,
            "current_user_id": current_user.id,
            "msg_len": len(message_data.message or "")
        }
    )
    try:
        return send_artist_message_func(booking_id, message_data, current_user, db)
    except HTTPException:
        raise
    except Exception:
        chat_logger.exception(
            "Error sending message from artist",
            extra={"booking_id": booking_id, "current_user_id": current_user.id}
        )
        raise HTTPException(status_code=500, detail="Failed to send message")

# ---------- Send message: booker (by token) ----------

def send_message_from_booker_func(
    booking_id: int,
    message_data: MessageCreate,
    chat_token: str,
    db: Session
) -> MessageResponse:
    chat_logger.debug("Sending message from booker" , extra={"booking_id": booking_id , "message_data": message_data , "chat_token": chat_token})
    booking = validate_chat_token(booking_id, chat_token, db)
    chat_logger.debug("Booking validated" , extra={"booking": booking})
    chat_message = ChatMessage(
        booking_request_id=booking_id,
        sender_user_id=None,       # למזמין אין User
        sender_type="booker",
        message=message_data.message,
        timestamp=datetime.utcnow(),
        is_read=False,
    )

    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)
    chat_logger.debug("Chat message created" , extra={"chat_message": chat_message})
    sender_name, sender_user_id = resolve_sender_name_and_id(
        chat_message, booking, fallback_artist_name=None
    )

    return MessageResponse(
        id=chat_message.id,
        booking_request_id=chat_message.booking_request_id,
        sender_user_id=sender_user_id,  # יהיה None בצד מזמין
        sender_type=chat_message.sender_type,
        message=chat_message.message,
        timestamp=chat_message.timestamp,
        is_read=chat_message.is_read,
        sender_name=sender_name,
    )

@router.post("/{booking_id}/messages/booker", response_model=MessageResponse)
async def send_message_from_booker(
    booking_id: int,
    message_data: MessageCreate,
    chat_token: str = Query(..., description="Chat token from booking request"),
    db: Session = Depends(get_db),
):
    chat_logger.debug(
        "Sending message from booker",
        extra={"booking_id": booking_id, "msg_len": len(message_data.message or "")}
    )
    try:
        return send_message_from_booker_func(booking_id, message_data, chat_token, db)
    except HTTPException:
        raise
    except Exception:
        chat_logger.exception(
            "Error sending message from booker",
            extra={"booking_id": booking_id}
        )
        raise HTTPException(status_code=500, detail="Failed to send message")

# ---------- Get messages: artist side ----------

@router.get("/{booking_id}/messages/artist", response_model=ChatResponse)
async def get_messages_for_artist(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat_logger.debug("get_messages_for_artist: start", extra={"booking_id": booking_id})

    try:
        # בדיקת הרשאות והבאת ה-booking (יזרוק 403/404 אם לא תקין)
        booking = validate_artist_access(booking_id, current_user, db)

        # שליפת ההודעות בסדר כרונולוגי
        messages: List[ChatMessage] = (
            db.query(ChatMessage)
            .filter(ChatMessage.booking_request_id == booking_id)
            .order_by(ChatMessage.timestamp.asc())
            .all()
        )

        # המרה ל-DTO
        items: List[MessageResponse] = []
        for m in messages:
            sender_name, sender_user_id = resolve_sender_name_and_id(
                m, booking, fallback_artist_name=current_user.name
            )
            items.append(
                MessageResponse(
                    id=m.id,
                    booking_request_id=m.booking_request_id,
                    sender_user_id=sender_user_id,
                    sender_type=m.sender_type,
                    message=m.message,
                    timestamp=m.timestamp,
                    is_read=m.is_read,
                    sender_name=sender_name,
                )
            )

        # סימון כהנקראו את הודעות המזמין (יעיל ובטוח)
        (
            db.query(ChatMessage)
            .filter(
                ChatMessage.booking_request_id == booking_id,
                ChatMessage.sender_type == "booker",
                ChatMessage.is_read == False,  # noqa: E712
            )
            .update({"is_read": True}, synchronize_session=False)
        )
        db.commit()

        chat_logger.info(
            "get_messages_for_artist: success",
            extra={"booking_id": booking_id, "count": len(items)},
        )
        return ChatResponse(messages=items, total_count=len(items))

    except HTTPException:
        # חשוב לתת ל-FastAPI לטפל ב-HTTPException כפי שהוא
        chat_logger.warning(
            "get_messages_for_artist: http error", extra={"booking_id": booking_id}
        )
        raise
    except Exception:
        # יכניס traceback מלא ללוג
        chat_logger.exception(
            "get_messages_for_artist: unhandled error", extra={"booking_id": booking_id}
        )
        raise HTTPException(status_code=500, detail="Failed to get messages")






# @router.get("/{booking_id}/messages/artist", response_model=ChatResponse)
# async def get_messages_for_artist(
#     booking_id: int,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db),
# ):
    chat_logger.debug("Sending message from booker" , extra={"booking_id": booking_id })
    try:
        booking = validate_artist_access(booking_id, current_user, db)

        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.booking_request_id == booking_id)
            .order_by(ChatMessage.timestamp.asc())
            .all()
        )

        items: List[MessageResponse] = []
        for m in messages:
            sender_name, sender_user_id = resolve_sender_name_and_id(
                m, booking, fallback_artist_name=current_user.name
            )
            items.append(
                MessageResponse(
                    id=m.id,
                    booking_request_id=m.booking_request_id,
                    sender_user_id=sender_user_id,  
                    sender_type=m.sender_type,
                    message=m.message,
                    timestamp=m.timestamp,
                    is_read=m.is_read,
                    sender_name=sender_name,
                )
            )

        # סימון כהנקראו את הודעות המזמין
        db.query(ChatMessage).filter(
            ChatMessage.booking_request_id == booking_id,
            ChatMessage.sender_type == "booker",
            ChatMessage.is_read == False
        ).update({"is_read": True})
        db.commit()
        chat_logger.debug("Messages fetched successfully" , extra={"booking_id": booking_id , "messages": messages})
        return ChatResponse(messages=items, total_count=len(items))

    except HTTPException:
        raise
    except Exception as e:
        chat_logger.error("Error getting messages for artist" , extra={"booking_id": booking_id , "error": e})
        raise HTTPException(status_code=500, detail="Failed to get messages")

# ---------- Get messages: booker side (by token) ----------

@router.get("/{booking_id}/getmessages/booker", response_model=ChatResponse)
async def get_messages_for_booker(
    
    booking_id: int,
    chat_token: str = Query(..., description="Chat token from booking request"),
    db: Session = Depends(get_db),
):
    chat_logger.debug("Getting messages for booker" , extra={"booking_id": booking_id , "chat_token": chat_token})

    try:
        booking = validate_chat_token(booking_id, chat_token, db)

        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.booking_request_id == booking_id)
            .order_by(ChatMessage.timestamp.asc())
            .all()
        )

        # שם האמן למקרה שאין relationship טמון באובייקט
        artist_name = (
            booking.artist.user.name
            if booking.artist and booking.artist.user
            else "Artist"
        )

        items: List[MessageResponse] = []
        for m in messages:
            sender_name, sender_user_id = resolve_sender_name_and_id(
                m, booking, fallback_artist_name=artist_name
            )
            items.append(
                MessageResponse(
                    id=m.id,
                    booking_request_id=m.booking_request_id,
                    sender_user_id=sender_user_id,
                    message=m.message,
                    timestamp=m.timestamp,
                    is_read=m.is_read,
                    sender_name=sender_name,
                    sender_type=m.sender_type,
                )
            )

        # סימון כהנקראו את הודעות האמן
        db.query(ChatMessage).filter(
            ChatMessage.booking_request_id == booking_id,
            ChatMessage.sender_type == "artist",
            ChatMessage.is_read == False
        ).update({"is_read": True})
        db.commit()
        chat_logger.debug("Messages fetched successfully" , extra={"booking_id": booking_id , "messages": messages})
        return ChatResponse(messages=items, total_count=len(items))

    except HTTPException:
        raise
    except Exception as e:
        chat_logger.error("Error getting messages for booker" , extra={"booking_id": booking_id , "chat_token": chat_token , "error": e})
        raise HTTPException(status_code=500, detail="Failed to get messages")







































