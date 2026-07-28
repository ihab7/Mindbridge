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
