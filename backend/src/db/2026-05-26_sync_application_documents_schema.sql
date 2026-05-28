-- Sync migration for application_documents/admin notes and FK safety.
SET @schema_name := DATABASE();

-- Ensure catatan_admin exists
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'application_documents' AND COLUMN_NAME = 'catatan_admin'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE application_documents ADD COLUMN catatan_admin TEXT NOT NULL DEFAULT '''' AFTER status',
  'SELECT "application_documents.catatan_admin already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure admin_notes exists
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'application_documents' AND COLUMN_NAME = 'admin_notes'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE application_documents ADD COLUMN admin_notes TEXT NOT NULL DEFAULT '''' AFTER catatan_admin',
  'SELECT "application_documents.admin_notes already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure status exists
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'application_documents' AND COLUMN_NAME = 'status'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE application_documents ADD COLUMN status ENUM(''uploaded'',''verified'',''needs_revision'',''rejected'') NOT NULL DEFAULT ''uploaded'' AFTER file_size',
  'SELECT "application_documents.status already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure uploaded_at exists
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'application_documents' AND COLUMN_NAME = 'uploaded_at'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE application_documents ADD COLUMN uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER admin_notes',
  'SELECT "application_documents.uploaded_at already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure FK to internship_applications exists
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = @schema_name AND CONSTRAINT_NAME = 'fk_application_documents_application'
);
SET @sql := IF(@has_fk = 0,
  'ALTER TABLE application_documents ADD CONSTRAINT fk_application_documents_application FOREIGN KEY (application_id) REFERENCES internship_applications(id) ON DELETE CASCADE',
  'SELECT "fk_application_documents_application already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure FK to users exists
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = @schema_name AND CONSTRAINT_NAME = 'fk_application_documents_user'
);
SET @sql := IF(@has_fk = 0,
  'ALTER TABLE application_documents ADD CONSTRAINT fk_application_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
  'SELECT "fk_application_documents_user already exists"');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
