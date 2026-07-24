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
