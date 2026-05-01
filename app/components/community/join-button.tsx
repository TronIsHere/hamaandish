"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string;
  initialJoined: boolean;
  isOwner: boolean;
};

export function JoinButton({ slug, initialJoined, isOwner }: Props) {
  const router = useRouter();
  const [joined, setJoined] = useState(initialJoined);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      const method = joined ? "DELETE" : "POST";
      const res = await fetch(`/api/communities/${slug}/join`, { method });
      if (res.ok) {
        setJoined(!joined);
        router.refresh();
      } else if (res.status === 401) {
        router.push("/login");
      }
    } finally {
      setPending(false);
    }
  }

  if (isOwner) {
    return (
      <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
        سازنده انجمن 👑
      </span>
    );
  }

  if (joined) {
    return (
      <button
        onClick={toggle}
        disabled={pending}
        className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/30 disabled:opacity-60"
      >
        {pending ? "…" : "عضو انجمن هستی ✓"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-60"
    >
      {pending ? "…" : "عضویت در انجمن"}
    </button>
  );
}
