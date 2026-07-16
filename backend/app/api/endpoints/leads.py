from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import Lead as LeadSchema, LeadCreate, LeadUpdate, PaginatedLeads, Note as NoteSchema, NoteCreate
from app.crud import crud_ops

router = APIRouter()

@router.get("/", response_model=PaginatedLeads)
def read_leads(
    db: Session = Depends(get_db),
    search: str = Query(None),
    status: str = Query(None),
    priority: str = Query(None),
    assigned_employee_id: int = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1), # default large for kanban board
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    items, total = crud_ops.get_leads(
        db,
        search=search,
        status=status,
        priority=priority,
        assigned_employee_id=assigned_employee_id,
        page=page,
        limit=limit,
        user_id=current_user.id,
        user_role=current_user.role
    )
    pages = (total + limit - 1) // limit
    return {"items": items, "total": total, "page": page, "pages": pages}

@router.post("/", response_model=LeadSchema, status_code=status.HTTP_201_CREATED)
def create_lead(
    *,
    db: Session = Depends(get_db),
    lead_in: LeadCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # If the user is Sales Executive, enforce assignment to themselves by default
    if current_user.role == "Sales Executive":
        lead_in.assigned_employee_id = current_user.id
    return crud_ops.create_lead(db, lead=lead_in, user_id=current_user.id)

@router.get("/{lead_id}", response_model=LeadSchema)
def read_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    lead = crud_ops.get_lead(db, lead_id=lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if current_user.role == "Sales Executive" and lead.assigned_employee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this lead")
    return lead

@router.put("/{lead_id}", response_model=LeadSchema)
def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    lead = crud_ops.get_lead(db, lead_id=lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if current_user.role == "Sales Executive" and lead.assigned_employee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit leads assigned to others")
    return crud_ops.update_lead(db, db_lead=lead, lead_update=lead_in, user_id=current_user.id)

@router.delete("/{lead_id}")
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)  # Admin only delete
) -> Any:
    deleted = crud_ops.delete_lead(db, lead_id=lead_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

# Notes sub-resource
@router.get("/{lead_id}/notes", response_model=List[NoteSchema])
def read_lead_notes(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_ops.get_notes_for_target(db, lead_id=lead_id)

@router.post("/{lead_id}/notes", response_model=NoteSchema)
def create_lead_note(
    lead_id: int,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    note_in.lead_id = lead_id
    return crud_ops.create_note(db, note=note_in, user_id=current_user.id)
