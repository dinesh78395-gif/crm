from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta

from app.database import get_db
from app.models.domain import Lead, Followup, Customer, Batch, Invoice, Payment, Expense, Student, BatchStudent, Program, Trainer, User
from app.schemas.pydantic_schemas import (
    LeadCreate, LeadUpdate, LeadOut, LeadConvertRequest, FollowupCreate, FollowupComplete, FollowupOut, CustomerOut
)
from app.auth.jwt import get_current_user, require_roles

router = APIRouter(prefix="/api/crm", tags=["CRM"])

def compute_followup_priority(followup: Followup, lead: Optional[Lead] = None) -> str:
    """
    Rule-based Priority calculation:
    HIGH:
    - Overdue follow-up (scheduled_date < today AND status == 'PENDING')
    - Follow-up due today (scheduled_date == today AND status == 'PENDING')
    - High-value lead currently in negotiation (lead.status == 'NEGOTIATION' or lead.priority == 'HIGH')
    
    MEDIUM:
    - Proposal sent and awaiting response (lead.status == 'PROPOSAL_SENT')
    - Qualified lead (lead.status == 'QUALIFIED')
    - Follow-up within the next 2 days
    
    LOW:
    - New lead (lead.status == 'NEW')
    - Follow-up more than 2 days away
    """
    today = date.today()
    f_date = followup.followup_date

    if followup.status == "PENDING":
        if f_date < today:
            return "HIGH" # Overdue
        if f_date == today:
            return "HIGH" # Due Today

    if lead:
        if lead.status == "NEGOTIATION" or lead.priority == "HIGH":
            return "HIGH"
        if lead.status in ["PROPOSAL_SENT", "QUALIFIED"]:
            return "MEDIUM"
        if lead.status == "NEW":
            return "LOW"
    
    if f_date <= today + timedelta(days=2):
        return "MEDIUM"
    
    return "LOW"

@router.get("/leads", response_model=List[LeadOut])
def get_leads(db: Session = Depends(get_db), current_user = Depends(require_roles(["SALES", "MANAGEMENT"]))):
    leads = db.query(Lead).order_by(Lead.id.desc()).all()
    res = []
    for l in leads:
        lead_dict = LeadOut.from_orm(l)
        if l.assigned_salesperson:
            lead_dict.assigned_salesperson_name = l.assigned_salesperson.name
        res.append(lead_dict)
    return res

