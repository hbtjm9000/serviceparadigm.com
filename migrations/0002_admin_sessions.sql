-- Admin sessions for /internala auth (password + PIN two-factor)
-- Sessions are created on successful login, deleted on logout or expiry.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  last_used_at TEXT
);

CREATE INDEX idx_admin_session_id ON admin_sessions(session_id);
CREATE INDEX idx_admin_expires ON admin_sessions(expires_at);
