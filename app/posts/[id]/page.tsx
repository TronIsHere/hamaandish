import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowDown,
  FaArrowUp,
  FaBookmark,
  FaCommentDots,
} from "react-icons/fa6";
import { SiteHeader } from "@/app/components/site-header";
import { getPostById } from "@/app/lib/db/posts";
import { formatRelativeTime, estimateReadTime } from "@/app/lib/utils";

type Params = { id: string };
type PageProps = { params: Promise<Params> };

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: "پست پیدا نشد" };
  return {
    title: `${post.title} | هم‌اندیش`,
    description: post.body.slice(0, 160),
  };
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl px-4 py-4">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-800">
            خانه
          </Link>
          <span>·</span>
          <Link
            href={`/communities/${post.communitySlug}`}
            className="hover:text-zinc-800"
          >
            {post.communityName}
          </Link>
          <span>·</span>
          <span className="line-clamp-1 font-medium text-zinc-800">
            {post.title}
          </span>
        </div>

        {/* Post article */}
        <article className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <Link
              href={`/communities/${post.communitySlug}`}
              className="font-semibold text-zinc-700 hover:text-orange-600"
            >
              {post.communityName}
            </Link>
            <span className="text-zinc-300">·</span>
            <span className="font-medium text-zinc-700">{post.authorName}</span>
            <span className="text-zinc-300">·</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
            <span className="text-zinc-300">·</span>
            <span>{estimateReadTime(post.body)}</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold leading-snug">{post.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-zinc-700">
            {post.body}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 font-medium">
              <FaArrowUp className="size-3.5" />
              {toPersian(post.upvotes)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 font-medium">
              <FaArrowDown className="size-3.5" />
              {toPersian(post.downvotes)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 font-medium">
              <FaCommentDots className="size-3.5" />
              {toPersian(post.commentsCount)} دیدگاه
            </span>
            <button className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 font-medium transition hover:bg-zinc-200">
              <FaBookmark className="size-3.5" />
              ذخیره
            </button>
          </div>
        </article>

        {/* Comment form */}
        <section className="mt-3 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-800">ارسال دیدگاه</h2>
          <textarea
            className="mt-3 min-h-28 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-7 outline-none ring-orange-500 transition focus:ring-2"
            placeholder="دیدگاه خودت را بنویس..."
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-zinc-400">
              محترمانه بنویس و روی ایده نقد کن.
            </p>
            <button className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
              انتشار دیدگاه
            </button>
          </div>
        </section>

        {post.commentsCount === 0 && (
          <p className="mt-3 px-1 text-sm text-zinc-400">
            هنوز دیدگاهی ثبت نشده است. اولین نفر باش!
          </p>
        )}
      </main>
    </div>
  );
}
