from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date as date_type
from app.database import get_db
from app.models.domain import Invoice, InvoiceItem, Payment, Expense, Vendor, Customer, Batch, User
from app.schemas.pydantic_schemas import (
    InvoiceCreate, InvoiceOut, PaymentCreate, PaymentOut,
    ExpenseCreate, ExpenseOut, VendorCreate, VendorOut,
    InvoicePaymentInfo
)
from app.auth.jwt import get_current_user, require_roles

router = APIRouter(prefix="/api/finance", tags=["Sales & Finance"])


# ── Helper: compute invoice status from payments ──────────────────────
def _compute_invoice_status(invoice: Invoice, total_paid: float) -> str:
    """Derive status purely from payment totals and due date."""
    if total_paid >= invoice.total_amount:
        return "PAID"
    if invoice.due_date and invoice.due_date < date_type.today():
        return "OVERDUE"
    if total_paid > 0:
        return "PARTIALLY PAID"
    return "UNPAID"


def _get_invoice_paid_amount(db: Session, invoice_id: int) -> float:
    """Sum of all payments for a given invoice."""
    result = db.query(func.sum(Payment.amount)).filter(Payment.invoice_id == invoice_id).scalar()
    return result or 0.0


# ── Invoices ──────────────────────────────────────────────────────────
@router.get("/invoices", response_model=List[InvoiceOut])
def get_invoices(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    invoices = db.query(Invoice).order_by(Invoice.id.desc()).all()
    res = []
    for inv in invoices:
        paid = _get_invoice_paid_amount(db, inv.id)
        outstanding = max(0.0, inv.total_amount - paid)
        computed_status = _compute_invoice_status(inv, paid)

        # Persist status update if it changed
        if inv.status != computed_status:
            inv.status = computed_status
            db.commit()

        res.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "customer_id": inv.customer_id,
            "batch_id": inv.batch_id,
            "issue_date": inv.issue_date,
            "due_date": inv.due_date,
            "subtotal": inv.subtotal,
            "tax_amount": inv.tax_amount,
            "total_amount": inv.total_amount,
            "status": computed_status,
            "customer_name": inv.customer.name if inv.customer else "Customer",
            "paid_amount": paid,
            "outstanding": outstanding
        })
    return res


