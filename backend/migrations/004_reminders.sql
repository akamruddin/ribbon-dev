-- Migration 004: reminder tracking on reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;
