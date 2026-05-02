import { redirect } from "next/navigation";
import Link from "next/link";
import { FaCheck, FaComment, FaFire, FaRegBell, FaReply } from "react-icons/fa6";
import { getSessionUser } from "@/app/lib/auth/session";
import {
  getNotificationsForUser,
  markAllRead,
  type PublicNotification,
} from "@/app/lib/db/notifications";
import { SiteHeader } from "@/app/components/site-header";
import { formatRelativeTime } from "@/app/lib/utils";

export const dynamic = "force-dynamic";

function NotificationIcon({ type }: { type: PublicNotification["type"] }) {
  if (type === "reply_to_comment")
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <FaReply className="size-4" />
      </span>
    );
  if (type === "comment_on_post")
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <FaComment className="size-4" />
      </span>
    );
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500">
      <FaFire className="size-4" />
    </span>
  );
}

function notificationText(n: PublicNotification): string {
  if (n.type === "comment_on_post") {
    return `${n.actorName ?? "کسی"} روی پست شما دیدگاه گذاشت`;
  }
  if (n.type === "reply_to_comment") {
    return `${n.actorName ?? "کسی"} به دیدگاه شما پاسخ داد`;
  }
  // vote_milestone
  return `پست شما به ${n.milestone?.toLocaleString("fa-IR")} رأی مثبت رسید 🎉`;
}

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // Mark all as read server-side when the page loads
  await markAllRead(user.id);

  const notifications = await getNotificationsForUser(user.id);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <FaRegBell className="size-6 text-orange-500" />
          <h1 className="text-xl font-bold text-zinc-900">اعلان‌ها</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-zinc-400">
            <FaRegBell className="size-12 opacity-30" />
            <p className="text-sm">هنوز اعلانی نداری</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/posts/${n.postId}`}
                  className="flex items-start gap-3 px-4 py-4 transition hover:bg-zinc-50"
                >
                  <NotificationIcon type={n.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug text-zinc-800">
                      {notificationText(n)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {n.postTitle}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatRelativeTime(new Date(n.createdAt))}
                    </p>
                  </div>
                  <FaCheck className="mt-1 size-3 shrink-0 text-zinc-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
