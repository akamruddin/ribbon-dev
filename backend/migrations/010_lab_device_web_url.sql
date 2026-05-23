-- Migration 010: add web_url to lab_devices
-- Stores the browser-accessible UI URL for devices that expose one (e.g. Muse).
-- SSH host is still used for config reset; web_url is displayed in the session
-- credentials panel so engineers can click straight into the Muse UI.

ALTER TABLE lab_devices
  ADD COLUMN IF NOT EXISTS web_url TEXT;   -- NULL for CLI-only devices (Neptune / Apollo)

-- Wire up the live Muse instance
UPDATE lab_devices
SET
  host    = 'muse.ipo-strike-muse-001.lab.rbbn.com',
  web_url = 'https://muse.ipo-strike-muse-001.lab.rbbn.com/'
WHERE device_key = 'muse';
