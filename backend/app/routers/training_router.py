from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.domain import Program, Trainer, Batch, Student, BatchStudent, Session as TrainingSession, Attendance
from app.schemas.pydantic_schemas import (
    ProgramCreate, ProgramOut, TrainerCreate, TrainerOut,
    BatchCreate, BatchOut, StudentCreate, StudentOut, AttendanceBulkCreate
)
from app.auth.jwt import get_current_user, require_roles

router = APIRouter(prefix="/api/training", tags=["Training Management"])

# Programs
@router.get("/programs", response_model=List[ProgramOut])
def get_programs(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Program).all()

@router.post("/programs", response_model=ProgramOut)
def create_program(prog_in: ProgramCreate, db: Session = Depends(get_db), current_user = Depends(require_roles(["OPERATIONS", "MANAGEMENT"]))):
    count = db.query(Program).count() + 100
    prog_code = f"PRG-PY-{count}"
    program = Program(
        program_code=prog_code,
        title=prog_in.title,
        category=prog_in.category,
        duration_hours=prog_in.duration_hours,
        total_sessions=prog_in.total_sessions,
        price_per_student=prog_in.price_per_student
    )
    db.add(program)
    db.commit()
    db.refresh(program)
    return program

# Trainers
@router.get("/trainers", response_model=List[TrainerOut])
def get_trainers(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Trainer).all()

@router.post("/trainers", response_model=TrainerOut)
def create_trainer(trn_in: TrainerCreate, db: Session = Depends(get_db), current_user = Depends(require_roles(["OPERATIONS", "MANAGEMENT"]))):
    count = db.query(Trainer).count() + 101
    trn_code = f"TRN-{count}"
    trainer = Trainer(
        trainer_code=trn_code,
        name=trn_in.name,
        email=trn_in.email,
        phone=trn_in.phone,
        expertise=trn_in.expertise,
        per_session_rate=trn_in.per_session_rate
    )
    db.add(trainer)
    db.commit()
    db.refresh(trainer)
    return trainer

# Batches
@router.get("/batches", response_model=List[BatchOut])
def get_batches(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    query = db.query(Batch)
    if current_user.role and current_user.role.name == "TRAINER":
        trainer = db.query(Trainer).filter(Trainer.email == current_user.email).first()
        if not trainer:
            return []
        query = query.filter(Batch.trainer_id == trainer.id)
    batches = query.all()
    res = []
    for b in batches:
        b_dict = {
            "id": b.id,
            "batch_code": b.batch_code,
            "program_id": b.program_id,
            "customer_id": b.customer_id,
            "trainer_id": b.trainer_id,
            "start_date": b.start_date,
            "end_date": b.end_date,
            "total_enrolled": b.total_enrolled,
            "status": b.status,
            "program_title": b.program.title if b.program else "Program",
            "customer_name": b.customer.name if b.customer else "Customer",
            "trainer_name": b.trainer.name if b.trainer else "Trainer",
            "location": "Campus Tech Lab (Room 302)"
        }
        res.append(b_dict)
    return res

class AssignTrainerRequest(BaseModel):
    trainer_id: int

@router.get("/pending-assignments")
def get_pending_assignments(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["OPERATIONS", "MANAGEMENT"]))
):
    batches = db.query(Batch).filter(
        (Batch.trainer_id == None) | (Batch.status.in_(["Pending Assignment", "Pending Trainer Assignment"]))
    ).all()

    result = []
    for b in batches:
        customer = b.customer
        lead = customer.lead if customer else None

        contract_val = lead.estimated_value if (lead and lead.estimated_value) else ((b.program.price_per_student * b.total_enrolled) if b.program else 500000.0)

        won_date_str = "10 Sep 2026"
        if customer and customer.created_at:
            won_date_str = customer.created_at.strftime("%d %b %Y")
        elif lead and lead.next_followup_date:
            won_date_str = lead.next_followup_date.strftime("%d %b %Y")

        req_text = lead.requirement if (lead and lead.requirement) else (f"{b.program.title if b.program else 'Training'} {b.total_enrolled} Seats")

        result.append({
            "id": b.id,
            "batch_id": b.id,
            "batch_code": b.batch_code,
            "customer_id": b.customer_id,
            "customer_name": customer.name if customer else "Customer",
            "program_id": b.program_id,
            "program_title": b.program.title if b.program else "Program",
            "students": b.total_enrolled,
            "contract_value": contract_val,
            "won_date": won_date_str,
            "status": "Pending Trainer Assignment",
            "required_training": req_text,
            "start_date": b.start_date.isoformat() if b.start_date else None,
            "preferred_location": "Campus Tech Lab (Room 302)",
            "trainer_id": b.trainer_id,
            "trainer_name": b.trainer.name if b.trainer else None
        })
    return result

