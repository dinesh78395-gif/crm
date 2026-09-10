from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str

# Lead Schemas
class LeadBase(BaseModel):
    organization_name: str
    contact_person: str
    email: Optional[str] = None
    phone: Optional[str] = None
    category: str = "College"
    requirement: Optional[str] = None
    estimated_value: float = 0.0
    status: str = "NEW"
    priority: Optional[str] = "MEDIUM"
    lead_source: Optional[str] = "Inbound"
    reason: Optional[str] = None
    next_followup_date: Optional[date] = None
    next_followup_time: Optional[str] = None

class LeadCreate(LeadBase):
    assigned_sales_id: Optional[int] = None

class LeadUpdate(BaseModel):
    organization_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    requirement: Optional[str] = None
    estimated_value: Optional[float] = None
    status: Optional[str] = None
    assigned_sales_id: Optional[int] = None
    priority: Optional[str] = None
    lead_source: Optional[str] = None
    reason: Optional[str] = None
    next_followup_date: Optional[date] = None
    next_followup_time: Optional[str] = None

class LeadOut(LeadBase):
    id: int
    lead_code: str
    assigned_sales_id: Optional[int] = None
    assigned_salesperson_name: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class LeadConvertRequest(BaseModel):
    address: Optional[str] = "Campus Main Office"

# Followup Schemas
class FollowupCreate(BaseModel):
    lead_id: Optional[int] = None
    customer_id: Optional[int] = None
    followup_date: date
    followup_time: Optional[str] = "10:00 AM"
    type: str = "Call" # 'Call', 'Meeting', 'Demo', 'Email', 'WhatsApp'
    reason: Optional[str] = None
    previous_interaction: Optional[str] = None
    notes: Optional[str] = None

class FollowupComplete(BaseModel):
    outcome: str
    notes: Optional[str] = None
    next_action: Optional[str] = None
    next_followup_date: Optional[date] = None
    next_followup_time: Optional[str] = None
    updated_lead_status: Optional[str] = None

class FollowupOut(BaseModel):
    id: int
    lead_id: Optional[int] = None
    customer_id: Optional[int] = None
    followup_date: date
    followup_time: Optional[str] = None
    type: str
    reason: Optional[str] = None
    previous_interaction: Optional[str] = None
    notes: Optional[str] = None
    outcome: Optional[str] = None
    next_action: Optional[str] = None
    status: str
    created_by: Optional[int] = None
    created_at: datetime
    priority: Optional[str] = None
    organization_name: Optional[str] = None
    contact_person: Optional[str] = None
    lead_status: Optional[str] = None
    estimated_value: Optional[float] = None
    assigned_salesperson_name: Optional[str] = None
    class Config:
        from_attributes = True

# Customer Schemas
class CustomerOut(BaseModel):
    id: int
    customer_code: str
    lead_id: Optional[int]
    name: str
    category: str
    contact_person: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# Program Schemas
class ProgramCreate(BaseModel):
    title: str
    category: str
    duration_hours: int
    total_sessions: int
    price_per_student: float

class ProgramOut(ProgramCreate):
    id: int
    program_code: str
    status: str
    class Config:
        from_attributes = True

# Trainer Schemas
class TrainerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    expertise: Optional[str] = None
    per_session_rate: float

class TrainerOut(TrainerCreate):
    id: int
    trainer_code: str
    status: str
    class Config:
        from_attributes = True

# Batch Schemas
class BatchCreate(BaseModel):
    program_id: int
    customer_id: int
    trainer_id: int
    start_date: date
    end_date: Optional[date] = None

class BatchOut(BaseModel):
    id: int
    batch_code: str
    program_id: int
    customer_id: int
    trainer_id: int
    start_date: date
    end_date: Optional[date]
    total_enrolled: int
    status: str
    program_title: Optional[str] = None
    customer_name: Optional[str] = None
    trainer_name: Optional[str] = None
    location: Optional[str] = "Campus Tech Lab (Room 302)"
    class Config:
        from_attributes = True

# Student Schemas
class StudentCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    college_company: Optional[str] = None

class StudentOut(StudentCreate):
    id: int
    student_code: str
    batch_code: Optional[str] = None
    status: Optional[str] = "Enrolled"
    attendance_percentage: Optional[float] = 100.0
    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceMarkItem(BaseModel):
    student_id: int
    status: str # 'Present', 'Absent', 'Late'

class AttendanceBulkCreate(BaseModel):
    session_id: int
    records: List[AttendanceMarkItem]

# Invoice Schemas
class InvoiceItemSchema(BaseModel):
    description: str
    quantity: int
    unit_price: float

class InvoiceCreate(BaseModel):
    customer_id: int
    batch_id: Optional[int] = None
    issue_date: date
    due_date: date
    items: List[InvoiceItemSchema]

class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    customer_id: int
    batch_id: Optional[int]
    issue_date: date
    due_date: date
    subtotal: float
    tax_amount: float
    total_amount: float
    status: str
    customer_name: Optional[str] = None
    paid_amount: Optional[float] = 0.0
    outstanding: Optional[float] = 0.0
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentCreate(BaseModel):
    invoice_id: int
    amount: float
    payment_mode: str = "RTGS/NEFT"
    reference_number: Optional[str] = None
    payment_date: Optional[date] = None
    notes: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    receipt_number: str
    invoice_id: int
    customer_id: int
    payment_date: date
    amount: float
    payment_mode: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    recorded_by: Optional[int] = None
    customer_name: Optional[str] = None
    invoice_number: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class InvoicePaymentInfo(BaseModel):
    id: int
    invoice_number: str
    customer_id: int
    customer_name: str
    total_amount: float
    paid_amount: float
    outstanding: float
    due_date: date
    issue_date: date
    status: str

# Expense Schemas
class ExpenseCreate(BaseModel):
    category: str
    description: str
    amount: float
    expense_date: date
    batch_id: Optional[int] = None
    vendor_id: Optional[int] = None
    trainer_id: Optional[int] = None
    paid_via: str = "Bank Transfer"

class ExpenseOut(ExpenseCreate):
    id: int
    expense_code: str
    created_at: datetime
    class Config:
        from_attributes = True

# Vendor Schemas
class VendorCreate(BaseModel):
    name: str
    category: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None

class VendorOut(VendorCreate):
    id: int
    class Config:
        from_attributes = True

# Dashboard Overview
class DashboardMetrics(BaseModel):
    total_leads: int
    conversion_rate: float
    active_customers: int
    active_batches: int
    total_students: int
    total_revenue: float
    total_collected: float
    total_outstanding: float
    total_expenses: float
    net_profit: float
    profit_margin: float
