from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional
import re

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if not re.match(r'^[a-zA-Z\s-]+$', v):
            raise ValueError('Name can only contain letters, spaces, and hyphens')
        return v.strip().title()

class UserCreate(UserBase):
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 12:
            raise ValueError('Password must be at least 12 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserUpdate(BaseModel):
    """Profile update model - only first_name and last_name can be updated"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    # Email is intentionally excluded - it's read-only

    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if v is not None:
            if not v or len(v.strip()) < 2:
                raise ValueError('Name must be at least 2 characters long')
            if not re.match(r'^[a-zA-Z\s-]+$', v):
                raise ValueError('Name can only contain letters, spaces, and hyphens')
            return v.strip().title()
        return v

class User(UserBase):
    """User response model - email is included but read-only in profile updates"""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None