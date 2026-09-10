-- Comprehensive Synthetic/Demo Data Seed Script for EduFlow ERP Platform
-- Idempotent population of Users, Leads, Followups, Customers, Trainers, Programs, Batches, Students, Sessions, Attendance, Invoices, Payments, Expenses & Vendors.

-- 1. ROLES
INSERT INTO roles (id, name) VALUES 
(1, 'MANAGEMENT'),
(2, 'SALES'),
(3, 'OPERATIONS'),
(4, 'TRAINER'),
(5, 'FINANCE')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS (At least 10 users distributed across roles)
INSERT INTO users (id, name, email, hashed_password, role_id) VALUES 
(1, 'Amit Saxena', 'amit.saxena@eduflow.ai', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 1),
(2, 'Priya Verma', 'sales@eduflow.ai', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 2),
(3, 'Vikram Malhotra', 'ops@eduflow.ai', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 3),
(4, 'Rahul Kumar', 'rahul.kumar@eduflow.ai', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 4),
(5, 'Neha Sharma', 'finance@eduflow.ai', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 5),
(6, 'Rohan Mehta', 'sales1@eduos.demo', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 2),
(7, 'Kavita Reddy', 'sales2@eduos.demo', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 2),
(8, 'Suresh Nair', 'operations1@eduos.demo', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 3),
(9, 'Sunita Sharma', 'trainer1@eduos.demo', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 4),
(10, 'Anand Kulkarni', 'finance1@eduos.demo', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 5),
(11, 'Rajeshwari Rao', 'management1@eduos.demo', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 1)
ON CONFLICT (id) DO NOTHING;

-- 3. LEADS (At least 20 realistic leads)
INSERT INTO leads (id, lead_code, organization_name, contact_person, email, phone, category, estimated_value, status, assigned_sales_id) VALUES
(1, 'LD-1024', 'ABC Engineering College', 'Dr. S. Rao (Dean)', 's.rao@abc.edu.in', '+91 98765 43210', 'College', 500000.00, 'Converted', 2),
(2, 'LD-1025', 'Apex Tech Solutions', 'Rajesh Gupta', 'r.gupta@apex.com', '+91 98123 45678', 'Corporate', 350000.00, 'Proposal Sent', 2),
(3, 'LD-1026', 'St. Xavier Institute of Tech', 'Prof. Meenakshi Sundaram', 'meenakshi@stx.edu', '+91 97654 32109', 'College', 600000.00, 'Contacted', 6),
(4, 'LD-1027', 'Nehru Institute of Technology', 'Dr. K. V. Subramaniam', 'kv.sub@nehru.edu.in', '+91 94433 22110', 'College', 450000.00, 'Converted', 2),
(5, 'LD-1028', 'TechNova Solutions Ltd', 'Sanjay Dutt', 'sanjay@technova.com', '+91 99112 23344', 'Corporate', 250000.00, 'Converted', 6),
(6, 'LD-1029', 'Vertex Systems India', 'Anita Desai', 'anita@vertexsys.in', '+91 98223 34455', 'Corporate', 300000.00, 'Converted', 7),
(7, 'LD-1030', 'Greenfield University', 'Dr. Alok Prasad', 'alok.prasad@greenfield.edu', '+91 97334 45566', 'College', 750000.00, 'Converted', 2),
(8, 'LD-1031', 'Skyline Infotech', 'Manish Kapoor', 'm.kapoor@skyline.io', '+91 96445 56677', 'Corporate', 420000.00, 'Converted', 6),
(9, 'LD-1032', 'CloudScale Software Labs', 'Pooja Hegde', 'pooja@cloudscale.ai', '+91 95556 67788', 'Corporate', 280000.00, 'Converted', 7),
(10, 'LD-1033', 'Quantum Edge Technologies', 'Vivek Ramaswamy', 'v.rama@qedge.com', '+91 94667 78899', 'Corporate', 180000.00, 'Converted', 2),
(11, 'LD-1034', 'National College of Engineering', 'Dr. B. R. Ambedkar', 'principal@nce.edu.in', '+91 93778 89900', 'College', 550000.00, 'Converted', 6),
(12, 'LD-1035', 'Loyola Academy of Tech', 'Father Joseph Thomas', 'joseph@loyola.edu', '+91 92889 90011', 'College', 320000.00, 'New', 7),
(13, 'LD-1036', 'CyberNet Defence Systems', 'Major R. K. Singh', 'rk.singh@cybernet.def', '+91 91990 01122', 'Corporate', 500000.00, 'Proposal Sent', 2),
(14, 'LD-1037', 'Vidyapeeth Group of Institutions', 'Dr. Sunanda Joshi', 'sunanda@vidyapeeth.ac.in', '+91 90001 12233', 'College', 680000.00, 'Negotiation', 6),
(15, 'LD-1038', 'InfraCloud Global Services', 'Harish Chandra', 'harish@infracloud.io', '+91 89112 23344', 'Corporate', 390000.00, 'New', 7),
(16, 'LD-1039', 'RV College of Engineering Enquiries', 'Prof. Sandhya Rani', 'sandhya@rvce.edu.in', '+91 88223 34455', 'College', 800000.00, 'Contacted', 2),
(17, 'LD-1040', 'DataDynamics Analytics', 'Girish Karnad', 'girish@datadynamics.com', '+91 87334 45566', 'Corporate', 220000.00, 'Lost', 6),
(18, 'LD-1041', 'SRM Institute Student Delegation', 'Karthik Raja', 'karthik@srm.edu.in', '+91 86445 56677', 'Individual', 150000.00, 'Contacted', 7),
(19, 'LD-1042', 'Synergy Global Tech Academy', 'Divya Spandana', 'divya@synergytech.org', '+91 85556 67788', 'Corporate', 480000.00, 'Proposal Sent', 2),
(20, 'LD-1043', 'BMS College of Engineering', 'Dr. Venugopal K.', 'venugopal@bmsce.ac.in', '+91 84667 78899', 'College', 620000.00, 'Negotiation', 6)
ON CONFLICT (id) DO NOTHING;

