from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.all_models import User
from app.schemas.all_schemas import Task as TaskSchema, TaskCreate, TaskUpdate
from app.crud import crud_ops

router = APIRouter()

@router.get("/", response_model=List[TaskSchema])
def read_tasks(
    db: Session = Depends(get_db),
    is_completed: bool = Query(None),
    customer_id: int = Query(None),
    lead_id: int = Query(None),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # If the user is Sales Executive, they only get their own tasks
    assigned_user_id = current_user.id if current_user.role == "Sales Executive" else None
    return crud_ops.get_tasks(
        db, 
        assigned_user_id=assigned_user_id, 
        is_completed=is_completed, 
        customer_id=customer_id, 
        lead_id=lead_id
    )

@router.post("/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
def create_task(
    *,
    db: Session = Depends(get_db),
    task_in: TaskCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # If Sales Executive, force task to be assigned to themselves
    if current_user.role == "Sales Executive":
        task_in.assigned_user_id = current_user.id
    return crud_ops.create_task(db, task=task_in, user_id=current_user.id)

@router.get("/{task_id}", response_model=TaskSchema)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    task = crud_ops.get_task(db, task_id=task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "Sales Executive" and task.assigned_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return task

@router.put("/{task_id}", response_model=TaskSchema)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    task = crud_ops.get_task(db, task_id=task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "Sales Executive" and task.assigned_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return crud_ops.update_task(db, db_task=task, task_update=task_in, user_id=current_user.id)

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    task = crud_ops.get_task(db, task_id=task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "Sales Executive" and task.assigned_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    crud_ops.delete_task(db, task_id=task_id, user_id=current_user.id)
    return {"message": "Task deleted successfully"}
