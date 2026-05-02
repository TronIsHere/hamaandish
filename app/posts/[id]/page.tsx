import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaBookmark, FaCommentDots } from "react-icons/fa6";
import { PostCommentsSection } from "@/app/components/post/post-comments-section";
import { PostVoteBar } from "@/app/components/post/post-vote-bar";
import { SiteHeader } from "@/app/components/site-header";
import { getSessionUser } from "@/app/lib/auth/session";
import { getUserCommentVotes } from "@/app/lib/db/comment-votes";
import { listCommentsByPost } from "@/app/lib/db/comments";
import { isMember } from "@/app/lib/db/memberships";
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
    description: post.body.slice(0, 160),
  };
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  const user = await getSessionUser();
  const [comments, member, userPostVote] = await Promise.all([
    listCommentsByPost(id),
    user ? isMember(user.id, post.communitySlug) : Promise.resolve(false),
    getUserPostVote(user?.id, id),
  ]);
  const canEngage = Boolean(user && member);
  const votesByComment = await getUserCommentVotes(
    user?.id,
    comments.map((c) => c.id),
  );

  const serializedComments = comments.map((c) => ({
    id: c.id,
    authorName: c.authorName,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    upvotes: c.upvotes,
    downvotes: c.downvotes,
    userVote: votesByComment[c.id] ?? null,
  }));

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
          <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-zinc-700">
            {post.body}
          </p>

          <div className="mt-6 space-y-3 border-t border-zinc-100 pt-4 text-sm">
            <PostVoteBar
              key={`pv-${post.id}-${post.upvotes}-${post.downvotes}-${userPostVote ?? "none"}`}
              postId={post.id}
              communitySlug={post.communitySlug}
              initialUpvotes={post.upvotes}
              initialDownvotes={post.downvotes}
              initialUserVote={userPostVote}
              canVote={canEngage}
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
          communitySlug={post.communitySlug}
          initialComments={serializedComments}
          canCommentAndVote={canEngage}
          isLoggedIn={Boolean(user)}
        />
      </main>
    </div>
  );
}