-- 4. FOLLOW-UPS (At least 20 follow-up records)
INSERT INTO followups (id, lead_id, followup_date, type, notes, status, created_by) VALUES
(1, 1, '2026-08-15', 'Meeting', 'Initial syllabus alignment meeting with Dean Dr. S. Rao.', 'Completed', 2),
(2, 1, '2026-08-20', 'Demo', 'Technical demo presented for 50 Python Full Stack seats. Accepted.', 'Completed', 2),
(3, 2, '2026-08-22', 'Call', 'Discussed corporate pricing for Apex Tech DevOps batch.', 'Completed', 2),
(4, 3, '2026-08-25', 'Email', 'Shared St. Xavier Java Full Stack syllabus proposal.', 'Completed', 6),
(5, 4, '2026-08-28', 'Meeting', 'Finalized MOU for Nehru Institute Cybersecurity cohort.', 'Completed', 2),
(6, 5, '2026-08-30', 'Demo', 'TechNova Solutions demo for Java Spring Boot program.', 'Completed', 6),
(7, 6, '2026-09-01', 'Call', 'Vertex Systems signed agreement for Machine Learning lab.', 'Completed', 7),
(8, 7, '2026-09-02', 'Meeting', 'Greenfield University Data Science 30-student program onboarding.', 'Completed', 2),
(9, 8, '2026-09-03', 'Email', 'Sent invoice schedule to Skyline Infotech finance team.', 'Completed', 6),
(10, 9, '2026-09-04', 'Call', 'CloudScale Data Analytics lab setup confirmed.', 'Completed', 7),
(11, 10, '2026-09-05', 'Demo', 'Quantum Edge AI Immersion module walkthrough.', 'Completed', 2),
(12, 11, '2026-09-06', 'Meeting', 'National College of Engg MoU signed by Principal.', 'Completed', 6),
(13, 12, '2026-09-07', 'Call', 'Loyola Academy initial phone qualification.', 'Scheduled', 7),
(14, 13, '2026-09-08', 'Email', 'Sent CyberNet Defence commercial quote for 25 seats.', 'Scheduled', 2),
(15, 14, '2026-09-09', 'Meeting', 'Vidyapeeth Group price negotiation call scheduled.', 'Scheduled', 6),
(16, 15, '2026-09-10', 'Call', 'InfraCloud initial follow-up pending.', 'Scheduled', 7),
(17, 16, '2026-09-11', 'Demo', 'RVCE Python lab demo scheduled for HODs.', 'Scheduled', 2),
(18, 17, '2026-08-10', 'Call', 'DataDynamics declined due to budget constraints.', 'Completed', 6),
(19, 18, '2026-09-12', 'WhatsApp', 'Shared student discount voucher code with SRM lead.', 'Scheduled', 7),
(20, 19, '2026-09-13', 'Email', 'Synergy Global commercial proposal review.', 'Scheduled', 2),
(21, 20, '2026-09-14', 'Meeting', 'BMS College final contract review meeting.', 'Scheduled', 6)
ON CONFLICT (id) DO NOTHING;

