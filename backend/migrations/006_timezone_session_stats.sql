-- Migration 006: user timezone + session completion tracking

-- User preferred timezone (IANA name, e.g. 'America/New_York')
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

-- Actual end time (may differ from scheduled end_time when user ends early)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ;

-- Whether the post-session summary email has been sent
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS summary_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- 'completed' is a valid state for naturally-expired or user-ended sessions
-- (state column is free-text so no ALTER needed)
