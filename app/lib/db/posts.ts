import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";
import { escapeRegExp } from "@/app/lib/utils";

type PostDoc = {
  _id: ObjectId;
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
};

export type PublicPost = {
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
};

/** Reddit-style hot ranking (time + vote magnitude). */
const REDDIT_EPOCH_SEC = 1134028003;

export type FeedSort = "new" | "hot";

/** Initial page size for post feeds (home + community). */
export const FEED_PAGE_SIZE = 12;

export type PaginatedPosts = {
  posts: PublicPost[];
  hasMore: boolean;
  /** For "new" / joined feeds: pass to the next page request. */
  nextCursor: string | null;
  /** For "hot" feed: pass as offset to the next page request. */
  nextHotOffset: number | null;
};

function hotRanking(post: PublicPost): number {
  const s = post.upvotes - post.downvotes;
  const order = Math.log10(Math.max(Math.abs(s), 1));
  const sign = s > 0 ? 1 : s < 0 ? -1 : 0;
  const seconds = post.createdAt.getTime() / 1000 - REDDIT_EPOCH_SEC;
  return sign * order + seconds / 45000;
}

function sortByHot(posts: PublicPost[]): PublicPost[] {
  return [...posts].sort((a, b) => hotRanking(b) - hotRanking(a));
}

function encodeFeedCursor(createdAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({ ca: createdAt.getTime(), id }),
    "utf8",
  ).toString("base64url");
}

export function parseFeedCursor(raw: string): {
  createdAt: Date;
  id: string;
} | null {
  try {
    const j = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      ca?: unknown;
      id?: unknown;
    };
    if (typeof j.ca !== "number" || typeof j.id !== "string") return null;
    if (!ObjectId.isValid(j.id)) return null;
    return { createdAt: new Date(j.ca), id: j.id };
  } catch {
    return null;
  }
}

async function getCol() {
  const db = await getAppDb();
  const col = db.collection<PostDoc>("posts");
  await col.createIndex({ communitySlug: 1, createdAt: -1 });
  await col.createIndex({ createdAt: -1 });
  return col;
}

function docToPublic(doc: PostDoc): PublicPost {
  return {
    id: doc._id.toHexString(),
    communitySlug: doc.communitySlug,
    communityName: doc.communityName,
    authorId: doc.authorId,
    authorName: doc.authorName,
    title: doc.title,
    body: doc.body,
    upvotes: doc.upvotes,
    downvotes: doc.downvotes,
    commentsCount: doc.commentsCount,
    createdAt: doc.createdAt,
  };
}

export async function createPost(input: {
  communitySlug: string;
  communityName: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
}): Promise<PublicPost> {
  const col = await getCol();
  const doc: PostDoc = {
    _id: new ObjectId(),
    communitySlug: input.communitySlug,
    communityName: input.communityName,
    authorId: input.authorId,
    authorName: input.authorName,
    title: input.title,
    body: input.body,
    upvotes: 0,
    downvotes: 0,
    commentsCount: 0,
    createdAt: new Date(),
  };
  await col.insertOne(doc);
  return docToPublic(doc);
}

export async function countPostsByCommunity(communitySlug: string): Promise<number> {
  const col = await getCol();
  return col.countDocuments({ communitySlug });
}

export async function getPostsByCommunityPage(options: {
  communitySlug: string;
  sort: FeedSort;
  limit: number;
  cursor?: { createdAt: Date; id: string } | null;
  hotOffset?: number;
}): Promise<PaginatedPosts> {
  const { communitySlug, sort, limit } = options;
  const cursor = options.cursor ?? null;
  const hotOffset = options.hotOffset ?? 0;
  const col = await getCol();

  if (sort === "new") {
    const filter: Record<string, unknown> = { communitySlug };
    if (cursor) {
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        {
          createdAt: cursor.createdAt,
          _id: { $lt: new ObjectId(cursor.id) },
        },
      ];
    }
    const docs = await col
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .toArray();
    const hasMore = docs.length > limit;
    const slice = docs.slice(0, limit);
    const posts = slice.map(docToPublic);
    const last = posts[posts.length - 1];
    return {
      posts,
      hasMore,
      nextCursor:
        hasMore && last
          ? encodeFeedCursor(last.createdAt, last.id)
          : null,
      nextHotOffset: null,
    };
  }

  const windowLimit = Math.max((hotOffset + limit) * 8, 120);
  const docs = await col
    .find({ communitySlug })
    .sort({ createdAt: -1 })
    .limit(windowLimit)
    .toArray();
  const sorted = sortByHot(docs.map(docToPublic));
  const posts = sorted.slice(hotOffset, hotOffset + limit);
  const hasMore =
    posts.length === limit &&
    (hotOffset + limit < sorted.length || docs.length === windowLimit);
  return {
    posts,
    hasMore,
    nextCursor: null,
    nextHotOffset: hasMore ? hotOffset + limit : null,
  };
}

