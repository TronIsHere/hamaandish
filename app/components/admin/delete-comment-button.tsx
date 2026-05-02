"use client";

import { useCallback, useState } from "react";

export function AdminSoftDeleteCommentButton({
  commentId,
  deleted,
  onModerated,
  compact,
}: {
  commentId: string;
  deleted: boolean;
  onModerated: () => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async () => {
    const ok = window.confirm(
      "این دیدگاه به صورت حذف توسط مدیر علامت بخورد و متن پاک شود؟",
    );
    if (!ok) return;

    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "انجام نشد.");
        return;
      }
      onModerated();
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setBusy(false);
    }
  }, [commentId, onModerated]);

  if (deleted) return null;

  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      {error && (
        <span className="text-[10px] text-red-600" role="alert">
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
          compact
            ? "rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-800 hover:bg-red-100 disabled:opacity-60"
            : "rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
        }
      >
        {busy ? "…" : "حذف دیدگاه (مدیر)"}
      </button>
    </div>
  );
}
