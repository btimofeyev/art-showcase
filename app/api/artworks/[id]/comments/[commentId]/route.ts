import { NextResponse } from "next/server";
import { deleteArtworkComment } from "@/lib/feedback";
import { requireAdminSession } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string; commentId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { commentId } = await context.params;
    const comment = await deleteArtworkComment(commentId);

    if (!comment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
