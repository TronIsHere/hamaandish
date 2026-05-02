import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaBookmark, FaCommentDots } from "react-icons/fa6";
import {
  PostCommentsSection,
  type SerializedCommentNode,
} from "@/app/components/post/post-comments-section";
import { PostVoteBar } from "@/app/components/post/post-vote-bar";
import { SiteHeader } from "@/app/components/site-header";
import { getSessionUser } from "@/app/lib/auth/session";
import { isAdminEmail } from "@/app/lib/auth/admin";
import { getUserCommentVotes } from "@/app/lib/db/comment-votes";
import { listCommentsByPost, nestComments, type CommentTreeNode } from "@/app/lib/db/comments";
import { getUserPostVote } from "@/app/lib/db/post-votes";
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
    description: post.body.replace(/<[^>]*>/g, " ").trim().slice(0, 160),
  };
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  const user = await getSessionUser();
  const [comments, userPostVote] = await Promise.all([
    listCommentsByPost(id),
    getUserPostVote(user?.id, id),
  ]);
  const votesByComment = await getUserCommentVotes(
    user?.id,
    comments.map((c) => c.id),
  );

  const pageIsAdmin = Boolean(user && isAdminEmail(user.email));

  function serializeTree(nodes: CommentTreeNode[]): SerializedCommentNode[] {
    return nodes.map((n) => ({
      id: n.id,
      parentId: n.parentId,
      authorName: n.authorName,
      body: n.body,
      createdAt: n.createdAt.toISOString(),
      upvotes: n.upvotes,
      downvotes: n.downvotes,
      userVote: votesByComment[n.id] ?? null,
      deletedByAdmin: n.deletedByAdmin,
      replies: serializeTree(n.replies),
    }));
  }

  const commentTreeRoots = serializeTree(nestComments(comments));

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
          <div
            className="post-body mt-4 text-base leading-8 text-zinc-700"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <div className="mt-6 space-y-3 border-t border-zinc-100 pt-4 text-sm">
            <PostVoteBar
              key={`pv-${post.id}-${post.upvotes}-${post.downvotes}-${userPostVote ?? "none"}`}
              postId={post.id}
              initialUpvotes={post.upvotes}
              initialDownvotes={post.downvotes}
              initialUserVote={userPostVote}
              isLoggedIn={Boolean(user)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-800">
                <FaCommentDots className="size-3.5" />
                {toPersian(post.commentsCount)} دیدگاه
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-800 transition hover:bg-zinc-200"
              >
                <FaBookmark className="size-3.5" />
                ذخیره
              </button>
            </div>
          </div>
        </article>

        <PostCommentsSection
          postId={post.id}
          initialCommentTree={commentTreeRoots}
          isLoggedIn={Boolean(user)}
          isAdmin={pageIsAdmin}
        />
      </main>
    </div>
  );
}
