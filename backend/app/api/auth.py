from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from urllib.parse import urlencode
import requests as httpx
import json
import logging


from app.core.db import get_db
from app.models.models import User, UserSession
from app.schemas.auth import Token, UserResponse


auth_logger = logging.getLogger("app.auth")


# Config
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
#SECRET_KEY = os.getenv("GOOGLE_CLIENT_SECRET", "dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour for security

# Security scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Router
router = APIRouter()

# Token creation
def create_access_token(data: dict) -> str:
    auth_logger.info(f"Creating access token for user: {data}")
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.get("/google/login")
def google_login():
    auth_logger.debug("Google login" )
    params = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return {"auth_url": url}

@router.get("/google/callback")
def google_callback(code: str, response: Response, db: Session = Depends(get_db)):
    auth_logger.debug("Google callback")

    # Step 1: Exchange code for access_token
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
        "grant_type": "authorization_code"
    }
    auth_logger.debug("Exchanging code with Google...")
    r = httpx.post(token_url, data=data)
    if not r.ok:
        auth_logger.error("Google token exchange failed" , extra={"status_code": r.status_code, "text": r.text})
        raise HTTPException(status_code=400, detail=f"Failed to get token from Google: {r.text}")
    tokens = r.json()
    access_token = tokens.get("access_token")
    if not access_token:
        auth_logger.error("No access token from Google" )
        raise HTTPException(status_code=400, detail="No access token from Google")

    # Step 2: Get user info
    auth_logger.debug("Getting user info from Google...")
    userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    r = httpx.get(userinfo_url, headers=headers)
    if not r.ok:
        raise HTTPException(status_code=400, detail="Failed to get user info from Google")
    userinfo = r.json()
    email = userinfo.get("email")
    name = userinfo.get("name")
    #auth_logger.debug("User info received from Google" , extra={"email": email, "name": name})
    if not email:
        auth_logger.error("Google account missing email" )
        raise HTTPException(status_code=400, detail="Google account missing email")

    # Step 3: Insert/update user in DB
    #auth_logger.debug("Checking if user exists in DB..." , extra={"email": email , "name": name})
    user = db.query(User).filter(User.email == email).first()
    if not user:
        #auth_logger.debug("User not found, creating new user..." , extra={"email": email , "name": name})
        user = User(email=email, name=name,  role="artist" , created_at=datetime.utcnow(), updated_at=datetime.utcnow())
        db.add(user)
        db.commit()
        db.refresh(user)
        #auth_logger.debug("New user created" , extra={"user_id": user.id})
    # else:
    #     auth_logger.debug("User found in DB" , extra={"user_id": user.id})
    # Step 4: Create JWT and session with secure cookie
    # auth_logger.debug("Creating JWT and session with secure cookie" , extra={"user_id": user.id , "email": email , "name": name})
    access_token_jwt = create_access_token({"sub": str(user.id)})
    # auth_logger.debug("JWT created" , extra={"user_id": user.id , "email": email , "name": name})
    expires_at = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    session = UserSession(user_id=user.id, token=access_token_jwt, expires_at=expires_at)
    db.add(session)
    db.commit()
    # auth_logger.debug("Session created" , extra={"user_id": user.id , "email": email , "name": name})
    # Set secure HTTP-only cookie and redirect to frontend
    redirect_response = RedirectResponse(url="http://localhost:3000/dashboard")
    redirect_response.set_cookie(
        key="access_token",
        value=access_token_jwt,
        max_age=3600,  # 1 hour in seconds
        httponly=True,
        secure=False,  # Set to False for development (HTTP)
        samesite="lax"
    )
    # auth_logger.debug("Redirecting to frontend" , extra={"user_id": user.id , "email": email , "name": name})
    return redirect_response

async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    # Extract token from cookie instead of Authorization header
    auth_logger.debug("Getting current user" , extra={"request": request})
    token = request.cookies.get("access_token")
    if not token:
        auth_logger.error("No token found in request" , extra={"request": request})
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        auth_logger.debug("Decoding JWT" , extra={"Request": Request})
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
    except (JWTError, ValueError):
        auth_logger.error("Invalid token" )
        raise HTTPException(status_code=401, detail="Invalid token")
    
    auth_logger.debug("Getting session from DB" )
    session = db.query(UserSession).filter(UserSession.token == token).first()
    if not session or session.expires_at < datetime.utcnow():
        auth_logger.error("Session expired or invalid" , extra={"token": token})
        raise HTTPException(status_code=401, detail="Session expired or invalid")
    
    auth_logger.debug("Getting user from DB" , extra={"user_id": user_id})
    user = db.query(User).get(user_id)
    if not user:
        auth_logger.error("User not found" , extra={"user_id": user_id})
        raise HTTPException(status_code=404, detail="User not found")
    auth_logger.debug("User found" , extra={"user_id": user_id})
    return user

@router.post("/logout")
async def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    """Logout user and clear secure cookie"""
    # Get token from cookie to invalidate session
    token = request.cookies.get("access_token")
    if token:
        # Invalidate session in database
        session = db.query(UserSession).filter(UserSession.token == token).first()
        if session:
            db.delete(session)
            db.commit()
    
    # Clear the secure cookie
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    
    return {"success": True, "message": "Logged out successfully"}