-- 5. CUSTOMERS (At least 10 customers)
INSERT INTO customers (id, customer_code, lead_id, name, category, contact_person, email, phone, address) VALUES
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
ON CONFLICT (id) DO NOTHING;

-- 6. TRAINERS (At least 10 trainers with diverse specializations)
INSERT INTO trainers (id, trainer_code, name, email, phone, expertise, per_session_rate, status) VALUES
(1, 'TRN-101', 'Rahul Kumar', 'rahul.kumar@eduflow.ai', '+91 99887 76655', 'Python, Full Stack Development', 4500.00, 'Active'),
(2, 'TRN-102', 'Dr. Arvind Swaminathan', 'arvind@eduflow.ai', '+91 98765 11223', 'Machine Learning, Deep Learning', 5000.00, 'Active'),
(3, 'TRN-103', 'Sunita Sharma', 'trainer1@eduos.demo', '+91 97766 55443', 'Java, Spring Boot, Microservices', 4200.00, 'Active'),
(4, 'TRN-104', 'Amit Patel', 'amit.patel@eduflow.ai', '+91 96655 44332', 'Cloud Computing, AWS, Azure', 4800.00, 'Active'),
(5, 'TRN-105', 'Ananya Sen', 'ananya.sen@eduflow.ai', '+91 95544 33221', 'Data Science, Pandas, R', 4600.00, 'Active'),
(6, 'TRN-106', 'Deepa Nair', 'deepa.nair@eduflow.ai', '+91 94433 22110', 'DevOps, Docker, Kubernetes', 4700.00, 'Active'),
(7, 'TRN-107', 'Rajesh Kothari', 'rajesh.k@eduflow.ai', '+91 93322 11009', 'Cybersecurity, Ethical Hacking', 4900.00, 'Active'),
(8, 'TRN-108', 'Karthik V', 'karthik.v@eduflow.ai', '+91 92211 00998', 'Web Development, React, Node.js', 4400.00, 'Active'),
(9, 'TRN-109', 'Vikramaditya R', 'vikram.r@eduflow.ai', '+91 91100 99887', 'Data Analytics, PowerBI, SQL', 4300.00, 'Active'),
(10, 'TRN-110', 'Priyanka Reddy', 'priyanka.r@eduflow.ai', '+91 90099 88776', 'AI & Machine Learning', 5100.00, 'Active')
ON CONFLICT (id) DO NOTHING;

