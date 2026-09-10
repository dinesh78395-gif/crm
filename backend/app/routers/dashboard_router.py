from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.domain import Lead, Customer, Batch, Student, Invoice, Payment, Expense
from app.schemas.pydantic_schemas import DashboardMetrics
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Management Dashboard"])

@router.get("/overview", response_model=DashboardMetrics)
def get_dashboard_overview(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_leads = db.query(Lead).count()
    converted_leads = db.query(Lead).filter((Lead.status == "WON") | (Lead.status == "Converted")).count()
    conversion_rate = (converted_leads / total_leads * 100.0) if total_leads > 0 else 0.0

    active_customers = db.query(Customer).count()
    active_batches = db.query(Batch).filter(Batch.status == "In-Progress").count()
    total_students = db.query(Student).count()

    total_revenue = db.query(func.sum(Invoice.total_amount)).scalar() or 0.0
    total_collected = db.query(func.sum(Payment.amount)).scalar() or 0.0
    total_outstanding = max(0.0, total_revenue - total_collected)

    total_expenses = db.query(func.sum(Expense.amount)).scalar() or 0.0
    net_profit = total_revenue - total_expenses
    profit_margin = (net_profit / total_revenue * 100.0) if total_revenue > 0 else 0.0

    return {
        "total_leads": total_leads,
        "conversion_rate": round(conversion_rate, 1),
        "active_customers": active_customers,
        "active_batches": active_batches,
        "total_students": total_students,
        "total_revenue": total_revenue,
        "total_collected": total_collected,
        "total_outstanding": total_outstanding,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "profit_margin": round(profit_margin, 1)
    }

@router.get("/financial")
def get_financial_dashboard(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    invoices = db.query(Invoice).all()
    payments = db.query(Payment).all()
    expenses = db.query(Expense).all()

    # Monthly breakdown simulation
    monthly_data = [
        {"month": "May 2026", "revenue": 100000, "collected": 80000, "expenses": 30000, "profit": 70000},
        {"month": "Jun 2026", "revenue": 150000, "collected": 120000, "expenses": 40000, "profit": 110000},
        {"month": "Jul 2026", "revenue": 200000, "collected": 180000, "expenses": 50000, "profit": 150000},
        {"month": "Aug 2026", "revenue": 500000, "collected": 200000, "expenses": 135000, "profit": 365000},
    ]

    return {
        "monthly_performance": monthly_data,
        "total_revenue": sum(i.total_amount for i in invoices),
        "total_collected": sum(p.amount for p in payments),
        "total_expenses": sum(e.amount for e in expenses)
    }
