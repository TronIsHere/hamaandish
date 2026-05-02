"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

type Props = {
  postId: string;
  communitySlug: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: 1 | -1 | null;
  canVote: boolean;
  isLoggedIn: boolean;
};

const btnBase =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition disabled:opacity-60";

export function PostVoteBar({
  postId,
  communitySlug,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  canVote,
  isLoggedIn,
}: Props) {
  const router = useRouter();
  const [up, setUp] = useState(initialUpvotes);
  const [down, setDown] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [pending, setPending] = useState<"up" | "down" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function vote(direction: "up" | "down") {
    setError(null);
    if (!canVote) {
      router.push(isLoggedIn ? `/communities/${communitySlug}` : "/login");
      return;
    }

    setPending(direction);
    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        upvotes?: number;
        downvotes?: number;
        userVote?: 1 | -1 | null;
      };

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "مشکلی پیش آمد.");
        return;
      }
      if (data.upvotes !== undefined) setUp(data.upvotes);
      if (data.downvotes !== undefined) setDown(data.downvotes);
      if (data.userVote !== undefined) setUserVote(data.userVote ?? null);
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={userVote === 1}
          aria-label="رأی مثبت"
          onClick={() => vote("up")}
          disabled={pending !== null}
          className={`${btnBase} ${
            userVote === 1
              ? "bg-orange-100 text-orange-800 ring-1 ring-orange-300"
              : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
          }`}
        >
          <FaArrowUp className="size-3.5 shrink-0" />
          <span className="text-sm">{toPersian(up)}</span>
        </button>
        <button
          type="button"
          aria-pressed={userVote === -1}
          aria-label="رأی منفی"
          onClick={() => vote("down")}
          disabled={pending !== null}
          className={`${btnBase} ${
            userVote === -1
              ? "bg-slate-200 text-slate-800 ring-1 ring-slate-400"
              : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
          }`}
        >
          <FaArrowDown className="size-3.5 shrink-0" />
          <span className="text-sm">{toPersian(down)}</span>
        </button>
      </div>
      {!canVote && (
        <p className="text-xs text-zinc-400">
          برای ثبت رأی مثبت یا منفی{" "}
          {isLoggedIn ? (
            <Link
              href={`/communities/${communitySlug}`}
              className="font-semibold text-orange-600 hover:underline"
            >
              عضو این انجمن شو
            </Link>
          ) : (
            <Link
              href="/login"
              className="font-semibold text-orange-600 hover:underline"
            >
              وارد شو
            </Link>
          )}
          .
        </p>
      )}
      {canVote && error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
