-- MindBridge Mental Health Platform - Database Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'practitioner')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (links patient user to practitioner)
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 10),
  anxiety INTEGER NOT NULL CHECK (anxiety BETWEEN 1 AND 10),
  sleep_hours NUMERIC(3,1) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  medication_taken BOOLEAN NOT NULL DEFAULT false,
  side_effects TEXT[] NOT NULL DEFAULT '{}',
  side_effects_other TEXT,
  challenges TEXT DEFAULT '',
  achievements TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate legacy side_effects TEXT column to new side_effects TEXT[] + side_effects_other TEXT
-- Keeps existing data by renaming the old column to side_effects_legacy.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'journal_entries'
      AND column_name = 'side_effects'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE journal_entries RENAME COLUMN side_effects TO side_effects_legacy;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'journal_entries'
      AND column_name = 'side_effects'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN side_effects TEXT[] NOT NULL DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'journal_entries'
      AND column_name = 'side_effects_other'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN side_effects_other TEXT;
  END IF;
END $$;

-- Session preparation (one active row per patient)
CREATE TABLE IF NOT EXISTS session_prep (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topics_to_discuss TEXT DEFAULT '',
  questions_for_therapist TEXT DEFAULT '',
  recent_concerns TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id)
);
ALTER TABLE session_prep ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE NULL;

-- Practitioner feedback (one active row per patient)
CREATE TABLE IF NOT EXISTS practitioner_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  next_appointment_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(patient_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for auth
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient demographics (optional, filled in as needed from consultation reports)
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER NULL CHECK (age IS NULL OR (age > 0 AND age < 150));
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20) NULL;