-- 7. PROGRAMS / COURSES (At least 10 programs)
INSERT INTO programs (id, program_code, title, category, duration_hours, total_sessions, price_per_student, status) VALUES
(1, 'PRG-PY-100', 'Python Full Stack Training', 'Software Engineering', 120, 20, 10000.00, 'Active'),
(2, 'PRG-JV-100', 'Java Full Stack Development', 'Software Engineering', 140, 24, 10000.00, 'Active'),
(3, 'PRG-DS-100', 'Data Science with Python', 'Data Science', 130, 22, 12000.00, 'Active'),
(4, 'PRG-ML-100', 'Machine Learning Fundamentals', 'AI & ML', 150, 25, 15000.00, 'Active'),
(5, 'PRG-CLD-100', 'Cloud Computing with AWS', 'Cloud & Infra', 100, 18, 12000.00, 'Active'),
(6, 'PRG-DEV-100', 'DevOps Engineering & CI/CD', 'Cloud & Infra', 110, 20, 13000.00, 'Active'),
(7, 'PRG-SEC-100', 'Cybersecurity Fundamentals', 'Security', 120, 20, 12500.00, 'Active'),
(8, 'PRG-WEB-100', 'Modern Web Development', 'Software Engineering', 90, 15, 8000.00, 'Active'),
(9, 'PRG-DA-100', 'Data Analytics with PowerBI', 'Data Science', 80, 14, 9000.00, 'Active'),
(10, 'PRG-AI-100', 'AI & Deep Learning Masterclass', 'AI & ML', 160, 26, 16000.00, 'Active')
ON CONFLICT (id) DO NOTHING;

-- 8. BATCHES (At least 10 batches)
INSERT INTO batches (id, batch_code, program_id, customer_id, trainer_id, start_date, end_date, total_enrolled, status) VALUES
(1, 'PY-24', 1, 1, 1, '2026-08-01', '2026-10-15', 50, 'In-Progress'),
(2, 'JV-10', 2, 3, 3, '2026-08-05', '2026-10-20', 25, 'In-Progress'),
(3, 'DS-05', 3, 5, 5, '2026-08-10', '2026-10-25', 30, 'In-Progress'),
(4, 'ML-02', 4, 4, 2, '2026-08-12', '2026-11-01', 20, 'In-Progress'),
(5, 'CLD-08', 5, 6, 4, '2026-08-15', '2026-10-10', 35, 'In-Progress'),
(6, 'DEV-04', 6, 10, 6, '2026-08-18', '2026-10-30', 22, 'In-Progress'),
(7, 'SEC-01', 7, 2, 7, '2026-08-20', '2026-11-05', 40, 'In-Progress'),
(8, 'WEB-12', 8, 9, 8, '2026-08-22', '2026-10-05', 45, 'Completed'),
(9, 'DA-03', 9, 7, 9, '2026-08-25', '2026-10-12', 28, 'In-Progress'),
(10, 'AI-09', 10, 8, 10, '2026-09-01', '2026-11-20', 18, 'Upcoming')
ON CONFLICT (id) DO NOTHING;

-- 9. VENDORS
INSERT INTO vendors (id, name, category, contact_person, phone) VALUES
(1, 'AWS Cloud Labs', 'Software/Cloud', 'Support Desk', '+1 800 555 0199'),
(2, 'EduBook Press Ltd', 'Material', 'Suresh Kumar', '+91 98111 22334'),
(3, 'Grand Residency Hotel & Conference', 'Venue', 'Manager Desk', '+91 98222 33445'),
(4, 'JetLine Logistics & Travel', 'Travel', 'Travel Agent', '+91 98333 44556')
ON CONFLICT (id) DO NOTHING;

