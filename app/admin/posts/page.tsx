import Link from "next/link";
import { FEED_PAGE_SIZE, getHomeFeedPostsPage } from "@/app/lib/db/posts";
import { AdminModerationFeed } from "./moderation-feed";

export default async function AdminPostsPage() {
  const feedPage = await getHomeFeedPostsPage({
    sort: "new",
    limit: FEED_PAGE_SIZE,
  }).catch(() => null);

  const postsJson = (feedPage?.posts ?? []).map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          سوپراَدمین
        </p>
        <h1 className="mt-2 text-2xl font-bold">نسخهٔ فید — حذف پست</h1>
        <p className="mt-2 text-sm text-zinc-600">
          هر پستی را می‌توانی حذف کنی؛ دیدگاه‌ها و آراء مربوطه هم پاک می‌شوند.
        </p>
      </div>

      <AdminModerationFeed
        initialSort="new"
        initial={{
          posts: postsJson,
          hasMore: feedPage?.hasMore ?? false,
          nextCursor: feedPage?.nextCursor ?? null,
          nextHotOffset: feedPage?.nextHotOffset ?? null,
        }}
      />

      <div className="mt-10 flex flex-wrap gap-4 border-t border-zinc-200 pt-8">
        <Link
          href="/admin"
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          ← داشبورد مدیر
        </Link>
        <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          فید عمومی خانه
        </Link>
      </div>
    </main>
  );
}