-- Consultation reports
CREATE TABLE IF NOT EXISTS consultation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consultation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  mood_summary TEXT NOT NULL DEFAULT '',
  medication_summary TEXT NOT NULL DEFAULT '',
  sleep_summary TEXT NOT NULL DEFAULT '',
  mindfulness_summary TEXT NOT NULL DEFAULT '',
  journal_summary TEXT NOT NULL DEFAULT '',
  side_effects_summary TEXT NOT NULL DEFAULT '',
  overall_progress TEXT NOT NULL DEFAULT '',
  recommendations TEXT[] NOT NULL DEFAULT '{}',
  next_appointment TIMESTAMP WITH TIME ZONE,
  full_report JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultation_reports_patient ON consultation_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultation_reports_practitioner ON consultation_reports(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_consultation_reports_date ON consultation_reports(consultation_date);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_patient ON journal_entries(patient_id);
CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_session_prep_patient ON session_prep(patient_id);
CREATE INDEX IF NOT EXISTS idx_feedback_patient ON practitioner_feedback(patient_id);
CREATE INDEX IF NOT EXISTS idx_feedback_practitioner ON practitioner_feedback(practitioner_id);

-- Mindfulness breathing sessions (optional tracking)
CREATE TABLE IF NOT EXISTS breathing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  rating INTEGER NULL CHECK (rating >= 1 AND rating <= 5),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE breathing_sessions ADD COLUMN IF NOT EXISTS rating INTEGER NULL CHECK (rating >= 1 AND rating <= 5);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_patient ON breathing_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_breathing_sessions_completed_at ON breathing_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_alerts_patient ON alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_practitioner ON patients(practitioner_id);

-- Structured programs (multi-week, practitioner-assigned, session-based)
CREATE TABLE IF NOT EXISTS program_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT NOT NULL DEFAULT 'anxiety-4week-v1',
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_note TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
-- Only one active assignment per patient at a time (they can be re-assigned after completion)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_assignment_per_patient
  ON program_assignments(patient_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_program_assignments_patient ON program_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_program_assignments_practitioner ON program_assignments(practitioner_id);

-- AI-assisted care planning: an assignment now carries the composed plan
-- itself (session ids + week + order), not just a reference to a fixed
-- program. `source` records how the plan was drafted; `practitioner_edits`
-- captures what the practitioner changed relative to the draft, for the
-- audit trail.
ALTER TABLE program_assignments ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'manual'
  CHECK (source IN ('ai', 'rules', 'manual'));
ALTER TABLE program_assignments ADD COLUMN IF NOT EXISTS plan JSONB NOT NULL DEFAULT '[]';
ALTER TABLE program_assignments ADD COLUMN IF NOT EXISTS ai_summary TEXT NOT NULL DEFAULT '';
ALTER TABLE program_assignments ADD COLUMN IF NOT EXISTS practitioner_edits JSONB;

-- Backfill: existing rows (assigned before AI-assisted planning existed) get
-- the original fixed 18-session, 4-week program mapped into `plan` — the
-- exact order DEFAULT_PROGRAM reproduces in lib/program/sessionLibrary.ts —
-- so the patient-facing program view keeps rendering unchanged for them.
UPDATE program_assignments
SET plan = '[
  {"session_id":"w1s1","week":1,"order":0}, {"session_id":"w1s2","week":1,"order":1},
  {"session_id":"w1s3","week":1,"order":2}, {"session_id":"w1s4","week":1,"order":3},
  {"session_id":"w2s1","week":2,"order":4}, {"session_id":"w2s2","week":2,"order":5},
  {"session_id":"w2s3","week":2,"order":6}, {"session_id":"w2s4","week":2,"order":7},
  {"session_id":"w2s5","week":2,"order":8},
  {"session_id":"w3s1","week":3,"order":9}, {"session_id":"w3s2","week":3,"order":10},
  {"session_id":"w3s3","week":3,"order":11}, {"session_id":"w3s4","week":3,"order":12},
  {"session_id":"w3s5","week":3,"order":13},
  {"session_id":"w4s1","week":4,"order":14}, {"session_id":"w4s2","week":4,"order":15},
  {"session_id":"w4s3","week":4,"order":16}, {"session_id":"w4s4","week":4,"order":17}
]'::jsonb
WHERE plan = '[]'::jsonb AND program_id = 'anxiety-4week-v1';

-- Audit trail for AI-drafted care plans, independent of whether they were
-- ever approved (kept even if the practitioner discards/redrafts).
CREATE TABLE IF NOT EXISTS program_proposal_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('ai', 'rules', 'manual')),
  session_ids TEXT[] NOT NULL DEFAULT '{}',
  proposal JSONB NOT NULL DEFAULT '{}',
  warnings TEXT[] NOT NULL DEFAULT '{}',
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_at TIMESTAMP WITH TIME ZONE,
  practitioner_edits JSONB,
  assignment_id UUID REFERENCES program_assignments(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_program_proposal_audit_patient ON program_proposal_audit(patient_id);
CREATE INDEX IF NOT EXISTS idx_program_proposal_audit_practitioner ON program_proposal_audit(practitioner_id);

CREATE TABLE IF NOT EXISTS session_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES program_assignments(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 5),
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 5),
  reflection_answer TEXT NOT NULL DEFAULT '',
  selected_triggers TEXT[] NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, session_id)
);
CREATE INDEX IF NOT EXISTS idx_session_progress_assignment ON session_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_session_progress_completed_at ON session_progress(completed_at);

