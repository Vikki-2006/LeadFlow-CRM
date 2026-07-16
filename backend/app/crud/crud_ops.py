from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta

from app.models.all_models import User, Company, Customer, Lead, Task, Meeting, Note, Activity, Notification
from app.schemas.all_schemas import UserCreate, UserUpdate, CompanyCreate, CompanyUpdate, CustomerCreate, CustomerUpdate, LeadCreate, LeadUpdate, TaskCreate, TaskUpdate, MeetingCreate, MeetingUpdate, NoteCreate
from app.core.security import get_password_hash

# --- Activity Helper ---
def log_activity(db: Session, user_id: int, action: str, details: Optional[str] = None) -> Activity:
    db_activity = Activity(user_id=user_id, action=action, details=details)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

# --- Notification Helper ---
def create_notification(db: Session, user_id: int, title: str, content: str, type_: str) -> Notification:
    db_notif = Notification(user_id=user_id, title=title, content=content, type=type_, is_read=False)
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif


# --- User CRUD ---
def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        name=user.name,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        profile_picture=user.profile_picture,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_update: UserUpdate) -> User:
    update_data = user_update.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        hashed_password = get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
        del update_data["password"]
        
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


# --- Company CRUD ---
def get_company(db: Session, company_id: int) -> Optional[Company]:
    return db.query(Company).filter(Company.id == company_id).first()

def get_company_by_name(db: Session, name: str) -> Optional[Company]:
    return db.query(Company).filter(Company.name == name).first()

def get_companies(
    db: Session, 
    search: Optional[str] = None, 
    page: int = 1, 
    limit: int = 10
) -> Tuple[List[Company], int]:
    query = db.query(Company)
    if search:
        query = query.filter(
            or_(
                Company.name.ilike(f"%{search}%"),
                Company.industry.ilike(f"%{search}%"),
                Company.address.ilike(f"%{search}%")
            )
        )
    total = query.count()
    skip = (page - 1) * limit
    items = query.order_by(Company.name.asc()).offset(skip).limit(limit).all()
    return items, total

def create_company(db: Session, company: CompanyCreate, user_id: int) -> Company:
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    log_activity(db, user_id, "Company Created", f"Created company '{db_company.name}'")
    return db_company

def update_company(db: Session, db_company: Company, company_update: CompanyUpdate, user_id: int) -> Company:
    for key, value in company_update.model_dump(exclude_unset=True).items():
        setattr(db_company, key, value)
    db.commit()
    db.refresh(db_company)
    log_activity(db, user_id, "Company Updated", f"Updated company details for '{db_company.name}'")
    return db_company

def delete_company(db: Session, company_id: int, user_id: int) -> bool:
    db_company = get_company(db, company_id)
    if db_company:
        name = db_company.name
        db.delete(db_company)
        db.commit()
        log_activity(db, user_id, "Company Deleted", f"Deleted company '{name}'")
        return True
    return False


# --- Customer CRUD ---
def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.id == customer_id).first()

def get_customers(
    db: Session, 
    search: Optional[str] = None, 
    company_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1, 
    limit: int = 10,
    user_id: Optional[int] = None, # If sales executive, filter can be done outside or by leads assigned to them.
    user_role: Optional[str] = None
) -> Tuple[List[Customer], int]:
    query = db.query(Customer)
    if search:
        query = query.filter(
            or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
                Customer.phone.ilike(f"%{search}%"),
                Customer.job_title.ilike(f"%{search}%")
            )
        )
    if company_id:
        query = query.filter(Customer.company_id == company_id)
    if status:
        query = query.filter(Customer.status == status)
        
    # If the user is a Sales Executive, we only allow access to customers associated with their assigned leads.
    if user_role == "Sales Executive" and user_id:
        query = query.join(Lead, Lead.customer_id == Customer.id, isouter=True).filter(
            or_(Lead.assigned_employee_id == user_id, Customer.id.in_(
                db.query(Meeting.customer_id).filter(Meeting.assigned_user_id == user_id)
            ))
        )
        
    total = query.distinct().count()
    skip = (page - 1) * limit
    items = query.distinct().order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()
    return items, total

def create_customer(db: Session, customer: CustomerCreate, user_id: int) -> Customer:
    db_customer = Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    log_activity(db, user_id, "Customer Created", f"Added customer '{db_customer.name}'")
    return db_customer

def update_customer(db: Session, db_customer: Customer, customer_update: CustomerUpdate, user_id: int) -> Customer:
    for key, value in customer_update.model_dump(exclude_unset=True).items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    log_activity(db, user_id, "Customer Updated", f"Updated details for customer '{db_customer.name}'")
    return db_customer

