import Link from "next/link";
import { FaArrowDown, FaArrowUp, FaCommentDots, FaFire, FaPlus } from "react-icons/fa6";
import { SiteHeader } from "./components/site-header";
import { listCommunities } from "./lib/db/communities";
import { getRecentPosts } from "./lib/db/posts";
import { getMemberCommunitySlugs } from "./lib/db/memberships";
import { getSessionUser } from "./lib/auth/session";
import { formatRelativeTime } from "./lib/utils";

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

export default async function Home() {
  const [user, communities, posts] = await Promise.all([
    getSessionUser(),
    listCommunities().catch(() => []),
    getRecentPosts().catch(() => []),
  ]);

  const joinedSlugs = user
    ? await getMemberCommunitySlugs(user.id).catch(() => [] as string[])
    : [];
  const joinedSet = new Set(joinedSlugs);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[240px_1fr_300px]">
        {/* Communities sidebar */}
        <aside className="order-2 lg:order-1 lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between px-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                انجمن‌ها
              </p>
              {user && (
                <Link
                  href="/communities/create"
                  className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-orange-600"
                >
                  <FaPlus className="size-2.5" />
                  ساخت
                </Link>
              )}
            </div>
            <nav className="mt-3 space-y-0.5">
              {communities.length === 0 ? (
                <p className="px-2 py-3 text-sm text-zinc-400">
                  هنوز انجمنی ساخته نشده.
                </p>
              ) : (
                communities.map((community) => (
                  <Link
                    key={community.slug}
                    href={`/communities/${community.slug}`}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 transition hover:bg-zinc-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-800">
                        {community.name}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {toPersian(community.memberCount)} عضو
                      </span>
                    </span>
                    {joinedSet.has(community.slug) && (
                      <span className="size-2 shrink-0 rounded-full bg-orange-400" />
                    )}
                  </Link>
                ))
              )}
            </nav>

            {!user && (
              <div className="mt-3 border-t border-zinc-100 pt-3">
                <Link
                  href="/communities/create"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 text-sm text-zinc-500 transition hover:border-orange-400 hover:text-orange-600"
                >
                  <FaPlus className="size-3" />
                  ساخت انجمن جدید
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Main feed */}
        <section className="order-1 space-y-3 lg:order-2">
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-base font-bold">آخرین پست‌ها</h1>
              <div className="flex items-center gap-1.5">
                <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white">
                  جدیدترین
                </button>
                <button className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-200">
                  <FaFire className="size-3 text-orange-500" />
                  داغ‌ترین
                </button>
              </div>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
              <p className="text-zinc-500">هنوز پستی منتشر نشده است.</p>
              {user && communities.length > 0 && (
                <Link
                  href={`/communities/${communities[0]!.slug}`}
                  className="mt-3 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  اولین پست را بگذار
                </Link>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                  <Link
                    href={`/communities/${post.communitySlug}`}
                    className="font-semibold text-zinc-700 hover:text-orange-600"
                  >
                    {post.communityName}
                  </Link>
                  <span className="text-zinc-300">·</span>
                  <span>{post.authorName}</span>
                  <span className="text-zinc-300">·</span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                </div>

                <Link href={`/posts/${post.id}`} className="block">
                  <h3 className="text-base font-bold leading-snug text-zinc-900 hover:text-orange-600">
                    {post.title}
                  </h3>
                </Link>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                  {post.body.replace(/<[^>]*>/g, " ").trim()}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium">
                    <FaArrowUp className="size-3" />
                    {toPersian(post.upvotes)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium">
                    <FaArrowDown className="size-3" />
                    {toPersian(post.downvotes)}
                  </span>
                  <Link
                    href={`/posts/${post.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-200"
                  >
                    <FaCommentDots className="size-3.5" />
                    {toPersian(post.commentsCount)}
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>

        {/* Right sidebar */}
        <aside className="order-3 space-y-3">
          {user ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-sm font-semibold text-zinc-800">
                سلام، {user.name} 👋
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                عضو {toPersian(joinedSlugs.length)} انجمن هستی.
              </p>
              <Link
                href="/communities/create"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                <FaPlus className="size-3.5" />
                ساخت انجمن جدید
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <div className="bg-linear-to-l from-orange-500 to-amber-400 px-4 py-5 text-white">
                <p className="text-base font-bold">به هم‌اندیش بپیوند</p>
                <p className="mt-1.5 text-sm leading-6 text-white/80">
                  انجمن بساز، پست بگذار و با دیگران گفت‌وگو کن.
                </p>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <Link
                  href="/register"
                  className="w-full rounded-full bg-orange-500 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  ثبت نام رایگان
                </Link>
                <Link
                  href="/login"
                  className="w-full rounded-full border border-zinc-300 py-2 text-center text-sm font-medium transition hover:bg-zinc-50"
                >
                  ورود به حساب
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-zinc-800">
              قوانین سریع انجمن
            </h2>
            <ul className="mt-2.5 space-y-2.5 text-sm text-zinc-600">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">۱.</span>
                محترمانه بحث کن و روی ایده نقد بده، نه شخص.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">۲.</span>
                اگر سوال فنی می‌پرسی، جزئیات کافی اضافه کن.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">۳.</span>
                برای معرفی محصول، نمونه یا اسکرین‌شات قرار بده.
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
