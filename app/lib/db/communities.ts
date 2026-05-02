import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";

type CommunityDoc = {
  _id: ObjectId;
  slug: string;
  name: string;
  description: string;
  icon: string;
  ownerUserId: string;
  memberCount: number;
  createdAt: Date;
};

export type PublicCommunity = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  ownerUserId: string;
  memberCount: number;
  createdAt: Date;
};

async function getCol() {
  const db = await getAppDb();
  const col = db.collection<CommunityDoc>("communities");
  await col.createIndex({ slug: 1 }, { unique: true });
  return col;
}

function docToPublic(doc: CommunityDoc): PublicCommunity {
  return {
    id: doc._id.toHexString(),
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    icon: doc.icon,
    ownerUserId: doc.ownerUserId,
    memberCount: doc.memberCount,
    createdAt: doc.createdAt,
  };
}

export async function findCommunityBySlug(
  slug: string,
): Promise<PublicCommunity | null> {
  const col = await getCol();
  const doc = await col.findOne({ slug });
  return doc ? docToPublic(doc) : null;
}

export async function listCommunities(): Promise<PublicCommunity[]> {
  const col = await getCol();
  const docs = await col
    .find({})
    .sort({ memberCount: -1 })
    .limit(50)
    .toArray();
  return docs.map(docToPublic);
}

export async function createCommunity(input: {
  slug: string;
  name: string;
  description: string;
  icon: string;
  ownerUserId: string;
}): Promise<PublicCommunity> {
  const col = await getCol();
  const doc: CommunityDoc = {
    _id: new ObjectId(),
    slug: input.slug,
    name: input.name,
    description: input.description,
    icon: input.icon,
    ownerUserId: input.ownerUserId,
    memberCount: 1,
    createdAt: new Date(),
  };
  await col.insertOne(doc);
  return docToPublic(doc);
}

export async function incrementMemberCount(slug: string, delta: 1 | -1) {
  const col = await getCol();
  await col.updateOne({ slug }, { $inc: { memberCount: delta } });
}

/** Removes the community doc and dependent rows (posts, comments, votes, notifications, memberships). */
export async function deleteCommunityAndRelated(slug: string): Promise<boolean> {
  const db = await getAppDb();
  const postsCol = db.collection("posts");
  const postDocs = await postsCol
    .find({ communitySlug: slug })
    .project({ _id: 1 })
    .toArray();
  const postIds = postDocs.map((p) => p._id.toHexString());

  if (postIds.length > 0) {
    const commentsCol = db.collection("comments");
    const commentDocs = await commentsCol
      .find({ postId: { $in: postIds } })
      .project({ _id: 1 })
      .toArray();
    const commentIds = commentDocs.map((c) => c._id.toHexString());

    if (commentIds.length > 0) {
      await db.collection("comment_votes").deleteMany({
        commentId: { $in: commentIds },
      });
    }
    await commentsCol.deleteMany({ postId: { $in: postIds } });
    await db.collection("post_votes").deleteMany({ postId: { $in: postIds } });
    await db
      .collection("notifications")
      .deleteMany({ postId: { $in: postIds } });
  }

  await postsCol.deleteMany({ communitySlug: slug });
  await db.collection("memberships").deleteMany({ communitySlug: slug });

  const col = await getCol();
  const result = await col.deleteOne({ slug });
  return result.deletedCount === 1;
}

const LATIN_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Normalizes user input to a lowercase ASCII slug fragment (may be invalid / empty). */
export function normalizeLatinSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF\u200C]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export function isValidCommunitySlug(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 50 && LATIN_SLUG.test(slug);
}
