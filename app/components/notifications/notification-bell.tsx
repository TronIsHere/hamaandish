"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaRegBell } from "react-icons/fa6";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      try {
        const res = await fetch("/api/notifications", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as { unreadCount?: number };
        if (!cancelled) setUnread(data.unreadCount ?? 0);
      } catch {
        // silently ignore network errors
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `${unread} اعلان خوانده‌نشده` : "اعلان‌ها"}
      className="relative flex items-center justify-center rounded-full p-2 text-orange-500 transition hover:bg-orange-50"
    >
      <FaRegBell className="size-5" />
      {unread > 0 && (
        <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500 ring-2 ring-white" />
      )}
    </Link>
  );
}
