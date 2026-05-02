import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";

type CommentDoc = {
  _id: ObjectId;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
};

export type PublicComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
};

async function getCol() {
  const db = await getAppDb();
  const col = db.collection<CommentDoc>("comments");
  await col.createIndex({ postId: 1, createdAt: 1 });
  return col;
}

function docToPublic(doc: CommentDoc): PublicComment {
  return {
    id: doc._id.toHexString(),
    postId: doc.postId,
    authorId: doc.authorId,
    authorName: doc.authorName,
    body: doc.body,
    upvotes: doc.upvotes,
    downvotes: doc.downvotes,
    createdAt: doc.createdAt,
  };
}

export async function listCommentsByPost(postId: string): Promise<PublicComment[]> {
  if (!ObjectId.isValid(postId)) return [];
  const col = await getCol();
  const docs = await col
    .find({ postId })
    .sort({ createdAt: 1 })
    .limit(500)
    .toArray();
  return docs.map(docToPublic);
}

export async function createComment(input: {
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
}): Promise<PublicComment | null> {
  if (!ObjectId.isValid(input.postId)) return null;
  const col = await getCol();
  const db = await getAppDb();
  const postCol = db.collection("posts");

  const oid = new ObjectId(input.postId);
  const postExists = await postCol.findOne(
    { _id: oid },
    { projection: { _id: 1 } },
  );
  if (!postExists) return null;

  const doc: CommentDoc = {
    _id: new ObjectId(),
    postId: input.postId,
    authorId: input.authorId,
    authorName: input.authorName,
    body: input.body,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date(),
  };

  await col.insertOne(doc);
  await postCol.updateOne({ _id: oid }, { $inc: { commentsCount: 1 } });
  return docToPublic(doc);
}
