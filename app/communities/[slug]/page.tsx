import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FaFire } from "react-icons/fa6";
import { SiteHeader } from "@/app/components/site-header";
import { JoinButton } from "@/app/components/community/join-button";
import { CreatePostForm } from "@/app/components/community/create-post-form";
import { DeleteCommunityButton } from "@/app/components/community/delete-community-button";
import { CommunityInviteLink } from "@/app/components/community/community-invite-link";
import { CommunityPaginatedPostFeed } from "@/app/components/post/paginated-post-feed";
import { findCommunityBySlug } from "@/app/lib/db/communities";
import {
  countPostsByCommunity,
  FEED_PAGE_SIZE,
  getPostsByCommunityPage,
} from "@/app/lib/db/posts";
import { isMember } from "@/app/lib/db/memberships";
import { getSessionUser } from "@/app/lib/auth/session";
import { isAdminEmail } from "@/app/lib/auth/admin";
import { getSiteOrigin } from "@/app/lib/request-origin";

type Params = { slug: string };
type PageProps = {
  params: Promise<Params>;
  searchParams?: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ slug }, user] = await Promise.all([params, getSessionUser()]);
  if (!user) return { title: "هم‌اندیش" };
  const community = await findCommunityBySlug(slug);
  if (!community) return { title: "انجمن پیدا نشد" };
  return {
    title: `${community.name} | هم‌اندیش`,
    description: community.description,
  };
}

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

function parseCommunitySort(raw: string | undefined): "new" | "hot" {
  return raw?.toLowerCase() === "hot" ? "hot" : "new";
}

export default async function CommunityPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect(
      "/login?next=" + encodeURIComponent(`/communities/${slug}`),
    );
  }

  const sp = (await searchParams) ?? {};
  const sort = parseCommunitySort(
    typeof sp.sort === "string" ? sp.sort : undefined,
  );

  const community = await findCommunityBySlug(slug);

  if (!community) notFound();

  const [feedPage, postCount, joined] = await Promise.all([
    getPostsByCommunityPage({
      communitySlug: slug,
      sort,
      limit: FEED_PAGE_SIZE,
    }),
    countPostsByCommunity(slug),
    isMember(user.id, slug),
  ]);

  const postsJson = feedPage.posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  const isOwner = user.id === community.ownerUserId;
  const showAdminFeedDelete = isAdminEmail(user.email);

  const origin = await getSiteOrigin();
  const inviteUrl =
    origin !== ""
      ? `${origin}/communities/${slug}`
      : `/communities/${slug}`;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 py-4">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-800">
            خانه
          </Link>
          <span>·</span>
          <span className="font-medium text-zinc-800">{community.name}</span>
        </div>

        {/* Community hero */}
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="bg-linear-to-l from-orange-500 to-amber-400 px-5 py-6 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-medium text-white/70">
                  انجمن تخصصی
                </p>
                <h1 className="text-2xl font-bold">{community.name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/90">
                  {community.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70">
                  <span>{toPersian(community.memberCount)} عضو</span>
                  <span>·</span>
                  <span>{toPersian(postCount)} پست</span>
                </div>
              </div>
              <div className="shrink-0">
                <JoinButton
                  slug={slug}
                  initialJoined={joined}
                  isOwner={isOwner}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <section className="space-y-3">
            {/* Create post */}
            {joined || isOwner ? (
              <section className="rounded-xl border border-zinc-200 bg-white p-4">
                <CreatePostForm
                  communitySlug={slug}
                  communityName={community.name}
                />
              </section>
            ) : (
              <section className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-zinc-300 bg-white p-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-800">
                    می‌خواهی پست بگذاری؟
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    برای انتشار پست، ابتدا عضو این انجمن شو.
                  </p>
                </div>
                <JoinButton slug={slug} initialJoined={false} isOwner={false} />
              </section>
            )}

            {/* Sort + header */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-800">
                پست‌های این انجمن
              </h2>
              <div className="flex items-center gap-1.5 text-xs">
                <Link
                  href={`/communities/${slug}`}
                  className={`rounded-full px-3 py-1.5 transition ${sort === "new" ? "bg-zinc-900 font-semibold text-white" : "bg-zinc-100 font-medium text-zinc-800 hover:bg-zinc-200"}`}
                >
                  جدیدترین
                </Link>
                <Link
                  href={`/communities/${slug}?sort=hot`}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition ${sort === "hot" ? "bg-zinc-900 font-semibold text-white" : "bg-zinc-100 font-medium text-zinc-800 hover:bg-zinc-200"}`}
                >
                  <FaFire
                    className={`size-3 ${sort === "hot" ? "text-orange-400" : "text-orange-500"}`}
                  />
                  داغ‌ترین
                </Link>
              </div>
            </div>

            {/* Posts */}
            {postCount === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
                <p className="text-zinc-500">
                  هنوز پستی در این انجمن منتشر نشده است.
                </p>
                {(joined || isOwner) && (
                  <p className="mt-2 text-sm text-zinc-400">
                    اولین نفری باش که یک پست می‌گذاری!
                  </p>
                )}
              </div>
            ) : (
              <CommunityPaginatedPostFeed
                key={sort}
                slug={slug}
                sort={sort}
                initialPosts={postsJson}
                initialHasMore={feedPage.hasMore}
                initialNextCursor={feedPage.nextCursor}
                initialNextHotOffset={feedPage.nextHotOffset}
                showAdminDelete={showAdminFeedDelete}
              />
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
            <section className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-zinc-800">
                درباره انجمن
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {community.description}
              </p>
              <div className="mt-3 space-y-1.5 border-t border-zinc-100 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">اعضا</span>
                  <span className="font-medium text-zinc-800">
                    {toPersian(community.memberCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">پست‌ها</span>
                  <span className="font-medium text-zinc-800">
                    {toPersian(postCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">تاسیس</span>
                  <span className="font-medium text-zinc-800">
                    {community.createdAt.toLocaleDateString("fa-IR", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>
              {isOwner && (
                <DeleteCommunityButton
                  slug={slug}
                  communityName={community.name}
                />
              )}
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-zinc-800">
                لینک دعوت
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                این آدرس را برای دوستان بفرست تا مستقیم به همین انجمن بیایند و در
                صورت تمایل عضو شوند.
              </p>
              <CommunityInviteLink
                inviteUrl={inviteUrl}
                communityName={community.name}
              />
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-zinc-800">
                قوانین انجمن
              </h3>
              <ul className="mt-2.5 space-y-2.5 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 font-bold text-orange-500">۱.</span>
                  قبل از ارسال، پست‌های مشابه را جستجو کن.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 font-bold text-orange-500">۲.</span>
                  عنوان واضح و قابل فهم بنویس.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 font-bold text-orange-500">۳.</span>
                  نقد سازنده بده و محترمانه پاسخ بده.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
