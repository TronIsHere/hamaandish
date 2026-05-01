import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCommentDots } from "react-icons/fa6";
import { getCommunityBySlug, getPostsByCommunity } from "@/app/lib/forum-data";

type Params = {
  slug: string;
};

type PageProps = {
  params: Promise<Params>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);

  if (!community) {
    return {
      title: "انجمن پیدا نشد",
      description: "انجمن مورد نظر وجود ندارد.",
    };
  }

  return {
    title: `${community.name} | هم‌اندیش`,
    description: community.description,
  };
}

export default async function CommunityPage({ params }: PageProps) {
  const { slug } = await params;
  const community = getCommunityBySlug(slug);

  if (!community) {
    notFound();
  }

  const posts = getPostsByCommunity(slug);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            بازگشت به فید
          </Link>
        </div>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <div className="bg-linear-to-l from-orange-500 to-amber-400 px-5 py-6 text-white">
            <p className="text-xs/6 opacity-90">انجمن تخصصی</p>
            <h1 className="mt-1 text-2xl font-bold">{community.name}</h1>
            <p className="mt-2 max-w-3xl text-sm/7 text-white/90">
              {community.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
                {community.members}
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-700">
                ۳۴۵ پست این ماه
              </span>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              {community.isJoined ? (
                <span className="flex-1 rounded-full bg-emerald-50 px-4 py-2 text-center text-sm font-semibold text-emerald-700 sm:flex-none">
                  عضو انجمن هستی
                </span>
              ) : (
                <button className="flex-1 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 sm:flex-none">
                  عضویت در انجمن
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          <section className="space-y-3">
            {community.isJoined ? (
              <section className="rounded-xl border border-zinc-200 bg-white p-4">
                <h2 className="text-base font-semibold">
                  ایجاد پست در {community.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  فقط در انجمن هایی که عضو هستی می توانی پست منتشر کنی.
                </p>

                <label className="mt-4 block text-sm font-medium text-zinc-700">
                  عنوان پست
                </label>
                <input
                  type="text"
                  placeholder="یک عنوان دقیق و واضح بنویس..."
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none ring-orange-500 transition focus:ring-2"
                />

                <label className="mt-4 block text-sm font-medium text-zinc-700">
                  متن پست
                </label>
                <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200">
                  <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs">
                    <button className="rounded-md border border-zinc-300 bg-white px-2 py-1 font-semibold">
                      B
                    </button>
                    <button className="rounded-md border border-zinc-300 bg-white px-2 py-1 italic">
                      I
                    </button>
                    <button className="rounded-md border border-zinc-300 bg-white px-2 py-1 underline">
                      U
                    </button>
                    <button className="rounded-md border border-zinc-300 bg-white px-2 py-1">
                      لیست
                    </button>
                    <button className="rounded-md border border-zinc-300 bg-white px-2 py-1">
                      لینک
                    </button>
                  </div>
                  <div
                    className="min-h-40 w-full px-4 py-3 text-sm leading-7 text-zinc-700 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    aria-label="ویرایشگر متن پست"
                    data-placeholder="متن کامل پستت را اینجا بنویس..."
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <button className="w-full rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 sm:w-auto">
                    ذخیره پیش نویس
                  </button>
                  <button className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 sm:w-auto">
                    انتشار در انجمن
                  </button>
                </div>
              </section>
            ) : (
              <section className="rounded-xl border border-dashed border-zinc-300 bg-white p-4">
                <h2 className="text-base font-semibold">ایجاد پست</h2>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  برای انتشار پست باید اول عضو این انجمن شوی. بعد از عضویت، فرم
                  عنوان و ویرایشگر متن برایت فعال می شود.
                </p>
              </section>
            )}

            <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">پست های این انجمن</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button className="rounded-full bg-zinc-900 px-3 py-1.5 text-white">
                  جدیدترین
                </button>
                <button className="rounded-full bg-zinc-100 px-3 py-1.5 hover:bg-zinc-200">
                  پرمخاطب
                </button>
                <button className="rounded-full bg-zinc-100 px-3 py-1.5 hover:bg-zinc-200">
                  داغ
                </button>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
                هنوز پستی در این انجمن منتشر نشده است.
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                    <span className="rounded-full bg-zinc-100 px-2 py-1">
                      {post.category}
                    </span>
                    <span>{post.author}</span>
                    <span>{post.time} پیش</span>
                  </div>
                  <Link href={`/posts/${post.id}`} className="block">
                    <h3 className="text-lg font-semibold leading-snug hover:text-orange-600">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-sm leading-7 text-zinc-700">
                    {post.body}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full bg-zinc-100 px-3 py-1.5">
                      ▲ {post.votes}
                    </span>
                    <Link
                      href={`/posts/${post.id}`}
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 hover:bg-zinc-200"
                    >
                      <FaCommentDots aria-hidden className="size-4" />
                      {post.commentsCount}
                    </Link>
                    <button className="rounded-full bg-zinc-100 px-3 py-1.5 hover:bg-zinc-200">
                      اشتراک گذاری
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="space-y-3 lg:sticky lg:top-20 lg:h-fit">
            <section className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-zinc-800">
                درباره انجمن
              </h3>
              <p className="mt-2 text-sm leading-7 text-zinc-600">
                {community.description}
              </p>
              <div className="mt-3 space-y-2 text-xs text-zinc-500">
                <p>تاسیس: فروردین ۱۴۰۳</p>
                <p>میانگین پاسخ: ۲ ساعت</p>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-zinc-800">
                قوانین انجمن
              </h3>
              <ul className="mt-2 space-y-2 text-sm text-zinc-600">
                <li>قبل از ارسال، پست های مشابه را جستجو کن.</li>
                <li>عنوان واضح و قابل فهم بنویس.</li>
                <li>نقد سازنده بده و محترمانه پاسخ بده.</li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
