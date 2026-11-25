-- Media is private by default. Only explicitly published assets are served publicly.
ALTER TABLE media ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';
CREATE INDEX IF NOT EXISTS media_visibility_created_at_idx ON media(visibility, created_at DESC);