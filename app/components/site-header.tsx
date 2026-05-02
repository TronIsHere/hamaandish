import Link from "next/link";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import { logout } from "@/app/actions/auth";
import { isAdminEmail } from "@/app/lib/auth/admin";
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
        <div className="flex min-w-0 flex-1 justify-end sm:justify-start">
          {user && (
            <Link
              href="/search"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 transition hover:border-zinc-300 hover:bg-white hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:size-auto sm:gap-2 sm:px-4 sm:py-2"
              aria-label="باز کردن صفحه جستجو"
            >
              <FaMagnifyingGlass className="size-4" aria-hidden />
              <span className="hidden text-sm font-medium sm:inline">جستجو</span>
            </Link>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              {isAdminEmail(user.email) && (
                <Link
                  href="/admin"
                  className="inline-flex max-w-30 truncate rounded-full border border-orange-200 bg-orange-50 px-2.5 py-2 text-[11px] font-semibold text-orange-800 transition hover:bg-orange-100 sm:max-w-none sm:px-3 sm:text-xs"
                  title="پنل سوپراَدمین"
                >
                  پنل مدیر
                </Link>
              )}
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
