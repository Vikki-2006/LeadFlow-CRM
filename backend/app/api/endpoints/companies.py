from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import Company as CompanySchema, CompanyCreate, CompanyUpdate, PaginatedCompanies
from app.crud import crud_ops

router = APIRouter()

@router.get("/", response_model=PaginatedCompanies)
def read_companies(
    db: Session = Depends(get_db),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    items, total = crud_ops.get_companies(db, search=search, page=page, limit=limit)
    pages = (total + limit - 1) // limit
    return {"items": items, "total": total, "page": page, "pages": pages}

@router.post("/", response_model=CompanySchema, status_code=status.HTTP_201_CREATED)
def create_company(
    *,
    db: Session = Depends(get_db),
    company_in: CompanyCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    existing = crud_ops.get_company_by_name(db, name=company_in.name)
    if existing:
        raise HTTPException(status_code=400, detail="Company name already exists")
    return crud_ops.create_company(db, company=company_in, user_id=current_user.id)

@router.get("/{company_id}", response_model=CompanySchema)
def read_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    company = crud_ops.get_company(db, company_id=company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.put("/{company_id}", response_model=CompanySchema)
def update_company(
    company_id: int,
    company_in: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    company = crud_ops.get_company(db, company_id=company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return crud_ops.update_company(db, db_company=company, company_update=company_in, user_id=current_user.id)

@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)  # Admin only delete
) -> Any:
    deleted = crud_ops.delete_company(db, company_id=company_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"message": "Company deleted successfully"}
