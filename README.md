# EduFlow — EduTech CRM & Training Business Management Platform

Full-stack, functional web application built from the Stitch prototype `16857220339137656255`.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Python, FastAPI, SQLAlchemy, PyJWT
- **Database**: PostgreSQL / Relational Schema
- **Auth**: JWT & Role-Based Access Control (RBAC)

## Project Structure
```
crm/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── auth/
│   │   └── routers/
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── context/
    │   ├── services/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Running the Application

### 1. Backend Server (FastAPI on Port 8000)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Application (Vite on Port 3000)
```bash
cd frontend
npm install
npm run dev -- --port 3000
```

Open **http://localhost:3000** in your browser.

## Primary Demo Scenario Seeded
- **Customer**: ABC Engineering College
- **Program**: Python Full Stack Training
- **Batch**: PY-24 (Trainer: Rahul Kumar)
- **Students**: 50 Enrolled Students
- **Revenue**: ₹5,00,000
- **Collected**: ₹2,00,000 (RTGS HDFC009218299104)
- **Outstanding**: ₹3,00,000
- **Expenses**: ₹1,35,000
- **Net Profit**: ₹3,65,000 (73.0% Profit Margin)
