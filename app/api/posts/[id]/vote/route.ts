import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import { getPostById } from "@/app/lib/db/posts";
import { togglePostVote } from "@/app/lib/db/post-votes";

type Params = { id: string };

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
  const post = await getPostById(id);
  if (!post) {
    return NextResponse.json({ error: "پست پیدا نشد." }, { status: 404 });
  }

  let body: { direction?: unknown };
  try {
    body = (await request.json()) as { direction?: unknown };
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const direction = body.direction === "down" ? "down" : "up";

  try {
    const result = await togglePostVote(user.id, id, direction);
    if (!result) {
      return NextResponse.json({ error: "پست پیدا نشد." }, { status: 404 });
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
