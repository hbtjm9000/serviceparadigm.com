-- Write-first transaction log
-- Every API call is INSERTed before execution, UPDATEd after.
-- Failed or in-flight transactions are discoverable and replayable.

CREATE TABLE IF NOT EXISTS transaction_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  request_body TEXT,
  request_headers TEXT,
  cf_country TEXT,
  cf_ip TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending', 'success', 'failed')),
  response_body TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX idx_tlog_status ON transaction_log(status);
CREATE INDEX idx_tlog_endpoint ON transaction_log(endpoint);
CREATE INDEX idx_tlog_created ON transaction_log(created_at);
CREATE INDEX idx_tlog_request_id ON transaction_log(request_id);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'newsletter',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK(status IN ('active', 'unsubscribed', 'bounced')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sub_email ON subscribers(email);
CREATE INDEX idx_sub_status ON subscribers(status);

-- Orders (in-flight and completed)
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_ref TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  items TEXT NOT NULL,  -- JSON array
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_url TEXT,
  payment_ref TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_ord_ref ON orders(order_ref);
CREATE INDEX idx_ord_email ON orders(customer_email);
CREATE INDEX idx_ord_status ON orders(status);
