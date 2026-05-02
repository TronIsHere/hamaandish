import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";
import { getSessionUser } from "@/app/lib/auth/session";
import { toggleCommentVote } from "@/app/lib/db/comment-votes";
import { findCommunityBySlug } from "@/app/lib/db/communities";
import { isMember } from "@/app/lib/db/memberships";
import { getPostById } from "@/app/lib/db/posts";

type Params = { id: string };

async function commentPostId(commentId: string): Promise<string | null> {
  if (!ObjectId.isValid(commentId)) return null;
  const db = await getAppDb();
  const doc = await db.collection<{ postId: string }>("comments").findOne(
    { _id: new ObjectId(commentId) },
    { projection: { postId: 1 } },
  );
  return doc?.postId ?? null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "برای رأی‌دادن باید وارد حساب کاربری شوی." },
      { status: 401 },
    );
  }

  const { id } = await params;

  let body: { direction?: unknown };
  try {
    body = (await request.json()) as { direction?: unknown };
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const direction = body.direction === "down" ? "down" : "up";

  const postId = await commentPostId(id);
  if (!postId) {
    return NextResponse.json({ error: "دیدگاه پیدا نشد." }, { status: 404 });
  }

  const post = await getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "پست پیدا نشد." }, { status: 404 });
  }

  const community = await findCommunityBySlug(post.communitySlug);
  if (!community) {
    return NextResponse.json({ error: "انجمن پیدا نشد." }, { status: 404 });
  }

  const member = await isMember(user.id, post.communitySlug);
  if (!member) {
    return NextResponse.json(
      { error: "برای رأی‌دادن باید عضو این انجمن باشی." },
      { status: 403 },
    );
  }

  try {
    const result = await toggleCommentVote(user.id, id, direction);
    if (!result) {
      return NextResponse.json({ error: "دیدگاه پیدا نشد." }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      upvotes: result.upvotes,
      downvotes: result.downvotes,
      userVote: result.userVote,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "مشکلی پیش آمد. دوباره امتحان کن." },
      { status: 500 },
    );
  }
}
