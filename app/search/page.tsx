import type { Metadata } from "next";
import Link from "next/link";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { SiteHeader } from "@/app/components/site-header";
import { searchApprovedUsersByText } from "@/app/lib/auth/users";
import { searchCommunitiesByText } from "@/app/lib/db/communities";
import { searchPostsByText } from "@/app/lib/db/posts";
import {
  getAvatarColor,
  getInitials,
} from "@/app/lib/utils";

export const metadata: Metadata = {
  title: "جستجو | هم‌اندیش",
  description: "جستجو در کاربران، انجمن‌ها و پست‌ها",
};

type PageProps = { searchParams?: Promise<{ q?: string }> };

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

function postExcerpt(htmlBody: string): string {
  const plain = htmlBody.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= 140) return plain;
  return `${plain.slice(0, 140)}…`;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const rawQ = typeof sp.q === "string" ? sp.q : "";
  const q = rawQ.trim();
  const canSearch = q.length >= 2;

  const [users, communities, posts] = canSearch
    ? await Promise.all([
        searchApprovedUsersByText(q, 8).catch(() => []),
        searchCommunitiesByText(q, 8).catch(() => []),
        searchPostsByText(q, 3).catch(() => []),
      ])
    : [[], [], []];

  const hasAnyResult =
    users.length > 0 || communities.length > 0 || posts.length > 0;

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 pb-24 md:pb-10">
        <h1 className="text-2xl font-bold">جستجو</h1>
        <p className="mt-1 text-sm text-zinc-500">
          کاربران، انجمن‌ها و پست‌ها را در یک جا بگردید.
        </p>

        <form
          action="/search"
          method="get"
          className="mt-6 flex w-full gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <FaMagnifyingGlass
              aria-hidden
              className="size-4 shrink-0 text-zinc-400"
            />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="حداقل دو نویسه بنویسید…"
              autoComplete="off"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-zinc-400"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            جستجو
          </button>
        </form>

        {canSearch && !hasAnyResult && (
          <p className="mt-10 text-center text-sm text-zinc-500">
            نتیجه‌ای برای «{q}» پیدا نشد.
          </p>
        )}

        {canSearch && users.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold text-zinc-800">کاربران</h2>
            <ul className="mt-3 space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarColor(u.name)}`}
                  >
                    {getInitials(u.name)}
                  </span>
                  <span className="min-w-0 truncate font-medium text-zinc-900">
                    {u.name}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {canSearch && communities.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold text-zinc-800">انجمن‌ها</h2>
            <ul className="mt-3 space-y-2">
              {communities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/communities/${c.slug}`}
                    className="block rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.icon}</span>
                      <span className="font-semibold text-zinc-900">{c.name}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {c.description}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-zinc-400">
                      {toPersian(c.memberCount)} عضو
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {canSearch && posts.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold text-zinc-800">پست‌ها</h2>
            <ul className="mt-3 space-y-2">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/posts/${p.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-300 hover:shadow-sm"
                  >
                    <p className="font-semibold text-zinc-900">{p.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {postExcerpt(p.body)}
                    </p>
                    <p className="mt-2 text-[11px] text-zinc-400">
                      {p.communityName} · {p.authorName}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!canSearch && q.length > 0 && (
          <p className="mt-8 text-center text-sm text-amber-700">
            برای جستجو حداقل دو نویسه وارد کنید.
          </p>
        )}
      </main>
    </div>
  );
}
