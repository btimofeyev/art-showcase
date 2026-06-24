import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublishedArtworkById } from "@/lib/db";
import { addArtworkComment } from "@/lib/feedback";
import { attachVisitorCookie, resolveVisitorKey } from "@/lib/visitor";

const commentSchema = z.object({
  author_name: z.string().trim().min(1).max(40),
  body: z.string().trim().min(1).max(500),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const artwork = await getPublishedArtworkById(id);

    if (!artwork) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = commentSchema.parse(body);
    const { visitorKey, needsCookie } = await resolveVisitorKey();
    const comment = await addArtworkComment(id, data.author_name, data.body);
    const response = NextResponse.json(comment);

    if (needsCookie) {
      attachVisitorCookie(response, visitorKey);
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
