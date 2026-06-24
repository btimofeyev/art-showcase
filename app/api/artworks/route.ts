import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createArtwork,
  getAllArtworks,
  getPublishedArtworks,
} from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  year: z.number().int().min(1000).max(9999).nullable().optional(),
  blob_url: z.string().url(),
  blob_pathname: z.string().min(1),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      await requireAdminSession();
      const artworks = await getAllArtworks();
      return NextResponse.json(artworks);
    }

    const artworks = await getPublishedArtworks();
    return NextResponse.json(artworks);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch artworks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const data = createSchema.parse(body);
    const artwork = await createArtwork(data);
    return NextResponse.json(artwork, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create artwork" }, { status: 500 });
  }
}
