"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminApproveButtons({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setError(null);
    setPending("approve");
    try {
      const res = await fetch(`/api/admin/registrations/${userId}/approve`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "تأیید انجام نشد.");
        return;
      }
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setPending(null);
    }
  }

  async function reject() {
    const ok = window.confirm(
      "این ثبت‌نام رد شود؟ حساب حذف می‌شود و فرد می‌تواند دوباره درخواست بدهد.",
    );
    if (!ok) return;

    setError(null);
    setPending("reject");
    try {
      const res = await fetch(`/api/admin/registrations/${userId}/reject`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "رد درخواست انجام نشد.");
        return;
      }
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setPending(null);
    }
  }

  const busy = pending !== null;

  return (
    <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={reject}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-60"
        >
          {pending === "reject" ? "…" : "رد درخواست"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={approve}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {pending === "approve" ? "…" : "پذیرش و عضویت"}
        </button>
      </div>
    </div>
  );
}