@router.post("/batches/{batch_id}/assign-trainer")
def assign_trainer_to_batch(
    batch_id: int,
    req: AssignTrainerRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["OPERATIONS", "MANAGEMENT"]))
):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    trainer = db.query(Trainer).filter(Trainer.id == req.trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    batch.trainer_id = trainer.id
    batch.status = "Assigned"

    # Ensure training sessions exist for this batch
    session_count = db.query(TrainingSession).filter(TrainingSession.batch_id == batch.id).count()
    if session_count == 0:
        total_sessions = (batch.program.total_sessions if batch.program else 5) or 5
        num_sessions = min(total_sessions, 5)
        for i in range(1, num_sessions + 1):
            s = TrainingSession(
                batch_id=batch.id,
                session_number=i,
                topic=f"Session {i}: {batch.program.title if batch.program else 'Core Module'} Foundations",
                session_date=batch.start_date,
                status="Scheduled"
            )
            db.add(s)
        db.commit()

    # Ensure enrolled students exist in batch_students
    student_count = db.query(BatchStudent).filter(BatchStudent.batch_id == batch.id).count()
    if student_count == 0:
        cname = batch.customer.name if batch.customer else "Client Cohort"
        existing_cust_students = db.query(Student).filter(Student.college_company == cname).all()
        target_count = batch.total_enrolled or 30
        if len(existing_cust_students) < target_count:
            start_num = len(existing_cust_students) + 1
            code_prefix = "".join([w[0] for w in cname.split() if w[0].isalpha()]).upper()[:4] or "STD"
            for i in range(start_num, target_count + 1):
                st_code = f"{code_prefix}-{i:03d}"
                while db.query(Student).filter(Student.student_code == st_code).first():
                    st_code = f"{code_prefix}-{i+100:03d}"
                new_std = Student(
                    student_code=st_code,
                    name=f"Student {i} ({cname})",
                    email=f"student{i}@{code_prefix.lower()}.edu",
                    phone=f"+91 98000 {i:05d}",
                    college_company=cname
                )
                db.add(new_std)
                db.commit()
                db.refresh(new_std)
                existing_cust_students.append(new_std)

        for std in existing_cust_students[:target_count]:
            if not db.query(BatchStudent).filter(BatchStudent.batch_id == batch.id, BatchStudent.student_id == std.id).first():
                db.add(BatchStudent(batch_id=batch.id, student_id=std.id, completion_status="Enrolled"))
        db.commit()

    db.commit()
    db.refresh(batch)

    return {
        "success": True,
        "batch_id": batch.id,
        "batch_code": batch.batch_code,
        "trainer_id": trainer.id,
        "trainer_name": trainer.name,
        "status": batch.status,
        "customer_name": batch.customer.name if batch.customer else "Customer",
        "program_title": batch.program.title if batch.program else "Program",
        "message": f"Trainer {trainer.name} successfully assigned to batch {batch.batch_code}"
    }

@router.get("/batches/{batch_id}")
def get_batch_detail(batch_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    if current_user.role and current_user.role.name == "TRAINER":
        trainer = db.query(Trainer).filter(Trainer.email == current_user.email).first()
        if not trainer or batch.trainer_id != trainer.id:
            raise HTTPException(status_code=403, detail="Access denied. You are not assigned to this batch.")

    sessions = db.query(TrainingSession).filter(TrainingSession.batch_id == batch_id).order_by(TrainingSession.session_number.asc()).all()
    session_ids = [s.id for s in sessions]

    students_query = (
        db.query(Student, BatchStudent.completion_status)
        .join(BatchStudent, BatchStudent.student_id == Student.id)
        .filter(BatchStudent.batch_id == batch_id)
        .all()
    )

    students_list = []
    for std, comp_status in students_query:
        if session_ids:
            total_recorded = db.query(Attendance).filter(Attendance.student_id == std.id, Attendance.session_id.in_(session_ids)).count()
            presents = db.query(Attendance).filter(Attendance.student_id == std.id, Attendance.session_id.in_(session_ids), Attendance.status.in_(['Present', 'PRESENT'])).count()
            att_pct = round((presents / total_recorded * 100.0), 1) if total_recorded > 0 else 100.0
        else:
            att_pct = 100.0

        students_list.append({
            "id": std.id,
            "student_code": std.student_code,
            "name": std.name,
            "email": std.email,
            "phone": std.phone,
            "college_company": std.college_company,
            "status": comp_status or "Enrolled",
            "attendance_percentage": att_pct
        })

    formatted_sessions = []
    for s in sessions:
        formatted_sessions.append({
            "id": s.id,
            "session_number": s.session_number,
            "topic": s.topic,
            "session_date": s.session_date.isoformat() if hasattr(s.session_date, 'isoformat') else str(s.session_date),
            "start_time": "09:30 AM",
            "end_time": "11:30 AM",
            "location": "Campus Tech Lab (Room 302)",
            "status": s.status
        })

    return {
        "id": batch.id,
        "batch_code": batch.batch_code,
        "program_title": batch.program.title if batch.program else "Program",
        "customer_name": batch.customer.name if batch.customer else "Customer",
        "trainer_name": batch.trainer.name if batch.trainer else "Unassigned",
        "start_date": batch.start_date.isoformat() if hasattr(batch.start_date, 'isoformat') else str(batch.start_date),
        "end_date": batch.end_date.isoformat() if hasattr(batch.end_date, 'isoformat') else str(batch.end_date),
        "total_enrolled": len(students_list) if len(students_list) > 0 else batch.total_enrolled,
        "status": batch.status,
        "location": "Campus Tech Lab (Room 302)",
        "sessions": formatted_sessions,
        "students": students_list
    }

@router.post("/batches", response_model=BatchOut)
def create_batch(b_in: BatchCreate, db: Session = Depends(get_db), current_user = Depends(require_roles(["OPERATIONS", "MANAGEMENT"]))):
    count = db.query(Batch).count() + 24
    b_code = f"PY-{count}"
    batch = Batch(
        batch_code=b_code,
        program_id=b_in.program_id,
        customer_id=b_in.customer_id,
        trainer_id=b_in.trainer_id,
        start_date=b_in.start_date,
        end_date=b_in.end_date,
        total_enrolled=0,
        status="In-Progress"
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)

    for i in range(1, 6):
        session = TrainingSession(
            batch_id=batch.id,
            session_number=i,
            topic=f"Session {i}: Core Learning Module",
            session_date=b_in.start_date,
            status="Scheduled"
        )
        db.add(session)
    db.commit()

    return {
        "id": batch.id,
        "batch_code": batch.batch_code,
        "program_id": batch.program_id,
        "customer_id": batch.customer_id,
        "trainer_id": batch.trainer_id,
        "start_date": batch.start_date,
        "end_date": batch.end_date,
        "total_enrolled": 0,
        "status": batch.status,
        "program_title": batch.program.title if batch.program else "",
        "customer_name": batch.customer.name if batch.customer else "",
        "trainer_name": batch.trainer.name if batch.trainer else "",
        "location": "Campus Tech Lab (Room 302)"
    }

# Students
@router.get("/students", response_model=List[StudentOut])
def get_students(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role and current_user.role.name == "TRAINER":
        trainer = db.query(Trainer).filter(Trainer.email == current_user.email).first()
        if not trainer:
            return []
        trainer_batch_ids = [b.id for b in trainer.batches]
        if not trainer_batch_ids:
            return []

        student_rows = (
            db.query(Student, Batch.batch_code, BatchStudent.completion_status, BatchStudent.batch_id)
            .join(BatchStudent, BatchStudent.student_id == Student.id)
            .join(Batch, Batch.id == BatchStudent.batch_id)
            .filter(BatchStudent.batch_id.in_(trainer_batch_ids))
            .all()
        )

        res = []
        for std, b_code, status, b_id in student_rows:
            sessions = db.query(TrainingSession).filter(TrainingSession.batch_id == b_id).all()
            session_ids = [s.id for s in sessions]
            if session_ids:
                total_recorded = db.query(Attendance).filter(Attendance.student_id == std.id, Attendance.session_id.in_(session_ids)).count()
                presents = db.query(Attendance).filter(Attendance.student_id == std.id, Attendance.session_id.in_(session_ids), Attendance.status.in_(['Present', 'PRESENT'])).count()
                att_pct = round((presents / total_recorded * 100.0), 1) if total_recorded > 0 else 100.0
            else:
                att_pct = 100.0

            res.append({
                "id": std.id,
                "student_code": std.student_code,
                "name": std.name,
                "email": std.email,
                "phone": std.phone,
                "college_company": std.college_company,
                "batch_code": b_code,
                "status": status or "Enrolled",
                "attendance_percentage": att_pct
            })
        return res
    else:
        students = db.query(Student).all()
        res = []
        for std in students:
            bs = db.query(BatchStudent).filter(BatchStudent.student_id == std.id).first()
            b_code = bs.batch.batch_code if (bs and bs.batch) else "-"
            status = bs.completion_status if bs else "Enrolled"
            b_id = bs.batch_id if bs else None

            if b_id:
                sessions = db.query(TrainingSession).filter(TrainingSession.batch_id == b_id).all()
                session_ids = [s.id for s in sessions]
                if session_ids:
                    total_recorded = db.query(Attendance).filter(Attendance.student_id == std.id, Attendance.session_id.in_(session_ids)).count()
                    presents = db.query(Attendance).filter(Attendance.student_id == std.id, Attendance.session_id.in_(session_ids), Attendance.status.in_(['Present', 'PRESENT'])).count()
                    att_pct = round((presents / total_recorded * 100.0), 1) if total_recorded > 0 else 100.0
                else:
                    att_pct = 100.0
            else:
                att_pct = 100.0

            res.append({
                "id": std.id,
                "student_code": std.student_code,
                "name": std.name,
                "email": std.email,
                "phone": std.phone,
                "college_company": std.college_company,
                "batch_code": b_code,
                "status": status,
                "attendance_percentage": att_pct
            })
        return res

@router.post("/students", response_model=StudentOut)
def create_student(std_in: StudentCreate, db: Session = Depends(get_db), current_user = Depends(require_roles(["OPERATIONS", "MANAGEMENT"]))):
    count = db.query(Student).count() + 1
    std_code = f"ABC-CSE-{count:03d}"
    student = Student(
        student_code=std_code,
        name=std_in.name,
        email=std_in.email,
        phone=std_in.phone,
        college_company=std_in.college_company or "ABC Engineering College"
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.post("/batches/{batch_id}/enroll")
def enroll_student_to_batch(batch_id: int, student_id: int, db: Session = Depends(get_db), current_user = Depends(require_roles(["OPERATIONS", "MANAGEMENT"]))):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    existing = db.query(BatchStudent).filter(BatchStudent.batch_id == batch_id, BatchStudent.student_id == student_id).first()
    if not existing:
        bs = BatchStudent(batch_id=batch_id, student_id=student_id, completion_status="Enrolled")
        db.add(bs)
        batch.total_enrolled += 1
        db.commit()
    return {"message": "Student enrolled successfully", "total_enrolled": batch.total_enrolled}

# Attendance & Sessions
@router.get("/trainer/sessions")
def get_trainer_sessions(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if current_user.role and current_user.role.name == "TRAINER":
        trainer = db.query(Trainer).filter(Trainer.email == current_user.email).first()
        if not trainer:
            return []
        trainer_batch_ids = [b.id for b in trainer.batches]
        sessions = db.query(TrainingSession).filter(TrainingSession.batch_id.in_(trainer_batch_ids)).order_by(TrainingSession.session_date.asc(), TrainingSession.session_number.asc()).all()
    else:
        sessions = db.query(TrainingSession).order_by(TrainingSession.session_date.asc(), TrainingSession.session_number.asc()).all()

    res = []
    for s in sessions:
        res.append({
            "id": s.id,
            "batch_id": s.batch_id,
            "batch_code": s.batch.batch_code if s.batch else "",
            "session_number": s.session_number,
            "topic": s.topic,
            "session_date": s.session_date,
            "status": s.status
        })
    return res

@router.get("/sessions/{session_id}/attendance")
def get_session_attendance(session_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    session = db.query(TrainingSession).filter(TrainingSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if current_user.role and current_user.role.name == "TRAINER":
        trainer = db.query(Trainer).filter(Trainer.email == current_user.email).first()
        if not trainer or session.batch.trainer_id != trainer.id:
            raise HTTPException(status_code=403, detail="Access denied. You are not assigned to this session.")

    students = db.query(Student).join(BatchStudent, BatchStudent.student_id == Student.id).filter(BatchStudent.batch_id == session.batch_id).all()
    records = db.query(Attendance).filter(Attendance.session_id == session_id).all()
    attendance_map = {r.student_id: r.status for r in records}

    return {
        "session": {
            "id": session.id,
            "batch_id": session.batch_id,
            "batch_code": session.batch.batch_code if session.batch else "",
            "session_number": session.session_number,
            "topic": session.topic,
            "session_date": session.session_date,
            "status": session.status
        },
        "students": [
            {
                "id": s.id,
                "student_code": s.student_code,
                "name": s.name,
                "email": s.email,
                "college_company": s.college_company
            } for s in students
        ],
        "attendance_map": attendance_map
    }

@router.get("/batches/{batch_id}/sessions")
def get_batch_sessions(batch_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    batch = db.query(Batch).filter(Batch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    if current_user.role and current_user.role.name == "TRAINER":
        trainer = db.query(Trainer).filter(Trainer.email == current_user.email).first()
        if not trainer or batch.trainer_id != trainer.id:
            raise HTTPException(status_code=403, detail="Access denied. You are not assigned to this batch.")

    sessions = db.query(TrainingSession).filter(TrainingSession.batch_id == batch_id).order_by(TrainingSession.session_number.asc()).all()
    students = db.query(Student).join(BatchStudent, BatchStudent.student_id == Student.id).filter(BatchStudent.batch_id == batch_id).all()
    return {
        "sessions": sessions,
        "students": students
    }

@router.post("/attendance")
def record_attendance(data: AttendanceBulkCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    session = db.query(TrainingSession).filter(TrainingSession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if current_user.role and current_user.role.name == "TRAINER":
        trainer = db.query(Trainer).filter(Trainer.email == current_user.email).first()
        if not trainer or session.batch.trainer_id != trainer.id:
            raise HTTPException(status_code=403, detail="Access denied. You can only mark attendance for your assigned batches.")

    for rec in data.records:
        existing = db.query(Attendance).filter(Attendance.session_id == data.session_id, Attendance.student_id == rec.student_id).first()
        if existing:
            existing.status = rec.status
        else:
            att = Attendance(session_id=data.session_id, student_id=rec.student_id, status=rec.status)
            db.add(att)

    session.status = "Completed"
    db.commit()
    return {"message": f"Attendance recorded for {len(data.records)} students."}
