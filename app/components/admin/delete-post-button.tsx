"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  postId: string;
  onDeleted?: () => void;
  className?: string;
  label?: string;
};

/** Calls DELETE /api/admin/posts/[postId]; admin session required. */
export function AdminDeletePostButton({
  postId,
  onDeleted,
  className,
  label = "حذف پست",
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    const ok = window.confirm(
      "این پست برای همیشه حذف شود؟ نظرها و رأی‌ها هم پاک می‌شوند.",
    );
    if (!ok) return;

    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "حذف انجام نشد.");
        return;
      }
      if (onDeleted) onDeleted();
      else router.refresh();
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex flex-col gap-1">
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void remove();
        }}
        className={
          className ??
          "rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
        }
      >
        {busy ? "…" : label}
      </button>
    </div>
  );
}
