import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="Sales Executive")  # "Admin" or "Sales Executive"
    is_active = Column(Boolean, default=True)
    profile_picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    assigned_leads = relationship("Lead", back_populates="assigned_employee")
    tasks = relationship("Task", back_populates="assigned_user")
    meetings = relationship("Meeting", back_populates="assigned_user")
    notes = relationship("Note", back_populates="user")
    activities = relationship("Activity", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    customers = relationship("Customer", back_populates="company")
    leads = relationship("Lead", back_populates="company")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    job_title = Column(String, nullable=True)
    status = Column(String, default="Active")  # "Active", "Inactive"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="customers")
    leads = relationship("Lead", back_populates="customer")
    tasks = relationship("Task", back_populates="customer")
    meetings = relationship("Meeting", back_populates="customer")
    notes = relationship("Note", back_populates="customer")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    value = Column(Float, default=0.0)
    priority = Column(String, default="Medium")  # "Low", "Medium", "High"
    status = Column(String, default="New")  # "New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"
    expected_closing_date = Column(DateTime, nullable=True)
    
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    assigned_employee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="leads")
    company = relationship("Company", back_populates="leads")
    assigned_employee = relationship("User", back_populates="assigned_leads")
    tasks = relationship("Task", back_populates="lead")
    lead_notes = relationship("Note", back_populates="lead")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    priority = Column(String, default="Medium")  # "Low", "Medium", "High"
    is_completed = Column(Boolean, default=False)
    
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    assigned_user = relationship("User", back_populates="tasks")
    customer = relationship("Customer", back_populates="tasks")
    lead = relationship("Lead", back_populates="tasks")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    time = Column(DateTime, nullable=False)  # Scheduled date/time
    notes = Column(Text, nullable=True)
    
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="meetings")
    assigned_user = relationship("User", back_populates="meetings")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notes")
    customer = relationship("Customer", back_populates="notes")
    lead = relationship("Lead", back_populates="lead_notes")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)  # e.g., "Lead Created", "Meeting Scheduled"
    details = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="activities")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # "New Lead", "Meeting Reminder", "Task Reminder"
    is_read = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
