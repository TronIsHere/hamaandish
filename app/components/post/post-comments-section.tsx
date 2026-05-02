"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import { formatRelativeTime } from "@/app/lib/utils";

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

export type SerializedCommentNode = {
  id: string;
  parentId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
  replies: SerializedCommentNode[];
};

type CommentVoteRowProps = {
  commentId: string;
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
  isLoggedIn: boolean;
};

function CommentVoteRow({
  commentId,
  upvotes,
  downvotes,
  userVote,
  isLoggedIn,
}: CommentVoteRowProps) {
  const router = useRouter();
  const [up, setUp] = useState(upvotes);
  const [down, setDown] = useState(downvotes);
  const [uv, setUv] = useState(userVote);
  const [pending, setPending] = useState<"up" | "down" | null>(null);

  async function vote(direction: "up" | "down") {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setPending(direction);
    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
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
      if (data.userVote !== undefined) setUv(data.userVote ?? null);
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  const rowBtn =
    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-pressed={uv === 1}
        onClick={() => vote("up")}
        disabled={pending !== null}
        className={`${rowBtn} ${
          uv === 1
            ? "bg-orange-50 text-orange-800 ring-1 ring-orange-200"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
        }`}
      >
        <FaArrowUp className="size-3 shrink-0" />
        {toPersian(up)}
      </button>
      <button
        type="button"
        aria-pressed={uv === -1}
        onClick={() => vote("down")}
        disabled={pending !== null}
        className={`${rowBtn} ${
          uv === -1
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

type ReplyComposerProps = {
  postId: string;
  parentId: string;
  onCancel: () => void;
  onSuccess: () => void;
};

function ReplyComposer({ postId, parentId, onCancel, onSuccess }: ReplyComposerProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const text = taRef.current?.value?.trim() ?? "";
    if (text.length < 2) {
      setError("متن خیلی کوتاه است.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, parentId }),
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

      if (taRef.current) taRef.current.value = "";
      onSuccess();
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-3 rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200" onSubmit={submit}>
      {error && (
        <p
          className="mb-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      <textarea
        ref={taRef}
        rows={3}
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-7 outline-none ring-orange-500 transition focus:ring-2"
        placeholder="پاسخت را بنویس…"
        disabled={pending}
      />
      <div className="mt-2 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-200"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {pending ? "…" : "ارسال پاسخ"}
        </button>
      </div>
    </form>
  );
}

type ThreadProps = {
  node: SerializedCommentNode;
  postId: string;
  isLoggedIn: boolean;
};

function CommentThread({
  node: n,
  postId,
  isLoggedIn,
}: ThreadProps) {
  const router = useRouter();
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <div className="text-start">
      <article
        className={`rounded-xl border border-zinc-200 bg-white p-4 ${
          n.parentId !== null ? "shadow-sm" : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span className="font-medium text-zinc-700">{n.authorName}</span>
          <span className="text-zinc-300">·</span>
          <span>{formatRelativeTime(new Date(n.createdAt))}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-700">{n.body}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-3">
          <CommentVoteRow
            commentId={n.id}
            upvotes={n.upvotes}
            downvotes={n.downvotes}
            userVote={n.userVote}
            isLoggedIn={isLoggedIn}
          />
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => setReplyOpen((v) => !v)}
              className="rounded-full px-3 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-200 transition hover:bg-orange-50 aria-pressed:ring-orange-400"
              aria-pressed={replyOpen}
            >
              {replyOpen ? "بستن پاسخ" : "پاسخ"}
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              پاسخ (ورود)
            </Link>
          )}
        </div>

        {replyOpen && isLoggedIn && (
          <ReplyComposer
            postId={postId}
            parentId={n.id}
            onCancel={() => setReplyOpen(false)}
            onSuccess={() => {
              setReplyOpen(false);
              router.refresh();
            }}
          />
        )}
      </article>

      {n.replies.length > 0 && (
        <div className="ms-4 mt-3 space-y-3 border-s border-zinc-200 ps-4">
          {n.replies.map((child) => (
            <CommentThread
              key={`${child.id}-${child.upvotes}-${child.downvotes}-${child.userVote ?? "none"}`}
              node={child}
              postId={postId}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type SectionProps = {
  postId: string;
  initialCommentTree: SerializedCommentNode[];
  isLoggedIn: boolean;
};

export function PostCommentsSection({
  postId,
  initialCommentTree,
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
        {isLoggedIn && (
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
                برای پاسخ روی «پاسخ» زیر هر دیدگاه بزن.
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
        </div>
        {initialCommentTree.length === 0 ? (
          <p className="px-1 text-sm text-zinc-400">
            هنوز دیدگاهی ثبت نشده است. اولین نفر باش!
          </p>
        ) : (
          initialCommentTree.map((c) => (
            <CommentThread
              key={`${c.id}-${c.upvotes}-${c.downvotes}-${c.userVote ?? "none"}`}
              node={c}
              postId={postId}
              isLoggedIn={isLoggedIn}
            />
          ))
        )}
      </section>
    </>
  );
}
