from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import Customer as CustomerSchema, CustomerCreate, CustomerUpdate, PaginatedCustomers, Note as NoteSchema, NoteCreate
from app.crud import crud_ops

router = APIRouter()

@router.get("/", response_model=PaginatedCustomers)
def read_customers(
    db: Session = Depends(get_db),
    search: str = Query(None),
    company_id: int = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    items, total = crud_ops.get_customers(
        db, 
        search=search, 
        company_id=company_id, 
        status=status, 
        page=page, 
        limit=limit,
        user_id=current_user.id,
        user_role=current_user.role
    )
    pages = (total + limit - 1) // limit
    return {"items": items, "total": total, "page": page, "pages": pages}

@router.post("/", response_model=CustomerSchema, status_code=status.HTTP_201_CREATED)
def create_customer(
    *,
    db: Session = Depends(get_db),
    customer_in: CustomerCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_ops.create_customer(db, customer=customer_in, user_id=current_user.id)

@router.get("/{customer_id}", response_model=CustomerSchema)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    customer = crud_ops.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    # Check role limits
    if current_user.role == "Sales Executive":
        # Check if customer has any assigned leads or meetings for this user
        has_access = False
        for lead in customer.leads:
            if lead.assigned_employee_id == current_user.id:
                has_access = True
                break
        if not has_access:
            # Check meetings
            meetings = db.query(deps.User).join(deps.User.meetings).filter(
                deps.User.id == current_user.id,
                deps.Meeting.customer_id == customer_id
            ).first()
            if meetings:
                has_access = True
        
        # If the customer is completely unassigned (newly created), we can let the sales executive access it
        if not customer.leads:
            has_access = True
            
        if not has_access:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this customer contact")
            
    return customer

@router.put("/{customer_id}", response_model=CustomerSchema)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    customer = crud_ops.get_customer(db, customer_id=customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return crud_ops.update_customer(db, db_customer=customer, customer_update=customer_in, user_id=current_user.id)

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
) -> Any:
    deleted = crud_ops.delete_customer(db, customer_id=customer_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deleted successfully"}

# Notes Sub-resource
@router.get("/{customer_id}/notes", response_model=List[NoteSchema])
def read_customer_notes(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    return crud_ops.get_notes_for_target(db, customer_id=customer_id)

@router.post("/{customer_id}/notes", response_model=NoteSchema)
def create_customer_note(
    customer_id: int,
    note_in: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    note_in.customer_id = customer_id
    return crud_ops.create_note(db, note=note_in, user_id=current_user.id)
