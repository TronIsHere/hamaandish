import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import { findCommunityBySlug } from "@/app/lib/db/communities";
import { isMember } from "@/app/lib/db/memberships";
import {
  createPost,
  FEED_PAGE_SIZE,
  getPostsByCommunityPage,
  parseFeedCursor,
  type FeedSort,
} from "@/app/lib/db/posts";

type Params = { slug: string };

function toJsonPost(p: {
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
  createdAt: Date;
}) {
  return {
    ...p,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const community = await findCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "انجمن پیدا نشد." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const sort: FeedSort =
    searchParams.get("sort")?.toLowerCase() === "hot" ? "hot" : "new";
  const cursorParam = searchParams.get("cursor");
  const offsetRaw = searchParams.get("offset");
  const hotOffset = offsetRaw ? Math.max(0, parseInt(offsetRaw, 10) || 0) : 0;

  const parsedCursor =
    cursorParam && sort === "new" ? parseFeedCursor(cursorParam) : null;
  if (cursorParam && sort === "new" && !parsedCursor) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  try {
    const page = await getPostsByCommunityPage({
      communitySlug: slug,
      sort,
      limit: FEED_PAGE_SIZE,
      cursor: parsedCursor,
      hotOffset: sort === "hot" ? hotOffset : 0,
    });

    return NextResponse.json({
      posts: page.posts.map(toJsonPost),
      hasMore: page.hasMore,
      nextCursor: page.nextCursor,
      nextHotOffset: page.nextHotOffset,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "مشکلی پیش آمد." },
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
      { error: "برای ارسال پست باید وارد حساب کاربری شوی." },
      { status: 401 },
    );
  }

  const { slug } = await params;
  const community = await findCommunityBySlug(slug);
  if (!community) {
    return NextResponse.json({ error: "انجمن پیدا نشد." }, { status: 404 });
  }

  const memberStatus = await isMember(user.id, slug);
  if (!memberStatus) {
    return NextResponse.json(
      { error: "فقط اعضای انجمن می‌توانند پست بگذارند." },
      { status: 403 },
    );
  }

  let body: { title?: string; body?: string };
  try {
    body = (await request.json()) as { title?: string; body?: string };
  } catch {
    return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  if (title.length < 5) {
    return NextResponse.json(
      { error: "عنوان پست باید حداقل ۵ کاراکتر باشد." },
      { status: 400 },
    );
  }
  if (title.length > 300) {
    return NextResponse.json(
      { error: "عنوان پست خیلی بلند است." },
      { status: 400 },
    );
  }

  const content = (body.body ?? "").trim();
  if (content.length < 10) {
    return NextResponse.json(
      { error: "متن پست باید حداقل ۱۰ کاراکتر باشد." },
      { status: 400 },
    );
  }

  try {
    const post = await createPost({
      communitySlug: slug,
      communityName: community.name,
      authorId: user.id,
      authorName: user.name,
      title,
      body: content,
    });

    return NextResponse.json({ ok: true, id: post.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "مشکلی پیش آمد. دوباره امتحان کن." },
      { status: 500 },
    );
  }
}
