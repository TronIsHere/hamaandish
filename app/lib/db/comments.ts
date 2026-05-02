import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";
import { createNotification } from "@/app/lib/db/notifications";

type CommentDoc = {
  _id: ObjectId;
  postId: string;
  /** null / missing = top-level comment on the post */
  parentId?: string | null;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  /** When true, body is cleared and UI shows a moderation placeholder. */
  deletedByAdmin?: boolean;
};

export type PublicComment = {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  deletedByAdmin: boolean;
};

export type CommentTreeNode = PublicComment & {
  replies: CommentTreeNode[];
};

async function getCol() {
  const db = await getAppDb();
  const col = db.collection<CommentDoc>("comments");
  await col.createIndex({ postId: 1, createdAt: 1 });
  await col.createIndex({ postId: 1, parentId: 1 });
  return col;
}

function docToPublic(doc: CommentDoc): PublicComment {
  const deleted = doc.deletedByAdmin === true;
  return {
    id: doc._id.toHexString(),
    postId: doc.postId,
    parentId:
      typeof doc.parentId === "string" && ObjectId.isValid(doc.parentId)
        ? doc.parentId
        : null,
    authorId: doc.authorId,
    authorName: doc.authorName,
    body: deleted ? "" : doc.body,
    upvotes: doc.upvotes,
    downvotes: doc.downvotes,
    createdAt: doc.createdAt,
    deletedByAdmin: deleted,
  };
}

/** Builds a nested tree from a flat list (any order). orphan replies attach as roots. */
export function nestComments(flat: PublicComment[]): CommentTreeNode[] {
  const byId = new Map<string, CommentTreeNode>();
  for (const c of flat) {
    byId.set(c.id, { ...c, replies: [] });
  }

  const roots: CommentTreeNode[] = [];

  for (const c of flat) {
    const node = byId.get(c.id)!;
    const parentId = c.parentId;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortTree(nodes: CommentTreeNode[]) {
    nodes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    for (const n of nodes) sortTree(n.replies);
  }
  sortTree(roots);

  return roots;
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

export async function isCommentDeletedByAdmin(
  commentIdHex: string,
): Promise<boolean> {
  if (!ObjectId.isValid(commentIdHex)) return false;
  const col = await getCol();
  const doc = await col.findOne(
    { _id: new ObjectId(commentIdHex) },
    { projection: { deletedByAdmin: 1 } },
  );
  return doc?.deletedByAdmin === true;
}

/** Clears body and marks the comment as removed by a moderator; keeps the row (and replies). */
export async function softDeleteCommentByAdmin(
  commentIdHex: string,
): Promise<boolean> {
  if (!ObjectId.isValid(commentIdHex)) return false;
  const col = await getCol();
  const oid = new ObjectId(commentIdHex);
  const existing = await col.findOne(
    { _id: oid },
    { projection: { deletedByAdmin: 1 } },
  );
  if (!existing) return false;
  if (existing.deletedByAdmin === true) return true;
  await col.updateOne(
    { _id: oid },
    { $set: { deletedByAdmin: true, body: "" } },
  );
  return true;
}

export async function createComment(input: {
  postId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  body: string;
}): Promise<PublicComment | null> {
  if (!ObjectId.isValid(input.postId)) return null;
  const parentIdHex =
    typeof input.parentId === "string" &&
    input.parentId.length > 0 &&
    ObjectId.isValid(input.parentId)
      ? input.parentId
      : null;

  const col = await getCol();
  const db = await getAppDb();
  const postCol = db.collection("posts");

  const oid = new ObjectId(input.postId);
  const postDoc = await postCol.findOne(
    { _id: oid },
    { projection: { _id: 1, authorId: 1, authorName: 1, title: 1 } },
  ) as { _id: ObjectId; authorId: string; authorName: string; title: string } | null;
  if (!postDoc) return null;

  let parentAuthorId: string | null = null;
  let parentAuthorName: string | null = null;
  if (parentIdHex) {
    const parent = await col.findOne(
      {
        _id: new ObjectId(parentIdHex),
        postId: input.postId,
      },
      { projection: { _id: 1, authorId: 1, authorName: 1 } },
    ) as { _id: ObjectId; authorId: string; authorName: string } | null;
    if (!parent) return null;
    parentAuthorId = parent.authorId;
    parentAuthorName = parent.authorName;
  }

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
  if (parentIdHex) {
    doc.parentId = parentIdHex;
  }

  await col.insertOne(doc);
  await postCol.updateOne({ _id: oid }, { $inc: { commentsCount: 1 } });

  const commentId = doc._id.toHexString();
  const postTitle = postDoc.title;

  if (parentIdHex && parentAuthorId && parentAuthorName) {
    // Notify parent comment author about the reply (skip if replying to yourself)
    if (parentAuthorId !== input.authorId) {
      createNotification({
        userId: parentAuthorId,
        type: "reply_to_comment",
        postId: input.postId,
        postTitle,
        commentId,
        actorName: input.authorName,
      }).catch(() => {});
    }
  } else {
    // Notify post author about the comment (skip if commenting on own post)
    if (postDoc.authorId !== input.authorId) {
      createNotification({
        userId: postDoc.authorId,
        type: "comment_on_post",
        postId: input.postId,
        postTitle,
        commentId,
        actorName: input.authorName,
      }).catch(() => {});
    }
  }

  return docToPublic(doc);
}
