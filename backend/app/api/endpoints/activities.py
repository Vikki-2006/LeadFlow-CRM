from typing import Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import Activity as ActivitySchema
from app.crud import crud_ops

router = APIRouter()

@router.get("/", response_model=List[ActivitySchema])
def read_activities(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_ops.get_activities(db, limit=limit)
