import { NextResponse } from "next/server";
import { z } from "zod";
import { isAllowedImageType, uploadArtworkImage } from "@/lib/blob";
import { createArtwork } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import {
  getMaxInputBytes,
  processArtworkImage,
} from "@/lib/image-processing";

const metadataSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  year: z.coerce.number().int().min(1000).max(9999).nullable().optional(),
  published: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!isAllowedImageType(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 },
      );
    }

    if (file.size > getMaxInputBytes()) {
      return NextResponse.json(
        { error: "Image must be 25MB or smaller" },
        { status: 400 },
      );
    }

    const metadata = metadataSchema.parse({
      title: formData.get("title") || undefined,
      description: formData.get("description") || null,
      medium: formData.get("medium") || null,
      year: formData.get("year") || null,
      published: formData.get("published") || undefined,
    });

    const input = Buffer.from(await file.arrayBuffer());
    const processed = await processArtworkImage(input);
    const blob = await uploadArtworkImage(
      processed.buffer,
      file.name,
      processed.contentType,
    );

    const title =
      metadata.title ||
      file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

    const artwork = await createArtwork({
      title,
      description: metadata.description ?? null,
      medium: metadata.medium ?? null,
      year: metadata.year ?? null,
      blob_url: blob.url,
      blob_pathname: blob.pathname,
      width: processed.width,
      height: processed.height,
      published: metadata.published ?? true,
    });

    return NextResponse.json(artwork, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes("25MB")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Upload failed:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