@router.post("/leads", response_model=LeadOut)
def create_lead(lead_in: LeadCreate, db: Session = Depends(get_db), current_user = Depends(require_roles(["SALES", "MANAGEMENT"]))):
    max_lead = db.query(Lead).order_by(Lead.id.desc()).first()
    next_num = (max_lead.id + 1025) if max_lead else 1024
    while db.query(Lead).filter(Lead.lead_code == f"LD-{next_num}").first():
        next_num += 1
    lead_code = f"LD-{next_num}"
    
    lead = Lead(
        lead_code=lead_code,
        organization_name=lead_in.organization_name,
        contact_person=lead_in.contact_person,
        email=lead_in.email,
        phone=lead_in.phone,
        category=lead_in.category,
        requirement=lead_in.requirement,
        estimated_value=lead_in.estimated_value,
        assigned_sales_id=lead_in.assigned_sales_id or current_user.id,
        status=lead_in.status or "NEW",
        priority=lead_in.priority or "MEDIUM",
        lead_source=lead_in.lead_source or "Inbound",
        reason=lead_in.reason,
        next_followup_date=lead_in.next_followup_date,
        next_followup_time=lead_in.next_followup_time
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    # If next_followup_date provided, auto-create initial pending followup
    if lead.next_followup_date:
        flw = Followup(
            lead_id=lead.id,
            followup_date=lead.next_followup_date,
            followup_time=lead.next_followup_time or "10:00 AM",
            type="Call",
            reason=lead.reason or f"Initial requirement discussion with {lead.organization_name}",
            previous_interaction="New enquiry created",
            status="PENDING",
            created_by=current_user.id
        )
        db.add(flw)
        db.commit()

    lead_out = LeadOut.from_orm(lead)
    if lead.assigned_salesperson:
        lead_out.assigned_salesperson_name = lead.assigned_salesperson.name
    return lead_out

@router.get("/leads/{lead_id}")
def get_lead_detail(lead_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    followups = db.query(Followup).filter(Followup.lead_id == lead_id).order_by(Followup.followup_date.desc(), Followup.id.desc()).all()
    
    lead_out = LeadOut.from_orm(lead)
    if lead.assigned_salesperson:
        lead_out.assigned_salesperson_name = lead.assigned_salesperson.name
        
    formatted_followups = []
    for f in followups:
        f_out = FollowupOut.from_orm(f)
        f_out.priority = compute_followup_priority(f, lead)
        f_out.organization_name = lead.organization_name
        f_out.contact_person = lead.contact_person
        f_out.lead_status = lead.status
        f_out.estimated_value = lead.estimated_value
        if f.creator:
            f_out.assigned_salesperson_name = f.creator.name
        elif lead.assigned_salesperson:
            f_out.assigned_salesperson_name = lead.assigned_salesperson.name
        formatted_followups.append(f_out)

    return {
        "lead": lead_out,
        "followups": formatted_followups
    }

@router.put("/leads/{lead_id}", response_model=LeadOut)
def update_lead(lead_id: int, lead_in: LeadUpdate, db: Session = Depends(get_db), current_user = Depends(require_roles(["SALES", "MANAGEMENT"]))):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
    
    db.commit()
    db.refresh(lead)

    lead_out = LeadOut.from_orm(lead)
    if lead.assigned_salesperson:
        lead_out.assigned_salesperson_name = lead.assigned_salesperson.name
    return lead_out

@router.post("/leads/{lead_id}/convert", response_model=CustomerOut)
def convert_lead(lead_id: int, req: LeadConvertRequest, db: Session = Depends(get_db), current_user = Depends(require_roles(["SALES", "MANAGEMENT"]))):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.customer:
        customer = lead.customer
    else:
        # Generate non-colliding customer_code
        max_cust = db.query(Customer).order_by(Customer.id.desc()).first()
        next_num = (max_cust.id + 1035) if max_cust else 1024
        while db.query(Customer).filter(Customer.customer_code == f"CUST-{next_num}").first():
            next_num += 1
        cust_code = f"CUST-{next_num}"

        customer = Customer(
            customer_code=cust_code,
            lead_id=lead.id,
            name=lead.organization_name,
            category=lead.category,
            contact_person=lead.contact_person,
            email=lead.email,
            phone=lead.phone,
            address=req.address or "Campus Main Office"
        )
        lead.status = "WON"
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # Ensure training batch enters Pending Trainer Assignment if not already assigned
    existing_batch = db.query(Batch).filter(Batch.customer_id == customer.id).first()
    if not existing_batch:
        import re
        req_text = (lead.requirement or "").lower()
        matched_prog = None
        programs = db.query(Program).all()
        for p in programs:
            words = [w.lower() for w in p.title.split() if len(w) > 3]
            if any(w in req_text for w in words):
                matched_prog = p
                break
        if not matched_prog:
            matched_prog = programs[0] if programs else None

        seats = 30
        if lead.requirement:
            m = re.search(r'(\d+)\s*(?:seat|student|cohort)', lead.requirement, re.IGNORECASE)
            if m:
                seats = int(m.group(1))

        prog_prefix = "BTCH"
        if matched_prog and matched_prog.program_code:
            parts = matched_prog.program_code.split('-')
            prog_prefix = parts[1] if len(parts) > 1 else "TRN"

        batch_count = db.query(Batch).count() + 1
        batch_code = f"{prog_prefix}-{batch_count + 20}"
        while db.query(Batch).filter(Batch.batch_code == batch_code).first():
            batch_count += 1
            batch_code = f"{prog_prefix}-{batch_count + 20}"

        new_batch = Batch(
            batch_code=batch_code,
            program_id=matched_prog.id if matched_prog else 1,
            customer_id=customer.id,
            trainer_id=None,
            start_date=date.today() + timedelta(days=7),
            end_date=date.today() + timedelta(days=60),
            total_enrolled=seats,
            status="Pending Assignment"
        )
        db.add(new_batch)
        db.commit()

    return customer

@router.get("/followups")
def get_followups(db: Session = Depends(get_db), current_user = Depends(require_roles(["SALES", "MANAGEMENT"]))):
    followups = db.query(Followup).order_by(Followup.followup_date.asc(), Followup.id.asc()).all()
    today = date.today()

    items = []
    priority_calls_count = 0
    due_today_count = 0
    overdue_count = 0
    upcoming_count = 0

    for f in followups:
        lead = f.lead
        # Skip followups for LOST leads
        if lead and lead.status == "LOST":
            continue

        priority = compute_followup_priority(f, lead)
        
        if f.status == "PENDING":
            if priority == "HIGH":
                priority_calls_count += 1
            if f.followup_date == today:
                due_today_count += 1
            elif f.followup_date < today:
                overdue_count += 1
            elif f.followup_date > today:
                upcoming_count += 1

        f_out = {
            "id": f.id,
            "lead_id": f.lead_id,
            "customer_id": f.customer_id,
            "followup_date": f.followup_date.isoformat() if f.followup_date else None,
            "followup_time": f.followup_time or "10:00 AM",
            "type": f.type,
            "reason": f.reason or (lead.reason if lead else "Scheduled Followup"),
            "previous_interaction": f.previous_interaction,
            "notes": f.notes,
            "outcome": f.outcome,
            "next_action": f.next_action,
            "status": f.status,
            "created_by": f.created_by,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "priority": priority,
            "organization_name": lead.organization_name if lead else (f.customer.name if f.customer else "Unknown Client"),
            "contact_person": lead.contact_person if lead else (f.customer.contact_person if f.customer else "-"),
            "lead_status": lead.status if lead else "Customer",
            "estimated_value": lead.estimated_value if lead else 0.0,
            "assigned_salesperson_name": lead.assigned_salesperson.name if (lead and lead.assigned_salesperson) else (f.creator.name if f.creator else "Sales Team")
        }
        items.append(f_out)

    return {
        "summary": {
            "priority_calls": priority_calls_count,
            "due_today": due_today_count,
            "overdue": overdue_count,
            "upcoming": upcoming_count,
            "total_pending": len([i for i in items if i["status"] == "PENDING"])
        },
        "items": items
    }

@router.post("/leads/{lead_id}/followups", response_model=FollowupOut)
def add_lead_followup(lead_id: int, followup_in: FollowupCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    followup = Followup(
        lead_id=lead_id,
        followup_date=followup_in.followup_date,
        followup_time=followup_in.followup_time or "10:00 AM",
        type=followup_in.type or "Call",
        reason=followup_in.reason or lead.reason,
        previous_interaction=followup_in.previous_interaction,
        notes=followup_in.notes,
        status="PENDING",
        created_by=current_user.id
    )
    
    lead.next_followup_date = followup_in.followup_date
    lead.next_followup_time = followup_in.followup_time
    if followup_in.reason:
        lead.reason = followup_in.reason

    db.add(followup)
    db.commit()
    db.refresh(followup)

    f_out = FollowupOut.from_orm(followup)
    f_out.priority = compute_followup_priority(followup, lead)
    f_out.organization_name = lead.organization_name
    f_out.contact_person = lead.contact_person
    f_out.lead_status = lead.status
    f_out.estimated_value = lead.estimated_value
    return f_out

@router.post("/followups/{followup_id}/complete")
def complete_followup(followup_id: int, req: FollowupComplete, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    followup = db.query(Followup).filter(Followup.id == followup_id).first()
    if not followup:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    
    followup.status = "COMPLETED"
    followup.outcome = req.outcome
    if req.notes:
        followup.notes = req.notes
    if req.next_action:
        followup.next_action = req.next_action

    lead = followup.lead
    if lead:
        if req.updated_lead_status:
            lead.status = req.updated_lead_status
        if req.next_action:
            lead.reason = req.next_action

        # Schedule next follow-up if requested
        if req.next_followup_date:
            lead.next_followup_date = req.next_followup_date
            lead.next_followup_time = req.next_followup_time or "10:00 AM"

            next_flw = Followup(
                lead_id=lead.id,
                followup_date=req.next_followup_date,
                followup_time=req.next_followup_time or "10:00 AM",
                type="Call",
                reason=req.next_action or f"Followup after interaction on {date.today()}",
                previous_interaction=f"Outcome: {req.outcome}",
                status="PENDING",
                created_by=current_user.id
            )
            db.add(next_flw)

    db.commit()
    return {"status": "success", "message": "Follow-up marked as COMPLETED successfully"}

@router.get("/customers", response_model=List[CustomerOut])
def get_customers(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Customer).order_by(Customer.id.desc()).all()

@router.get("/customers/{customer_id}/360")
def get_customer_360(customer_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    lead = customer.lead
    batches = db.query(Batch).filter(Batch.customer_id == customer_id).all()
    invoices = db.query(Invoice).filter(Invoice.customer_id == customer_id).all()
    payments = db.query(Payment).filter(Payment.customer_id == customer_id).all()
    
    batch_ids = [b.id for b in batches]
    expenses = db.query(Expense).filter(Expense.batch_id.in_(batch_ids)).all() if batch_ids else []

    # Financial totals for customer
    total_invoiced = sum(i.total_amount for i in invoices)
    total_collected = sum(p.amount for p in payments)
    total_outstanding = max(0.0, total_invoiced - total_collected)
    total_expenses = sum(e.amount for e in expenses)
    net_profit = total_invoiced - total_expenses
    margin = (net_profit / total_invoiced * 100) if total_invoiced > 0 else 0.0

    # Students enrolled
    student_count = db.query(BatchStudent).filter(BatchStudent.batch_id.in_(batch_ids)).count() if batch_ids else 0

    return {
        "customer": customer,
        "lead": lead,
        "batches": [
            {
                "id": b.id,
                "batch_code": b.batch_code,
                "program_title": b.program.title if b.program else "Training",
                "trainer_name": b.trainer.name if b.trainer else "Assigned Trainer",
                "start_date": b.start_date,
                "status": b.status,
                "total_enrolled": b.total_enrolled
            } for b in batches
        ],
        "invoices": invoices,
        "payments": payments,
        "expenses": expenses,
        "financial_summary": {
            "total_invoiced": total_invoiced,
            "total_collected": total_collected,
            "total_outstanding": total_outstanding,
            "total_expenses": total_expenses,
            "net_profit": net_profit,
            "profit_margin": round(margin, 2),
            "enrolled_students": student_count
        }
    }
