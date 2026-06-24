"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminComment = {
  id: string;
  artwork_id: string;
  author_name: string;
  body: string;
  created_at: string;
  artwork_title: string;
};

type AdminCommentsPanelProps = {
  comments: AdminComment[];
};

export function AdminCommentsPanel({ comments: initial }: AdminCommentsPanelProps) {
  const router = useRouter();
  const [comments, setComments] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function removeComment(comment: AdminComment) {
    if (!confirm("Delete this comment?")) return;

    setLoadingId(comment.id);
    const response = await fetch(
      `/api/artworks/${comment.artwork_id}/comments/${comment.id}`,
      { method: "DELETE" },
    );

    if (response.ok) {
      setComments((items) => items.filter((item) => item.id !== comment.id));
      router.refresh();
    }
    setLoadingId(null);
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="text-base font-medium text-stone-900">Recent comments</h2>
        <p className="mt-2 text-sm text-stone-600">No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <h2 className="text-base font-medium text-stone-900">Recent comments</h2>
      <ul className="mt-4 space-y-3">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="border border-stone-200 p-3 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-stone-900">{comment.author_name}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  on {comment.artwork_title}
                </p>
              </div>
              <button
                type="button"
                disabled={loadingId === comment.id}
                onClick={() => removeComment(comment)}
                className="shrink-0 text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 leading-relaxed text-stone-700">{comment.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
