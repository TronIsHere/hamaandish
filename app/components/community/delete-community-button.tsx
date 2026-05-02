"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string;
  communityName: string;
};

export function DeleteCommunityButton({ slug, communityName }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    const msg = `انجمن «${communityName}» و همه پست‌ها و نظرهایش برای همیشه حذف می‌شوند. ادامه می‌دهی؟`;
    if (!window.confirm(msg)) return;

    setPending(true);
    try {
      const res = await fetch(`/api/communities/${slug}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/communities");
        router.refresh();
        return;
      }
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      window.alert(data.error ?? "حذف انجمن انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
    >
      {pending ? "…" : "حذف انجمن"}
    </button>
  );
}
