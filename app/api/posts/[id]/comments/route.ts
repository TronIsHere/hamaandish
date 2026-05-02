import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import { findCommunityBySlug } from "@/app/lib/db/communities";
import { createComment, listCommentsByPost } from "@/app/lib/db/comments";
import { isMember } from "@/app/lib/db/memberships";
import { getPostById } from "@/app/lib/db/posts";

type Params = { id: string };

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "پست پیدا نشد." }, { status: 404 });
  }

  try {
    const comments = await listCommentsByPost(id);
    return NextResponse.json({ ok: true, comments });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "مشکلی پیش آمد. دوباره امتحان کن." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "برای ثبت دیدگاه باید وارد حساب کاربری شوی." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const post = await getPostById(id);
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
      { error: "فقط اعضای انجمن می‌توانند دیدگاه بگذارند." },
      { status: 403 },
    );
  }

  let body: { body?: unknown };
  try {
    body = (await request.json()) as { body?: unknown };
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const text =
    typeof body.body === "string" ? body.body.trim() : String(body.body ?? "").trim();

  if (text.length < 2) {
    return NextResponse.json(
      { error: "متن دیدگاه خیلی کوتاه است." },
      { status: 400 },
    );
  }
  if (text.length > 5000) {
    return NextResponse.json(
      { error: "متن دیدگاه خیلی بلند است." },
      { status: 400 },
    );
  }

  try {
    const comment = await createComment({
      postId: id,
      authorId: user.id,
      authorName: user.name,
      body: text,
    });

    if (!comment) {
      return NextResponse.json({ error: "پست پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, comment }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "مشکلی پیش آمد. دوباره امتحان کن." },
      { status: 500 },
    );
  }
}
