import { NextResponse } from "next/server";
import {
  FEED_PAGE_SIZE,
  getHomeFeedPostsPage,
  parseFeedCursor,
} from "@/app/lib/db/posts";
import { getMemberCommunitySlugs } from "@/app/lib/db/memberships";
import { getSessionUser } from "@/app/lib/auth/session";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedRaw = searchParams.get("feed")?.toLowerCase();
  const feed =
    feedRaw === "hot" || feedRaw === "joined" ? feedRaw : "new";
  const cursorParam = searchParams.get("cursor");
  const offsetRaw = searchParams.get("offset");
  const hotOffset = offsetRaw ? Math.max(0, parseInt(offsetRaw, 10) || 0) : 0;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const joinedSlugs =
    feed === "joined"
      ? await getMemberCommunitySlugs(user.id).catch(() => [] as string[])
      : [];

  const parsedCursor =
    cursorParam && feed !== "hot" ? parseFeedCursor(cursorParam) : null;
  if (cursorParam && feed !== "hot" && !parsedCursor) {
    return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
  }

  try {
    const page = await getHomeFeedPostsPage({
      sort: feed === "hot" ? "hot" : "new",
      communitySlugsIn: feed === "joined" ? joinedSlugs : undefined,
      limit: FEED_PAGE_SIZE,
      cursor: parsedCursor,
      hotOffset: feed === "hot" ? hotOffset : 0,
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
      { error: "Failed to load feed" },
      { status: 500 },
    );
  }
}
