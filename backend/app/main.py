from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import datetime

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.api import api_router
from app.models.all_models import User, Company, Customer, Lead, Task, Meeting, Activity, Notification
from app.core.security import get_password_hash

def seed_db(db: Session):
    # Check if we already seeded database
    if db.query(User).count() > 0:
        return

    print("Seeding database with sample records...")
    
    # 1. Create Users
    admin = User(
        email="admin@leadflow.com",
        name="LeadFlow Admin",
        hashed_password=get_password_hash("AdminPassword123"),
        phone="555-0100",
        role="Admin",
        is_active=True
    )
    sarah = User(
        email="sarah@leadflow.com",
        name="Sarah Jenkins",
        hashed_password=get_password_hash("SarahPassword123"),
        phone="555-0101",
        role="Sales Executive",
        is_active=True
    )
    david = User(
        email="david@leadflow.com",
        name="David Miller",
        hashed_password=get_password_hash("DavidPassword123"),
        phone="555-0102",
        role="Sales Executive",
        is_active=True
    )
    michael = User(
        email="michael@leadflow.com",
        name="Michael Chen",
        hashed_password=get_password_hash("MichaelPassword123"),
        phone="555-0103",
        role="Sales Executive",
        is_active=True
    )
    
    db.add_all([admin, sarah, david, michael])
    db.commit() # Commit to get IDs
    
    # Refresh to load IDs
    db.refresh(admin)
    db.refresh(sarah)
    db.refresh(david)
    db.refresh(michael)

    # 2. Create Companies
    acme = Company(
        name="Acme Corporation",
        industry="Manufacturing",
        website="https://acme.org",
        phone="555-1000",
        address="123 Industrial Way, Chicago IL"
    )
    globex = Company(
        name="Globex Industries",
        industry="Technology",
        website="https://globex.co",
        phone="555-2000",
        address="456 Silicon Valley Blvd, San Jose CA"
    )
    hooli = Company(
        name="Hooli",
        industry="Enterprise Software",
        website="https://hooli.xyz",
        phone="555-3000",
        address="789 Pied Piper Lane, Palo Alto CA"
    )
    initech = Company(
        name="Initech",
        industry="Financial Services",
        website="https://initech.biz",
        phone="555-4000",
        address="100 Office Space Way, Austin TX"
    )
    
    db.add_all([acme, globex, hooli, initech])
    db.commit()
    db.refresh(acme)
    db.refresh(globex)
    db.refresh(hooli)
    db.refresh(initech)

    # 3. Create Customers
    c1 = Customer(
        name="John Doe",
        email="john.doe@acme.org",
        phone="555-1001",
        company_id=acme.id,
        job_title="VP of Procurement",
        status="Active"
    )
    c2 = Customer(
        name="Alice Smith",
        email="alice.smith@globex.co",
        phone="555-2001",
        company_id=globex.id,
        job_title="Chief Technology Officer",
        status="Active"
    )
    c3 = Customer(
        name="Peter Gibbons",
        email="peter@initech.biz",
        phone="555-4001",
        company_id=initech.id,
        job_title="Software Architect",
        status="Active"
    )
    c4 = Customer(
        name="Richard Hendricks",
        email="richard@hooli.xyz",
        phone="555-3001",
        company_id=hooli.id,
        job_title="Director of Engineering",
        status="Active"
    )
    c5 = Customer(
        name="Erlich Bachman",
        email="erlich@bachmanity.com",
        phone="555-3002",
        company_id=hooli.id,
        job_title="Board Member",
        status="Active"
    )
    
    db.add_all([c1, c2, c3, c4, c5])
    db.commit()
    db.refresh(c1)
    db.refresh(c2)
    db.refresh(c3)
    db.refresh(c4)
    db.refresh(c5)

    # 4. Create Leads
    l1 = Lead(
        name="Acme Enterprise Supply Contract",
        value=85000.0,
        priority="High",
        status="Negotiation",
        expected_closing_date=datetime.datetime.now() + datetime.timedelta(days=20),
        customer_id=c1.id,
        company_id=acme.id,
        assigned_employee_id=sarah.id,
        notes="Negotiating delivery terms and quarterly volume discounts."
    )
    l2 = Lead(
        name="Globex Cloud Infrastructure Expansion",
        value=150000.0,
        priority="High",
        status="Won",
        expected_closing_date=datetime.datetime.now() - datetime.timedelta(days=10),
        customer_id=c2.id,
        company_id=globex.id,
        assigned_employee_id=sarah.id,
        notes="Deals finalized. Setup scheduled."
    )
    l3 = Lead(
        name="Hooli Nucleus Platform License Upgrade",
        value=65000.0,
        priority="Medium",
        status="Won",
        expected_closing_date=datetime.datetime.now() - datetime.timedelta(days=5),
        customer_id=c4.id,
        company_id=hooli.id,
        assigned_employee_id=david.id,
        notes="Upgrade finalized and invoiced."
    )
    l4 = Lead(
        name="Initech Database Migration Services",
        value=42000.0,
        priority="Medium",
        status="Proposal",
        expected_closing_date=datetime.datetime.now() + datetime.timedelta(days=15),
        customer_id=c3.id,
        company_id=initech.id,
        assigned_employee_id=david.id,
        notes="Sent proposal. Awaiting confirmation."
    )
    l5 = Lead(
        name="Bachmanity Tech Stack Consulting",
        value=30000.0,
        priority="Low",
        status="Contacted",
        expected_closing_date=datetime.datetime.now() + datetime.timedelta(days=40),
        customer_id=c5.id,
        company_id=hooli.id,
        assigned_employee_id=michael.id,
        notes="Discussed tech stack capabilities."
    )
    l6 = Lead(
        name="Globex Backup Services Pilot",
        value=18000.0,
        priority="Low",
        status="Lost",
        expected_closing_date=datetime.datetime.now() - datetime.timedelta(days=30),
        customer_id=c2.id,
        company_id=globex.id,
        assigned_employee_id=michael.id,
        notes="Competitor pricing was cheaper."
    )
    
    db.add_all([l1, l2, l3, l4, l5, l6])
    db.commit()

    # 5. Create Tasks
    t1 = Task(
        title="Follow up on Acme pricing contract",
        description="Verify if procurement approved the 5% tier reduction.",
        due_date=datetime.datetime.now() + datetime.timedelta(days=2),
        priority="High",
        is_completed=False,
        assigned_user_id=sarah.id,
        customer_id=c1.id
    )
    t2 = Task(
        title="Send proposal breakdown to Initech",
        description="Detail costs related to server instances and engineering hours.",
        due_date=datetime.datetime.now() + datetime.timedelta(days=1),
        priority="High",
        is_completed=False,
        assigned_user_id=david.id,
        customer_id=c3.id
    )
    t3 = Task(
        title="Schedule kickoff call with Globex IT Team",
        description="Need to align schedules for platform provisioning.",
        due_date=datetime.datetime.now() - datetime.timedelta(days=1),
        priority="Medium",
        is_completed=True,
        assigned_user_id=sarah.id,
        customer_id=c2.id
    )
    t4 = Task(
        title="Introductory call with Erlich",
        description="Initial meet and greet to map consulting parameters.",
        due_date=datetime.datetime.now() + datetime.timedelta(days=5),
        priority="Low",
        is_completed=False,
        assigned_user_id=michael.id,
        customer_id=c5.id
    )
    db.add_all([t1, t2, t3, t4])
    db.commit()

    # 6. Create Meetings
    m1 = Meeting(
        title="Acme Quarterly Account Review",
        description="Sync on contract negotiation and expected close timeline.",
        time=datetime.datetime.now() + datetime.timedelta(days=3, hours=2),
        notes="Reviewing pricing sheet options",
        customer_id=c1.id,
        assigned_user_id=sarah.id
    )
    m2 = Meeting(
        title="Initech Migration Proposal Discussion",
        description="Walkthrough of details and timeline details.",
        time=datetime.datetime.now() + datetime.timedelta(days=1, hours=4),
        notes="Be sure to cover database schemas.",
        customer_id=c3.id,
        assigned_user_id=david.id
    )
    db.add_all([m1, m2])
    db.commit()

    # 7. Create Activities
    act1 = Activity(
        action="Lead Status Changed",
        details="Moved lead 'Globex Cloud Infrastructure Expansion' from Negotiation to Won",
        user_id=sarah.id,
        created_at=datetime.datetime.now() - datetime.timedelta(days=10)
    )
    act2 = Activity(
        action="Lead Status Changed",
        details="Moved lead 'Hooli Nucleus Platform License Upgrade' from Proposal to Won",
        user_id=david.id,
        created_at=datetime.datetime.now() - datetime.timedelta(days=5)
    )
    act3 = Activity(
        action="Meeting Scheduled",
        details="Scheduled meeting 'Initech Migration Proposal Discussion'",
        user_id=david.id,
        created_at=datetime.datetime.now() - datetime.timedelta(hours=2)
    )
    db.add_all([act1, act2, act3])
    db.commit()

    # 8. Create Notifications
    n1 = Notification(
        title="New Lead Assigned",
        content="You have been assigned the lead 'Acme Enterprise Supply Contract'",
        type="New Lead",
        is_read=False,
        user_id=sarah.id
    )
    n2 = Notification(
        title="Task Reminder",
        content="Task 'Follow up on Acme pricing contract' is due soon",
        type="Task Reminder",
        is_read=False,
        user_id=sarah.id
    )
    n3 = Notification(
        title="Meeting Reminder",
        content="Meeting 'Initech Migration Proposal Discussion' starts tomorrow",
        type="Meeting Reminder",
        is_read=False,
        user_id=david.id
    )
    db.add_all([n1, n2, n3])
    db.commit()
    print("Database seeding completed.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Seed Database
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
        
    yield
    # Shutdown logic (none needed)

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS] + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to LeadFlow CRM API. Head to /docs for Swagger UI documentation."}
