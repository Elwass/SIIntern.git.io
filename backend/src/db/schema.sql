CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified_at DATETIME NULL,
  status ENUM('pending','active','blocked') NOT NULL DEFAULT 'pending',
  role ENUM('student', 'admin', 'mentor', 'pembimbing_lapangan') NOT NULL DEFAULT 'student',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  nama_lengkap VARCHAR(150) NOT NULL,
  nim VARCHAR(80) NOT NULL,
  kampus VARCHAR(190) NOT NULL,
  program_studi VARCHAR(150) NOT NULL,
  semester INT NOT NULL,
  no_hp VARCHAR(40) NOT NULL,
  alamat TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS internship_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bidang_magang VARCHAR(150) NOT NULL,
  periode_mulai DATE NOT NULL,
  periode_selesai DATE NOT NULL,
  motivasi TEXT NOT NULL,
  status ENUM('draft', 'pending', 'verified', 'accepted', 'rejected') NOT NULL DEFAULT 'draft',
  catatan_admin TEXT NOT NULL DEFAULT '',
  admin_notes TEXT NOT NULL DEFAULT '',
  mentor_id INT NULL,
  submitted_at DATETIME NULL,
  verified_at DATETIME NULL,
  accepted_at DATETIME NULL,
  rejected_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_internship_applications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_internship_applications_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_user_internship_period (user_id, periode_mulai, periode_selesai),
  INDEX idx_internship_applications_user_status (user_id, status),
  INDEX idx_internship_applications_status (status),
  INDEX idx_internship_applications_bidang (bidang_magang)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS application_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  user_id INT NOT NULL,
  jenis_dokumen ENUM('surat_pengantar_kampus', 'curriculum_vitae', 'kartu_tanda_mahasiswa', 'pas_foto', 'transkrip_nilai') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT NOT NULL,
  status ENUM('uploaded', 'verified', 'needs_revision', 'rejected') NOT NULL DEFAULT 'uploaded',
  catatan_admin TEXT NOT NULL DEFAULT '',
  admin_notes TEXT NOT NULL DEFAULT '',
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application_document_type (application_id, jenis_dokumen),
  CONSTRAINT fk_application_documents_application FOREIGN KEY (application_id) REFERENCES internship_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_application_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mentor_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL UNIQUE,
  mentor_id INT NOT NULL,
  assigned_by INT NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mentor_assignments_application FOREIGN KEY (application_id) REFERENCES internship_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_mentor_assignments_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_mentor_assignments_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(190) NOT NULL,
  message TEXT NOT NULL,
  related_type VARCHAR(50) NULL,
  related_id INT NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS email_otps (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email VARCHAR(190) NOT NULL,
  purpose ENUM('signup','signin','reset_password') NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_email_otps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_email_otps_lookup (user_id, email, purpose, used_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  refresh_token_hash CHAR(64) NOT NULL UNIQUE,
  user_agent VARCHAR(255) NULL,
  ip_address VARCHAR(64) NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user_expires (user_id, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE internship_applications MODIFY status ENUM('draft', 'pending', 'verified', 'accepted', 'rejected', 'needs_revision') NOT NULL DEFAULT 'draft';
CREATE TABLE IF NOT EXISTS logbook_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  user_id INT NOT NULL,
  mentor_id INT NULL,
  activity_date DATE NOT NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NOT NULL,
  output TEXT NOT NULL DEFAULT '',
  supporting_file_name VARCHAR(255) NOT NULL DEFAULT '',
  supporting_file_path VARCHAR(500) NOT NULL DEFAULT '',
  supporting_file_url VARCHAR(500) NOT NULL DEFAULT '',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  feedback TEXT NOT NULL DEFAULT '',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_logbook_application FOREIGN KEY (application_id) REFERENCES internship_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_logbook_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_logbook_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_logbook_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_logbook_application_status (application_id, status),
  INDEX idx_logbook_mentor_status (mentor_id, status),
  INDEX idx_logbook_activity_date (activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  user_id INT NOT NULL,
  mentor_id INT NULL,
  attendance_date DATE NOT NULL,
  check_in_at DATETIME NULL,
  check_out_at DATETIME NULL,
  status ENUM('present', 'late', 'sick', 'permit', 'absent') NOT NULL DEFAULT 'present',
  proof_type VARCHAR(50) NOT NULL DEFAULT '',
  proof_file_name VARCHAR(255) NOT NULL DEFAULT '',
  proof_file_path VARCHAR(500) NOT NULL DEFAULT '',
  proof_file_url VARCHAR(500) NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  corrected_by INT NULL,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance_application_date (application_id, attendance_date),
  CONSTRAINT fk_attendance_application FOREIGN KEY (application_id) REFERENCES internship_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_attendance_corrector FOREIGN KEY (corrected_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_attendance_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_attendance_user_date (user_id, attendance_date),
  INDEX idx_attendance_mentor_date (mentor_id, attendance_date),
  INDEX idx_attendance_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  mentor_id INT NOT NULL,
  performance_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  soft_skills_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  logbook_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  final_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  grade VARCHAR(5) NOT NULL DEFAULT 'D',
  feedback TEXT NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_evaluations_application FOREIGN KEY (application_id) REFERENCES internship_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_evaluations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_evaluations_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id INT NULL,
  application_id INT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_audit_application FOREIGN KEY (application_id) REFERENCES internship_applications(id) ON DELETE SET NULL,
  INDEX idx_audit_application (application_id, created_at),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_actor (actor_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
