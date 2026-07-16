from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import User as UserSchema, UserCreate, UserUpdate
from app.crud import crud_ops

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_admin)
) -> Any:
    return crud_ops.get_users(db, skip=skip, limit=limit)

@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_admin)
) -> Any:
    existing = crud_ops.get_user_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists."
        )
    return crud_ops.create_user(db, user=user_in)

@router.get("/{user_id}", response_model=UserSchema)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
) -> Any:
    user = crud_ops.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
) -> Any:
    user = crud_ops.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud_ops.update_user(db, db_user=user, user_update=user_in)

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
) -> Any:
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Admins cannot delete themselves")
    deleted = crud_ops.delete_user(db, user_id=user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
