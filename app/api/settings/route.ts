import { NextResponse } from "next/server";
import { z } from "zod";
import { getSiteSettings, updateSiteSettings } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";

const updateSchema = z.object({
  artist_name: z.string().min(1).optional(),
  tagline: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const data = updateSchema.parse(body);
    const settings = await updateSiteSettings(data);
    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