-- 10. STUDENTS (At least 50 synthetic students)
INSERT INTO students (id, student_code, name, email, phone, college_company) VALUES
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
(21, 'NEH-IT-001', 'Rajesh Khanna', 'rajesh.k@nehru.edu.in', '+91 92222 00001', 'Nehru Institute of Tech'),
(22, 'NEH-IT-002', 'Sharmila Tagore', 'sharmila.t@nehru.edu.in', '+91 92222 00002', 'Nehru Institute of Tech'),
(23, 'NEH-IT-003', 'Amitabh Bachchan', 'amitabh.b@nehru.edu.in', '+91 92222 00003', 'Nehru Institute of Tech'),
(24, 'NEH-IT-004', 'Jaya Bhaduri', 'jaya.b@nehru.edu.in', '+91 92222 00004', 'Nehru Institute of Tech'),
(25, 'NEH-IT-005', 'Dharmendra Deol', 'dharmendra.d@nehru.edu.in', '+91 92222 00005', 'Nehru Institute of Tech'),
(26, 'TN-EMP-001', 'Vikram Seth', 'vikram@technova.com', '+91 93333 00001', 'TechNova Solutions'),
(27, 'TN-EMP-002', 'Arundhati Roy', 'arundhati@technova.com', '+91 93333 00002', 'TechNova Solutions'),
(28, 'TN-EMP-003', 'Chetan Bhagat', 'chetan@technova.com', '+91 93333 00003', 'TechNova Solutions'),
(29, 'VT-EMP-001', 'Shashi Tharoor', 'shashi@vertexsys.in', '+91 94444 00001', 'Vertex Systems'),
(30, 'VT-EMP-002', 'Sudha Murty', 'sudha@vertexsys.in', '+91 94444 00002', 'Vertex Systems'),
(31, 'GF-CS-001', 'Narayana Murthy', 'narayana@greenfield.edu', '+91 95555 00001', 'Greenfield University'),
(32, 'GF-CS-002', 'Nandan Nilekani', 'nandan@greenfield.edu', '+91 95555 00002', 'Greenfield University'),
(33, 'SKY-EMP-001', 'Kiran Mazumdar', 'kiran@skyline.io', '+91 96666 00001', 'Skyline Infotech'),
(34, 'CS-EMP-001', 'Azim Premji', 'azim@cloudscale.ai', '+91 97777 00001', 'CloudScale Software Labs'),
(35, 'QE-EMP-001', 'Shiv Nadar', 'shiv@qedge.com', '+91 98888 00001', 'Quantum Edge Tech')
ON CONFLICT (id) DO NOTHING;

-- 11. BATCH ENROLLMENTS
INSERT INTO batch_students (batch_id, student_id, completion_status) VALUES
(1, 1, 'Enrolled'), (1, 2, 'Enrolled'), (1, 3, 'Enrolled'), (1, 4, 'Enrolled'), (1, 5, 'Enrolled'),
(1, 6, 'Enrolled'), (1, 7, 'Enrolled'), (1, 8, 'Enrolled'), (1, 9, 'Enrolled'), (1, 10, 'Enrolled'),
(1, 11, 'Enrolled'), (1, 12, 'Enrolled'), (1, 13, 'Enrolled'), (1, 14, 'Enrolled'), (1, 15, 'Enrolled'),
(1, 16, 'Enrolled'), (1, 17, 'Enrolled'), (1, 18, 'Enrolled'), (1, 19, 'Enrolled'), (1, 20, 'Enrolled'),
(7, 21, 'Enrolled'), (7, 22, 'Enrolled'), (7, 23, 'Enrolled'), (7, 24, 'Enrolled'), (7, 25, 'Enrolled'),
(2, 26, 'Enrolled'), (2, 27, 'Enrolled'), (2, 28, 'Enrolled'),
(4, 29, 'Enrolled'), (4, 30, 'Enrolled'),
(3, 31, 'Enrolled'), (3, 32, 'Enrolled'),
(5, 33, 'Enrolled'), (9, 34, 'Enrolled'), (10, 35, 'Enrolled')
ON CONFLICT DO NOTHING;

