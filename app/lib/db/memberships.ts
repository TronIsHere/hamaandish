import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";

type MembershipDoc = {
  _id: ObjectId;
  userId: string;
  communitySlug: string;
  joinedAt: Date;
};

async function getCol() {
  const db = await getAppDb();
  const col = db.collection<MembershipDoc>("memberships");
  await col.createIndex({ userId: 1, communitySlug: 1 }, { unique: true });
  return col;
}

export async function isMember(
  userId: string,
  communitySlug: string,
): Promise<boolean> {
  const col = await getCol();
  const doc = await col.findOne({ userId, communitySlug });
  return doc !== null;
}

export async function joinCommunity(
  userId: string,
  communitySlug: string,
): Promise<void> {
  const col = await getCol();
  await col.insertOne({
    _id: new ObjectId(),
    userId,
    communitySlug,
    joinedAt: new Date(),
  });
}

export async function leaveCommunity(
  userId: string,
  communitySlug: string,
): Promise<void> {
  const col = await getCol();
  await col.deleteOne({ userId, communitySlug });
}

export async function getMemberCommunitySlugs(
  userId: string,
): Promise<string[]> {
  const col = await getCol();
  const docs = await col.find({ userId }).toArray();
  return docs.map((d) => d.communitySlug);
}
