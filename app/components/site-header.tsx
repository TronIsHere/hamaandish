import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import { logout } from "@/app/actions/auth";
import { getSessionUser } from "@/app/lib/auth/session";
import { NotificationBell } from "@/app/components/notifications/notification-bell";

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold text-orange-500">
          هم‌اندیش
        </Link>
        <div className="min-w-0 flex-1">
          <input
            type="search"
            placeholder="جستجو در پست‌ها، انجمن‌ها و کاربران..."
            className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <Link
                href="/communities/create"
                className="hidden items-center gap-1.5 rounded-full bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 sm:inline-flex"
              >
                <FaPlus className="size-3" />
                انجمن
              </Link>
              <NotificationBell />
              <span className="hidden max-w-40 truncate text-sm font-medium text-zinc-800 sm:inline">
                {user.name}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
                >
                  خروج
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 sm:inline-flex"
              >
                ورود
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                ثبت نام
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