-- 12. SESSIONS (At least 20 training sessions)
INSERT INTO sessions (id, batch_id, session_number, topic, session_date, status) VALUES
(1, 1, 1, 'Python Fundamentals & Control Flow', '2026-08-05', 'Completed'),
(2, 1, 2, 'Data Structures & OOP Principles', '2026-08-10', 'Completed'),
(3, 1, 3, 'FastAPI & RESTful Web APIs', '2026-08-15', 'Completed'),
(4, 1, 4, 'PostgreSQL Database Integration', '2026-08-20', 'Completed'),
(5, 1, 5, 'React 18 & Frontend State Management', '2026-08-25', 'Completed'),
(6, 2, 1, 'Java Syntax & OOP Core Concepts', '2026-08-07', 'Completed'),
(7, 2, 2, 'Spring Boot Rest Services & JPA', '2026-08-14', 'Completed'),
(8, 3, 1, 'Data Science Foundations & NumPy', '2026-08-12', 'Completed'),
(9, 3, 2, 'Pandas Dataframes & Visualization', '2026-08-19', 'Completed'),
(10, 4, 1, 'Supervised Machine Learning Algorithms', '2026-08-15', 'Completed'),
(11, 4, 2, 'Neural Networks & PyTorch Basics', '2026-08-22', 'Completed'),
(12, 5, 1, 'AWS Core EC2, S3 & VPC Setup', '2026-08-17', 'Completed'),
(13, 5, 2, 'AWS Cloud IAM & Security Best Practices', '2026-08-24', 'Completed'),
(14, 6, 1, 'Docker Containerization & Multi-Stage Builds', '2026-08-20', 'Completed'),
(15, 6, 2, 'Kubernetes Deployment & Services Manifests', '2026-08-27', 'Completed'),
(16, 7, 1, 'Cybersecurity Fundamentals & Threat Vectors', '2026-08-22', 'Completed'),
(17, 7, 2, 'Network Penetration Testing & Wireshark', '2026-08-29', 'Completed'),
(18, 8, 1, 'Modern JavaScript ES6+ & DOM Manipulation', '2026-08-24', 'Completed'),
(19, 8, 2, 'React Components & Hooks State', '2026-08-31', 'Completed'),
(20, 9, 1, 'PowerBI Data Modeling & DAX Expressions', '2026-08-27', 'Completed'),
(21, 9, 2, 'SQL Advanced Aggregations & Window Functions', '2026-09-03', 'Completed')
ON CONFLICT (id) DO NOTHING;

-- 13. ATTENDANCE (Realistic 75%-98% attendance variations)
INSERT INTO attendance (session_id, student_id, status) VALUES
(1, 1, 'Present'), (1, 2, 'Present'), (1, 3, 'Present'), (1, 4, 'Present'), (1, 5, 'Present'),
(1, 6, 'Present'), (1, 7, 'Present'), (1, 8, 'Present'), (1, 9, 'Present'), (1, 10, 'Present'),
(2, 1, 'Present'), (2, 2, 'Present'), (2, 3, 'Present'), (2, 4, 'Absent'),  (2, 5, 'Present'),
(2, 6, 'Present'), (2, 7, 'Late'),    (2, 8, 'Present'), (2, 9, 'Present'), (2, 10, 'Present'),
(3, 1, 'Present'), (3, 2, 'Present'), (3, 3, 'Present'), (3, 4, 'Present'), (3, 5, 'Present'),
(3, 6, 'Present'), (3, 7, 'Present'), (3, 8, 'Absent'),  (3, 9, 'Present'), (3, 10, 'Present'),
(6, 26, 'Present'), (6, 27, 'Present'), (6, 28, 'Present'),
(8, 31, 'Present'), (8, 32, 'Absent'),
(12, 33, 'Present'), (16, 21, 'Present'), (16, 22, 'Present'), (16, 23, 'Present'), (16, 24, 'Late'), (16, 25, 'Present')
ON CONFLICT DO NOTHING;

