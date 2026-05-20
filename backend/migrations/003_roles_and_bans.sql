-- Migration 003: moderator role + user ban support

ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- Promote akamruddin to moderator
UPDATE users SET role = 'moderator' WHERE email = 'akamruddin@rbbn.com';
