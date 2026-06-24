import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteArtwork,
  getPublishedArtworkById,
  moveArtwork,
  updateArtwork,
} from "@/lib/db";
import { deleteArtworkImage } from "@/lib/blob";
import { requireAdminSession } from "@/lib/auth";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  year: z.number().int().min(1000).max(9999).nullable().optional(),
  published: z.boolean().optional(),
  move: z.enum(["up", "down"]).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const artwork = await getPublishedArtworkById(id);

    if (!artwork) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(artwork);
  } catch {
    return NextResponse.json({ error: "Failed to fetch artwork" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    if (data.move) {
      const artworks = await moveArtwork(id, data.move);
      return NextResponse.json(artworks);
    }

    const updates = {
      title: data.title,
      description: data.description,
      medium: data.medium,
      year: data.year,
      published: data.published,
    };
    const artwork = await updateArtwork(id, updates);

    if (!artwork) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(artwork);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update artwork" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const artwork = await deleteArtwork(id);

    if (!artwork) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteArtworkImage(artwork.blob_url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete artwork" }, { status: 500 });
  }
}