-- 14. INVOICES (At least 10 invoices with realistic amounts)
INSERT INTO invoices (id, invoice_number, customer_id, batch_id, issue_date, due_date, subtotal, tax_amount, total_amount, status) VALUES
(1, 'INV-2026-089-A', 1, 1, '2026-08-01', '2026-08-15', 200000.00, 0.00, 200000.00, 'Paid'),
(2, 'INV-2026-089-B', 1, 1, '2026-09-01', '2026-09-25', 300000.00, 0.00, 300000.00, 'Unpaid'),
(3, 'INV-2026-090-A', 2, 7, '2026-08-05', '2026-08-20', 450000.00, 0.00, 450000.00, 'Partially Paid'),
(4, 'INV-2026-091-A', 3, 2, '2026-08-10', '2026-08-25', 250000.00, 0.00, 250000.00, 'Paid'),
(5, 'INV-2026-092-A', 4, 4, '2026-08-12', '2026-08-27', 300000.00, 0.00, 300000.00, 'Paid'),
(6, 'INV-2026-093-A', 5, 3, '2026-08-15', '2026-08-30', 750000.00, 0.00, 750000.00, 'Partially Paid'),
(7, 'INV-2026-094-A', 6, 5, '2026-08-18', '2026-09-02', 420000.00, 0.00, 420000.00, 'Paid'),
(8, 'INV-2026-095-A', 7, 9, '2026-08-20', '2026-09-05', 280000.00, 0.00, 280000.00, 'Unpaid'),
(9, 'INV-2026-096-A', 8, 10, '2026-08-22', '2026-09-07', 180000.00, 0.00, 180000.00, 'Unpaid'),
(10, 'INV-2026-097-A', 9, 8, '2026-08-25', '2026-09-10', 550000.00, 0.00, 550000.00, 'Paid')
ON CONFLICT (id) DO NOTHING;

-- 15. PAYMENTS (At least 15 payment records)
INSERT INTO payments (id, receipt_number, invoice_id, customer_id, payment_date, amount, payment_mode, reference_number, notes) VALUES
(1, 'REC-8841', 1, 1, '2026-08-10', 200000.00, 'RTGS/NEFT', 'HDFC009218299104', 'Initial 40% Tranche Payment'),
(2, 'REC-8842', 3, 2, '2026-08-12', 200000.00, 'RTGS/NEFT', 'ICIC001928374650', 'First installment for Cybersecurity batch'),
(3, 'REC-8843', 4, 3, '2026-08-15', 250000.00, 'RTGS/NEFT', 'SBIN004827163524', 'Full settlement for Java Full Stack'),
(4, 'REC-8844', 5, 4, '2026-08-18', 300000.00, 'UPI', 'AXIS991827364501', 'Full payment for Machine Learning lab'),
(5, 'REC-8845', 6, 5, '2026-08-20', 400000.00, 'RTGS/NEFT', 'HDFC003829104756', 'Tranche 1 payment Greenfield University'),
(6, 'REC-8846', 7, 6, '2026-08-22', 420000.00, 'RTGS/NEFT', 'KKBK004920183746', 'Full settlement Skyline Infotech'),
(7, 'REC-8847', 10, 9, '2026-08-28', 550000.00, 'Cheque', 'CHQ-882716', 'Cleared cheque National College'),
(8, 'REC-8848', 3, 2, '2026-09-01', 100000.00, 'UPI', 'UPI-992817263544', 'Second installment Nehru Institute'),
(9, 'REC-8849', 6, 5, '2026-09-03', 150000.00, 'RTGS/NEFT', 'UTIB001928374651', 'Tranche 2 payment Greenfield University'),
(10, 'REC-8850', 8, 7, '2026-09-04', 100000.00, 'RTGS/NEFT', 'HDFC001928374652', 'Partial payment CloudScale Software'),
(11, 'REC-8851', 9, 8, '2026-09-05', 80000.00, 'UPI', 'UPI-881920394857', 'Partial payment Quantum Edge'),
(12, 'REC-8852', 2, 1, '2026-09-06', 100000.00, 'RTGS/NEFT', 'HDFC009988776655', 'Additional collection ABC College'),
(13, 'REC-8853', 3, 2, '2026-09-07', 50000.00, 'Cheque', 'CHQ-991827', 'Final cheque clearing Nehru Institute'),
(14, 'REC-8854', 8, 7, '2026-09-08', 80000.00, 'RTGS/NEFT', 'ICIC009988776655', 'Second tranche CloudScale'),
(15, 'REC-8855', 9, 8, '2026-09-09', 50000.00, 'UPI', 'UPI-771122334455', 'Second tranche Quantum Edge')
ON CONFLICT (id) DO NOTHING;

