"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMMENT_DELETED_BY_ADMIN_PLACEHOLDER } from "@/app/lib/comment-display";
import { AdminSoftDeleteCommentButton } from "@/app/components/admin/delete-comment-button";

type ApiComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  parentId?: string | null;
  deletedByAdmin?: boolean;
};

/** Expandable moderator list under a feed card (lazy-load). */
export function AdminFeedCommentsPanel({ postId }: { postId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<ApiComment[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function load() {
    setFetchError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = (await res.json()) as {
        ok?: boolean;
        comments?: ApiComment[];
        error?: string;
      };
      if (!res.ok || !data.comments) {
        setFetchError(data.error ?? "بارگذاری نشد.");
        return;
      }
      setComments(
        [...data.comments].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
      );
    } catch {
      setFetchError("ارتباط برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next && comments === null && !loading) void load();
      return next;
    });
  }

  function markModerated(commentId: string) {
    setComments((rows) =>
      rows
        ? rows.map((r) =>
            r.id === commentId
              ? { ...r, deletedByAdmin: true, body: "" }
              : r,
          )
        : rows,
    );
  }

  return (
    <div className="mt-2 border-t border-dashed border-zinc-200 pt-2">
      <button
        type="button"
        onClick={toggle}
        className="text-xs font-semibold text-orange-700 hover:text-orange-800"
      >
        {open ? "▼ بستن دیدگاه‌ها (مدیر)" : "▸ مدیریت دیدگاه‌ها"}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-lg bg-zinc-50 p-3 ring-1 ring-zinc-200">
          {fetchError && (
            <p className="text-xs text-red-600" role="alert">
              {fetchError}
            </p>
          )}
          {loading && (
            <p className="text-xs text-zinc-500">در حال بارگذاری دیدگاه‌ها…</p>
          )}
          {!loading && comments && comments.length === 0 && (
            <p className="text-xs text-zinc-500">هنوز دیدگاهی نیست.</p>
          )}
          {!loading &&
            comments?.map((c) => (
              <div
                key={c.id}
                className="flex gap-2 rounded-md border border-zinc-100 bg-white p-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-800">{c.authorName}</p>
                  <p
                    className={`mt-0.5 break-words text-zinc-600 ${c.deletedByAdmin ? "italic text-zinc-400" : ""}`}
                  >
                    {c.deletedByAdmin
                      ? COMMENT_DELETED_BY_ADMIN_PLACEHOLDER
                      : (c.body || "").slice(0, 280) +
                        ((c.body || "").length > 280 ? "…" : "")}
                  </p>
                </div>
                <AdminSoftDeleteCommentButton
                  commentId={c.id}
                  deleted={c.deletedByAdmin === true}
                  onModerated={() => {
                    markModerated(c.id);
                    router.refresh();
                  }}
                  compact
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