@router.post("/invoices", response_model=InvoiceOut)
def create_invoice(inv_in: InvoiceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    max_inv = db.query(Invoice).order_by(Invoice.id.desc()).first()
    next_num = (max_inv.id + 89) if max_inv else 89
    while db.query(Invoice).filter(Invoice.invoice_number == f"INV-2026-{next_num:03d}-A").first():
        next_num += 1
    inv_num = f"INV-2026-{next_num:03d}-A"

    subtotal = sum(item.quantity * item.unit_price for item in inv_in.items)
    tax = subtotal * 0.0  # 0% tax or customizable
    total = subtotal + tax

    invoice = Invoice(
        invoice_number=inv_num,
        customer_id=inv_in.customer_id,
        batch_id=inv_in.batch_id,
        issue_date=inv_in.issue_date,
        due_date=inv_in.due_date,
        subtotal=subtotal,
        tax_amount=tax,
        total_amount=total,
        status="UNPAID"
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    for item in inv_in.items:
        ii = InvoiceItem(
            invoice_id=invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            amount=item.quantity * item.unit_price
        )
        db.add(ii)
    db.commit()

    customer = db.query(Customer).filter(Customer.id == inv_in.customer_id).first()

    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "customer_id": invoice.customer_id,
        "batch_id": invoice.batch_id,
        "issue_date": invoice.issue_date,
        "due_date": invoice.due_date,
        "subtotal": subtotal,
        "tax_amount": tax,
        "total_amount": total,
        "status": invoice.status,
        "customer_name": customer.name if customer else "Customer",
        "paid_amount": 0.0,
        "outstanding": total
    }


# ── Invoice Payment Info (for Record Payment modal) ──────────────────
@router.get("/invoices/{invoice_id}/payment-info", response_model=InvoicePaymentInfo)
def get_invoice_payment_info(invoice_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    paid = _get_invoice_paid_amount(db, invoice.id)
    outstanding = max(0.0, invoice.total_amount - paid)
    computed_status = _compute_invoice_status(invoice, paid)

    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "customer_id": invoice.customer_id,
        "customer_name": invoice.customer.name if invoice.customer else "Customer",
        "total_amount": invoice.total_amount,
        "paid_amount": paid,
        "outstanding": outstanding,
        "due_date": invoice.due_date,
        "issue_date": invoice.issue_date,
        "status": computed_status
    }


# ── Payments ──────────────────────────────────────────────────────────
@router.get("/payments", response_model=List[PaymentOut])
def get_payments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payments = db.query(Payment).order_by(Payment.id.desc()).all()
    res = []
    for p in payments:
        invoice = db.query(Invoice).filter(Invoice.id == p.invoice_id).first()
        customer = db.query(Customer).filter(Customer.id == p.customer_id).first()
        res.append({
            "id": p.id,
            "receipt_number": p.receipt_number,
            "invoice_id": p.invoice_id,
            "customer_id": p.customer_id,
            "payment_date": p.payment_date,
            "amount": p.amount,
            "payment_mode": p.payment_mode,
            "reference_number": p.reference_number,
            "notes": p.notes,
            "recorded_by": p.recorded_by,
            "customer_name": customer.name if customer else "Customer",
            "invoice_number": invoice.invoice_number if invoice else "N/A",
            "created_at": p.created_at
        })
    return res


@router.post("/payments", response_model=PaymentOut)
def record_payment(pay_in: PaymentCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["FINANCE", "MANAGEMENT"]))):
    # 1. Validate invoice exists
    invoice = db.query(Invoice).filter(Invoice.id == pay_in.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    # 2. Calculate outstanding
    paid_so_far = _get_invoice_paid_amount(db, invoice.id)
    outstanding = invoice.total_amount - paid_so_far

    # 3. Validate payment does not exceed outstanding
    if pay_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")
    if pay_in.amount > outstanding + 0.01:  # small tolerance for floating point
        raise HTTPException(
            status_code=400,
            detail=f"Payment cannot exceed the outstanding amount of ₹{outstanding:,.0f}."
        )

    # 4. Generate receipt number
    count = db.query(Payment).count() + 8841
    rec_num = f"REC-{count}"
    while db.query(Payment).filter(Payment.receipt_number == rec_num).first():
        count += 1
        rec_num = f"REC-{count}"

    # 5. Determine payment date
    payment_date = pay_in.payment_date or date_type.today()

    # 6. Create payment (customer_id derived from invoice)
    payment = Payment(
        receipt_number=rec_num,
        invoice_id=pay_in.invoice_id,
        customer_id=invoice.customer_id,
        payment_date=payment_date,
        amount=pay_in.amount,
        payment_mode=pay_in.payment_mode,
        reference_number=pay_in.reference_number,
        notes=pay_in.notes,
        recorded_by=current_user.id if hasattr(current_user, 'id') else None
    )
    db.add(payment)

    # 7. Recalculate and persist invoice status
    new_total_paid = paid_so_far + pay_in.amount
    invoice.status = _compute_invoice_status(invoice, new_total_paid)

    db.commit()
    db.refresh(payment)

    # 8. Build response
    customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
    return {
        "id": payment.id,
        "receipt_number": payment.receipt_number,
        "invoice_id": payment.invoice_id,
        "customer_id": payment.customer_id,
        "payment_date": payment.payment_date,
        "amount": payment.amount,
        "payment_mode": payment.payment_mode,
        "reference_number": payment.reference_number,
        "notes": payment.notes,
        "recorded_by": payment.recorded_by,
        "customer_name": customer.name if customer else "Customer",
        "invoice_number": invoice.invoice_number,
        "created_at": payment.created_at
    }


# ── Expenses ──────────────────────────────────────────────────────────
@router.get("/expenses", response_model=List[ExpenseOut])
def get_expenses(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Expense).order_by(Expense.id.desc()).all()


@router.post("/expenses", response_model=ExpenseOut)
def create_expense(exp_in: ExpenseCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["FINANCE", "MANAGEMENT", "OPERATIONS"]))):
    count = db.query(Expense).count() + 1001
    exp_code = f"EXP-{count}"

    expense = Expense(
        expense_code=exp_code,
        category=exp_in.category,
        description=exp_in.description,
        amount=exp_in.amount,
        expense_date=exp_in.expense_date,
        batch_id=exp_in.batch_id,
        vendor_id=exp_in.vendor_id,
        trainer_id=exp_in.trainer_id,
        paid_via=exp_in.paid_via
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


# ── Vendors ───────────────────────────────────────────────────────────
@router.get("/vendors", response_model=List[VendorOut])
def get_vendors(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Vendor).all()


@router.post("/vendors", response_model=VendorOut)
def create_vendor(v_in: VendorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vendor = Vendor(
        name=v_in.name,
        category=v_in.category,
        contact_person=v_in.contact_person,
        phone=v_in.phone
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor
