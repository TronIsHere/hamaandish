import { NextResponse } from "next/server";
import {
  FEED_PAGE_SIZE,
  getHomeFeedPostsPage,
  parseFeedCursor,
} from "@/app/lib/db/posts";
import { getAdminSession } from "@/app/lib/auth/admin";

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

/** Paginated global feed for admins (moderation UI). Query: cursor (new), offset (hot), sort=new|hot */
export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "غیرمجاز" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const sortRaw = searchParams.get("sort")?.toLowerCase();
  const sort = sortRaw === "hot" ? "hot" : "new";
  const cursorParam = searchParams.get("cursor");
  const offsetRaw = searchParams.get("offset");
  const hotOffset = offsetRaw ? Math.max(0, parseInt(offsetRaw, 10) || 0) : 0;

  const parsedCursor =
    cursorParam && sort !== "hot" ? parseFeedCursor(cursorParam) : null;
  if (cursorParam && sort !== "hot" && !parsedCursor) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  try {
    const page = await getHomeFeedPostsPage({
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
      { error: "خطا در بارگذاری فید مدیر" },
      { status: 500 },
    );
  }
}
