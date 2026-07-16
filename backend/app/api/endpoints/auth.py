from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import Token, UserCreate, UserUpdate, UserUpdatePassword, User as UserSchema

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "name": user.name
    }

@router.post("/register", response_model=UserSchema)
def register_user(
    *, db: Session = Depends(get_db), user_in: UserCreate
) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    db_user = User(
        email=user_in.email,
        name=user_in.name,
        phone=user_in.phone,
        role=user_in.role or "Sales Executive",
        is_active=True,
        hashed_password=get_password_hash(user_in.password),
        profile_picture=user_in.profile_picture
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    if user_in.email:
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        current_user.hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]

    for field in update_data:
        setattr(current_user, field, update_data[field])

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password")
def change_password_me(
    *,
    db: Session = Depends(get_db),
    pass_in: UserUpdatePassword,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if not verify_password(pass_in.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.hashed_password = get_password_hash(pass_in.new_password)
    db.add(current_user)
    db.commit()
    return {"message": "Password changed successfully"}
