from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from datetime import date, datetime

from app.database import get_db
from app.models.domain import (
    User, Lead, Followup, Customer, Batch, Invoice, Payment, Expense, Program, Trainer, Student, Attendance
)
from app.auth.jwt import require_roles

router = APIRouter(prefix="/api/management", tags=["Management"])

def format_inr(val: float) -> str:
    val = float(val or 0.0)
    return f"₹{val:,.2f}".replace(".00", "")

@router.get("/assistant/query")
def query_assistant(
    q: str = Query(..., description="Predefined question key or index"),
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["MANAGEMENT"]))
):
    today = date.today()

    # Normalization of query parameter
    q_norm = q.strip().lower()

    # Mapping of 11 questions
    # 1. What needs my attention today?
    if q_norm in ["1", "attention", "what_needs_attention", "what needs my attention today?"]:
        # A. Overdue invoices
        all_invoices = db.query(Invoice).all()
        overdue_invoices = []
        for inv in all_invoices:
            paid = sum(p.amount for p in inv.payments) if inv.payments else 0.0
            outstanding = max(0.0, inv.total_amount - paid)
            if outstanding > 0 and inv.due_date and inv.due_date < today and inv.status.upper() != "PAID":
                overdue_invoices.append({
                    "entity": f"{inv.customer.name if inv.customer else 'Customer'} ({inv.invoice_number})",
                    "current_status": "Overdue",
                    "reason": f"Payment of {format_inr(outstanding)} was due on {inv.due_date.strftime('%d %b %Y')}.",
                    "recommended_action": "Contact the customer regarding the outstanding payment."
                })

        # B. Leads requiring follow-up
        pending_followups = db.query(Followup).filter(
            Followup.status == "PENDING",
            Followup.followup_date <= today
        ).all()
        lead_items = []
        for f in pending_followups:
            org = f.lead.organization_name if f.lead else (f.customer.name if f.customer else "Opportunity")
            lead_items.append({
                "entity": org,
                "current_status": "Follow-up Due" if f.followup_date == today else "Overdue Follow-up",
                "reason": f"Follow-up scheduled for {f.followup_date.strftime('%d %b %Y')} ({f.reason or 'Opportunity review'}).",
                "recommended_action": "Contact the lead and update the opportunity status."
            })

        # C. Customers awaiting trainer assignment
        pending_batches = db.query(Batch).filter(
            (Batch.trainer_id == None) | (Batch.status.in_(["Pending Assignment", "Pending Trainer Assignment"]))
        ).all()
        trainer_items = []
        for b in pending_batches:
            cname = b.customer.name if b.customer else "Customer"
            prog = b.program.title if b.program else "Training Program"
            trainer_items.append({
                "entity": f"{cname} — {prog}",
                "current_status": "Pending Trainer Assignment",
                "reason": f"{b.total_enrolled} students enrolled; no trainer assigned to batch {b.batch_code}.",
                "recommended_action": "Assign a trainer so the training batch can be scheduled."
            })

        total_count = len(overdue_invoices) + len(lead_items) + len(trainer_items)
        highlights = []
        if overdue_invoices:
            highlights.append({"text": f"{len(overdue_invoices)} overdue invoice{'s' if len(overdue_invoices) > 1 else ''}", "icon": "🔴", "badge": "bg-red-50 text-red-700 border-red-200"})
        if lead_items:
            highlights.append({"text": f"{len(lead_items)} lead{'s' if len(lead_items) > 1 else ''} requiring follow-up", "icon": "🟠", "badge": "bg-amber-50 text-amber-700 border-amber-200"})
        if trainer_items:
            highlights.append({"text": f"{len(trainer_items)} customer{'s' if len(trainer_items) > 1 else ''} awaiting trainer assignment", "icon": "🟡", "badge": "bg-yellow-50 text-yellow-700 border-yellow-200"})

        all_items = overdue_invoices + lead_items + trainer_items

        return {
            "question": "What needs my attention today?",
            "summary": f"{total_count} items require attention." if total_count > 0 else "All operations are on schedule. No urgent items require attention.",
            "highlights": highlights,
            "items": all_items
        }

    # 2. Which customers have outstanding payments?
    elif q_norm in ["2", "outstanding_customers", "which customers have outstanding payments?"]:
        customers = db.query(Customer).all()
        items = []
        total_outstanding_all = 0.0

        for c in customers:
            c_outstanding = 0.0
            unpaid_invoices = []
            for inv in c.invoices:
                paid = sum(p.amount for p in inv.payments) if inv.payments else 0.0
                out = max(0.0, inv.total_amount - paid)
                if out > 0:
                    c_outstanding += out
                    unpaid_invoices.append(inv.invoice_number)
            
            if c_outstanding > 0:
                total_outstanding_all += c_outstanding
                items.append({
                    "entity": c.name,
                    "current_status": f"Outstanding: {format_inr(c_outstanding)}",
                    "reason": f"{len(unpaid_invoices)} invoice(s) pending payment ({', '.join(unpaid_invoices[:3])}).",
                    "recommended_action": f"Contact {c.contact_person or c.name} regarding the outstanding balance of {format_inr(c_outstanding)}."
                })

        return {
            "question": "Which customers have outstanding payments?",
            "summary": f"{len(items)} customers have outstanding balances totaling {format_inr(total_outstanding_all)}.",
            "highlights": [{"text": f"{len(items)} customer accounts", "icon": "🔴", "badge": "bg-red-50 text-red-700 border-red-200"}],
            "items": items
        }

    # 3. Which invoices are overdue?
    elif q_norm in ["3", "overdue_invoices", "which invoices are overdue?"]:
        all_invoices = db.query(Invoice).all()
        items = []
        total_overdue = 0.0

        for inv in all_invoices:
            paid = sum(p.amount for p in inv.payments) if inv.payments else 0.0
            out = max(0.0, inv.total_amount - paid)
            if out > 0 and inv.due_date and inv.due_date < today and inv.status.upper() != "PAID":
                total_overdue += out
                items.append({
                    "entity": f"{inv.customer.name if inv.customer else 'Customer'} ({inv.invoice_number})",
                    "current_status": "Overdue",
                    "reason": f"Due on {inv.due_date.strftime('%d %b %Y')} ({format_inr(out)} unpaid of {format_inr(inv.total_amount)}).",
                    "recommended_action": "Contact the customer regarding the outstanding payment."
                })

        return {
            "question": "Which invoices are overdue?",
            "summary": f"{len(items)} invoice(s) are overdue, amounting to {format_inr(total_overdue)}." if items else "No invoices are currently overdue.",
            "highlights": [{"text": f"{len(items)} overdue invoices", "icon": "🔴", "badge": "bg-red-50 text-red-700 border-red-200"}] if items else [],
            "items": items
        }

    # 4. Which leads need follow-up?
    elif q_norm in ["4", "leads_followup", "which leads need follow-up?"]:
        followups = db.query(Followup).filter(
            Followup.status == "PENDING",
            Followup.followup_date <= today
        ).order_by(Followup.followup_date.asc()).all()
        items = []
        for f in followups:
            lead = f.lead
            org = lead.organization_name if lead else (f.customer.name if f.customer else "Opportunity")
            items.append({
                "entity": f"{org} — {lead.contact_person if lead else 'Contact'}",
                "current_status": "Due Today" if f.followup_date == today else "Overdue",
                "reason": f"Scheduled {f.type} on {f.followup_date.strftime('%d %b %Y')} at {f.followup_time or '10:00 AM'}: {f.reason or 'Opportunity follow-up'}",
                "recommended_action": "Contact the lead and update the opportunity status."
            })

        return {
            "question": "Which leads need follow-up?",
            "summary": f"{len(items)} lead follow-ups require attention today." if items else "No pending lead follow-ups scheduled for today.",
            "highlights": [{"text": f"{len(items)} pending follow-ups", "icon": "🟠", "badge": "bg-amber-50 text-amber-700 border-amber-200"}] if items else [],
            "items": items
        }

    # 5. Which customers are waiting for trainer assignment?
    elif q_norm in ["5", "waiting_trainer", "which customers are waiting for trainer assignment?"]:
        pending_batches = db.query(Batch).filter(
            (Batch.trainer_id == None) | (Batch.status.in_(["Pending Assignment", "Pending Trainer Assignment"]))
        ).all()
        items = []
        for b in pending_batches:
            cname = b.customer.name if b.customer else "Customer"
            prog = b.program.title if b.program else "Training Program"
            lead = b.customer.lead if b.customer else None
            contract_val = lead.estimated_value if (lead and lead.estimated_value) else ((b.program.price_per_student * b.total_enrolled) if b.program else 500000.0)
            items.append({
                "entity": f"{cname} — {prog}",
                "current_status": "Pending Trainer Assignment",
                "reason": f"Contract of {format_inr(contract_val)} confirmed for {b.total_enrolled} students. Batch {b.batch_code} is unallocated.",
                "recommended_action": "Assign a trainer so the training batch can be scheduled."
            })

        return {
            "question": "Which customers are waiting for trainer assignment?",
            "summary": f"{len(items)} customer training cohort(s) waiting for faculty assignment." if items else "All customer training programs have assigned trainers.",
            "highlights": [{"text": f"{len(items)} awaiting trainer", "icon": "🟡", "badge": "bg-yellow-50 text-yellow-700 border-yellow-200"}] if items else [],
            "items": items
        }

    # 6. Which batches are currently active?
    elif q_norm in ["6", "active_batches", "which batches are currently active?"]:
        batches = db.query(Batch).filter(
            Batch.status.in_(["In-Progress", "Assigned", "Active"])
        ).all()
        items = []
        for b in batches:
            # Check attendance records
            sessions = b.sessions or []
            total_attendances = 0
            present_attendances = 0
            for s in sessions:
                for a in s.attendance:
                    total_attendances += 1
                    if a.status in ["Present", "PRESENT"]:
                        present_attendances += 1
            att_rate = (present_attendances / total_attendances * 100) if total_attendances > 0 else 85.0

            rec_action = "Monitor batch delivery and session schedule."
            if att_rate < 75.0:
                rec_action = "Review attendance with the assigned trainer."

            items.append({
                "entity": f"Batch {b.batch_code} ({b.program.title if b.program else 'Program'})",
                "current_status": f"{b.status} • Faculty: {b.trainer.name if b.trainer else 'Unassigned'}",
                "reason": f"Client: {b.customer.name if b.customer else 'Customer'} • {b.total_enrolled} Enrolled • Attendance: {att_rate:.1f}%",
                "recommended_action": rec_action
            })

        return {
            "question": "Which batches are currently active?",
            "summary": f"{len(items)} batch cohort(s) are currently in progress.",
            "highlights": [{"text": f"{len(items)} active cohorts", "icon": "🟢", "badge": "bg-emerald-50 text-emerald-700 border-emerald-200"}],
            "items": items
        }

    # 7. Which batches are most profitable?
    elif q_norm in ["7", "profitable_batches", "which batches are most profitable?"]:
        batches = db.query(Batch).all()
        profit_data = []

        for b in batches:
            # Revenue: either from invoices or enrolled * price
            b_rev = sum(inv.total_amount for inv in b.invoices) if b.invoices else ((b.program.price_per_student * b.total_enrolled) if b.program else 0.0)
            # Expenses: from linked expenses + trainer session payout
            b_exp = sum(e.amount for e in b.expenses) if b.expenses else 0.0
            if not b_exp and b.trainer:
                # estimate trainer payout
                sess_count = b.program.total_sessions if b.program else 15
                b_exp = sess_count * (b.trainer.per_session_rate or 4500.0)

            profit = b_rev - b_exp
            margin = (profit / b_rev * 100.0) if b_rev > 0 else 0.0

            rec_action = "Maintain operational efficiency and analyze delivery best practices."
            if b_exp > 0.6 * b_rev:
                rec_action = "Review batch expenses and profitability."

            profit_data.append({
                "entity": f"Batch {b.batch_code} ({b.program.title if b.program else 'Program'})",
                "current_status": f"Net Profit: {format_inr(profit)} ({margin:.1f}% margin)",
                "reason": f"Revenue: {format_inr(b_rev)} | Expenses: {format_inr(b_exp)} | Client: {b.customer.name if b.customer else 'Client'}",
                "recommended_action": rec_action,
                "profit": profit
            })

        profit_data.sort(key=lambda x: x["profit"], reverse=True)

        return {
            "question": "Which batches are most profitable?",
            "summary": f"Analyzed {len(profit_data)} cohorts. Top performing batch is {profit_data[0]['entity']} generating {profit_data[0]['current_status']}." if profit_data else "No batch profitability data available.",
            "highlights": [{"text": "Ranked by Net Margin", "icon": "📈", "badge": "bg-indigo-50 text-indigo-700 border-indigo-200"}],
            "items": profit_data[:5]
        }

    # 8. What is our current revenue?
    elif q_norm in ["8", "current_revenue", "what is our current revenue?"]:
        invoices = db.query(Invoice).all()
        total_rev = sum(inv.total_amount for inv in invoices)
        
        customer_breakdown = {}
        for inv in invoices:
            cname = inv.customer.name if inv.customer else "Direct"
            customer_breakdown[cname] = customer_breakdown.get(cname, 0.0) + inv.total_amount

        items = []
        for cname, amt in sorted(customer_breakdown.items(), key=lambda x: x[1], reverse=True):
            items.append({
                "entity": cname,
                "current_status": f"Billed: {format_inr(amt)}",
                "reason": f"Invoiced contract value ({amt / total_rev * 100:.1f}% of total).",
                "recommended_action": "Track invoice milestone delivery to accelerate billings."
            })

        return {
            "question": "What is our current revenue?",
            "summary": f"Total recognized revenue is {format_inr(total_rev)} across {len(invoices)} invoices.",
            "highlights": [{"text": f"Revenue: {format_inr(total_rev)}", "icon": "💳", "badge": "bg-blue-50 text-blue-700 border-blue-200"}],
            "items": items
        }

    # 9. What is our current collection?
    elif q_norm in ["9", "current_collection", "what is our current collection?"]:
        payments = db.query(Payment).all()
        total_col = sum(p.amount for p in payments)

        items = []
        for p in sorted(payments, key=lambda x: x.id, reverse=True)[:6]:
            cname = p.customer.name if p.customer else "Customer"
            inv_num = p.invoice.invoice_number if p.invoice else "Invoice"
            items.append({
                "entity": f"{cname} ({inv_num})",
                "current_status": f"Collected: {format_inr(p.amount)} via {p.payment_mode}",
                "reason": f"Ref: {p.reference_number or 'Direct Bank Transfer'} on {p.payment_date.strftime('%d %b %Y') if p.payment_date else 'Recent'}.",
                "recommended_action": "Reconcile bank UTR settlements and update payment records."
            })

        return {
            "question": "What is our current collection?",
            "summary": f"Total realized collection is {format_inr(total_col)} from {len(payments)} payment transactions.",
            "highlights": [{"text": f"Realized: {format_inr(total_col)}", "icon": "💰", "badge": "bg-emerald-50 text-emerald-700 border-emerald-200"}],
            "items": items
        }

    # 10. What is our current outstanding amount?
    elif q_norm in ["10", "current_outstanding", "what is our current outstanding amount?"]:
        invoices = db.query(Invoice).all()
        total_rev = sum(inv.total_amount for inv in invoices)
        payments = db.query(Payment).all()
        total_col = sum(p.amount for p in payments)
        total_out = max(0.0, total_rev - total_col)

        # Top debtor customers
        cust_map = {}
        for inv in invoices:
            cname = inv.customer.name if inv.customer else "Customer"
            paid = sum(p.amount for p in inv.payments) if inv.payments else 0.0
            out = max(0.0, inv.total_amount - paid)
            if out > 0:
                cust_map[cname] = cust_map.get(cname, 0.0) + out

        items = []
        for cname, amt in sorted(cust_map.items(), key=lambda x: x[1], reverse=True):
            items.append({
                "entity": cname,
                "current_status": f"Balance Due: {format_inr(amt)}",
                "reason": "Outstanding invoice tranche pending customer disbursement.",
                "recommended_action": "Contact the customer regarding the outstanding payment."
            })

        return {
            "question": "What is our current outstanding amount?",
            "summary": f"Current outstanding balance is {format_inr(total_out)} across {len(cust_map)} client accounts.",
            "highlights": [{"text": f"Outstanding: {format_inr(total_out)}", "icon": "⚠️", "badge": "bg-amber-50 text-amber-700 border-amber-200"}],
            "items": items
        }

    # 11. What is our current net profit?
    elif q_norm in ["11", "current_net_profit", "what is our current net profit?"]:
        invoices = db.query(Invoice).all()
        total_rev = sum(inv.total_amount for inv in invoices)
        expenses = db.query(Expense).all()
        total_exp = sum(e.amount for e in expenses)
        net_profit = total_rev - total_exp
        margin = (net_profit / total_rev * 100.0) if total_rev > 0 else 0.0

        items = [
            {
                "entity": "Gross Recognized Revenue",
                "current_status": format_inr(total_rev),
                "reason": f"From {len(invoices)} contracts and invoices.",
                "recommended_action": "Accelerate customer billing milestones."
            },
            {
                "entity": "Total Operating & Faculty Expenses",
                "current_status": format_inr(total_exp),
                "reason": f"From {len(expenses)} operational, trainer, and vendor expenses.",
                "recommended_action": "Review batch expenses and profitability."
            },
            {
                "entity": "Operating Net Profit",
                "current_status": f"{format_inr(net_profit)} ({margin:.1f}% margin)",
                "reason": "Net profitability before administrative overhead.",
                "recommended_action": "Keep trainer and vendor expenditures within budget allocations."
            }
        ]

        return {
            "question": "What is our current net profit?",
            "summary": f"Current Net Profit is {format_inr(net_profit)} with an operating margin of {margin:.1f}%.",
            "highlights": [{"text": f"Net Profit: {format_inr(net_profit)} ({margin:.1f}%)", "icon": "📊", "badge": "bg-indigo-50 text-indigo-700 border-indigo-200"}],
            "items": items
        }

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown question '{q}'. Must be one of 1 to 11."
        )
