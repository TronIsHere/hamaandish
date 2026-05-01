import Link from "next/link";
import { FaCommentDots } from "react-icons/fa";
import { communities, feedItems, trending } from "./lib/forum-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
          <div className="rounded-full bg-orange-500 px-3 py-1 text-center text-sm font-bold text-white md:text-start">
            هم‌اندیش
          </div>
          <div className="min-w-0 flex-1 items-center">
            <input
              type="search"
              placeholder="جستجو در پست ها، انجمن ها و کاربران..."
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm outline-none ring-orange-500 transition focus:ring-2"
            />
          </div>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <button className="flex-1 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 md:flex-none">
              ورود
            </button>
            <button className="flex-1 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 md:flex-none">
              ثبت نام
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[240px_1fr_300px]">
        <aside className="order-2 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 lg:order-1 lg:sticky lg:top-20 lg:h-fit">
          <h2 className="text-sm font-semibold text-zinc-500">انجمن ها</h2>
          <nav className="space-y-1">
            {communities.map((community) => (
              <Link
                key={community.slug}
                href={`/communities/${community.slug}`}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-zinc-100"
              >
                <span>{community.name}</span>
                <span className="text-xs text-zinc-400">مشاهده</span>
              </Link>
            ))}
          </nav>
        </aside>

        <section className="order-1 space-y-4 lg:order-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-bold">فید اصلی</h1>
              <button className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100">
                داغ ترین ها
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              تازه ترین بحث های جامعه فارسی درباره ساخت محصول، طراحی و توسعه را
              دنبال کن.
            </p>
          </div>

          {feedItems.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300"
            >
              <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
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
              </div>
              <Link href={`/posts/${post.id}`} className="block">
                <h3 className="text-lg font-semibold leading-snug hover:text-orange-600">
                  {post.title}
                </h3>
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {post.body}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <button className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium transition hover:bg-zinc-200">
                  ▲ {post.votes}
                </button>
                <Link
                  href={`/posts/${post.id}`}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 font-medium transition hover:bg-zinc-200"
                >
                  <FaCommentDots aria-hidden className="size-4" />
                  {post.commentsCount}
                </Link>
                <button className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium transition hover:bg-zinc-200">
                  اشتراک گذاری
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="order-3 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-zinc-700">
              ترندهای این هفته
            </h2>
            <ul className="mt-3 space-y-3">
              {trending.map((item) => (
                <li key={item.label}>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.posts}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-zinc-700">اصول طراحی</h2>
            <p className="mt-2 text-sm text-zinc-600">
              اصطکاک تعامل را کم نگه دارید: در هر بخش یک اقدام اصلی واضح داشته
              باشید و پیش نمایش محتوا کوتاه و قابل درک باشد.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-zinc-700">
              قوانین سریع انجمن
            </h2>
            <ul className="mt-2 space-y-2 text-sm text-zinc-600">
              <li>محترمانه بحث کن و روی ایده نقد بده، نه شخص.</li>
              <li>اگر سوال فنی می پرسی، جزئیات کافی اضافه کن.</li>
              <li>برای معرفی محصول، نمونه یا اسکرین شات قرار بده.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
