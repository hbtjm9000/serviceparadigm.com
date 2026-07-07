-- Migration 0003: Appointment requests (gated booking)
CREATE TABLE IF NOT EXISTS appointment_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  interest TEXT DEFAULT '',
  source TEXT NOT NULL DEFAULT 'booking',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending', 'verified', 'completed', 'cancelled')),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referral_code TEXT,
  discount_code TEXT,
  page_url TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_appointment_requests_email ON appointment_requests(email);
CREATE INDEX idx_appointment_requests_status ON appointment_requests(status);
