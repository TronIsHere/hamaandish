"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  FaArrowDown,
  FaArrowUp,
  FaCommentDots,
} from "react-icons/fa6";
import {
  estimateReadTime,
  formatRelativeTime,
  getAvatarColor,
  getInitials,
} from "@/app/lib/utils";
import { AdminDeletePostButton } from "@/app/components/admin/delete-post-button";
import { AdminFeedCommentsPanel } from "@/app/components/admin/feed-comment-moderation";

export type PostJson = {
  id: string;
  communitySlug: string;
  communityName: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  upvotes: number;
  downvotes: number;
  commentsCount: number;
  createdAt: string;
};

function toPersian(n: number): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]!);
}

type PaginationState = {
  posts: PostJson[];
  hasMore: boolean;
  nextCursor: string | null;
  nextHotOffset: number | null;
};

export function HomePaginatedPostFeed(props: {
  feedTab: "new" | "hot" | "joined";
  initialPosts: PostJson[];
  initialHasMore: boolean;
  initialNextCursor: string | null;
  initialNextHotOffset: number | null;
  showAdminDelete?: boolean;
}) {
  const [state, setState] = useState<PaginationState>({
    posts: props.initialPosts,
    hasMore: props.initialHasMore,
    nextCursor: props.initialNextCursor,
    nextHotOffset: props.initialNextHotOffset,
  });
  const [loading, setLoading] = useState(false);

  const removePost = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      posts: s.posts.filter((p) => p.id !== id),
    }));
  }, []);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || loading) return;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("feed", props.feedTab);
      if (props.feedTab === "hot") {
        q.set("offset", String(state.nextHotOffset ?? 0));
      } else if (state.nextCursor) {
        q.set("cursor", state.nextCursor);
      }
      const res = await fetch(`/api/feed?${q}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        posts: PostJson[];
        hasMore: boolean;
        nextCursor: string | null;
        nextHotOffset: number | null;
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
    props.feedTab,
    state.hasMore,
    state.nextCursor,
    state.nextHotOffset,
  ]);

  return (
    <>
      {state.posts.map((post) => (
        <article
          key={post.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
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
              </div>

              <Link href={`/posts/${post.id}`} className="block">
                <h3 className="text-base font-bold leading-snug text-zinc-900 hover:text-orange-600">
                  {post.title}
                </h3>
              </Link>

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                {post.body.replace(/<[^>]*>/g, " ").trim()}
              </p>

              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium">
                  <FaArrowUp className="size-3" />
                  {toPersian(post.upvotes)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium">
                  <FaArrowDown className="size-3" />
                  {toPersian(post.downvotes)}
                </span>
                <Link
                  href={`/posts/${post.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-200"
                >
                  <FaCommentDots className="size-3.5" />
                  {toPersian(post.commentsCount)}
                </Link>
              </div>
            </div>
            {props.showAdminDelete && (
              <AdminDeletePostButton
                postId={post.id}
                onDeleted={() => removePost(post.id)}
                label="حذف"
              />
            )}
          </div>
          {props.showAdminDelete && <AdminFeedCommentsPanel postId={post.id} />}
        </article>
      ))}

      {state.hasMore && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
          >
            {loading ? "در حال بارگذاری…" : "پست‌های بیشتر"}
          </button>
        </div>
      )}
    </>
  );
}

export function CommunityPaginatedPostFeed(props: {
  slug: string;
  sort: "new" | "hot";
  initialPosts: PostJson[];
  initialHasMore: boolean;
  initialNextCursor: string | null;
  initialNextHotOffset: number | null;
  showAdminDelete?: boolean;
}) {
  const [state, setState] = useState<PaginationState>({
    posts: props.initialPosts,
    hasMore: props.initialHasMore,
    nextCursor: props.initialNextCursor,
    nextHotOffset: props.initialNextHotOffset,
  });
  const [loading, setLoading] = useState(false);

  const removePost = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      posts: s.posts.filter((p) => p.id !== id),
    }));
  }, []);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || loading) return;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("sort", props.sort);
      if (props.sort === "hot") {
        q.set("offset", String(state.nextHotOffset ?? 0));
      } else if (state.nextCursor) {
        q.set("cursor", state.nextCursor);
      }
      const res = await fetch(`/api/communities/${props.slug}/posts?${q}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        posts: PostJson[];
        hasMore: boolean;
        nextCursor: string | null;
        nextHotOffset: number | null;
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
    props.slug,
    props.sort,
    state.hasMore,
    state.nextCursor,
    state.nextHotOffset,
  ]);

  return (
    <>
      {state.posts.map((post) => (
        <article
          key={post.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${getAvatarColor(post.authorName)}`}
                >
                  {getInitials(post.authorName)}
                </span>
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

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                {post.body.replace(/<[^>]*>/g, " ").trim()}
              </p>

              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium">
                  <FaArrowUp className="size-3" />
                  {toPersian(post.upvotes)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium">
                  <FaArrowDown className="size-3" />
                  {toPersian(post.downvotes)}
                </span>
                <Link
                  href={`/posts/${post.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-200"
                >
                  <FaCommentDots className="size-3.5" />
                  {toPersian(post.commentsCount)}
                </Link>
              </div>
            </div>
            {props.showAdminDelete && (
              <AdminDeletePostButton
                postId={post.id}
                onDeleted={() => removePost(post.id)}
                label="حذف"
              />
            )}
          </div>
          {props.showAdminDelete && <AdminFeedCommentsPanel postId={post.id} />}
        </article>
      ))}

      {state.hasMore && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
          >
            {loading ? "در حال بارگذاری…" : "پست‌های بیشتر"}
          </button>
        </div>
      )}
    </>
  );
}
