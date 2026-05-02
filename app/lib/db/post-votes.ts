import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";

type PostVoteDoc = {
  userId: string;
  postId: string;
  value: 1 | -1;
};

async function votesCol() {
  const db = await getAppDb();
  const col = db.collection<PostVoteDoc>("post_votes");
  await col.createIndex({ userId: 1, postId: 1 }, { unique: true });
  return col;
}

export async function getUserPostVote(
  userId: string | undefined,
  postId: string,
): Promise<1 | -1 | null> {
  if (!userId || !ObjectId.isValid(postId)) return null;
  const col = await votesCol();
  const doc = await col.findOne({ userId, postId });
  return doc ? doc.value : null;
}

/** Toggle: clicking the same direction again removes the vote. */
export async function togglePostVote(
  userId: string,
  postId: string,
  direction: "up" | "down",
): Promise<{
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
} | null> {
  if (!ObjectId.isValid(postId)) return null;

  const desired: 1 | -1 = direction === "up" ? 1 : -1;
  const col = await votesCol();
  const db = await getAppDb();
  const posts = db.collection<{ upvotes: number; downvotes: number }>("posts");
  const oid = new ObjectId(postId);

  const existing = await col.findOne({ userId, postId });

  let incUp = 0;
  let incDown = 0;
  let userVote: 1 | -1 | null;

  if (!existing) {
    incUp = desired === 1 ? 1 : 0;
    incDown = desired === -1 ? 1 : 0;
    await col.insertOne({ userId, postId, value: desired });
    userVote = desired;
  } else if (existing.value === desired) {
    incUp = desired === 1 ? -1 : 0;
    incDown = desired === -1 ? -1 : 0;
    await col.deleteOne({ userId, postId });
    userVote = null;
  } else {
    incUp = desired === 1 ? 1 : -1;
    incDown = desired === -1 ? 1 : -1;
    await col.replaceOne({ userId, postId }, { userId, postId, value: desired });
    userVote = desired;
  }

  const updated = await posts.findOneAndUpdate(
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
