-- Compatibility migration for environments that do not yet have `admin_notes`.
-- Works on MySQL versions that do not support `ADD COLUMN IF NOT EXISTS`.

SET @schema_name := DATABASE();

-- internship_applications.admin_notes
SET @has_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'internship_applications'
    AND COLUMN_NAME = 'admin_notes'
);
SET @sql := IF(
  @has_col = 0,
  'ALTER TABLE internship_applications ADD COLUMN admin_notes TEXT NOT NULL DEFAULT '''' AFTER catatan_admin',
  'SELECT "internship_applications.admin_notes already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- application_documents.admin_notes
SET @has_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'application_documents'
    AND COLUMN_NAME = 'admin_notes'
);
SET @sql := IF(
  @has_col = 0,
  'ALTER TABLE application_documents ADD COLUMN admin_notes TEXT NOT NULL DEFAULT '''' AFTER catatan_admin',
  'SELECT "application_documents.admin_notes already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
