-- Migration 011: FreeRADIUS radcheck table
-- FreeRADIUS rlm_sql reads credentials from this table.
-- The lab orchestrator writes one row per active session (username + cleartext password)
-- and deletes it on teardown — instantly revoking access on all RADIUS-authenticated devices.

CREATE TABLE IF NOT EXISTS radcheck (
    id        SERIAL       PRIMARY KEY,
    username  VARCHAR(64)  NOT NULL DEFAULT '',
    attribute VARCHAR(64)  NOT NULL DEFAULT '',
    op        CHAR(2)      NOT NULL DEFAULT ':=',
    value     VARCHAR(253) NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS radcheck_username ON radcheck (username, attribute);
