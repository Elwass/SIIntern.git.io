# PKL Internship Management Dashboard Blueprint (Banyumas Regency Secretariat)

This document provides a **ready-to-develop project structure** with clear role separation between:
- `mahasiswa` (student)
- `admin` / `pembimbing_lapangan` (field supervisor)

It aligns with the existing stack in this repository:
- Backend: Node.js + Express + MySQL
- Frontend: React (Vite)
- Auth: JWT + hashed passwords, optional OTP (informational only)

---

## 1) Full Project Structure

```bash
SIIntern.git.io/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── config/
│       │   └── db.js
│       ├── constants/
│       │   └── applicationConstants.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   └── rateLimit.js
│       ├── db/
│       │   ├── migrate.js
│       │   ├── schema.sql
│       │   ├── schema_pkl.sql
│       │   └── seed_pkl.sql
│       ├── repositories/
│       │   ├── userRepository.js
│       │   └── applicationRepository.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── studentController.js
│       │   ├── applicationController.js
│       │   ├── attendanceController.js
│       │   ├── adminController.js
│       │   └── reportController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── studentRoutes.js
│       │   ├── adminRoutes.js
│       │   ├── mentorRoutes.js
│       │   ├── dashboardRoutes.js
│       │   ├── applicationRoutes.js
│       │   ├── attendanceRoutes.js
│       │   └── reportRoutes.js
│       └── utils/
│           ├── validation.js
│           └── response.js
├── frontend/
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── services/
│       │   ├── auth.js
│       │   ├── applications.js
│       │   ├── student.js
│       │   ├── attendance.js
│       │   └── reports.js
│       ├── components/
│       │   ├── auth/
│       │   │   ├── ProtectedRoute.jsx
│       │   │   └── PublicOnlyRoute.jsx
│       │   ├── layout/
│       │   │   ├── DashboardLayout.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   └── Topbar.jsx
│       │   └── common/
│       │       ├── StatusBadge.jsx
│       │       └── KPIWidget.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── StudentDashboard.jsx
│           ├── StudentApplicationPage.jsx
│           ├── StudentAttendancePage.jsx
│           ├── AdminDashboard.jsx
│           ├── AdminApplicationsPage.jsx
│           ├── AdminAttendancePage.jsx
│           └── ReportPage.jsx
└── PKL_DASHBOARD_BLUEPRINT.md
```

---

## 2) Role Separation Rules (Core)

### Mahasiswa
Allowed:
- Register, login
- Submit internship application
- Upload proposal/CV/transcript documents
- View own application status
- View own attendance

Blocked:
- Any admin-only routes (`/admin/*`, global reports, approval actions)

### Admin / Pembimbing Lapangan
Allowed:
- Login
- View all applications
- Approve/reject applications
- Mark student attendance
- View/export reports

Blocked:
- Student-only self-service write actions if not relevant

Use middleware policy:
- `authenticate` (JWT/session check)
- `authorizeRoles('admin', 'pembimbing_lapangan')`
- `authorizeOwnerOrAdmin` for student-owned resources

---

## 3) Backend API Plan (Simple and Structured)

### Auth
- `POST /auth/signup`
- `POST /auth/signin`
- `POST /auth/verify-otp` (optional informational verification)
- `POST /auth/resend-otp`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/logout`
- `GET /auth/me`

### Student
- `GET /student/profile`
- `PUT /student/profile`
- `POST /student/applications`
- `GET /student/applications/me`
- `GET /student/attendance/me`

### Admin
- `GET /admin/applications`
- `PATCH /admin/applications/:id/approve`
- `PATCH /admin/applications/:id/reject`
- `POST /admin/attendance`
- `GET /admin/reports`

---

## 4) MySQL Schema (Required Tables)

Use this as `backend/src/db/schema_pkl.sql`.

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin','pembimbing_lapangan') NOT NULL DEFAULT 'student',
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  email_verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  nim VARCHAR(50) NOT NULL UNIQUE,
  university VARCHAR(160) NOT NULL,
  major VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS internship_applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  institution_name VARCHAR(200) NOT NULL DEFAULT 'Sekretariat Daerah Kabupaten Banyumas',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('submitted','reviewed','approved','rejected') NOT NULL DEFAULT 'submitted',
  proposal_url VARCHAR(255) NULL,
  cv_url VARCHAR(255) NULL,
  transcript_url VARCHAR(255) NULL,
  admin_note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  date DATE NOT NULL,
  check_in TIME NULL,
  check_out TIME NULL,
  status ENUM('present','sick','permit','absent') NOT NULL DEFAULT 'present',
  note TEXT NULL,
  marked_by BIGINT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance_user_date (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admin_actions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT NOT NULL,
  action_type VARCHAR(80) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_id BIGINT NOT NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 5) Seed Data

Use this as `backend/src/db/seed_pkl.sql`.

```sql
INSERT INTO users (name, email, password_hash, role, status, email_verified_at)
VALUES
('Admin Banyumas', 'admin@banyumaskab.go.id', '$2b$12$examplehashreplace', 'admin', 'active', NOW()),
('Pembimbing Lapangan', 'mentor@banyumaskab.go.id', '$2b$12$examplehashreplace', 'pembimbing_lapangan', 'active', NOW()),
('Mahasiswa Demo', 'student1@kampus.ac.id', '$2b$12$examplehashreplace', 'student', 'active', NOW());

INSERT INTO student_profiles (user_id, nim, university, major, phone, address)
SELECT id, 'A11.2026.0001', 'Universitas Contoh', 'Informatika', '08123456789', 'Purwokerto'
FROM users WHERE email = 'student1@kampus.ac.id';
```

> Generate real bcrypt hashes using a Node script before production.

---

## 6) Controller Responsibilities

- `authController.js`: signup/signin/logout/me, OTP informational flow, forgot/reset password.
- `applicationController.js`: student submit application + student own list.
- `attendanceController.js`: student own attendance + admin mark attendance.
- `adminController.js`: list/approve/reject all applications with audit logs (`admin_actions`).
- `reportController.js`: aggregate application + attendance report for dashboard.

All handlers should:
- use `async/await`
- validate input payload
- return consistent JSON shape
- forward errors with `next(error)`

---

## 7) Frontend Pages (MVP)

Student pages:
- `LoginPage.jsx`, `RegisterPage.jsx`
- `StudentDashboard.jsx`
- `StudentApplicationPage.jsx` (form + document upload)
- `StudentAttendancePage.jsx`

Admin pages:
- `AdminDashboard.jsx`
- `AdminApplicationsPage.jsx` (approve/reject)
- `AdminAttendancePage.jsx` (mark attendance)
- `ReportPage.jsx`

RBAC in React:
- Wrap pages with `ProtectedRoute` + role checks.
- Hide admin navigation items for student role.

---

## 8) Run Instructions

### Backend
```bash
cd backend
cp .env.example .env
npm install
# create database then run:
node src/db/migrate.js
# optional: apply additional PKL schema + seed
mysql -u root -p < src/db/schema_pkl.sql
mysql -u root -p < src/db/seed_pkl.sql
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 9) Implementation Order (Recommended)

1. Finalize auth + RBAC middleware contract.
2. Implement student application submission + list own status.
3. Implement admin application review actions.
4. Implement attendance (student view + admin mark).
5. Implement reports endpoint + `ReportPage`.
6. Add validations/tests for each route.

This keeps the first release simple, role-safe, and usable immediately.
