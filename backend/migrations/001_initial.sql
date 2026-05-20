-- Migration 001: initial schema

CREATE TABLE IF NOT EXISTS migrations (
  id         SERIAL PRIMARY KEY,
  filename   TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'member',  -- staff | partner | member
  initials      TEXT NOT NULL DEFAULT 'U',
  color         TEXT NOT NULL DEFAULT '#7D00B9',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  icon       TEXT NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS threads (
  id            SERIAL PRIMARY KEY,
  category_slug TEXT        NOT NULL REFERENCES categories(slug),
  title         TEXT        NOT NULL,
  body          TEXT        NOT NULL,
  author_id     INT         NOT NULL REFERENCES users(id),
  pinned        BOOLEAN     NOT NULL DEFAULT false,
  reply_count   INT         NOT NULL DEFAULT 0,
  view_count    INT         NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thread_tags (
  thread_id INT  NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  tag       TEXT NOT NULL,
  PRIMARY KEY (thread_id, tag)
);

CREATE TABLE IF NOT EXISTS replies (
  id         SERIAL PRIMARY KEY,
  thread_id  INT         NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id  INT         NOT NULL REFERENCES users(id),
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reservations (
  id            TEXT PRIMARY KEY,                -- RES-XXXX
  user_id       INT  REFERENCES users(id),
  state         TEXT        NOT NULL DEFAULT 'queued',
  current_stage INT         NOT NULL DEFAULT 0,  -- 0-4 boot stages
  expires_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_threads_category  ON threads(category_slug);
CREATE INDEX IF NOT EXISTS idx_threads_pinned    ON threads(pinned DESC, last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_replies_thread    ON replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
