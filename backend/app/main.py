from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine, Base, SessionLocal
from app.models.domain import Role, User, Lead, Followup, Customer, Quotation, Program, Trainer, Batch, Vendor, Student, BatchStudent, Session as TrainingSession, Attendance, Invoice, Payment, Expense
from app.auth.jwt import hash_password
from app.routers import auth_router, crm_router, training_router, finance_router, dashboard_router, management_router
from datetime import date

app = FastAPI(
    title="EduFlow ERP & Training Management System",
    version="2.4.0",
    description="Unified backend REST API powering EduFlow CRM, Training Operations, Finance & Management Cockpit."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(crm_router.router)
app.include_router(training_router.router)
app.include_router(finance_router.router)
app.include_router(dashboard_router.router)
app.include_router(management_router.router)

@app.on_event("startup")
def startup_db_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Schema Migration helper for SQLite (safely add columns if missing)
        migrations = [
            ("leads", "requirement", "TEXT"),
            ("leads", "next_followup_date", "DATE"),
            ("leads", "next_followup_time", "VARCHAR(20)"),
            ("leads", "priority", "VARCHAR(20) DEFAULT 'MEDIUM'"),
            ("leads", "lead_source", "VARCHAR(50) DEFAULT 'Inbound'"),
            ("leads", "reason", "TEXT"),
            ("followups", "customer_id", "INTEGER"),
            ("followups", "followup_time", "VARCHAR(20)"),
            ("followups", "reason", "TEXT"),
            ("followups", "previous_interaction", "TEXT"),
            ("followups", "outcome", "TEXT"),
            ("followups", "next_action", "TEXT"),
            ("payments", "recorded_by", "INTEGER")
        ]
        for tbl, col, col_type in migrations:
            try:
                db.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {col_type}"))
                db.commit()
            except Exception as e:
                db.rollback()

        # 1. ROLES
        if db.query(Role).count() == 0:
            roles = [
                Role(id=1, name="MANAGEMENT"),
                Role(id=2, name="SALES"),
                Role(id=3, name="OPERATIONS"),
                Role(id=4, name="TRAINER"),
                Role(id=5, name="FINANCE")
            ]
            db.add_all(roles)
            db.commit()

        # 2. USERS (11 users across roles)
        if db.query(User).count() < 10:
            users = [
                User(id=1, name="Amit Saxena", email="amit.saxena@eduflow.ai", hashed_password=hash_password("DemoAdmin2024!"), role_id=1),
                User(id=2, name="Priya Verma", email="sales@eduflow.ai", hashed_password=hash_password("DemoAdmin2024!"), role_id=2),
                User(id=3, name="Vikram Malhotra", email="ops@eduflow.ai", hashed_password=hash_password("DemoAdmin2024!"), role_id=3),
                User(id=4, name="Rahul Kumar", email="rahul.kumar@eduflow.ai", hashed_password=hash_password("DemoAdmin2024!"), role_id=4),
                User(id=5, name="Neha Sharma", email="finance@eduflow.ai", hashed_password=hash_password("DemoAdmin2024!"), role_id=5),
                User(id=6, name="Rohan Mehta", email="sales1@eduos.demo", hashed_password=hash_password("DemoAdmin2024!"), role_id=2),
                User(id=7, name="Kavita Reddy", email="sales2@eduos.demo", hashed_password=hash_password("DemoAdmin2024!"), role_id=2),
                User(id=8, name="Suresh Nair", email="operations1@eduos.demo", hashed_password=hash_password("DemoAdmin2024!"), role_id=3),
                User(id=9, name="Sunita Sharma", email="trainer1@eduos.demo", hashed_password=hash_password("DemoAdmin2024!"), role_id=4),
                User(id=10, name="Anand Kulkarni", email="finance1@eduos.demo", hashed_password=hash_password("DemoAdmin2024!"), role_id=5),
                User(id=11, name="Rajeshwari Rao", email="management1@eduos.demo", hashed_password=hash_password("DemoAdmin2024!"), role_id=1)
            ]
            for u in users:
                if not db.query(User).filter(User.id == u.id).first():
                    db.add(u)
            db.commit()

        # 3. LEADS (20 leads with realistic sales lifecycle distribution)
        if db.query(Lead).count() < 20:
            lead_items = [
            # (id, code, org, contact, email, phone, category, req, val, status, sid, fdate, ftime, priority, source, reason)
            (1, 'LD-1024', 'ABC Engineering College', 'Dr. S. Rao (Dean)', 's.rao@abc.edu.in', '+91 98765 43210', 'College', 'Python Full Stack 50 Seats', 500000.00, 'WON', 2, date(2026, 8, 20), '11:00 AM', 'HIGH', 'Referral', 'MOU Signed & Batch Started'),
            (2, 'LD-1025', 'Apex Tech Solutions', 'Rajesh Gupta', 'r.gupta@apex.com', '+91 98123 45678', 'Corporate', 'DevOps & Docker Immersion', 350000.00, 'PROPOSAL_SENT', 2, date(2026, 9, 11), '02:30 PM', 'MEDIUM', 'Website Enquiry', 'Proposal sent 2 days ago — awaiting response.'),
            (3, 'LD-1026', 'St. Xavier Institute of Tech', 'Prof. Meenakshi Sundaram', 'meenakshi@stx.edu', '+91 97654 32109', 'College', 'Java Spring Boot Lab', 600000.00, 'QUALIFIED', 6, date(2026, 9, 12), '10:30 AM', 'MEDIUM', 'Campus Event', 'Syllabus requirement review scheduled with HOD.'),
            (4, 'LD-1027', 'Nehru Institute of Technology', 'Dr. K. V. Subramaniam', 'kv.sub@nehru.edu.in', '+91 94433 22110', 'College', 'Cybersecurity 40 Seats', 450000.00, 'WON', 2, date(2026, 8, 28), '03:00 PM', 'HIGH', 'Inbound', 'MOU Executed successfully.'),
            (5, 'LD-1028', 'TechNova Solutions Ltd', 'Sanjay Dutt', 'sanjay@technova.com', '+91 99112 23344', 'Corporate', 'Full Stack Java Upskilling', 250000.00, 'WON', 6, date(2026, 8, 30), '04:00 PM', 'HIGH', 'Referral', 'Corporate training agreement completed.'),
            (6, 'LD-1029', 'Vertex Systems India', 'Anita Desai', 'anita@vertexsys.in', '+91 98223 34455', 'Corporate', 'Machine Learning Lab', 300000.00, 'WON', 7, date(2026, 9, 1), '02:00 PM', 'HIGH', 'Cold Call', 'Agreement signed for ML lab.'),
            (7, 'LD-1030', 'Greenfield University', 'Dr. Alok Prasad', 'alok.prasad@greenfield.edu', '+91 97334 45566', 'College', 'Data Science 30-Student Cohort', 750000.00, 'WON', 2, date(2026, 9, 2), '11:30 AM', 'HIGH', 'Inbound', 'Onboarding completed.'),
            (8, 'LD-1031', 'Skyline Infotech', 'Manish Kapoor', 'm.kapoor@skyline.io', '+91 96445 56677', 'Corporate', 'Cloud AWS Solution Architect', 420000.00, 'WON', 6, date(2026, 9, 3), '01:00 PM', 'HIGH', 'Referral', 'Invoice schedule sent to finance.'),
            (9, 'LD-1032', 'CloudScale Software Labs', 'Pooja Hegde', 'pooja@cloudscale.ai', '+91 95556 67788', 'Corporate', 'Data Analytics & PowerBI', 280000.00, 'WON', 7, date(2026, 9, 4), '10:00 AM', 'HIGH', 'Inbound', 'Analytics lab setup confirmed.'),
            (10, 'LD-1033', 'Quantum Edge Technologies', 'Vivek Ramaswamy', 'v.rama@qedge.com', '+91 94667 78899', 'Corporate', 'AI & Deep Learning Module', 180000.00, 'WON', 2, date(2026, 9, 5), '03:30 PM', 'HIGH', 'Inbound', 'AI Immersion walkthrough done.'),
            (11, 'LD-1034', 'National College of Engineering', 'Dr. B. R. Ambedkar', 'principal@nce.edu.in', '+91 93778 89900', 'College', 'Web Development Program', 550000.00, 'WON', 6, date(2026, 9, 6), '12:00 PM', 'HIGH', 'Campus Outreach', 'MoU signed by Principal.'),
            (12, 'LD-1035', 'Loyola Academy of Tech', 'Father Joseph Thomas', 'joseph@loyola.edu', '+91 92889 90011', 'College', 'Basic Web Dev & Python', 320000.00, 'NEW', 7, date(2026, 9, 14), '11:00 AM', 'LOW', 'Inbound', 'Initial phone qualification call.'),
            (13, 'LD-1036', 'CyberNet Defence Systems', 'Major R. K. Singh', 'rk.singh@cybernet.def', '+91 91990 01122', 'Corporate', 'Ethical Hacking 25 Seats', 500000.00, 'PROPOSAL_SENT', 2, date(2026, 9, 10), '04:00 PM', 'HIGH', 'Exhibition', 'Scheduled follow-up was missed.'),
            (14, 'LD-1037', 'Vidyapeeth Group of Institutions', 'Dr. Sunanda Joshi', 'sunanda@vidyapeeth.ac.in', '+91 90001 12233', 'College', 'Integrated CSE Upskilling', 680000.00, 'NEGOTIATION', 6, date(2026, 9, 11), '04:30 PM', 'HIGH', 'Referral', 'Contract pricing negotiation pending.'),
            (15, 'LD-1038', 'InfraCloud Global Services', 'Harish Chandra', 'harish@infracloud.io', '+91 89112 23344', 'Corporate', 'Cloud Infra Ops', 390000.00, 'NEW', 7, date(2026, 9, 15), '02:00 PM', 'LOW', 'Website', 'Initial requirement email pending response.'),
            (16, 'LD-1039', 'RV College of Engineering Enquiries', 'Prof. Sandhya Rani', 'sandhya@rvce.edu.in', '+91 88223 34455', 'College', 'Python & Data Science Lab', 800000.00, 'CONTACTED', 2, date(2026, 9, 11), '11:00 AM', 'HIGH', 'Campus Event', 'Initial requirement discussion completed — schedule technical discussion.'),
            (17, 'LD-1040', 'DataDynamics Analytics', 'Girish Karnad', 'girish@datadynamics.com', '+91 87334 45566', 'Corporate', 'PowerBI Corporate Cohort', 220000.00, 'LOST', 6, None, None, 'LOW', 'Cold Email', 'Declined due to budget constraints.'),
            (18, 'LD-1041', 'SRM Institute Student Delegation', 'Karthik Raja', 'karthik@srm.edu.in', '+91 86445 56677', 'Individual', 'React & Node.js Certification', 150000.00, 'CONTACTED', 7, date(2026, 9, 13), '03:00 PM', 'MEDIUM', 'Student Fair', 'Shared discount voucher details via WhatsApp.'),
            (19, 'LD-1042', 'Synergy Global Tech Academy', 'Divya Spandana', 'divya@synergytech.org', '+91 85556 67788', 'Corporate', 'Enterprise AI Readiness', 480000.00, 'PROPOSAL_SENT', 2, date(2026, 9, 13), '01:30 PM', 'MEDIUM', 'Inbound', 'Commercial proposal under internal board review.'),
            (20, 'LD-1043', 'BMS College of Engineering', 'Dr. Venugopal K.', 'venugopal@bmsce.ac.in', '+91 84667 78899', 'College', 'Python Full Stack 60 Seats', 620000.00, 'NEGOTIATION', 6, date(2026, 9, 11), '05:00 PM', 'HIGH', 'Referral', 'Contract pricing negotiation pending.')
        ]
            for lid, lcode, org, cp, em, ph, cat, req, val, st, sid, fdate, ftime, prio, src, rsn in lead_items:
                existing_lead = db.query(Lead).filter((Lead.id == lid) | (Lead.lead_code == lcode)).first()
                if not existing_lead:
                    db.add(Lead(
                        id=lid, lead_code=lcode, organization_name=org, contact_person=cp, email=em, phone=ph,
                        category=cat, requirement=req, estimated_value=val, status=st, assigned_sales_id=sid,
                        next_followup_date=fdate, next_followup_time=ftime, priority=prio, lead_source=src, reason=rsn
                    ))
                else:
                    existing_lead.requirement = req
                    existing_lead.status = st
                    existing_lead.next_followup_date = fdate
                    existing_lead.next_followup_time = ftime
                    existing_lead.priority = prio
                    existing_lead.lead_source = src
                    existing_lead.reason = rsn
            db.commit()

        # 4. FOLLOWUPS (Actionable follow-up data)
        flw_items = [
            # (id, lead_id, date, time, type, reason, prev_int, notes, outcome, next_act, status, created_by)
            (1, 1, date(2026, 8, 15), '10:00 AM', 'Meeting', 'Initial syllabus alignment meeting with Dean Dr. S. Rao.', 'Initial phone enquiry', 'Dean requested 50 seat proposal', 'Proposal Accepted', 'Draft MOU contract', 'COMPLETED', 2),
            (2, 1, date(2026, 8, 20), '11:00 AM', 'Demo', 'Technical demo presented for 50 Python Full Stack seats.', 'MOU draft sent', 'Faculty demo went excellently', 'Customer agreed to sign', 'Start Batch Registration', 'COMPLETED', 2),
            (3, 2, date(2026, 9, 11), '02:30 PM', 'Call', 'Proposal sent 2 days ago — awaiting response.', 'Sent commercial quote of ₹3.5L', 'Followup on quote approval', None, 'Confirm technical evaluation date', 'PENDING', 2),
            (4, 3, date(2026, 9, 12), '10:30 AM', 'Meeting', 'Syllabus requirement review scheduled with HOD.', 'Initial call completed with Prof. Meenakshi', 'Discuss 600k contract scope', None, 'Prepare custom course outline', 'PENDING', 6),
            (5, 13, date(2026, 9, 10), '04:00 PM', 'Email', 'Scheduled follow-up was missed.', 'Sent commercial quote for 25 seats', 'Need urgent re-engagement call', None, 'Call Major Singh regarding quote', 'PENDING', 2),
            (6, 14, date(2026, 9, 11), '04:30 PM', 'Call', 'Contract pricing negotiation pending.', 'Board approved program concept', 'Negotiating 5% bulk discount for 60 seats', None, 'Send revised commercial terms', 'PENDING', 6),
            (7, 16, date(2026, 9, 11), '11:00 AM', 'Demo', 'Initial requirement discussion completed — schedule technical discussion.', 'First call with Prof. Sandhya', 'Demonstrate lab environment to HODs', None, 'Schedule live online demo', 'PENDING', 2),
            (8, 20, date(2026, 9, 11), '05:00 PM', 'Meeting', 'Contract pricing negotiation pending.', 'MOU draft reviewed by legal team', 'Final pricing sign-off meeting', None, 'Finalize contract signatures', 'PENDING', 6),
            (9, 18, date(2026, 9, 13), '03:00 PM', 'WhatsApp', 'Shared student discount voucher code with SRM lead.', 'Phone inquiry regarding group discount', 'Sent 10% early bird code', None, 'Check registration count', 'PENDING', 7),
            (10, 19, date(2026, 9, 13), '01:30 PM', 'Email', 'Synergy Global commercial proposal review.', 'Proposal emailed to Divya', 'Review board feedback on AI module', None, 'Follow up on board decision', 'PENDING', 2),
            (11, 12, date(2026, 9, 14), '11:00 AM', 'Call', 'Loyola Academy initial phone qualification.', 'Website lead form submitted', 'Qualify batch size and timeline', None, 'Send program overview PDF', 'PENDING', 7),
            (12, 15, date(2026, 9, 15), '02:00 PM', 'Call', 'InfraCloud initial follow-up pending.', 'Lead form received from Harish', 'Discuss AWS Infra requirements', None, 'Schedule discovery call', 'PENDING', 7)
        ]
        for fid, lid, fdate, ftime, ftype, rsn, prev, nts, out, nact, fst, fby in flw_items:
            existing_flw = db.query(Followup).filter(Followup.id == fid).first()
            if not existing_flw:
                db.add(Followup(
                    id=fid, lead_id=lid, followup_date=fdate, followup_time=ftime, type=ftype,
                    reason=rsn, previous_interaction=prev, notes=nts, outcome=out, next_action=nact,
                    status=fst, created_by=fby
                ))
            else:
                existing_flw.followup_time = ftime
                existing_flw.reason = rsn
                existing_flw.previous_interaction = prev
                existing_flw.notes = nts
                existing_flw.outcome = out
                existing_flw.next_action = nact
                existing_flw.status = fst
        db.commit()

        # 5. CUSTOMERS (10 customers)
        if db.query(Customer).count() < 10:
            cust_items = [
                (1, 'CUST-1024', 1, 'ABC Engineering College', 'College', 'Dr. S. Rao (Dean)', 's.rao@abc.edu.in', '+91 98765 43210', 'Campus Block B, Tech Hub, Bengaluru, KA 560001'),
                (2, 'CUST-1027', 4, 'Nehru Institute of Technology', 'College', 'Dr. K. V. Subramaniam', 'kv.sub@nehru.edu.in', '+91 94433 22110', 'Coimbatore IT Corridor, Coimbatore, TN 641008'),
                (3, 'CUST-1028', 5, 'TechNova Solutions Ltd', 'Corporate', 'Sanjay Dutt', 'sanjay@technova.com', '+91 99112 23344', 'Cyber Towers, HITEC City, Hyderabad, TS 500081'),
                (4, 'CUST-1029', 6, 'Vertex Systems India', 'Corporate', 'Anita Desai', 'anita@vertexsys.in', '+91 98223 34455', 'OMR Tech Park, Chennai, TN 600096'),
                (5, 'CUST-1030', 7, 'Greenfield University', 'College', 'Dr. Alok Prasad', 'alok.prasad@greenfield.edu', '+91 97334 45566', 'Kakkanad Infopark Road, Kochi, KL 682030'),
                (6, 'CUST-1031', 8, 'Skyline Infotech', 'Corporate', 'Manish Kapoor', 'm.kapoor@skyline.io', '+91 96445 56677', 'Electronic City Phase 1, Bengaluru, KA 560100'),
                (7, 'CUST-1032', 9, 'CloudScale Software Labs', 'Corporate', 'Pooja Hegde', 'pooja@cloudscale.ai', '+91 95556 67788', 'Gachibowli Financial District, Hyderabad, TS 500032'),
                (8, 'CUST-1033', 10, 'Quantum Edge Technologies', 'Corporate', 'Vivek Ramaswamy', 'v.rama@qedge.com', '+91 94667 78899', 'Tidel Park, Chennai, TN 600113'),
                (9, 'CUST-1034', 11, 'National College of Engineering', 'College', 'Dr. B. R. Ambedkar', 'principal@nce.edu.in', '+91 93778 89900', 'Gandhinagar Tech Zone, Ahmedabad, GJ 382010'),
                (10, 'CUST-1025', 2, 'Apex Tech Solutions', 'Corporate', 'Rajesh Gupta', 'r.gupta@apex.com', '+91 98123 45678', 'Whitefield Main Road, Bengaluru, KA 560066')
            ]
            for cid, ccode, lid, cname, cat, cp, em, ph, addr in cust_items:
                if not db.query(Customer).filter((Customer.id == cid) | (Customer.customer_code == ccode)).first():
                    db.add(Customer(id=cid, customer_code=ccode, lead_id=lid, name=cname, category=cat, contact_person=cp, email=em, phone=ph, address=addr))
            db.commit()

        # 6. TRAINERS (10 trainers)
        if db.query(Trainer).count() < 10:
            trainer_items = [
                (1, 'TRN-101', 'Rahul Kumar', 'rahul.kumar@eduflow.ai', '+91 99887 76655', 'Python, Full Stack Development', 4500.00),
                (2, 'TRN-102', 'Dr. Arvind Swaminathan', 'arvind@eduflow.ai', '+91 98765 11223', 'Machine Learning, Deep Learning', 5000.00),
                (3, 'TRN-103', 'Sunita Sharma', 'trainer1@eduos.demo', '+91 97766 55443', 'Java, Spring Boot, Microservices', 4200.00),
                (4, 'TRN-104', 'Amit Patel', 'amit.patel@eduflow.ai', '+91 96655 44332', 'Cloud Computing, AWS, Azure', 4800.00),
                (5, 'TRN-105', 'Ananya Sen', 'ananya.sen@eduflow.ai', '+91 95544 33221', 'Data Science, Pandas, R', 4600.00),
                (6, 'TRN-106', 'Deepa Nair', 'deepa.nair@eduflow.ai', '+91 94433 22110', 'DevOps, Docker, Kubernetes', 4700.00),
                (7, 'TRN-107', 'Rajesh Kothari', 'rajesh.k@eduflow.ai', '+91 93322 11009', 'Cybersecurity, Ethical Hacking', 4900.00),
                (8, 'TRN-108', 'Karthik V', 'karthik.v@eduflow.ai', '+91 92211 00998', 'Web Development, React, Node.js', 4400.00),
                (9, 'TRN-109', 'Vikramaditya R', 'vikram.r@eduflow.ai', '+91 91100 99887', 'Data Analytics, PowerBI, SQL', 4300.00),
                (10, 'TRN-110', 'Priyanka Reddy', 'priyanka.r@eduflow.ai', '+91 90099 88776', 'AI & Machine Learning', 5100.00)
            ]
            for tid, tcode, tname, tem, tph, exp, rate in trainer_items:
                if not db.query(Trainer).filter((Trainer.id == tid) | (Trainer.trainer_code == tcode)).first():
                    db.add(Trainer(id=tid, trainer_code=tcode, name=tname, email=tem, phone=tph, expertise=exp, per_session_rate=rate))
            db.commit()

        # 7. PROGRAMS (10 programs)
        if db.query(Program).count() < 10:
            prog_items = [
                (1, 'PRG-PY-100', 'Python Full Stack Training', 'Software Engineering', 120, 20, 10000.00),
                (2, 'PRG-JV-100', 'Java Full Stack Development', 'Software Engineering', 140, 24, 10000.00),
                (3, 'PRG-DS-100', 'Data Science with Python', 'Data Science', 130, 22, 12000.00),
                (4, 'PRG-ML-100', 'Machine Learning Fundamentals', 'AI & ML', 150, 25, 15000.00),
                (5, 'PRG-CLD-100', 'Cloud Computing with AWS', 'Cloud & Infra', 100, 18, 12000.00),
                (6, 'PRG-DEV-100', 'DevOps Engineering & CI/CD', 'Cloud & Infra', 110, 20, 13000.00),
                (7, 'PRG-SEC-100', 'Cybersecurity Fundamentals', 'Security', 120, 20, 12500.00),
                (8, 'PRG-WEB-100', 'Modern Web Development', 'Software Engineering', 90, 15, 8000.00),
                (9, 'PRG-DA-100', 'Data Analytics with PowerBI', 'Data Science', 80, 14, 9000.00),
                (10, 'PRG-AI-100', 'AI & Deep Learning Masterclass', 'AI & ML', 160, 26, 16000.00)
            ]
            for pid, pcode, ptitle, pcat, pdur, psess, pprice in prog_items:
                if not db.query(Program).filter((Program.id == pid) | (Program.program_code == pcode)).first():
                    db.add(Program(id=pid, program_code=pcode, title=ptitle, category=pcat, duration_hours=pdur, total_sessions=psess, price_per_student=pprice))
            db.commit()

        # 8. BATCHES (10 batches)
        if db.query(Batch).count() < 10:
            batch_items = [
                (1, 'PY-24', 1, 1, None, date(2026, 8, 1), date(2026, 10, 15), 50, 'Pending Assignment'),
                (2, 'JV-10', 2, 3, 3, date(2026, 8, 5), date(2026, 10, 20), 25, 'In-Progress'),
                (3, 'DS-05', 3, 5, 5, date(2026, 8, 10), date(2026, 10, 25), 30, 'In-Progress'),
                (4, 'ML-02', 4, 4, 2, date(2026, 8, 12), date(2026, 11, 1), 20, 'In-Progress'),
                (5, 'CLD-08', 5, 6, 4, date(2026, 8, 15), date(2026, 10, 10), 35, 'In-Progress'),
                (6, 'DEV-04', 6, 10, 6, date(2026, 8, 18), date(2026, 10, 30), 22, 'In-Progress'),
                (7, 'SEC-01', 7, 2, 7, date(2026, 8, 20), date(2026, 11, 5), 40, 'In-Progress'),
                (8, 'WEB-12', 8, 9, 8, date(2026, 8, 22), date(2026, 10, 5), 45, 'Completed'),
                (9, 'DA-03', 9, 7, 9, date(2026, 8, 25), date(2026, 10, 12), 28, 'In-Progress'),
                (10, 'AI-09', 10, 8, 10, date(2026, 9, 1), date(2026, 11, 20), 18, 'Upcoming')
            ]
            for bid, bcode, pid, cid, tid, sdate, edate, total, st in batch_items:
                existing_b = db.query(Batch).filter((Batch.id == bid) | (Batch.batch_code == bcode)).first()
                if not existing_b:
                    db.add(Batch(id=bid, batch_code=bcode, program_id=pid, customer_id=cid, trainer_id=tid, start_date=sdate, end_date=edate, total_enrolled=total, status=st))
                elif bid == 1 and existing_b.trainer_id is None:
                    # preserve unassigned pending status if not assigned yet
                    existing_b.status = st
            db.commit()

        # 9. VENDORS (4 vendors)
        if db.query(Vendor).count() < 4:
            vendor_items = [
                (1, 'AWS Cloud Labs', 'Software/Cloud', 'Support Desk', '+1 800 555 0199'),
                (2, 'EduBook Press Ltd', 'Material', 'Suresh Kumar', '+91 98111 22334'),
                (3, 'Grand Residency Hotel & Conference', 'Venue', 'Manager Desk', '+91 98222 33445'),
                (4, 'JetLine Logistics & Travel', 'Travel', 'Travel Agent', '+91 98333 44556')
            ]
            for vid, vname, vcat, vcp, vph in vendor_items:
                if not db.query(Vendor).filter(Vendor.id == vid).first():
                    db.add(Vendor(id=vid, name=vname, category=vcat, contact_person=vcp, phone=vph))
            db.commit()

        # 10. STUDENTS (65 students)
        if db.query(Student).count() < 50:
            student_items = [
                (1, 'ABC-CSE-001', 'Aditi Sharma', 'aditi.s@student.abc.edu', '+91 91111 00001', 'ABC Engineering College'),
                (2, 'ABC-CSE-002', 'Rohan Verma', 'rohan.v@student.abc.edu', '+91 91111 00002', 'ABC Engineering College'),
                (3, 'ABC-CSE-003', 'Priya Nair', 'priya.n@student.abc.edu', '+91 91111 00003', 'ABC Engineering College'),
                (4, 'ABC-CSE-004', 'Karthik Raman', 'karthik.r@student.abc.edu', '+91 91111 00004', 'ABC Engineering College'),
                (5, 'ABC-CSE-005', 'Sneha Kulkarni', 'sneha.k@student.abc.edu', '+91 91111 00005', 'ABC Engineering College'),
                (6, 'ABC-CSE-006', 'Arjun Reddy', 'arjun.r@student.abc.edu', '+91 91111 00006', 'ABC Engineering College'),
                (7, 'ABC-CSE-007', 'Ananya Gupta', 'ananya.g@student.abc.edu', '+91 91111 00007', 'ABC Engineering College'),
                (8, 'ABC-CSE-008', 'Siddharth Joshi', 'siddharth.j@student.abc.edu', '+91 91111 00008', 'ABC Engineering College'),
                (9, 'ABC-CSE-009', 'Meera Krishnan', 'meera.k@student.abc.edu', '+91 91111 00009', 'ABC Engineering College'),
                (10, 'ABC-CSE-010', 'Rahul Deshmukh', 'rahul.d@student.abc.edu', '+91 91111 00010', 'ABC Engineering College'),
                (11, 'ABC-CSE-011', 'Deepika Padukone', 'deepika.p@student.abc.edu', '+91 91111 00011', 'ABC Engineering College'),
                (12, 'ABC-CSE-012', 'Varun Dhawan', 'varun.d@student.abc.edu', '+91 91111 00012', 'ABC Engineering College'),
                (13, 'ABC-CSE-013', 'Kriti Sanon', 'kriti.s@student.abc.edu', '+91 91111 00013', 'ABC Engineering College'),
                (14, 'ABC-CSE-014', 'Ayushmann Khurrana', 'ayushmann.k@student.abc.edu', '+91 91111 00014', 'ABC Engineering College'),
                (15, 'ABC-CSE-015', 'Taapsee Pannu', 'taapsee.p@student.abc.edu', '+91 91111 00015', 'ABC Engineering College'),
                (16, 'ABC-CSE-016', 'Vicky Kaushal', 'vicky.k@student.abc.edu', '+91 91111 00016', 'ABC Engineering College'),
                (17, 'ABC-CSE-017', 'Alia Bhatt', 'alia.b@student.abc.edu', '+91 91111 00017', 'ABC Engineering College'),
                (18, 'ABC-CSE-018', 'Ranbir Kapoor', 'ranbir.k@student.abc.edu', '+91 91111 00018', 'ABC Engineering College'),
                (19, 'ABC-CSE-019', 'Kiara Advani', 'kiara.a@student.abc.edu', '+91 91111 00019', 'ABC Engineering College'),
                (20, 'ABC-CSE-020', 'Sidharth Malhotra', 'sid.m@student.abc.edu', '+91 91111 00020', 'ABC Engineering College'),
                (21, 'ABC-CSE-021', 'Aditya Roy Kapur', 'aditya.r@student.abc.edu', '+91 91111 00021', 'ABC Engineering College'),
                (22, 'ABC-CSE-022', 'Pooja Hegde', 'pooja.h@student.abc.edu', '+91 91111 00022', 'ABC Engineering College'),
                (23, 'ABC-CSE-023', 'Manoj Bajpayee', 'manoj.b@student.abc.edu', '+91 91111 00023', 'ABC Engineering College'),
                (24, 'ABC-CSE-024', 'Pankaj Tripathi', 'pankaj.t@student.abc.edu', '+91 91111 00024', 'ABC Engineering College'),
                (25, 'ABC-CSE-025', 'Nawazuddin Siddiqui', 'nawaz.s@student.abc.edu', '+91 91111 00025', 'ABC Engineering College'),
                (26, 'ABC-CSE-026', 'Rajkummar Rao', 'rajkummar.r@student.abc.edu', '+91 91111 00026', 'ABC Engineering College'),
                (27, 'ABC-CSE-027', 'Ayush Sharma', 'ayush.s@student.abc.edu', '+91 91111 00027', 'ABC Engineering College'),
                (28, 'ABC-CSE-028', 'Disha Patani', 'disha.p@student.abc.edu', '+91 91111 00028', 'ABC Engineering College'),
                (29, 'ABC-CSE-029', 'Tara Sutaria', 'tara.s@student.abc.edu', '+91 91111 00029', 'ABC Engineering College'),
                (30, 'ABC-CSE-030', 'Ananya Panday', 'ananya.p@student.abc.edu', '+91 91111 00030', 'ABC Engineering College'),
                (31, 'ABC-CSE-031', 'Janhvi Kapoor', 'janhvi.k@student.abc.edu', '+91 91111 00031', 'ABC Engineering College'),
                (32, 'ABC-CSE-032', 'Sara Ali Khan', 'sara.k@student.abc.edu', '+91 91111 00032', 'ABC Engineering College'),
                (33, 'ABC-CSE-033', 'Ishaan Khatter', 'ishaan.k@student.abc.edu', '+91 91111 00033', 'ABC Engineering College'),
                (34, 'ABC-CSE-034', 'Sanya Malhotra', 'sanya.m@student.abc.edu', '+91 91111 00034', 'ABC Engineering College'),
                (35, 'ABC-CSE-035', 'Fatima Sana Shaikh', 'fatima.s@student.abc.edu', '+91 91111 00035', 'ABC Engineering College'),
                (36, 'ABC-CSE-036', 'Radhika Madan', 'radhika.m@student.abc.edu', '+91 91111 00036', 'ABC Engineering College'),
                (37, 'ABC-CSE-037', 'Mrunal Thakur', 'mrunal.t@student.abc.edu', '+91 91111 00037', 'ABC Engineering College'),
                (38, 'ABC-CSE-038', 'Triptii Dimri', 'triptii.d@student.abc.edu', '+91 91111 00038', 'ABC Engineering College'),
                (39, 'ABC-CSE-039', 'Wamiqa Gabbi', 'wamiqa.g@student.abc.edu', '+91 91111 00039', 'ABC Engineering College'),
                (40, 'ABC-CSE-040', 'Pratik Gandhi', 'pratik.g@student.abc.edu', '+91 91111 00040', 'ABC Engineering College'),
                (41, 'ABC-CSE-041', 'Jaideep Ahlawat', 'jaideep.a@student.abc.edu', '+91 91111 00041', 'ABC Engineering College'),
                (42, 'ABC-CSE-042', 'Vijay Varma', 'vijay.v@student.abc.edu', '+91 91111 00042', 'ABC Engineering College'),
                (43, 'ABC-CSE-043', 'Gulkand Kumar', 'gulkand.k@student.abc.edu', '+91 91111 00043', 'ABC Engineering College'),
                (44, 'ABC-CSE-044', 'Amol Parashar', 'amol.p@student.abc.edu', '+91 91111 00044', 'ABC Engineering College'),
                (45, 'ABC-CSE-045', 'Sumeet Vyas', 'sumeet.v@student.abc.edu', '+91 91111 00045', 'ABC Engineering College'),
                (46, 'ABC-CSE-046', 'Mithila Palkar', 'mithila.p@student.abc.edu', '+91 91111 00046', 'ABC Engineering College'),
                (47, 'ABC-CSE-047', 'Dhruv Sehgal', 'dhruv.s@student.abc.edu', '+91 91111 00047', 'ABC Engineering College'),
                (48, 'ABC-CSE-048', 'Shweta Tripathi', 'shweta.t@student.abc.edu', '+91 91111 00048', 'ABC Engineering College'),
                (49, 'ABC-CSE-049', 'Rasika Dugal', 'rasika.d@student.abc.edu', '+91 91111 00049', 'ABC Engineering College'),
                (50, 'ABC-CSE-050', 'Divyendu Sharma', 'divyendu.s@student.abc.edu', '+91 91111 00050', 'ABC Engineering College'),
                (51, 'NEH-IT-001', 'Rajesh Khanna', 'rajesh.k@nehru.edu.in', '+91 92222 00001', 'Nehru Institute of Tech'),
                (52, 'NEH-IT-002', 'Sharmila Tagore', 'sharmila.t@nehru.edu.in', '+91 92222 00002', 'Nehru Institute of Tech'),
                (53, 'NEH-IT-003', 'Amitabh Bachchan', 'amitabh.b@nehru.edu.in', '+91 92222 00003', 'Nehru Institute of Tech'),
                (54, 'NEH-IT-004', 'Jaya Bhaduri', 'jaya.b@nehru.edu.in', '+91 92222 00004', 'Nehru Institute of Tech'),
                (55, 'NEH-IT-005', 'Dharmendra Deol', 'dharmendra.d@nehru.edu.in', '+91 92222 00005', 'Nehru Institute of Tech'),
                (56, 'TN-EMP-001', 'Vikram Seth', 'vikram@technova.com', '+91 93333 00001', 'TechNova Solutions'),
                (57, 'TN-EMP-002', 'Arundhati Roy', 'arundhati@technova.com', '+91 93333 00002', 'TechNova Solutions'),
                (58, 'TN-EMP-003', 'Chetan Bhagat', 'chetan@technova.com', '+91 93333 00003', 'TechNova Solutions'),
                (59, 'VT-EMP-001', 'Shashi Tharoor', 'shashi@vertexsys.in', '+91 94444 00001', 'Vertex Systems'),
                (60, 'VT-EMP-002', 'Sudha Murty', 'sudha@vertexsys.in', '+91 94444 00002', 'Vertex Systems'),
                (61, 'GF-CS-001', 'Narayana Murthy', 'narayana@greenfield.edu', '+91 95555 00001', 'Greenfield University'),
                (62, 'GF-CS-002', 'Nandan Nilekani', 'nandan@greenfield.edu', '+91 95555 00002', 'Greenfield University'),
                (63, 'SKY-EMP-001', 'Kiran Mazumdar', 'kiran@skyline.io', '+91 96666 00001', 'Skyline Infotech'),
                (64, 'CS-EMP-001', 'Azim Premji', 'azim@cloudscale.ai', '+91 97777 00001', 'CloudScale Software Labs'),
                (65, 'QE-EMP-001', 'Shiv Nadar', 'shiv@qedge.com', '+91 98888 00001', 'Quantum Edge Tech')
            ]
            for sid, scode, sname, sem, sph, scol in student_items:
                if not db.query(Student).filter((Student.id == sid) | (Student.student_code == scode)).first():
                    db.add(Student(id=sid, student_code=scode, name=sname, email=sem, phone=sph, college_company=scol))
            db.commit()

            # Batch enrollments (50 students in Batch 1 PY-24)
            enroll_pairs = [(1, i) for i in range(1, 51)] + [
                (7, 51), (7, 52), (7, 53), (7, 54), (7, 55),
                (2, 56), (2, 57), (2, 58), (4, 59), (4, 60),
                (3, 61), (3, 62), (5, 63), (9, 64), (10, 65)
            ]
            for bid, stid in enroll_pairs:
                if not db.query(BatchStudent).filter(BatchStudent.batch_id == bid, BatchStudent.student_id == stid).first():
                    db.add(BatchStudent(batch_id=bid, student_id=stid, completion_status="Enrolled"))
            db.commit()

        # 11. SESSIONS (21 sessions)
        if db.query(TrainingSession).count() < 20:
            sess_items = [
                (1, 1, 1, 'Python Fundamentals & Control Flow', date(2026, 8, 5), 'Completed'),
                (2, 1, 2, 'Data Structures & OOP Principles', date(2026, 8, 10), 'Completed'),
                (3, 1, 3, 'FastAPI & RESTful Web APIs', date(2026, 8, 15), 'Completed'),
                (4, 1, 4, 'PostgreSQL Database Integration', date(2026, 8, 20), 'Completed'),
                (5, 1, 5, 'React 18 & Frontend State Management', date(2026, 8, 25), 'Completed'),
                (6, 2, 1, 'Java Syntax & OOP Core Concepts', date(2026, 8, 7), 'Completed'),
                (7, 2, 2, 'Spring Boot Rest Services & JPA', date(2026, 8, 14), 'Completed'),
                (8, 3, 1, 'Data Science Foundations & NumPy', date(2026, 8, 12), 'Completed'),
                (9, 3, 2, 'Pandas Dataframes & Visualization', date(2026, 8, 19), 'Completed'),
                (10, 4, 1, 'Supervised Machine Learning Algorithms', date(2026, 8, 15), 'Completed'),
                (11, 4, 2, 'Neural Networks & PyTorch Basics', date(2026, 8, 22), 'Completed'),
                (12, 5, 1, 'AWS Core EC2, S3 & VPC Setup', date(2026, 8, 17), 'Completed'),
                (13, 5, 2, 'AWS Cloud IAM & Security Best Practices', date(2026, 8, 24), 'Completed'),
                (14, 6, 1, 'Docker Containerization & Multi-Stage Builds', date(2026, 8, 20), 'Completed'),
                (15, 6, 2, 'Kubernetes Deployment & Services Manifests', date(2026, 8, 27), 'Completed'),
                (16, 7, 1, 'Cybersecurity Fundamentals & Threat Vectors', date(2026, 8, 22), 'Completed'),
                (17, 7, 2, 'Network Penetration Testing & Wireshark', date(2026, 8, 29), 'Completed'),
                (18, 8, 1, 'Modern JavaScript ES6+ & DOM Manipulation', date(2026, 8, 24), 'Completed'),
                (19, 8, 2, 'React Components & Hooks State', date(2026, 8, 31), 'Completed'),
                (20, 9, 1, 'PowerBI Data Modeling & DAX Expressions', date(2026, 8, 27), 'Completed'),
                (21, 9, 2, 'SQL Advanced Aggregations & Window Functions', date(2026, 9, 3), 'Completed')
            ]
            for sess_id, bid, snum, stopic, sdate, sst in sess_items:
                if not db.query(TrainingSession).filter(TrainingSession.id == sess_id).first():
                    db.add(TrainingSession(id=sess_id, batch_id=bid, session_number=snum, topic=stopic, session_date=sdate, status=sst))
            db.commit()

        # Seed initial attendance for Batch 1 (5 sessions x 50 students = 250 records, all Present = 100%)
        if db.query(Attendance).count() < 250:
            for s_id in range(1, 6):
                for st_id in range(1, 51):
                    if not db.query(Attendance).filter(Attendance.session_id == s_id, Attendance.student_id == st_id).first():
                        db.add(Attendance(session_id=s_id, student_id=st_id, status='Present'))
            db.commit()

        # 12. INVOICES (10 invoices)
        if db.query(Invoice).count() < 10:
            inv_items = [
                (1, 'INV-2026-089-A', 1, 1, date(2026, 8, 1), date(2026, 8, 15), 200000.00, 0.00, 200000.00, 'PAID'),
                (2, 'INV-2026-089-B', 1, 1, date(2026, 9, 1), date(2026, 9, 25), 300000.00, 0.00, 300000.00, 'UNPAID'),
                (3, 'INV-2026-090-A', 2, 7, date(2026, 8, 5), date(2026, 8, 20), 450000.00, 0.00, 450000.00, 'PARTIALLY PAID'),
                (4, 'INV-2026-091-A', 3, 2, date(2026, 8, 10), date(2026, 8, 25), 250000.00, 0.00, 250000.00, 'PAID'),
                (5, 'INV-2026-092-A', 4, 4, date(2026, 8, 12), date(2026, 8, 27), 300000.00, 0.00, 300000.00, 'PAID'),
                (6, 'INV-2026-093-A', 5, 3, date(2026, 8, 15), date(2026, 8, 30), 750000.00, 0.00, 750000.00, 'PARTIALLY PAID'),
                (7, 'INV-2026-094-A', 6, 5, date(2026, 8, 18), date(2026, 9, 2), 420000.00, 0.00, 420000.00, 'PAID'),
                (8, 'INV-2026-095-A', 7, 9, date(2026, 8, 20), date(2026, 9, 5), 280000.00, 0.00, 280000.00, 'UNPAID'),
                (9, 'INV-2026-096-A', 8, 10, date(2026, 8, 22), date(2026, 9, 7), 180000.00, 0.00, 180000.00, 'UNPAID'),
                (10, 'INV-2026-097-A', 9, 8, date(2026, 8, 25), date(2026, 9, 10), 550000.00, 0.00, 550000.00, 'PAID')
            ]
            for iid, inum, cid, bid, isdate, ddate, sub, tax, tot, st in inv_items:
                if not db.query(Invoice).filter((Invoice.id == iid) | (Invoice.invoice_number == inum)).first():
                    db.add(Invoice(id=iid, invoice_number=inum, customer_id=cid, batch_id=bid, issue_date=isdate, due_date=ddate, subtotal=sub, tax_amount=tax, total_amount=tot, status=st))
            db.commit()

        # 13. PAYMENTS (15 payments)
        if db.query(Payment).count() < 15:
            pay_items = [
                (1, 'REC-8841', 1, 1, date(2026, 8, 10), 200000.00, 'RTGS/NEFT', 'HDFC009218299104', 'Initial 40% Tranche Payment'),
                (2, 'REC-8842', 3, 2, date(2026, 8, 12), 200000.00, 'RTGS/NEFT', 'ICIC001928374650', 'First installment for Cybersecurity batch'),
                (3, 'REC-8843', 4, 3, date(2026, 8, 15), 250000.00, 'RTGS/NEFT', 'SBIN004827163524', 'Full settlement for Java Full Stack'),
                (4, 'REC-8844', 5, 4, date(2026, 8, 18), 300000.00, 'UPI', 'AXIS991827364501', 'Full payment for Machine Learning lab'),
                (5, 'REC-8845', 6, 5, date(2026, 8, 20), 400000.00, 'RTGS/NEFT', 'HDFC003829104756', 'Tranche 1 payment Greenfield University'),
                (6, 'REC-8846', 7, 6, date(2026, 8, 22), 420000.00, 'RTGS/NEFT', 'KKBK004920183746', 'Full settlement Skyline Infotech'),
                (7, 'REC-8847', 10, 9, date(2026, 8, 28), 550000.00, 'Cheque', 'CHQ-882716', 'Cleared cheque National College'),
                (8, 'REC-8848', 3, 2, date(2026, 9, 1), 100000.00, 'UPI', 'UPI-992817263544', 'Second installment Nehru Institute'),
                (9, 'REC-8849', 6, 5, date(2026, 9, 3), 150000.00, 'RTGS/NEFT', 'UTIB001928374651', 'Tranche 2 payment Greenfield University'),
                (10, 'REC-8850', 8, 7, date(2026, 9, 4), 100000.00, 'RTGS/NEFT', 'HDFC001928374652', 'Partial payment CloudScale Software'),
                (11, 'REC-8851', 9, 8, date(2026, 9, 5), 80000.00, 'UPI', 'UPI-881920394857', 'Partial payment Quantum Edge'),
                (12, 'REC-8852', 4, 3, date(2026, 9, 6), 100000.00, 'RTGS/NEFT', 'HDFC009988776655', 'Additional collection TechNova Java batch'),
                (13, 'REC-8853', 3, 2, date(2026, 9, 7), 50000.00, 'Cheque', 'CHQ-991827', 'Final cheque clearing Nehru Institute'),
                (14, 'REC-8854', 8, 7, date(2026, 9, 8), 80000.00, 'RTGS/NEFT', 'ICIC009988776655', 'Second tranche CloudScale'),
                (15, 'REC-8855', 9, 8, date(2026, 9, 9), 50000.00, 'UPI', 'UPI-771122334455', 'Second tranche Quantum Edge')
            ]
            for ppid, rnum, iid, cid, pdate, amt, pmode, rref, pnotes in pay_items:
                if not db.query(Payment).filter((Payment.id == ppid) | (Payment.receipt_number == rnum)).first():
                    db.add(Payment(id=ppid, receipt_number=rnum, invoice_id=iid, customer_id=cid, payment_date=pdate, amount=amt, payment_mode=pmode, reference_number=rref, notes=pnotes))
            db.commit()

        # 14. EXPENSES (20 expenses)
        if db.query(Expense).count() < 20:
            exp_items = [
                (1, 'EXP-1001', 'Trainer Payout', 'Rahul Kumar - Session Honorarium', 90000.00, date(2026, 8, 30), 1, None, 1, 'Bank Transfer'),
                (2, 'EXP-1002', 'Venue & Infrastructure', 'AWS Sandbox & High-Compute Lab', 25000.00, date(2026, 8, 2), 1, 1, None, 'Corporate Card'),
                (3, 'EXP-1003', 'Material & Software', 'Python Full Stack Courseware Packs', 20000.00, date(2026, 8, 4), 1, 2, None, 'Bank Transfer'),
                (4, 'EXP-1004', 'Trainer Payout', 'Sunita Sharma - Java Batch Payout', 50000.00, date(2026, 8, 28), 2, None, 3, 'Bank Transfer'),
                (5, 'EXP-1005', 'Travel & Accommodation', 'Faculty Flight & Hotel Stay for TechNova', 18000.00, date(2026, 8, 6), 2, 4, None, 'Corporate Card'),
                (6, 'EXP-1006', 'Trainer Payout', 'Ananya Sen - Data Science Payout', 65000.00, date(2026, 8, 31), 3, None, 5, 'Bank Transfer'),
                (7, 'EXP-1007', 'Venue & Infrastructure', 'Kochi Grand Hotel Conference Hall Rent', 35000.00, date(2026, 8, 11), 3, 3, None, 'Bank Transfer'),
                (8, 'EXP-1008', 'Trainer Payout', 'Dr. Arvind Swaminathan ML Honorarium', 75000.00, date(2026, 9, 1), 4, None, 2, 'Bank Transfer'),
                (9, 'EXP-1009', 'Material & Software', 'PyTorch & Cloud GPU Compute Lab Key', 30000.00, date(2026, 8, 13), 4, 1, None, 'Corporate Card'),
                (10, 'EXP-1010', 'Trainer Payout', 'Amit Patel Cloud Computing Honorarium', 55000.00, date(2026, 8, 30), 5, None, 4, 'Bank Transfer'),
                (11, 'EXP-1011', 'Trainer Payout', 'Deepa Nair DevOps Session Honorarium', 48000.00, date(2026, 8, 29), 6, None, 6, 'Bank Transfer'),
                (12, 'EXP-1012', 'Material & Software', 'Docker & Kubernetes Certification Vouchers', 40000.00, date(2026, 8, 19), 6, 2, None, 'Bank Transfer'),
                (13, 'EXP-1013', 'Trainer Payout', 'Rajesh Kothari Cybersecurity Honorarium', 80000.00, date(2026, 9, 2), 7, None, 7, 'Bank Transfer'),
                (14, 'EXP-1014', 'Venue & Infrastructure', 'Coimbatore IT Lab Dedicated Compute Line', 22000.00, date(2026, 8, 21), 7, 3, None, 'Bank Transfer'),
                (15, 'EXP-1015', 'Trainer Payout', 'Karthik V Web Development Payout', 42000.00, date(2026, 8, 30), 8, None, 8, 'Bank Transfer'),
                (16, 'EXP-1016', 'Trainer Payout', 'Vikramaditya R PowerBI Honorarium', 38000.00, date(2026, 9, 3), 9, None, 9, 'Bank Transfer'),
                (17, 'EXP-1017', 'Marketing', 'Digital Ad Campaign for Data Analytics', 15000.00, date(2026, 8, 24), 9, None, None, 'Corporate Card'),
                (18, 'EXP-1018', 'Equipment', 'High-Spec Laptops Rental for AI Lab', 45000.00, date(2026, 9, 2), 10, 1, None, 'Bank Transfer'),
                (19, 'EXP-1019', 'Trainer Payout', 'Priyanka Reddy AI Module Advance', 40000.00, date(2026, 9, 3), 10, None, 10, 'Bank Transfer'),
                (20, 'EXP-1020', 'Travel & Accommodation', 'Rahul Kumar Inter-campus Transit & Residency', 10000.00, date(2026, 8, 20), 1, 4, 1, 'Corporate Card')
            ]
            for eid, ecode, ecat, edesc, eamt, edate, bid, vid, tid, pvia in exp_items:
                if not db.query(Expense).filter((Expense.id == eid) | (Expense.expense_code == ecode)).first():
                    db.add(Expense(id=eid, expense_code=ecode, category=ecat, description=edesc, amount=eamt, expense_date=edate, batch_id=bid, vendor_id=vid, trainer_id=tid, paid_via=pvia))
            db.commit()

    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "EduFlow ERP & Training Management Platform",
        "version": "2.4.0",
        "docs": "/docs"
    }
