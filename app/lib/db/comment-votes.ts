import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";

type CommentVoteDoc = {
  userId: string;
  commentId: string;
  value: 1 | -1;
};

async function votesCol() {
  const db = await getAppDb();
  const col = db.collection<CommentVoteDoc>("comment_votes");
  await col.createIndex({ userId: 1, commentId: 1 }, { unique: true });
  return col;
}

export async function getUserCommentVotes(
  userId: string | undefined,
  commentIds: string[],
): Promise<Record<string, 1 | -1>> {
  if (!userId || commentIds.length === 0) return {};
  const validIds = commentIds.filter((id) => ObjectId.isValid(id));
  if (validIds.length === 0) return {};

  const col = await votesCol();
  const docs = await col
    .find({ userId, commentId: { $in: validIds } })
    .toArray();

  const out: Record<string, 1 | -1> = {};
  for (const d of docs) {
    out[d.commentId] = d.value;
  }
  return out;
}

export async function toggleCommentVote(
  userId: string,
  commentId: string,
  direction: "up" | "down",
): Promise<{
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
} | null> {
  if (!ObjectId.isValid(commentId)) return null;

  const desired: 1 | -1 = direction === "up" ? 1 : -1;
  const col = await votesCol();
  const db = await getAppDb();
  const comments = db.collection<{ upvotes: number; downvotes: number }>(
    "comments",
  );
  const oid = new ObjectId(commentId);

  const existing = await col.findOne({ userId, commentId });

  let incUp = 0;
  let incDown = 0;
  let userVote: 1 | -1 | null;

  if (!existing) {
    incUp = desired === 1 ? 1 : 0;
    incDown = desired === -1 ? 1 : 0;
    await col.insertOne({ userId, commentId, value: desired });
    userVote = desired;
  } else if (existing.value === desired) {
    incUp = desired === 1 ? -1 : 0;
    incDown = desired === -1 ? -1 : 0;
    await col.deleteOne({ userId, commentId });
    userVote = null;
  } else {
    incUp = desired === 1 ? 1 : -1;
    incDown = desired === -1 ? 1 : -1;
    await col.replaceOne(
      { userId, commentId },
      { userId, commentId, value: desired },
    );
    userVote = desired;
  }

  const updated = await comments.findOneAndUpdate(
    { _id: oid },
    { $inc: { upvotes: incUp, downvotes: incDown } },
    { returnDocument: "after" },
  );

  if (!updated) return null;

  return {
    upvotes: updated.upvotes,
    downvotes: updated.downvotes,
    userVote,
  };
}
