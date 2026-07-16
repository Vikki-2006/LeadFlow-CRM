from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import Meeting as MeetingSchema, MeetingCreate, MeetingUpdate
from app.crud import crud_ops

router = APIRouter()

@router.get("/", response_model=List[MeetingSchema])
def read_meetings(
    db: Session = Depends(get_db),
    customer_id: int = Query(None),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    assigned_user_id = current_user.id if current_user.role == "Sales Executive" else None
    return crud_ops.get_meetings(db, assigned_user_id=assigned_user_id, customer_id=customer_id)

@router.post("/", response_model=MeetingSchema, status_code=status.HTTP_201_CREATED)
def create_meeting(
    *,
    db: Session = Depends(get_db),
    meeting_in: MeetingCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role == "Sales Executive":
        meeting_in.assigned_user_id = current_user.id
    return crud_ops.create_meeting(db, meeting=meeting_in, user_id=current_user.id)

@router.get("/{meeting_id}", response_model=MeetingSchema)
def read_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    meeting = crud_ops.get_meeting(db, meeting_id=meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if current_user.role == "Sales Executive" and meeting.assigned_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return meeting

@router.put("/{meeting_id}", response_model=MeetingSchema)
def update_meeting(
    meeting_id: int,
    meeting_in: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    meeting = crud_ops.get_meeting(db, meeting_id=meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if current_user.role == "Sales Executive" and meeting.assigned_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return crud_ops.update_meeting(db, db_meeting=meeting, meeting_update=meeting_in, user_id=current_user.id)

@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    meeting = crud_ops.get_meeting(db, meeting_id=meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if current_user.role == "Sales Executive" and meeting.assigned_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    crud_ops.delete_meeting(db, meeting_id=meeting_id, user_id=current_user.id)
    return {"message": "Meeting deleted successfully"}