def delete_customer(db: Session, customer_id: int, user_id: int) -> bool:
    db_customer = get_customer(db, customer_id)
    if db_customer:
        name = db_customer.name
        db.delete(db_customer)
        db.commit()
        log_activity(db, user_id, "Customer Deleted", f"Deleted customer '{name}'")
        return True
    return False


# --- Lead CRUD ---
def get_lead(db: Session, lead_id: int) -> Optional[Lead]:
    return db.query(Lead).filter(Lead.id == lead_id).first()

def get_leads(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_employee_id: Optional[int] = None,
    page: int = 1,
    limit: int = 100, # Large default for pipelines
    user_id: Optional[int] = None,
    user_role: Optional[str] = None
) -> Tuple[List[Lead], int]:
    query = db.query(Lead)
    if search:
        query = query.filter(Lead.name.ilike(f"%{search}%"))
    if status:
        query = query.filter(Lead.status == status)
    if priority:
        query = query.filter(Lead.priority == priority)
    if assigned_employee_id:
        query = query.filter(Lead.assigned_employee_id == assigned_employee_id)
        
    # Sales Executive scoping
    if user_role == "Sales Executive" and user_id:
        query = query.filter(Lead.assigned_employee_id == user_id)
        
    total = query.count()
    skip = (page - 1) * limit
    items = query.order_by(Lead.updated_at.desc()).offset(skip).limit(limit).all()
    return items, total

def create_lead(db: Session, lead: LeadCreate, user_id: int) -> Lead:
    db_lead = Lead(**lead.model_dump())
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    log_activity(db, user_id, "Lead Created", f"Created lead '{db_lead.name}' worth ${db_lead.value:,.2f}")
    
    # Notify assigned employee if different from creator
    if db_lead.assigned_employee_id and db_lead.assigned_employee_id != user_id:
        create_notification(
            db, 
            db_lead.assigned_employee_id, 
            "New Lead Assigned", 
            f"You have been assigned the lead '{db_lead.name}'", 
            "New Lead"
        )
    return db_lead

def update_lead(db: Session, db_lead: Lead, lead_update: LeadUpdate, user_id: int) -> Lead:
    old_status = db_lead.status
    old_assigned = db_lead.assigned_employee_id
    
    for key, value in lead_update.model_dump(exclude_unset=True).items():
        setattr(db_lead, key, value)
        
    db.commit()
    db.refresh(db_lead)
    
    if old_status != db_lead.status:
        log_activity(db, user_id, "Lead Status Changed", f"Moved lead '{db_lead.name}' from {old_status} to {db_lead.status}")
    else:
        log_activity(db, user_id, "Lead Updated", f"Updated details for lead '{db_lead.name}'")
        
    # Notify if assignment changed
    if db_lead.assigned_employee_id and db_lead.assigned_employee_id != old_assigned:
        create_notification(
            db,
            db_lead.assigned_employee_id,
            "Lead Reassigned",
            f"Lead '{db_lead.name}' has been assigned to you.",
            "New Lead"
        )
    return db_lead

def delete_lead(db: Session, lead_id: int, user_id: int) -> bool:
    db_lead = get_lead(db, lead_id)
    if db_lead:
        name = db_lead.name
        db.delete(db_lead)
        db.commit()
        log_activity(db, user_id, "Lead Deleted", f"Deleted lead '{name}'")
        return True
    return False


# --- Task CRUD ---
def get_task(db: Session, task_id: int) -> Optional[Task]:
    return db.query(Task).filter(Task.id == task_id).first()

def get_tasks(
    db: Session,
    assigned_user_id: Optional[int] = None,
    is_completed: Optional[bool] = None,
    customer_id: Optional[int] = None,
    lead_id: Optional[int] = None
) -> List[Task]:
    query = db.query(Task)
    if assigned_user_id:
        query = query.filter(Task.assigned_user_id == assigned_user_id)
    if is_completed is not None:
        query = query.filter(Task.is_completed == is_completed)
    if customer_id:
        query = query.filter(Task.customer_id == customer_id)
    if lead_id:
        query = query.filter(Task.lead_id == lead_id)
    return query.order_by(Task.due_date.asc().nullslast()).all()

def create_task(db: Session, task: TaskCreate, user_id: int) -> Task:
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    log_activity(db, user_id, "Task Created", f"Created task '{db_task.title}'")
    
    if db_task.assigned_user_id != user_id:
        create_notification(
            db,
            db_task.assigned_user_id,
            "New Task Assigned",
            f"You have been assigned a task: '{db_task.title}' due on {db_task.due_date.strftime('%Y-%m-%d') if db_task.due_date else 'N/A'}",
            "Task Reminder"
        )
    return db_task

