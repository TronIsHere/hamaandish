import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCommentDots, FaThumbsUp } from "react-icons/fa6";
import { feedItems } from "@/app/lib/forum-data";

type Params = {
  id: string;
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = feedItems.find((item) => item.id === Number(id));

  if (!post) {
    return {
      title: "پست پیدا نشد",
      description: "این پست وجود ندارد یا حذف شده است.",
    };
  }

  return {
    title: `${post.title} | هم‌اندیش`,
    description: post.body,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = feedItems.find((item) => item.id === Number(id));

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            بازگشت به فید
          </Link>
        </div>

        <article className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full bg-zinc-100 px-2 py-1">
              {post.category}
            </span>
            <Link
              href={`/communities/${post.communitySlug}`}
              className="font-semibold text-zinc-700 hover:text-orange-600"
            >
              {post.communityName}
            </Link>
            <span>{post.author}</span>
            <span>{post.time} پیش</span>
            <span>{post.readTime}</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold leading-snug">{post.title}</h1>
          <p className="mt-4 text-base leading-8 text-zinc-700">{post.body}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
            <button className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium hover:bg-zinc-200">
              ▲ {post.votes}
            </button>
            <button className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 font-medium hover:bg-zinc-200">
              <FaCommentDots aria-hidden className="size-4" />
              {post.commentsCount}
            </button>
            <button className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium hover:bg-zinc-200">
              ذخیره
            </button>
          </div>
        </article>

        <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-lg font-semibold">ارسال نظر</h2>
          <textarea
            className="mt-3 min-h-28 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none ring-orange-500 focus:ring-2"
            placeholder="نظر خودت را بنویس..."
          />
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            <button className="w-full rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 sm:w-auto">
              پیش نویس
            </button>
            <button className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 sm:w-auto">
              انتشار نظر
            </button>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          <h2 className="text-lg font-semibold">دیدگاه ها</h2>
          {post.comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700">
                  {comment.author}
                </span>
                <span>{comment.time} پیش</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-zinc-700">
                {comment.content}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <button className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 hover:bg-zinc-200">
                  <FaThumbsUp aria-hidden className="size-4" />
                  {comment.likes}
                </button>
                <button className="rounded-full bg-zinc-100 px-3 py-1.5 hover:bg-zinc-200">
                  پاسخ
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
