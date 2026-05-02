"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import {
  estimateReadTime,
  formatRelativeTime,
} from "@/app/lib/utils";
import type { PostJson } from "@/app/components/post/paginated-post-feed";
import { AdminDeletePostButton } from "@/app/components/admin/delete-post-button";

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

type Sort = "new" | "hot";

type PaginationState = {
  posts: PostJson[];
  hasMore: boolean;
  nextCursor: string | null;
  nextHotOffset: number | null;
};

export function AdminModerationFeed(props: {
  initialSort: Sort;
  initial: PaginationState;
}) {
  const [sort, setSort] = useState<Sort>(props.initialSort);
  const [state, setState] = useState<PaginationState>(() => ({
    posts: [...props.initial.posts],
    hasMore: props.initial.hasMore,
    nextCursor: props.initial.nextCursor,
    nextHotOffset: props.initial.nextHotOffset,
  }));
  const [loading, setLoading] = useState(false);

  const reloadFirstPage = useCallback(async (nextSort: Sort) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("sort", nextSort);
      const res = await fetch(`/api/admin/posts?${q}`);
      if (!res.ok) return;
      const data = (await res.json()) as PaginationState & { posts: PostJson[] };
      setSort(nextSort);
      setState({
        posts: [...data.posts],
        hasMore: data.hasMore,
        nextCursor: data.nextCursor,
        nextHotOffset: data.nextHotOffset,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || loading) return;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("sort", sort);
      if (sort === "hot") {
        q.set("offset", String(state.nextHotOffset ?? 0));
      } else if (state.nextCursor) {
        q.set("cursor", state.nextCursor);
      }
      const res = await fetch(`/api/admin/posts?${q}`);
      if (!res.ok) return;
      const data = (await res.json()) as PaginationState & {
        posts: PostJson[];
      };
      setState((s) => ({
        posts: [...s.posts, ...data.posts],
        hasMore: data.hasMore,
        nextCursor: data.nextCursor,
        nextHotOffset: data.nextHotOffset,
      }));
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    sort,
    state.hasMore,
    state.nextCursor,
    state.nextHotOffset,
  ]);

  function removePost(id: string) {
    setState((s) => ({
      ...s,
      posts: s.posts.filter((p) => p.id !== id),
    }));
  }

  const tabCls = (active: boolean) =>
    active
      ? "rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white"
      : "rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-200";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-zinc-800">مرتب‌سازی</p>
        <button
          type="button"
          disabled={loading}
          className={tabCls(sort === "new")}
          onClick={() => {
            if (sort !== "new") void reloadFirstPage("new");
          }}
        >
          جدیدترین
        </button>
        <button
          type="button"
          disabled={loading}
          className={tabCls(sort === "hot")}
          onClick={() => {
            if (sort !== "hot") void reloadFirstPage("hot");
          }}
        >
          داغ‌ترین
        </button>
      </div>

      {state.posts.map((post) => (
        <article
          key={post.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <Link
                  href={`/communities/${post.communitySlug}`}
                  className="font-semibold text-zinc-700 hover:text-orange-600"
                >
                  {post.communityName}
                </Link>
                <span className="text-zinc-300">·</span>
                <span>{post.authorName}</span>
                <span className="text-zinc-300">·</span>
                <span>{formatRelativeTime(new Date(post.createdAt))}</span>
                <span className="text-zinc-300">·</span>
                <span>{estimateReadTime(post.body)}</span>
              </div>
              <Link href={`/posts/${post.id}`} className="block">
                <h3 className="text-base font-bold leading-snug text-zinc-900 hover:text-orange-600">
                  {post.title}
                </h3>
              </Link>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">
                {post.body.replace(/<[^>]*>/g, " ").trim()}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium">
                  <FaArrowUp className="size-3" />
                  {toPersian(post.upvotes)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium">
                  <FaArrowDown className="size-3" />
                  {toPersian(post.downvotes)}
                </span>
                <span className="text-xs text-zinc-400">
                  {toPersian(post.commentsCount)} نظر
                </span>
              </div>
            </div>
            <AdminDeletePostButton
              postId={post.id}
              onDeleted={() => removePost(post.id)}
              label="حذف"
            />
          </div>
        </article>
      ))}

      {state.posts.length === 0 && !loading && (
        <p className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
          پستی برای نمایش نیست.
        </p>
      )}

      {state.hasMore && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
          >
            {loading ? "در حال بارگذاری…" : "پست‌های بیشتر"}
          </button>
        </div>
      )}
    </div>
  );
}
