CREATE TABLE IF NOT EXISTS enquiry_rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  window_started INTEGER NOT NULL,
  count INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS enquiry_rate_limits_window_idx ON enquiry_rate_limits(window_started);
