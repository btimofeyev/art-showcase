export type Artwork = {
  id: string;
  title: string;
  description: string | null;
  medium: string | null;
  year: number | null;
  blob_url: string;
  blob_pathname: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  published: boolean;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  artist_name: string;
  tagline: string | null;
  bio: string | null;
};

export type SessionData = {
  isLoggedIn: boolean;
};

export type ArtworkComment = {
  id: string;
  artwork_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type ArtworkFeedback = {
  heart_count: number;
  has_hearted: boolean;
  comments: ArtworkComment[];
};

export type ArtworkHeartCounts = Record<string, number>;
