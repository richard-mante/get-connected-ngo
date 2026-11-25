CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded', 'archived')),
  internal_note TEXT,
  ip_hash TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS enquiries_status_created_idx ON enquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_created_idx ON enquiries(created_at DESC);
