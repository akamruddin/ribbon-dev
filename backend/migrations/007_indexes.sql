-- Performance indexes for common query patterns

-- reservations: availability and admin queries filter/join on these columns
CREATE INDEX IF NOT EXISTS idx_reservations_user_id        ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_state          ON reservations(state);
CREATE INDEX IF NOT EXISTS idx_reservations_start_time     ON reservations(start_time);
CREATE INDEX IF NOT EXISTS idx_reservations_end_time       ON reservations(end_time);
CREATE INDEX IF NOT EXISTS idx_reservations_reminder       ON reservations(reminder_sent, end_time)
  WHERE state NOT IN ('cancelled','destroyed','completed');

-- threads: forum listing filters by category and orders by activity
CREATE INDEX IF NOT EXISTS idx_threads_author_id           ON threads(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_at          ON threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_last_activity       ON threads(last_activity DESC);

-- replies: admin engagement queries join on author_id, order by created_at
CREATE INDEX IF NOT EXISTS idx_replies_author_id           ON replies(author_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at          ON replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_thread_id           ON replies(thread_id);
