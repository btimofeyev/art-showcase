import { sql } from "@vercel/postgres";
import type { ArtworkComment, ArtworkFeedback } from "./types";

function mapComment(row: Record<string, unknown>): ArtworkComment {
  return {
    id: row.id as string,
    artwork_id: row.artwork_id as string,
    author_name: row.author_name as string,
    body: row.body as string,
    created_at: String(row.created_at),
  };
}

export async function getArtworkFeedback(
  artworkId: string,
  visitorKey: string | null,
): Promise<ArtworkFeedback> {
  const [heartRows, commentRows, hasHeartedRows] = await Promise.all([
    sql`
      SELECT COUNT(*)::int AS count FROM artwork_hearts WHERE artwork_id = ${artworkId}
    `,
    sql`
      SELECT * FROM artwork_comments
      WHERE artwork_id = ${artworkId}
      ORDER BY created_at ASC
    `,
    visitorKey
      ? sql`
          SELECT 1 FROM artwork_hearts
          WHERE artwork_id = ${artworkId} AND visitor_key = ${visitorKey}
          LIMIT 1
        `
      : Promise.resolve({ rows: [] }),
  ]);

  return {
    heart_count: Number(heartRows.rows[0]?.count ?? 0),
    has_hearted: hasHeartedRows.rows.length > 0,
    comments: commentRows.rows.map(mapComment),
  };
}

export async function getHeartCountsForArtworks(
  artworkIds: string[],
): Promise<Record<string, number>> {
  if (artworkIds.length === 0) return {};

  const { rows } = await sql.query<{
    artwork_id: string;
    count: number;
  }>(
    `SELECT artwork_id, COUNT(*)::int AS count
     FROM artwork_hearts
     WHERE artwork_id = ANY($1::uuid[])
     GROUP BY artwork_id`,
    [artworkIds],
  );

  const counts: Record<string, number> = {};
  for (const id of artworkIds) {
    counts[id] = 0;
  }
  for (const row of rows) {
    counts[row.artwork_id as string] = Number(row.count);
  }
  return counts;
}

export async function toggleArtworkHeart(
  artworkId: string,
  visitorKey: string,
): Promise<{ heart_count: number; has_hearted: boolean }> {
  const existing = await sql`
    SELECT id FROM artwork_hearts
    WHERE artwork_id = ${artworkId} AND visitor_key = ${visitorKey}
    LIMIT 1
  `;

  if (existing.rows[0]) {
    await sql`
      DELETE FROM artwork_hearts
      WHERE artwork_id = ${artworkId} AND visitor_key = ${visitorKey}
    `;
  } else {
    await sql`
      INSERT INTO artwork_hearts (artwork_id, visitor_key)
      VALUES (${artworkId}, ${visitorKey})
    `;
  }

  const feedback = await getArtworkFeedback(artworkId, visitorKey);
  return {
    heart_count: feedback.heart_count,
    has_hearted: feedback.has_hearted,
  };
}

export async function addArtworkComment(
  artworkId: string,
  authorName: string,
  body: string,
): Promise<ArtworkComment> {
  const { rows } = await sql`
    INSERT INTO artwork_comments (artwork_id, author_name, body)
    VALUES (${artworkId}, ${authorName}, ${body})
    RETURNING *
  `;
  return mapComment(rows[0]);
}

export async function deleteArtworkComment(
  commentId: string,
): Promise<ArtworkComment | null> {
  const { rows } = await sql`
    DELETE FROM artwork_comments WHERE id = ${commentId} RETURNING *
  `;
  return rows[0] ? mapComment(rows[0]) : null;
}

export async function getCommentsForArtworkAdmin(
  artworkId: string,
): Promise<ArtworkComment[]> {
  const { rows } = await sql`
    SELECT * FROM artwork_comments
    WHERE artwork_id = ${artworkId}
    ORDER BY created_at DESC
  `;
  return rows.map(mapComment);
}

export async function getRecentCommentsForAdmin(limit = 20) {
  const { rows } = await sql`
    SELECT
      c.id,
      c.artwork_id,
      c.author_name,
      c.body,
      c.created_at,
      a.title AS artwork_title
    FROM artwork_comments c
    JOIN artworks a ON a.id = c.artwork_id
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    ...mapComment(row),
    artwork_title: String(row.artwork_title),
  }));
}