-- "Find a Psychiatrist Near You" directory (B2B: practitioners/cabinets pay
-- to be listed; patients browse and see contact info for free once logged
-- in). Independent of `users` -- a directory listing does not require the
-- practitioner to hold a MindBridge login. `user_id` optionally links a
-- listing to a platform practitioner account when the same person has one.
CREATE TABLE IF NOT EXISTS practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  bio TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city VARCHAR(255) DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone VARCHAR(50) DEFAULT '',
  email VARCHAR(255) DEFAULT '',
  website VARCHAR(255) DEFAULT '',
  languages TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER,
  tags TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT DEFAULT '',
  opening_hours JSONB NOT NULL DEFAULT '{}',
  plan VARCHAR(20) NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'premium')),
  is_subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_expires_at TIMESTAMPTZ,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_practitioners_listing
  ON practitioners(is_subscribed, subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_practitioners_plan ON practitioners(plan);
CREATE INDEX IF NOT EXISTS idx_practitioners_user ON practitioners(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Sleep Stories: static content now (see lib/sleep-stories/stories.ts) --
-- titles, transcripts, and audio paths live in the repo, not the database,
-- so there's no publish workflow and no publish-flag/language-filter chain
-- to get out of sync. Only play history remains dynamic, keyed by the
-- story's slug (plain text) instead of a foreign key into a stories table.
-- ─────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS sleep_story_recommendations CASCADE;
DROP TABLE IF EXISTS sleep_stories CASCADE;

CREATE TABLE IF NOT EXISTS sleep_story_plays (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id       TEXT NOT NULL,
  patient_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  played_at      TIMESTAMPTZ DEFAULT NOW(),
  completed      BOOLEAN DEFAULT false,
  timer_minutes  INTEGER
);
-- Migrate an existing UUID story_id column (from the old sleep_stories FK) to
-- plain text holding the slug -- old rows keep their stringified UUID, which
-- no longer resolves to anything, but the play-history rows themselves stay.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sleep_story_plays' AND column_name = 'story_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE sleep_story_plays ALTER COLUMN story_id TYPE TEXT USING story_id::text;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_sleep_story_plays_patient ON sleep_story_plays(patient_id);
CREATE INDEX IF NOT EXISTS idx_sleep_story_plays_story ON sleep_story_plays(story_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Printable clinical consultation LETTERS (letterhead documents).
-- Distinct from `consultation_reports` above (the AI-narrative summary): this
-- is a point-in-time, letterhead PDF-ready document. `practitioner_profiles`
-- holds the private letterhead identity for a logged-in practitioner USER —
-- separate from the public B2B `practitioners` directory listing, which not
-- every practitioner user has. Empty fields are simply omitted from the
-- letterhead, so all are nullable.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS practitioner_profiles (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name          TEXT,
  specialty          TEXT,
  cabinet_name       TEXT,
  license_number     TEXT,
  address            TEXT,
  phone              TEXT,
  email              TEXT,
  report_footer_note TEXT,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_practitioner_profiles_user ON practitioner_profiles(user_id);

-- Backfill: every existing practitioner USER gets a profile row (defaulting
-- name/email from their account) so the settings page never queries a missing
-- record. Idempotent via NOT EXISTS.
-- NOTE ON ACCESS CONTROL: this stack has no Supabase/RLS — a single application
-- DB role serves all requests and there is no auth.uid() to key a policy on.
-- "A practitioner reads/updates only their own row" is enforced in application
-- code: every query in the profile API and settings page is scoped to the
-- session user's id. Adding Postgres RLS here would be a non-functional no-op.
INSERT INTO practitioner_profiles (user_id, full_name, email)
SELECT u.id, u.name, u.email
FROM users u
WHERE u.role = 'practitioner'
  AND NOT EXISTS (SELECT 1 FROM practitioner_profiles p WHERE p.user_id = u.id);

-- A generated clinical letter. `snapshot` is the full ConsultationReport object
-- at issue time: regenerating/reopening reproduces the SAME figures, never a
-- recomputation against changed data. `language` fixes date/label rendering to
-- the language the report was issued in. Authorization is enforced in-app
-- (practitioner owns the patient link); patients never reach these rows.
CREATE TABLE IF NOT EXISTS clinical_letter_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT UNIQUE NOT NULL,
  practitioner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sequence        INTEGER NOT NULL,
  period_from     DATE NOT NULL,
  period_to       DATE NOT NULL,
  language        TEXT NOT NULL DEFAULT 'fr',
  snapshot        JSONB NOT NULL,
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clinical_letters_practitioner ON clinical_letter_reports(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_clinical_letters_patient ON clinical_letter_reports(patient_id);
-- Per-practitioner sequence is unique, so the reference counter never collides.
CREATE UNIQUE INDEX IF NOT EXISTS idx_clinical_letters_seq
  ON clinical_letter_reports(practitioner_id, sequence);

-- Report format: 'clinical' (letterhead + indicator table + signature, for the
-- file/insurance/colleagues) or 'narrative' (warm prose sections, for the
-- patient or session notes). A generated report is a permanent document —
-- format is fixed at generation and stored both as this column (for listing/
-- filtering) and inside `snapshot` itself (so reopening is self-describing).
ALTER TABLE clinical_letter_reports
  ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'clinical' CHECK (format IN ('clinical', 'narrative'));

-- ─────────────────────────────────────────────────────────────────────────
-- Clinical-depth fields: diagnosis on the patient link record, and an
-- ongoing-treatments table. Free text (no controlled vocabulary) — the
-- practitioner records whatever coding system they use. `diagnosis_updated_at`
-- is set by the application whenever code/label change, not by a trigger, so
-- it always reflects the practitioner's own edit, not incidental row writes.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE patients ADD COLUMN IF NOT EXISTS diagnosis_code TEXT NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS diagnosis_label TEXT NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS diagnosis_updated_at TIMESTAMPTZ NULL;

-- `patient_id` references users(id), matching journal_entries/alerts/etc. —
-- "patientId" throughout the app means the patient's users.id, not patients.id.
CREATE TABLE IF NOT EXISTS patient_treatments (
  id              SERIAL PRIMARY KEY,
  patient_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage          TEXT NULL,
  frequency       TEXT NULL,
  start_date      DATE NULL,
  end_date        DATE NULL,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'stopped')),
  notes           TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_patient_treatments_patient ON patient_treatments(patient_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Comparaison mode and risk assessment, mirrored as top-level columns
-- alongside `snapshot` so plain SQL can query them (e.g. counting
-- significant-risk reports) without JSON parsing. The snapshot remains the
-- frozen source of truth for reopening a report — these columns are a query
-- convenience, not a replacement.
--
-- NOTE: there is no separate `narrative_reports` table in this schema —
-- narrative-format reports are rows in `clinical_letter_reports` with
-- format = 'narrative'. `comparison_mode` is simply NULL for those rows,
-- since narrative reports have no indicator table and never offer that
-- selector.
--
-- Order matters: add columns first (no constraint), backfill from the
-- existing snapshot JSONB, rewrite the pre-rename 'high' value to
-- 'significant', THEN add the CHECK constraints — so the constraint is
-- never evaluated against not-yet-backfilled or not-yet-renamed data.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE clinical_letter_reports
  ADD COLUMN IF NOT EXISTS comparison_mode TEXT,
  ADD COLUMN IF NOT EXISTS risk_level TEXT,
  ADD COLUMN IF NOT EXISTS risk_detail TEXT;

UPDATE clinical_letter_reports
SET risk_level = snapshot->'riskAssessment'->>'level',
    risk_detail = snapshot->'riskAssessment'->>'detail',
    comparison_mode = snapshot->>'comparisonMode'
WHERE risk_level IS NULL;

UPDATE clinical_letter_reports
SET risk_level = 'significant'
WHERE risk_level = 'high';

DO $$
BEGIN
  ALTER TABLE clinical_letter_reports
    ADD CONSTRAINT clinical_letter_reports_risk_level_valid
    CHECK (risk_level IS NULL OR risk_level IN ('none', 'watch', 'significant'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE clinical_letter_reports
    ADD CONSTRAINT clinical_letter_reports_risk_detail_required
    CHECK (risk_level IS NULL
           OR risk_level = 'none'
           OR (risk_detail IS NOT NULL AND length(trim(risk_detail)) > 0));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE clinical_letter_reports
    ADD CONSTRAINT clinical_letter_reports_comparison_mode_valid
    CHECK (comparison_mode IS NULL OR comparison_mode IN ('withinWindow', 'previousPeriod', 'inclusion'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
