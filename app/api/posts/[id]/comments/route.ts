import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSessionUser } from "@/app/lib/auth/session";
import { createComment, listCommentsByPost } from "@/app/lib/db/comments";
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

  let body: { body?: unknown; parentId?: unknown };
  try {
    body = (await request.json()) as { body?: unknown; parentId?: unknown };
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const parentRaw = body.parentId;
  let parentId: string | null = null;
  if (typeof parentRaw === "string" && parentRaw.trim().length > 0) {
    const trimmed = parentRaw.trim();
    if (!ObjectId.isValid(trimmed)) {
      return NextResponse.json({ error: "شناسه پاسخ نامعتبر است." }, { status: 400 });
    }
    parentId = trimmed;
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
      parentId,
      authorId: user.id,
      authorName: user.name,
      body: text,
    });

    if (!comment) {
      return NextResponse.json(
        { error: parentId ? "پاسخ نامعتبر است یا والد وجود ندارد." : "پست پیدا نشد." },
        { status: parentId ? 400 : 404 },
      );
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
