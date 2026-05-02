import Link from "next/link";
import { redirect } from "next/navigation";
import { FaChevronRight } from "react-icons/fa6";
import { isAdminEmail } from "@/app/lib/auth/admin";
import { getSessionUser } from "@/app/lib/auth/session";
import { SiteHeader } from "@/app/components/site-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login?next=/admin");
  }
  if (!isAdminEmail(session.email)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 text-xs font-medium text-zinc-600">
          <Link
            href="/admin"
            className="rounded-lg px-2 py-1 font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            پنل سوپراَدمین
          </Link>
          <FaChevronRight className="size-3 text-zinc-300" aria-hidden />
          <span className="text-zinc-400">
            نقش مدیر؛ ایمیل‌ها در ADMIN_EMAILS
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
