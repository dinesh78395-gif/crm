-- PostgreSQL / Relational Schema for EduFlow ERP Platform

-- 1. Roles & Users
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CRM
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    lead_code VARCHAR(50) UNIQUE NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(20),
    category VARCHAR(50) NOT NULL DEFAULT 'College',
    estimated_value DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'New',
    assigned_sales_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS followups (
    id SERIAL PRIMARY KEY,
    lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
    followup_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    lead_id INT UNIQUE REFERENCES leads(id),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(120),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quotations (
    id SERIAL PRIMARY KEY,
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id),
    lead_id INT REFERENCES leads(id),
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Training
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    program_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    duration_hours INT NOT NULL,
    total_sessions INT NOT NULL,
    price_per_student DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS trainers (
    id SERIAL PRIMARY KEY,
    trainer_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20),
    expertise VARCHAR(100),
    per_session_rate DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    program_id INT REFERENCES programs(id),
    customer_id INT REFERENCES customers(id),
    trainer_id INT REFERENCES trainers(id),
    start_date DATE NOT NULL,
    end_date DATE,
    total_enrolled INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'In-Progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(20),
    college_company VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batch_students (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES batches(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    completion_status VARCHAR(50) DEFAULT 'Enrolled',
    UNIQUE(batch_id, student_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES batches(id) ON DELETE CASCADE,
    session_number INT NOT NULL,
    topic VARCHAR(200) NOT NULL,
    session_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Scheduled'
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, student_id)
);

-- 4. Finance
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INT REFERENCES customers(id),
    batch_id INT REFERENCES batches(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id INT REFERENCES invoices(id),
    customer_id INT REFERENCES customers(id),
    payment_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    expense_code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    batch_id INT REFERENCES batches(id),
    vendor_id INT REFERENCES vendors(id),
    trainer_id INT REFERENCES trainers(id),
    paid_via VARCHAR(50) DEFAULT 'Bank Transfer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
