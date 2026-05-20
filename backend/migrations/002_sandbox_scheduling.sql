-- Migration 002: sandbox environment pool + scheduling

CREATE TABLE IF NOT EXISTS sandbox_environments (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'available',  -- available | maintenance | decommissioned
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the initial 5-environment pool
INSERT INTO sandbox_environments (name)
VALUES ('ENV-001'), ('ENV-002'), ('ENV-003'), ('ENV-004'), ('ENV-005')
ON CONFLICT (name) DO NOTHING;

-- Add scheduling columns to reservations
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS environment_id  INT REFERENCES sandbox_environments(id),
  ADD COLUMN IF NOT EXISTS start_time      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS extension_count INT NOT NULL DEFAULT 0;

-- Fast overlap/availability queries
CREATE INDEX IF NOT EXISTS idx_reservations_env_time
  ON reservations(environment_id, start_time, end_time)
  WHERE state NOT IN ('cancelled', 'destroyed');
