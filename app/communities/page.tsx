import type { Metadata } from "next";
import Link from "next/link";
import { FaPlus } from "react-icons/fa6";
import { SiteHeader } from "@/app/components/site-header";
import { listCommunities } from "@/app/lib/db/communities";
import { getMemberCommunitySlugs } from "@/app/lib/db/memberships";
import { getSessionUser } from "@/app/lib/auth/session";

export const metadata: Metadata = {
  title: "انجمن‌ها | هم‌اندیش",
  description: "همه انجمن‌های تخصصی هم‌اندیش را ببین و عضو شو.",
};

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

export default async function CommunitiesPage() {
  const [user, communities] = await Promise.all([
    getSessionUser(),
    listCommunities().catch(() => []),
  ]);

  const joinedSlugs = user
    ? await getMemberCommunitySlugs(user.id).catch(() => [] as string[])
    : [];
  const joinedSet = new Set(joinedSlugs);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">انجمن‌ها</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {toPersian(communities.length)} انجمن تخصصی
            </p>
          </div>
          {user && (
            <Link
              href="/communities/create"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <FaPlus className="size-3.5" />
              ساخت انجمن
            </Link>
          )}
        </div>

        {communities.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-zinc-700">
              هنوز انجمنی ساخته نشده
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              اولین نفر باش که یک انجمن تخصصی می‌سازی!
            </p>
            <Link
              href={user ? "/communities/create" : "/login"}
              className="mt-5 inline-flex rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              {user ? "ساخت اولین انجمن" : "ورود برای ساخت انجمن"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {communities.map((community) => {
              const isJoined = joinedSet.has(community.slug);
              return (
                <Link
                  key={community.slug}
                  href={`/communities/${community.slug}`}
                  className="block rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-bold text-zinc-900">
                        {community.name}
                      </h2>
                      {isJoined && (
                        <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                          عضو
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                      {community.description}
                    </p>
                    <p className="mt-2 text-xs text-zinc-400">
                      {toPersian(community.memberCount)} عضو
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!user && communities.length > 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center">
            <p className="text-sm text-zinc-600">
              برای عضویت در انجمن‌ها و ارسال پست ابتدا وارد حساب کاربری شو.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
              >
                ورود
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                ثبت نام
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
