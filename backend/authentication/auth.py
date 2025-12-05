from database.db import prisma
from database.db import get_db
from fastapi import APIRouter, Depends
from database.models import User
import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr, Field
import bcrypt

# Load secret key from environment or use a default (for development, replace in production)
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-please-change-me")
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_DAYS = 30

router = APIRouter()

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str  

class SigninRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    email: Optional[EmailStr] = None

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="signin")

async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = prisma(db).user.find_first(where={"email": email})
    if user is None:
        raise credentials_exception
    return user

def create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_access_token(data: dict):
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"type": "access"})
    return create_jwt_token(data, expires_delta)

def create_refresh_token(data: dict):
    expires_delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"type": "refresh"})
    return create_jwt_token(data, expires_delta)

@router.post("/signup")
def signup(request: SignupRequest, db=Depends(get_db)):
    # Check if user already exists
    existing_user = prisma(db).user.find_first(where={"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash with SHA-256 first to create fixed-length (64 chars) input
    sha256_password = hashlib.sha256(request.password.encode()).hexdigest()
    
    # Then hash with bcrypt
    password_bytes = sha256_password.encode('utf-8')
    
    # Generate salt and hash
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Convert back to string for storage
    hashed_password = hashed.decode('utf-8')
    
    # Prepare user data - handle optional name
    user_data = {
        "email": request.email,
        "password": hashed_password
    }
    
    # Only add name if provided
    if request.name is not None:
        user_data["name"] = request.name
    
    # Create new user
    new_user = prisma(db).user.create(data=user_data)
    
    return {"message": "User created successfully", "user_id": new_user.id}

@router.post("/signin", response_model=Token)
def signin(request: SigninRequest, db=Depends(get_db)):
    # Find user by email
    user = prisma(db).user.find_first(where={"email": request.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Hash the provided password with SHA-256 first
    sha256_password = hashlib.sha256(request.password.encode()).hexdigest()
    
    # Convert to bytes for bcrypt
    password_bytes = sha256_password.encode('utf-8')
    stored_hash = user.password.encode('utf-8')
    
    # Verify password using bcrypt
    if not bcrypt.checkpw(password_bytes, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token({"sub": user.email})
    
    # Create refresh token
    refresh_token = create_refresh_token({"sub": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token(request: RefreshTokenRequest, db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "refresh":
            raise credentials_exception
        
        # Check if user still exists
        user = prisma(db).user.find_first(where={"email": email})
        if not user:
            raise credentials_exception
            
        # Create new access token
        access_token = create_access_token({"sub": email})
        
        # Create new refresh token
        refresh_token = create_refresh_token({"sub": email})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except JWTError:
        raise credentials_exception

@router.get("/get_session")
def get_session(current_user: User = Depends(get_current_user)):
    return {"name": current_user.name, "email": current_user.email}

@router.put("/users/me")
def update_user_data(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.email is not None:
        # Check if new email is already taken
        if user_update.email != current_user.email:
            existing_user = prisma(db).user.find_first(where={"email": user_update.email})
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already in use"
                )
        update_data["email"] = user_update.email

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for update",
        )

    updated_user = prisma(db).user.update(
        where={"id": current_user.id},
        data=update_data
    )

    return {
        "message": "User updated successfully",
        "user": {"name": updated_user.name, "email": updated_user.email},
    }

@router.post("/logout")
def logout(
    refresh_request: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    return {"message": "Logged out successfully"}