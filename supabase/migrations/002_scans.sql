-- Migration: 002_scans
-- Run in Supabase SQL editor after 001_scan_submissions.sql

-- Main scan results table
CREATE TABLE IF NOT EXISTS scans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain          TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('REDO', 'DELVIS_REDO', 'INTE_REDO')),
  industry        TEXT,
  findings        JSONB,
  next_steps      JSONB,
  technical_checks JSONB,
  is_demo         BOOLEAN NOT NULL DEFAULT false,
  scanned_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No personal data in this table.

CREATE INDEX IF NOT EXISTS scans_domain_idx     ON scans (domain);
CREATE INDEX IF NOT EXISTS scans_status_idx     ON scans (status);
CREATE INDEX IF NOT EXISTS scans_scanned_at_idx ON scans (scanned_at DESC);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Anyone can insert
CREATE POLICY "Public insert"
  ON scans FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Read via service role only (no anon SELECT)

-- Integration votes table (for future persistent voting)
CREATE TABLE IF NOT EXISTS integration_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id   TEXT NOT NULL,
  session_id  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS iv_system_id_idx ON integration_votes (system_id);

ALTER TABLE integration_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert"
  ON integration_votes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Useful queries:
--
-- Scans per status:
--   SELECT status, COUNT(*) FROM scans GROUP BY status;
--
-- Top scanned domains:
--   SELECT domain, COUNT(*) FROM scans GROUP BY domain ORDER BY COUNT(*) DESC LIMIT 20;
--
-- Demo vs real ratio:
--   SELECT is_demo, COUNT(*) FROM scans GROUP BY is_demo;
--
-- Top voted integrations:
--   SELECT system_id, COUNT(*) FROM integration_votes GROUP BY system_id ORDER BY COUNT(*) DESC;
