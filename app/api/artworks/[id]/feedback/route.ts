import { NextResponse } from "next/server";
import { getPublishedArtworkById } from "@/lib/db";
import { getArtworkFeedback } from "@/lib/feedback";
import { getVisitorKey } from "@/lib/visitor";

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

    const visitorKey = await getVisitorKey();
    const feedback = await getArtworkFeedback(id, visitorKey);
    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json({ error: "Failed to load feedback" }, { status: 500 });
  }
}
