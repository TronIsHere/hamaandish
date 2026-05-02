import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";

export type NotificationType =
  | "comment_on_post"
  | "reply_to_comment"
  | "vote_milestone";

type NotificationDoc = {
  _id: ObjectId;
  userId: string;
  type: NotificationType;
  read: boolean;
  postId: string;
  postTitle: string;
  commentId?: string;
  actorName?: string;
  milestone?: number;
  createdAt: Date;
};

export type PublicNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  read: boolean;
  postId: string;
  postTitle: string;
  commentId?: string;
  actorName?: string;
  milestone?: number;
  createdAt: Date;
};

const VOTE_MILESTONES = [10, 20, 30, 100, 200, 500];

async function getCol() {
  const db = await getAppDb();
  const col = db.collection<NotificationDoc>("notifications");
  await col.createIndex({ userId: 1, createdAt: -1 });
  await col.createIndex({ userId: 1, read: 1 });
  await col.createIndex({ postId: 1, type: 1, milestone: 1 });
  return col;
}

function docToPublic(doc: NotificationDoc): PublicNotification {
  return {
    id: doc._id.toHexString(),
    userId: doc.userId,
    type: doc.type,
    read: doc.read,
    postId: doc.postId,
    postTitle: doc.postTitle,
    commentId: doc.commentId,
    actorName: doc.actorName,
    milestone: doc.milestone,
    createdAt: doc.createdAt,
  };
}

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  postId: string;
  postTitle: string;
  commentId?: string;
  actorName?: string;
  milestone?: number;
}): Promise<void> {
  const col = await getCol();
  const doc: NotificationDoc = {
    _id: new ObjectId(),
    userId: input.userId,
    type: input.type,
    read: false,
    postId: input.postId,
    postTitle: input.postTitle,
    createdAt: new Date(),
  };
  if (input.commentId) doc.commentId = input.commentId;
  if (input.actorName) doc.actorName = input.actorName;
  if (input.milestone !== undefined) doc.milestone = input.milestone;
  await col.insertOne(doc);
}

export async function getNotificationsForUser(
  userId: string,
  limit = 50,
): Promise<PublicNotification[]> {
  const col = await getCol();
  const docs = await col
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map(docToPublic);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const col = await getCol();
  return col.countDocuments({ userId, read: false });
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
): Promise<void> {
  if (!ObjectId.isValid(notificationId)) return;
  const col = await getCol();
  await col.updateOne(
    { _id: new ObjectId(notificationId), userId },
    { $set: { read: true } },
  );
}

export async function markAllRead(userId: string): Promise<void> {
  const col = await getCol();
  await col.updateMany({ userId, read: false }, { $set: { read: true } });
}

/** Returns which milestones have NOT yet been notified for a post. */
export async function getPendingMilestones(
  postId: string,
  upvotes: number,
): Promise<number[]> {
  const col = await getCol();
  const existing = await col
    .find(
      { postId, type: "vote_milestone" },
      { projection: { milestone: 1 } },
    )
    .toArray();
  const notifiedSet = new Set(existing.map((d) => d.milestone));
  return VOTE_MILESTONES.filter(
    (m) => upvotes >= m && !notifiedSet.has(m),
  );
}
