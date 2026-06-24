import { NextResponse } from "next/server";
import { getPublishedArtworkById } from "@/lib/db";
import { toggleArtworkHeart } from "@/lib/feedback";
import { attachVisitorCookie, resolveVisitorKey } from "@/lib/visitor";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const artwork = await getPublishedArtworkById(id);

    if (!artwork) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { visitorKey, needsCookie } = await resolveVisitorKey();
    const result = await toggleArtworkHeart(id, visitorKey);
    const response = NextResponse.json(result);

    if (needsCookie) {
      attachVisitorCookie(response, visitorKey);
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to update heart" }, { status: 500 });
  }
}
