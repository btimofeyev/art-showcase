import { sql } from "@vercel/postgres";
import type { Artwork, SiteSettings } from "./types";
import { SITE } from "./site";

function mapArtwork(row: Record<string, unknown>): Artwork {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    medium: (row.medium as string | null) ?? null,
    year: row.year != null ? Number(row.year) : null,
    blob_url: row.blob_url as string,
    blob_pathname: row.blob_pathname as string,
    width: row.width != null ? Number(row.width) : null,
    height: row.height != null ? Number(row.height) : null,
    sort_order: Number(row.sort_order),
    published: Boolean(row.published),
    created_at: String(row.created_at),
  };
}

export async function getPublishedArtworks(): Promise<Artwork[]> {
  const { rows } = await sql`
    SELECT * FROM artworks
    WHERE published = true
    ORDER BY sort_order ASC, created_at DESC
  `;
  return rows.map(mapArtwork);
}

export async function getAllArtworks(): Promise<Artwork[]> {
  const { rows } = await sql`
    SELECT * FROM artworks
    ORDER BY sort_order ASC, created_at DESC
  `;
  return rows.map(mapArtwork);
}

export async function getArtworkById(id: string): Promise<Artwork | null> {
  const { rows } = await sql`
    SELECT * FROM artworks WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? mapArtwork(rows[0]) : null;
}

export async function getPublishedArtworkById(
  id: string,
): Promise<Artwork | null> {
  const { rows } = await sql`
    SELECT * FROM artworks
    WHERE id = ${id} AND published = true
    LIMIT 1
  `;
  return rows[0] ? mapArtwork(rows[0]) : null;
}

export async function getNextSortOrder(): Promise<number> {
  const { rows } = await sql`
    SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM artworks
  `;
  return Number(rows[0]?.next_order ?? 0);
}

export async function createArtwork(data: {
  title: string;
  description?: string | null;
  medium?: string | null;
  year?: number | null;
  blob_url: string;
  blob_pathname: string;
  width?: number | null;
  height?: number | null;
  published?: boolean;
}): Promise<Artwork> {
  const sortOrder = await getNextSortOrder();
  const { rows } = await sql`
    INSERT INTO artworks (
      title, description, medium, year,
      blob_url, blob_pathname, width, height,
      sort_order, published
    ) VALUES (
      ${data.title},
      ${data.description ?? null},
      ${data.medium ?? null},
      ${data.year ?? null},
      ${data.blob_url},
      ${data.blob_pathname},
      ${data.width ?? null},
      ${data.height ?? null},
      ${sortOrder},
      ${data.published ?? true}
    )
    RETURNING *
  `;
  return mapArtwork(rows[0]);
}

export async function updateArtwork(
  id: string,
  data: Partial<{
    title: string;
    description: string | null;
    medium: string | null;
    year: number | null;
    published: boolean;
    sort_order: number;
  }>,
): Promise<Artwork | null> {
  const existing = await getArtworkById(id);
  if (!existing) return null;

  const { rows } = await sql`
    UPDATE artworks SET
      title = ${data.title ?? existing.title},
      description = ${data.description !== undefined ? data.description : existing.description},
      medium = ${data.medium !== undefined ? data.medium : existing.medium},
      year = ${data.year !== undefined ? data.year : existing.year},
      published = ${data.published !== undefined ? data.published : existing.published},
      sort_order = ${data.sort_order !== undefined ? data.sort_order : existing.sort_order}
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapArtwork(rows[0]) : null;
}

export async function deleteArtwork(id: string): Promise<Artwork | null> {
  const existing = await getArtworkById(id);
  if (!existing) return null;

  await sql`DELETE FROM artworks WHERE id = ${id}`;
  return existing;
}

export async function moveArtwork(
  id: string,
  direction: "up" | "down",
): Promise<Artwork[]> {
  const artworks = await getAllArtworks();
  const index = artworks.findIndex((a) => a.id === id);
  if (index === -1) return artworks;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= artworks.length) return artworks;

  const current = artworks[index];
  const neighbor = artworks[swapIndex];

  await sql`
    UPDATE artworks SET sort_order = ${neighbor.sort_order} WHERE id = ${current.id}
  `;
  await sql`
    UPDATE artworks SET sort_order = ${current.sort_order} WHERE id = ${neighbor.id}
  `;

  return getAllArtworks();
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const { rows } = await sql`
    SELECT * FROM site_settings WHERE id = 1 LIMIT 1
  `;

  if (rows[0]) {
    return {
      id: Number(rows[0].id),
      artist_name: String(rows[0].artist_name),
      tagline: (rows[0].tagline as string | null) ?? null,
      bio: (rows[0].bio as string | null) ?? null,
    };
  }

  return {
    id: 1,
    artist_name: SITE.artistName,
    tagline: SITE.tagline,
    bio: SITE.bio,
  };
}

export async function updateSiteSettings(data: {
  artist_name?: string;
  tagline?: string | null;
  bio?: string | null;
}): Promise<SiteSettings> {
  const existing = await getSiteSettings();
  const { rows } = await sql`
    UPDATE site_settings SET
      artist_name = ${data.artist_name ?? existing.artist_name},
      tagline = ${data.tagline !== undefined ? data.tagline : existing.tagline},
      bio = ${data.bio !== undefined ? data.bio : existing.bio}
    WHERE id = 1
    RETURNING *
  `;

  return {
    id: Number(rows[0].id),
    artist_name: String(rows[0].artist_name),
    tagline: (rows[0].tagline as string | null) ?? null,
    bio: (rows[0].bio as string | null) ?? null,
  };
}
