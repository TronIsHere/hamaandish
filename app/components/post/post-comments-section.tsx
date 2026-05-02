"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { formatRelativeTime } from "@/app/lib/utils";

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

export type SerializedComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
};

type CommentRowProps = {
  comment: SerializedComment;
  canVote: boolean;
  isLoggedIn: boolean;
  communitySlug: string;
};

function CommentVoteRow({
  comment: c,
  canVote,
  isLoggedIn,
  communitySlug,
}: CommentRowProps) {
  const router = useRouter();
  const [up, setUp] = useState(c.upvotes);
  const [down, setDown] = useState(c.downvotes);
  const [userVote, setUserVote] = useState(c.userVote);
  const [pending, setPending] = useState<"up" | "down" | null>(null);

  async function vote(direction: "up" | "down") {
    if (!canVote) {
      router.push(isLoggedIn ? `/communities/${communitySlug}` : "/login");
      return;
    }
    setPending(direction);
    try {
      const res = await fetch(`/api/comments/${c.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      const data = (await res.json()) as {
        upvotes?: number;
        downvotes?: number;
        userVote?: 1 | -1 | null;
      };
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) return;
      if (data.upvotes !== undefined) setUp(data.upvotes);
      if (data.downvotes !== undefined) setDown(data.downvotes);
      if (data.userVote !== undefined) setUserVote(data.userVote ?? null);
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  const rowBtn =
    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition disabled:opacity-60";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
      <button
        type="button"
        aria-pressed={userVote === 1}
        onClick={() => vote("up")}
        disabled={pending !== null}
        className={`${rowBtn} ${
          userVote === 1
            ? "bg-orange-50 text-orange-800 ring-1 ring-orange-200"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
        }`}
      >
        <FaArrowUp className="size-3 shrink-0" />
        {toPersian(up)}
      </button>
      <button
        type="button"
        aria-pressed={userVote === -1}
        onClick={() => vote("down")}
        disabled={pending !== null}
        className={`${rowBtn} ${
          userVote === -1
            ? "bg-slate-100 text-slate-800 ring-1 ring-slate-300"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
        }`}
      >
        <FaArrowDown className="size-3 shrink-0" />
        {toPersian(down)}
      </button>
    </div>
  );
}

type SectionProps = {
  postId: string;
  communitySlug: string;
  initialComments: SerializedComment[];
  canCommentAndVote: boolean;
  /** Logged-in but not necessarily a member (for messaging). */
  isLoggedIn: boolean;
};

export function PostCommentsSection({
  postId,
  communitySlug,
  initialComments,
  canCommentAndVote,
  isLoggedIn,
}: SectionProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const text = bodyRef.current?.value?.trim() ?? "";
    if (text.length < 2) {
      setError("متن دیدگاه خیلی کوتاه است.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "مشکلی پیش آمد.");
        return;
      }

      if (bodyRef.current) bodyRef.current.value = "";
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="mt-3 rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-800">ارسال دیدگاه</h2>

        {!isLoggedIn && (
          <p className="mt-2 text-sm text-zinc-500">
            برای نوشتن دیدگاه ابتدا{" "}
            <Link href="/login" className="font-semibold text-orange-600 hover:underline">
              وارد حساب کاربری
            </Link>{" "}
            شو.
          </p>
        )}
        {isLoggedIn && !canCommentAndVote && (
          <p className="mt-2 text-sm text-zinc-500">
            فقط اعضای این انجمن می‌توانند دیدگاه بگذارند. از صفحه انجمن عضو شو.
          </p>
        )}

        {canCommentAndVote && (
          <form className="mt-3 space-y-3" onSubmit={submitComment}>
            {error && (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            )}
            <textarea
              ref={bodyRef}
              className="min-h-28 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-7 outline-none ring-orange-500 transition focus:ring-2"
              placeholder="دیدگاه خودت را بنویس..."
              disabled={pending}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-zinc-400">
                محترمانه بنویس و روی ایده نقد کن.
              </p>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {pending ? "در حال انتشار…" : "انتشار دیدگاه"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="mt-3 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
          <h3 className="text-sm font-semibold text-zinc-800">دیدگاه‌ها</h3>
          {!isLoggedIn && (
            <p className="text-xs text-zinc-400">
              برای ثبت نظر خودت یا رأی دادن{" "}
              <Link href="/login" className="font-semibold text-orange-600 hover:underline">
                وارد شو
              </Link>
              .
            </p>
          )}
          {isLoggedIn && !canCommentAndVote && (
            <p className="text-xs text-zinc-400">
              برای دیدگاه و رأی،{" "}
              <Link
                href={`/communities/${communitySlug}`}
                className="font-semibold text-orange-600 hover:underline"
              >
                عضو این انجمن شو
              </Link>
              .
            </p>
          )}
        </div>
        {initialComments.length === 0 ? (
          <p className="px-1 text-sm text-zinc-400">
            هنوز دیدگاهی ثبت نشده است. اولین نفر باش!
          </p>
        ) : (
          initialComments.map((c) => (
            <article
              key={`${c.id}-${c.upvotes}-${c.downvotes}-${c.userVote ?? "none"}`}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span className="font-medium text-zinc-700">{c.authorName}</span>
                <span className="text-zinc-300">·</span>
                <span>{formatRelativeTime(new Date(c.createdAt))}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
                {c.body}
              </p>
              <CommentVoteRow
                comment={c}
                canVote={canCommentAndVote}
                isLoggedIn={isLoggedIn}
                communitySlug={communitySlug}
              />
            </article>
          ))
        )}
      </section>
    </>
  );
}