export async function getPostsByCommunity(
  communitySlug: string,
  limit = 50,
  sort: FeedSort = "new",
): Promise<PublicPost[]> {
  const { posts } = await getPostsByCommunityPage({
    communitySlug,
    sort,
    limit,
    hotOffset: 0,
  });
  return posts;
}

export async function getRecentPosts(limit = 30): Promise<PublicPost[]> {
  return getHomeFeedPosts({ sort: "new", limit });
}

export async function getHomeFeedPostsPage(options: {
  sort: FeedSort;
  communitySlugsIn?: string[];
  limit: number;
  cursor?: { createdAt: Date; id: string } | null;
  hotOffset?: number;
}): Promise<PaginatedPosts> {
  const { sort, limit } = options;
  const cursor = options.cursor ?? null;
  const hotOffset = options.hotOffset ?? 0;
  const col = await getCol();

  if (
    options.communitySlugsIn !== undefined &&
    options.communitySlugsIn.length === 0
  ) {
    return {
      posts: [],
      hasMore: false,
      nextCursor: null,
      nextHotOffset: null,
    };
  }

  const match =
    options.communitySlugsIn !== undefined
      ? { communitySlug: { $in: options.communitySlugsIn } }
      : {};

  if (sort === "new") {
    const filter: Record<string, unknown> = { ...match };
    if (cursor) {
      filter.$or = [
        { createdAt: { $lt: cursor.createdAt } },
        {
          createdAt: cursor.createdAt,
          _id: { $lt: new ObjectId(cursor.id) },
        },
      ];
    }
    const docs = await col
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .toArray();
    const hasMore = docs.length > limit;
    const slice = docs.slice(0, limit);
    const posts = slice.map(docToPublic);
    const last = posts[posts.length - 1];
    return {
      posts,
      hasMore,
      nextCursor:
        hasMore && last
          ? encodeFeedCursor(last.createdAt, last.id)
          : null,
      nextHotOffset: null,
    };
  }

  const windowLimit = Math.max((hotOffset + limit) * 8, 120);
  const docs = await col
    .find(match)
    .sort({ createdAt: -1 })
    .limit(windowLimit)
    .toArray();
  const sorted = sortByHot(docs.map(docToPublic));
  const posts = sorted.slice(hotOffset, hotOffset + limit);
  const hasMore =
    posts.length === limit &&
    (hotOffset + limit < sorted.length || docs.length === windowLimit);
  return {
    posts,
    hasMore,
    nextCursor: null,
    nextHotOffset: hasMore ? hotOffset + limit : null,
  };
}

export async function getHomeFeedPosts(options: {
  sort: FeedSort;
  /** When set, only posts from these communities (e.g. joined). */
  communitySlugsIn?: string[];
  limit?: number;
}): Promise<PublicPost[]> {
  const limit = options.limit ?? 30;
  const { posts } = await getHomeFeedPostsPage({
    sort: options.sort,
    communitySlugsIn: options.communitySlugsIn,
    limit,
    hotOffset: 0,
  });
  return posts;
}

export async function getPostById(id: string): Promise<PublicPost | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await getCol();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? docToPublic(doc) : null;
}

/** Full-text–style preview search over title and HTML body (newest first). */
export async function searchPostsByText(
  rawQuery: string,
  limit = 3,
): Promise<PublicPost[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const pattern = escapeRegExp(q);
  const col = await getCol();
  const docs = await col
    .find({
      $or: [
        { title: { $regex: pattern, $options: "i" } },
        { body: { $regex: pattern, $options: "i" } },
      ],
    })
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .toArray();
  return docs.map(docToPublic);
}

/** Removes votes, comments, notifications, then the post. */
export async function deletePostById(postIdHex: string): Promise<boolean> {
  if (!ObjectId.isValid(postIdHex)) return false;
  const db = await getAppDb();
  const postsCol = db.collection("posts");
  const oid = new ObjectId(postIdHex);
  const exists = await postsCol.findOne(
    { _id: oid },
    { projection: { _id: 1 } },
  );
  if (!exists) return false;

  const commentsCol = db.collection("comments");
  const commentDocs = await commentsCol
    .find({ postId: postIdHex })
    .project({ _id: 1 })
    .toArray();
  const commentIds = commentDocs.map((c) => c._id.toHexString());

  if (commentIds.length > 0) {
    await db.collection("comment_votes").deleteMany({
      commentId: { $in: commentIds },
    });
  }
  await commentsCol.deleteMany({ postId: postIdHex });
  await db.collection("post_votes").deleteMany({ postId: postIdHex });
  await db.collection("notifications").deleteMany({ postId: postIdHex });

  const res = await postsCol.deleteOne({ _id: oid });
  return res.deletedCount === 1;
}
