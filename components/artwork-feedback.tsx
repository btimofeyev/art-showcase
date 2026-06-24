"use client";

import { useState } from "react";
import type { ArtworkComment, ArtworkFeedback } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ArtworkFeedbackPanelProps = {
  artworkId: string;
  artistName: string;
  initialFeedback: ArtworkFeedback;
};

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ArtworkFeedbackPanel({
  artworkId,
  artistName,
  initialFeedback,
}: ArtworkFeedbackPanelProps) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [heartLoading, setHeartLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [authorName, setAuthorName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("art-showcase-comment-name") ?? "";
  });
  const [commentBody, setCommentBody] = useState("");
  const [error, setError] = useState("");

  async function toggleHeart() {
    setHeartLoading(true);
    setError("");

    const response = await fetch(`/api/artworks/${artworkId}/heart`, {
      method: "POST",
    });

    if (!response.ok) {
      setError("Could not update heart");
      setHeartLoading(false);
      return;
    }

    const data = await response.json();
    setFeedback((current) => ({
      ...current,
      heart_count: data.heart_count,
      has_hearted: data.has_hearted,
    }));
    setHeartLoading(false);
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault();
    setCommentLoading(true);
    setError("");

    const response = await fetch(`/api/artworks/${artworkId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        author_name: authorName,
        body: commentBody,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Could not post comment");
      setCommentLoading(false);
      return;
    }

    const comment: ArtworkComment = await response.json();
    localStorage.setItem("art-showcase-comment-name", authorName.trim());
    setFeedback((current) => ({
      ...current,
      comments: [...current.comments, comment],
    }));
    setCommentBody("");
    setCommentLoading(false);
  }

  return (
    <section className="mt-10 border-t border-line pt-8">
      <span className="label-caps text-muted">Feedback</span>
      <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">
        Show {artistName} some love
      </h2>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={toggleHeart}
          disabled={heartLoading}
          aria-pressed={feedback.has_hearted}
          aria-label={
            feedback.has_hearted ? "Remove your heart" : "Leave a heart"
          }
          className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border px-4 text-sm font-medium transition-all disabled:opacity-50 ${
            feedback.has_hearted
              ? "border-accent bg-accent text-white"
              : "border-line bg-surface text-foreground hover:border-accent hover:text-accent"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill={feedback.has_hearted ? "currentColor" : "none"}
            aria-hidden
          >
            <path
              d="M9 15.35S2.25 10.88 2.25 6.75A3.56 3.56 0 0 1 9 4.88a3.56 3.56 0 0 1 6.75 1.87c0 4.13-6.75 8.6-6.75 8.6Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {feedback.heart_count > 0 && (
            <span>{feedback.heart_count}</span>
          )}
        </button>
        <p className="text-sm text-muted">
          {feedback.heart_count === 0
            ? "Be the first to leave a heart"
            : feedback.heart_count === 1
              ? "1 person loves this"
              : `${feedback.heart_count} people love this piece`}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground">Comments</h3>

        {feedback.comments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No comments yet. Be the first to tell {artistName} what you think.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {feedback.comments.map((comment) => (
              <li
                key={comment.id}
                className="border-l-2 border-accent/40 pl-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {comment.author_name}
                  </span>
                  <time
                    className="shrink-0 text-xs text-muted"
                    dateTime={comment.created_at}
                  >
                    {formatRelativeTime(comment.created_at)}
                  </time>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submitComment} className="mt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="author_name" className="mb-1.5 block text-sm text-muted">
                Your name
              </label>
              <Input
                id="author_name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Alex"
                required
                maxLength={40}
              />
            </div>
          </div>
          <div>
            <label htmlFor="comment_body" className="mb-1.5 block text-sm text-muted">
              Comment
            </label>
            <Textarea
              id="comment_body"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="This is amazing — love the colors!"
              required
              maxLength={500}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={commentLoading}>
            {commentLoading ? "Posting..." : "Post comment"}
          </Button>
        </form>
      </div>
    </section>
  );
}
