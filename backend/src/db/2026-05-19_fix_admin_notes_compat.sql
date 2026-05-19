-- Compatibility migration for environments that already have admin_notes columns.
-- This migration is optional when columns already exist or are unused by current code.
-- It safely creates admin_notes if absent so legacy queries/tools keep working.
ALTER TABLE internship_applications
  ADD COLUMN IF NOT EXISTS admin_notes TEXT NOT NULL DEFAULT '' AFTER catatan_admin;

ALTER TABLE application_documents
  ADD COLUMN IF NOT EXISTS admin_notes TEXT NOT NULL DEFAULT '' AFTER catatan_admin;
