import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";

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

export async function getPostsByCommunity(
  communitySlug: string,
  limit = 50,
): Promise<PublicPost[]> {
  const col = await getCol();
  const docs = await col
    .find({ communitySlug })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(docToPublic);
}

export async function getRecentPosts(limit = 30): Promise<PublicPost[]> {
  const col = await getCol();
  const docs = await col
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(docToPublic);
}

export async function getPostById(id: string): Promise<PublicPost | null> {
  if (!ObjectId.isValid(id)) return null;
  const col = await getCol();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  return doc ? docToPublic(doc) : null;
}
