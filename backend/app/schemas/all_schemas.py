from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel, EmailStr

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    name: str

class TokenData(BaseModel):
    username: Optional[str] = None


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    role: Optional[str] = "Sales Executive"
    is_active: Optional[bool] = True
    profile_picture: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    profile_picture: Optional[str] = None
    password: Optional[str] = None

class UserUpdatePassword(BaseModel):
    old_password: str
    new_password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Note Schemas ---
class NoteBase(BaseModel):
    content: str
    customer_id: Optional[int] = None
    lead_id: Optional[int] = None
    company_id: Optional[int] = None

class NoteCreate(NoteBase):
    pass

class Note(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    user: Optional[UserBase] = None

    class Config:
        from_attributes = True


# --- Company Schemas ---
class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class Company(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Customer Schemas ---
class CustomerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_id: Optional[int] = None
    job_title: Optional[str] = None
    status: Optional[str] = "Active"

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company_id: Optional[int] = None
    job_title: Optional[str] = None
    status: Optional[str] = None

class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime
    company: Optional[Company] = None

    class Config:
        from_attributes = True


# --- Lead Schemas ---
class LeadBase(BaseModel):
    name: str
    value: Optional[float] = 0.0
    priority: Optional[str] = "Medium"
    status: Optional[str] = "New"
    expected_closing_date: Optional[datetime] = None
    customer_id: Optional[int] = None
    company_id: Optional[int] = None
    assigned_employee_id: Optional[int] = None
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[float] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    expected_closing_date: Optional[datetime] = None
    customer_id: Optional[int] = None
    company_id: Optional[int] = None
    assigned_employee_id: Optional[int] = None
    notes: Optional[str] = None

class Lead(LeadBase):
    id: int
    created_at: datetime
    updated_at: datetime
    customer: Optional[Customer] = None
    company: Optional[Company] = None
    assigned_employee: Optional[UserBase] = None

    class Config:
        from_attributes = True


# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "Medium"
    is_completed: Optional[bool] = False
    assigned_user_id: int
    customer_id: Optional[int] = None
    lead_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    is_completed: Optional[bool] = None
    assigned_user_id: Optional[int] = None
    customer_id: Optional[int] = None
    lead_id: Optional[int] = None

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    assigned_user: Optional[UserBase] = None
    customer: Optional[Customer] = None
    lead: Optional[Lead] = None

    class Config:
        from_attributes = True


# --- Meeting Schemas ---
class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    time: datetime
    notes: Optional[str] = None
    customer_id: Optional[int] = None
    assigned_user_id: int

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time: Optional[datetime] = None
    notes: Optional[str] = None
    customer_id: Optional[int] = None
    assigned_user_id: Optional[int] = None

class Meeting(MeetingBase):
    id: int
    created_at: datetime
    updated_at: datetime
    customer: Optional[Customer] = None
    assigned_user: Optional[UserBase] = None

    class Config:
        from_attributes = True


# --- Activity Schemas ---
class Activity(BaseModel):
    id: int
    action: str
    details: Optional[str] = None
    user_id: int
    created_at: datetime
    user: Optional[UserBase] = None

    class Config:
        from_attributes = True


# --- Notification Schemas ---
class NotificationBase(BaseModel):
    title: str
    content: str
    type: str
    is_read: Optional[bool] = False
    user_id: int

class Notification(NotificationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Paginated Schemas ---
class PaginatedCustomers(BaseModel):
    items: List[Customer]
    total: int
    page: int
    pages: int

class PaginatedCompanies(BaseModel):
    items: List[Company]
    total: int
    page: int
    pages: int

class PaginatedLeads(BaseModel):
    items: List[Lead]
    total: int
    page: int
    pages: int


# --- Analytics Schemas ---
class MonthlyRevenue(BaseModel):
    month: str
    revenue: float

class ConversionRate(BaseModel):
    status: str
    count: int

class CustomerGrowth(BaseModel):
    month: str
    count: int

class SalesPipelineStage(BaseModel):
    stage: str
    count: int
    value: float

class TopEmployeePerformance(BaseModel):
    name: str
    deals_won: int
    revenue_generated: float

class AnalyticsReport(BaseModel):
    monthly_revenue: List[MonthlyRevenue]
    lead_conversion_rate: List[ConversionRate]
    customer_growth: List[CustomerGrowth]
    sales_pipeline: List[SalesPipelineStage]
    top_employees: List[TopEmployeePerformance]
    total_customers: int
    total_companies: int
    total_revenue: float
    active_leads_count: int