-- 16. EXPENSES (At least 20 expense records)
INSERT INTO expenses (id, expense_code, category, description, amount, expense_date, batch_id, vendor_id, trainer_id, paid_via) VALUES
(1, 'EXP-1001', 'Trainer Payout', 'Rahul Kumar - Session Honorarium', 90000.00, '2026-08-30', 1, NULL, 1, 'Bank Transfer'),
(2, 'EXP-1002', 'Venue & Infrastructure', 'AWS Sandbox & High-Compute Lab', 25000.00, '2026-08-02', 1, 1, NULL, 'Corporate Card'),
(3, 'EXP-1003', 'Material & Software', 'Python Full Stack Courseware Packs', 20000.00, '2026-08-04', 1, 2, NULL, 'Bank Transfer'),
(4, 'EXP-1004', 'Trainer Payout', 'Sunita Sharma - Java Batch Payout', 50000.00, '2026-08-28', 2, NULL, 3, 'Bank Transfer'),
(5, 'EXP-1005', 'Travel & Accommodation', 'Faculty Flight & Hotel Stay for TechNova', 18000.00, '2026-08-06', 2, 4, NULL, 'Corporate Card'),
(6, 'EXP-1006', 'Trainer Payout', 'Ananya Sen - Data Science Payout', 65000.00, '2026-08-31', 3, NULL, 5, 'Bank Transfer'),
(7, 'EXP-1007', 'Venue & Infrastructure', 'Kochi Grand Hotel Conference Hall Rent', 35000.00, '2026-08-11', 3, 3, NULL, 'Bank Transfer'),
(8, 'EXP-1008', 'Trainer Payout', 'Dr. Arvind Swaminathan ML Honorarium', 75000.00, '2026-09-01', 4, NULL, 2, 'Bank Transfer'),
(9, 'EXP-1009', 'Material & Software', 'PyTorch & Cloud GPU Compute Lab Key', 30000.00, '2026-08-13', 4, 1, NULL, 'Corporate Card'),
(10, 'EXP-1010', 'Trainer Payout', 'Amit Patel Cloud Computing Honorarium', 55000.00, '2026-08-30', 5, NULL, 4, 'Bank Transfer'),
(11, 'EXP-1011', 'Trainer Payout', 'Deepa Nair DevOps Session Honorarium', 48000.00, '2026-08-29', 6, NULL, 6, 'Bank Transfer'),
(12, 'EXP-1012', 'Material & Software', 'Docker & Kubernetes Certification Vouchers', 40000.00, '2026-08-19', 6, 2, NULL, 'Bank Transfer'),
(13, 'EXP-1013', 'Trainer Payout', 'Rajesh Kothari Cybersecurity Honorarium', 80000.00, '2026-09-02', 7, NULL, 7, 'Bank Transfer'),
(14, 'EXP-1014', 'Venue & Infrastructure', 'Coimbatore IT Lab Dedicated Compute Line', 22000.00, '2026-08-21', 7, 3, NULL, 'Bank Transfer'),
(15, 'EXP-1015', 'Trainer Payout', 'Karthik V Web Development Payout', 42000.00, '2026-08-30', 8, NULL, 8, 'Bank Transfer'),
(16, 'EXP-1016', 'Trainer Payout', 'Vikramaditya R PowerBI Honorarium', 38000.00, '2026-09-03', 9, NULL, 9, 'Bank Transfer'),
(17, 'EXP-1017', 'Marketing', 'Digital Ad Campaign for Data Analytics', 15000.00, '2026-08-24', 9, NULL, NULL, 'Corporate Card'),
(18, 'EXP-1018', 'Equipment', 'High-Spec Laptops Rental for AI Lab', 45000.00, '2026-09-02', 10, 1, NULL, 'Bank Transfer'),
(19, 'EXP-1019', 'Trainer Payout', 'Priyanka Reddy AI Module Advance', 40000.00, '2026-09-03', 10, NULL, 10, 'Bank Transfer'),
(20, 'EXP-1020', 'Travel & Accommodation', 'Rahul Kumar Inter-campus Transit & Residency', 10000.00, '2026-08-20', 1, 4, 1, 'Corporate Card')
ON CONFLICT (id) DO NOTHING;
