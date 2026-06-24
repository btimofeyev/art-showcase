-- artworks: one row per piece
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  medium TEXT,
  year SMALLINT,
  blob_url TEXT NOT NULL,
  blob_pathname TEXT NOT NULL,
  width INT,
  height INT,
  sort_order INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- site_settings: single-row artist profile
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  artist_name TEXT NOT NULL DEFAULT 'Artist',
  tagline TEXT,
  bio TEXT
);

INSERT INTO site_settings (artist_name)
VALUES ('Artist')
ON CONFLICT (id) DO NOTHING;

-- hearts: one per visitor per artwork
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