def update_task(db: Session, db_task: Task, task_update: TaskUpdate, user_id: int) -> Task:
    old_status = db_task.is_completed
    for key, value in task_update.model_dump(exclude_unset=True).items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    
    if old_status != db_task.is_completed:
        status_str = "Completed" if db_task.is_completed else "Re-opened"
        log_activity(db, user_id, "Task Status Changed", f"Marked task '{db_task.title}' as {status_str}")
    else:
        log_activity(db, user_id, "Task Updated", f"Updated task '{db_task.title}'")
        
    return db_task

def delete_task(db: Session, task_id: int, user_id: int) -> bool:
    db_task = get_task(db, task_id)
    if db_task:
        title = db_task.title
        db.delete(db_task)
        db.commit()
        log_activity(db, user_id, "Task Deleted", f"Deleted task '{title}'")
        return True
    return False


# --- Meeting CRUD ---
def get_meeting(db: Session, meeting_id: int) -> Optional[Meeting]:
    return db.query(Meeting).filter(Meeting.id == meeting_id).first()

def get_meetings(
    db: Session,
    assigned_user_id: Optional[int] = None,
    customer_id: Optional[int] = None
) -> List[Meeting]:
    query = db.query(Meeting)
    if assigned_user_id:
        query = query.filter(Meeting.assigned_user_id == assigned_user_id)
    if customer_id:
        query = query.filter(Meeting.customer_id == customer_id)
    return query.order_by(Meeting.time.asc()).all()

def create_meeting(db: Session, meeting: MeetingCreate, user_id: int) -> Meeting:
    db_meeting = Meeting(**meeting.model_dump())
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    log_activity(db, user_id, "Meeting Scheduled", f"Scheduled meeting '{db_meeting.title}' for {db_meeting.time.strftime('%Y-%m-%d %H:%M')}")
    
    if db_meeting.assigned_user_id != user_id:
        create_notification(
            db,
            db_meeting.assigned_user_id,
            "New Meeting Scheduled",
            f"Scheduled meeting with you: '{db_meeting.title}'",
            "Meeting Reminder"
        )
    return db_meeting

def update_meeting(db: Session, db_meeting: Meeting, meeting_update: MeetingUpdate, user_id: int) -> Meeting:
    for key, value in meeting_update.model_dump(exclude_unset=True).items():
        setattr(db_meeting, key, value)
    db.commit()
    db.refresh(db_meeting)
    log_activity(db, user_id, "Meeting Updated", f"Updated meeting details for '{db_meeting.title}'")
    return db_meeting

def delete_meeting(db: Session, meeting_id: int, user_id: int) -> bool:
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        title = db_meeting.title
        db.delete(db_meeting)
        db.commit()
        log_activity(db, user_id, "Meeting Deleted", f"Deleted meeting '{title}'")
        return True
    return False


# --- Notes CRUD ---
def create_note(db: Session, note: NoteCreate, user_id: int) -> Note:
    db_note = Note(
        content=note.content,
        customer_id=note.customer_id,
        lead_id=note.lead_id,
        company_id=note.company_id,
        user_id=user_id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # Log details depending on targets
    target = ""
    if note.customer_id:
        target += f" for customer #{note.customer_id}"
    if note.lead_id:
        target += f" for lead #{note.lead_id}"
    log_activity(db, user_id, "Note Added", f"Added note{target}")
    return db_note

def get_notes_for_target(
    db: Session,
    customer_id: Optional[int] = None,
    lead_id: Optional[int] = None,
    company_id: Optional[int] = None
) -> List[Note]:
    query = db.query(Note)
    if customer_id:
        query = query.filter(Note.customer_id == customer_id)
    if lead_id:
        query = query.filter(Note.lead_id == lead_id)
    if company_id:
        query = query.filter(Note.company_id == company_id)
    return query.order_by(Note.created_at.desc()).all()


# --- Activity & Notification Queries ---
def get_activities(db: Session, limit: int = 50) -> List[Activity]:
    return db.query(Activity).order_by(Activity.created_at.desc()).limit(limit).all()

def get_notifications(db: Session, user_id: int, unread_only: bool = False) -> List[Notification]:
    query = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.created_at.desc()).all()

def mark_notification_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notif:
        notif.is_read = True
        db.commit()
        db.refresh(notif)
    return notif

def mark_all_notifications_read(db: Session, user_id: int) -> int:
    result = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return result
