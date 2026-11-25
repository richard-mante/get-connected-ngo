-- Extend the media record for reusable, accessible gallery assets.
ALTER TABLE media ADD COLUMN caption TEXT;
ALTER TABLE media ADD COLUMN width INTEGER;
ALTER TABLE media ADD COLUMN height INTEGER;
ALTER TABLE media ADD COLUMN updated_at INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS media_created_at_idx ON media(created_at DESC);