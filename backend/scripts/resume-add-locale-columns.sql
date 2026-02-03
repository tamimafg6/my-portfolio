-- Add per-locale CV columns and make legacy file_url optional.
-- Run once: psql $DATABASE_URL -f scripts/resume-add-locale-columns.sql

ALTER TABLE resume
  ADD COLUMN IF NOT EXISTS file_url_en TEXT,
  ADD COLUMN IF NOT EXISTS file_url_ar TEXT;

ALTER TABLE resume
  ALTER COLUMN file_url DROP NOT NULL;
