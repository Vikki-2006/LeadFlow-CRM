from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import Notification as NotificationSchema
from app.crud import crud_ops

router = APIRouter()

@router.get("/", response_model=List[NotificationSchema])
def read_notifications(
    db: Session = Depends(get_db),
    unread_only: bool = Query(False),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_ops.get_notifications(db, user_id=current_user.id, unread_only=unread_only)

@router.put("/read-all")
def read_all_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    count = crud_ops.mark_all_notifications_read(db, user_id=current_user.id)
    return {"message": "All notifications marked as read", "count": count}

@router.put("/{notification_id}/read", response_model=NotificationSchema)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    notif = crud_ops.mark_notification_read(db, notification_id=notification_id, user_id=current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif
