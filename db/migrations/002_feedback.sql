-- Feedback: hearts and comments (run on existing databases)
CREATE TABLE IF NOT EXISTS artwork_hearts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  visitor_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (artwork_id, visitor_key)
);

CREATE TABLE IF NOT EXISTS artwork_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS artwork_hearts_artwork_id_idx ON artwork_hearts (artwork_id);
CREATE INDEX IF NOT EXISTS artwork_comments_artwork_id_idx ON artwork_comments (artwork_id);
