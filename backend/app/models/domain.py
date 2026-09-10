from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("Role", back_populates="users")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    lead_code = Column(String(50), unique=True, nullable=False, index=True)
    organization_name = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=False)
    email = Column(String(120))
    phone = Column(String(20))
    category = Column(String(50), default="College")
    requirement = Column(Text, nullable=True)
    estimated_value = Column(Float, default=0.0)
    status = Column(String(50), default="NEW") # 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'
    assigned_sales_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    next_followup_date = Column(Date, nullable=True)
    next_followup_time = Column(String(20), nullable=True)
    priority = Column(String(20), default="MEDIUM") # 'HIGH', 'MEDIUM', 'LOW'
    lead_source = Column(String(50), default="Inbound")
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assigned_salesperson = relationship("User", foreign_keys=[assigned_sales_id])
    followups = relationship("Followup", back_populates="lead", cascade="all, delete-orphan")
    customer = relationship("Customer", back_populates="lead", uselist=False)

class Followup(Base):
    __tablename__ = "followups"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    followup_date = Column(Date, nullable=False)
    followup_time = Column(String(20), nullable=True)
    type = Column(String(50), nullable=False) # 'Call', 'Meeting', 'Demo', 'Email', 'WhatsApp'
    reason = Column(Text, nullable=True)
    previous_interaction = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    outcome = Column(Text, nullable=True)
    next_action = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING") # 'PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED'
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="followups")
    customer = relationship("Customer")
    creator = relationship("User", foreign_keys=[created_by])

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    customer_code = Column(String(50), unique=True, nullable=False, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), unique=True, nullable=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    contact_person = Column(String(100))
    email = Column(String(120))
    phone = Column(String(20))
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="customer")
    batches = relationship("Batch", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")

class Quotation(Base):
    __tablename__ = "quotations"
    id = Column(Integer, primary_key=True, index=True)
    quotation_number = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="Draft")
    created_at = Column(DateTime, default=datetime.utcnow)

class Program(Base):
    __tablename__ = "programs"
    id = Column(Integer, primary_key=True, index=True)
    program_code = Column(String(50), unique=True, nullable=False)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    duration_hours = Column(Integer, nullable=False)
    total_sessions = Column(Integer, nullable=False)
    price_per_student = Column(Float, nullable=False)
    status = Column(String(50), default="Active")

    batches = relationship("Batch", back_populates="program")

class Trainer(Base):
    __tablename__ = "trainers"
    id = Column(Integer, primary_key=True, index=True)
    trainer_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    phone = Column(String(20))
    expertise = Column(String(100))
    per_session_rate = Column(Float, nullable=False)
    status = Column(String(50), default="Active")

    batches = relationship("Batch", back_populates="trainer")
    expenses = relationship("Expense", back_populates="trainer")

class Batch(Base):
    __tablename__ = "batches"
    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String(50), unique=True, nullable=False, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    total_enrolled = Column(Integer, default=0)
    status = Column(String(50), default="In-Progress")
    created_at = Column(DateTime, default=datetime.utcnow)

    program = relationship("Program", back_populates="batches")
    customer = relationship("Customer", back_populates="batches")
    trainer = relationship("Trainer", back_populates="batches")
    sessions = relationship("Session", back_populates="batch", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="batch")
    expenses = relationship("Expense", back_populates="batch")
    batch_students = relationship("BatchStudent", back_populates="batch", cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    student_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(120))
    phone = Column(String(20))
    college_company = Column(String(150))
    created_at = Column(DateTime, default=datetime.utcnow)

    batch_students = relationship("BatchStudent", back_populates="student", cascade="all, delete-orphan")

class BatchStudent(Base):
    __tablename__ = "batch_students"
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    enrollment_date = Column(Date, default=datetime.utcnow().date)
    completion_status = Column(String(50), default="Enrolled")

    batch = relationship("Batch", back_populates="batch_students")
    student = relationship("Student", back_populates="batch_students")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    session_number = Column(Integer, nullable=False)
    topic = Column(String(200), nullable=False)
    session_date = Column(Date, nullable=False)
    status = Column(String(50), default="Scheduled")

    batch = relationship("Batch", back_populates="sessions")
    attendance = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    status = Column(String(20), nullable=False) # 'Present', 'Absent', 'Late'
    recorded_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("Session", back_populates="attendance")
    student = relationship("Student")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    subtotal = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default="Unpaid") # 'Unpaid', 'Partially Paid', 'Paid', 'Overdue'
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="invoices")
    batch = relationship("Batch", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    description = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    amount = Column(Float, nullable=False)

    invoice = relationship("Invoice", back_populates="items")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    receipt_number = Column(String(50), unique=True, nullable=False, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    payment_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(50), nullable=False)
    reference_number = Column(String(100))
    notes = Column(Text)
    recorded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    invoice = relationship("Invoice", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")
    recorder = relationship("User", foreign_keys=[recorded_by])

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    contact_person = Column(String(100))
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    expenses = relationship("Expense", back_populates="vendor")

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    expense_code = Column(String(50), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    expense_date = Column(Date, nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=True)
    paid_via = Column(String(50), default="Bank Transfer")
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("Batch", back_populates="expenses")
    vendor = relationship("Vendor", back_populates="expenses")
    trainer = relationship("Trainer", back_populates="expenses")
