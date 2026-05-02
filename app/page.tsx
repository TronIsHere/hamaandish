import Link from "next/link";
import { FaFire, FaPlus, FaUsers } from "react-icons/fa6";
import { SiteHeader } from "./components/site-header";
import { HomePaginatedPostFeed } from "./components/post/paginated-post-feed";
import { listCommunities } from "./lib/db/communities";
import { FEED_PAGE_SIZE, getHomeFeedPostsPage } from "./lib/db/posts";
import { getMemberCommunitySlugs } from "./lib/db/memberships";
import { getSessionUser } from "./lib/auth/session";
import { isAdminEmail } from "./lib/auth/admin";

type HomeSearchParams = { feed?: string };

type PageProps = { searchParams?: Promise<HomeSearchParams> };

type HomeFeedTab = "new" | "hot" | "joined";

function parseHomeFeed(raw: string | undefined): HomeFeedTab {
  if (raw === "hot" || raw === "joined") return raw;
  return "new";
}

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

export default async function Home({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const feed = parseHomeFeed(
    typeof sp.feed === "string" ? sp.feed.toLowerCase() : undefined,
  );

  const user = await getSessionUser();
  const communities = user
    ? await listCommunities().catch(() => [])
    : [];

  const showAdminFeedDelete = !!(user && isAdminEmail(user.email));

  const joinedSlugs = user
    ? await getMemberCommunitySlugs(user.id).catch(() => [] as string[])
    : [];
  const joinedSet = new Set(joinedSlugs);

  let feedPage: Awaited<ReturnType<typeof getHomeFeedPostsPage>> | null = null;

  if (user) {
    if (feed === "joined") {
      feedPage = await getHomeFeedPostsPage({
        sort: "new",
        communitySlugsIn: joinedSlugs,
        limit: FEED_PAGE_SIZE,
      }).catch(() => null);
    } else {
      feedPage = await getHomeFeedPostsPage({
        sort: feed === "hot" ? "hot" : "new",
        limit: FEED_PAGE_SIZE,
      }).catch(() => null);
    }
  }

  const posts = feedPage?.posts ?? [];
  const postsJson = posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  const tabActive = "rounded-full px-3 py-1.5 text-xs font-semibold transition";
  const tabInactive =
    "rounded-full px-3 py-1.5 text-xs font-medium transition hover:bg-zinc-200";

  const feedTitle =
    feed === "hot"
      ? "داغ‌ترین"
      : feed === "joined"
        ? "جدیدترین انجمن‌های من"
        : "جدیدترین";

  const emptyMessage = (() => {
    if (feed === "joined" && joinedSlugs.length === 0) {
      return (
        <>
          <p className="text-zinc-500">
            هنوز عضو هیچ انجمنی نیستی. به انجمنی بپیوند تا فید شخصی‌ات اینجا پر
            شود.
          </p>
          {communities.length > 0 && (
            <Link
              href={`/communities/${communities[0]!.slug}`}
              className="mt-3 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              کشف انجمن‌ها
            </Link>
          )}
        </>
      );
    }
    if (feed === "joined") {
      return (
        <>
          <p className="text-zinc-500">
            در انجمن‌هایی که عضو هستی هنوز پستی منتشر نشده است.
          </p>
          <Link
            href="/"
            className="mt-3 inline-flex rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            همهٔ پست‌های تازه
          </Link>
        </>
      );
    }
    return (
      <>
        <p className="text-zinc-500">هنوز پستی منتشر نشده است.</p>
        {user && communities.length > 0 && (
          <Link
            href={`/communities/${communities[0]!.slug}`}
            className="mt-3 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            اولین پست را بگذار
          </Link>
        )}
      </>
    );
  })();

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />

      <main
        className={
          user
            ? "mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[240px_1fr_300px]"
            : "mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[1fr_300px]"
        }
      >
        {user ? (
          <aside className="order-2 lg:order-1 lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  انجمن‌ها
                </p>
                <Link
                  href="/communities/create"
                  className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-orange-600"
                >
                  <FaPlus className="size-2.5" />
                  ساخت
                </Link>
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
            </div>
          </aside>
        ) : null}

        <section className="order-1 space-y-3 lg:order-2">
          {!user ? (
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-10 text-center sm:px-8">
              <h1 className="text-lg font-bold text-zinc-900">
                فید هم‌اندیش
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
                مشاهدهٔ فید پلتفرم، انجمن‌ها و پست‌ها فقط برای کاربران وارد‌شده است.
                برای ادامه وارد حساب شو یا ثبت‌نام کن.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  ورود به حساب
                </Link>
                <Link
                  href="/register"
                  className="inline-flex rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                >
                  ثبت‌نام
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h1 className="text-base font-bold">{feedTitle}</h1>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href="/"
                      className={`${feed === "new" ? `${tabActive} bg-zinc-900 text-white` : `${tabInactive} bg-zinc-100 text-zinc-800`}`}
                    >
                      جدیدترین
                    </Link>
                    <Link
                      href="/?feed=hot"
                      className={`inline-flex items-center gap-1 ${feed === "hot" ? `${tabActive} bg-zinc-900 text-white` : `${tabInactive} bg-zinc-100 text-zinc-800`}`}
                    >
                      <FaFire
                        className={`size-3 ${feed === "hot" ? "text-orange-400" : "text-orange-500"}`}
                      />
                      داغ‌ترین
                    </Link>
                    <Link
                      href="/?feed=joined"
                      className={`inline-flex items-center gap-1 ${feed === "joined" ? `${tabActive} bg-zinc-900 text-white` : `${tabInactive} bg-zinc-100 text-zinc-800`}`}
                    >
                      <FaUsers
                        className={`size-3 ${feed === "joined" ? "text-orange-400" : "text-orange-500"}`}
                      />
                      انجمن‌های من
                    </Link>
                  </div>
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="rounded-xl border border-zinc-200 bg-white p-10 text-center">
                  {emptyMessage}
                </div>
              ) : (
                <HomePaginatedPostFeed
                  key={feed}
                  feedTab={feed}
                  initialPosts={postsJson}
                  initialHasMore={feedPage?.hasMore ?? false}
                  initialNextCursor={feedPage?.nextCursor ?? null}
                  initialNextHotOffset={feedPage?.nextHotOffset ?? null}
                  showAdminDelete={showAdminFeedDelete}
                />
              )}
            </>
          )}
        </section>

        <aside className="order-3 space-y-3 lg:order-3">
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
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">
                  ۱.
                </span>
                محترمانه بحث کن و روی ایده نقد بده، نه شخص.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">
                  ۲.
                </span>
                اگر سوال فنی می‌پرسی، جزئیات کافی اضافه کن.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">
                  ۳.
                </span>
                برای معرفی محصول، نمونه یا اسکرین‌شات قرار بده.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">
                  ۴.
                </span>
                از ارسال اسپم، تبلیغات تکراری یا لینک‌های فریبنده خودداری کن.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">
                  ۵.
                </span>
                اطلاعات شخصی خود یا دیگران را منتشر نکن.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">
                  ۶.
                </span>
                جمع‌آوری، ذخیره یا سوءاستفاده از داده کاربران ممنوع است.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-orange-500">
                  ۷.
                </span>
                هیچ‌کس حق درخواست رمز عبور، کد تأیید، یا اطلاعات امنیتی را
                ندارد.
                <br />
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
