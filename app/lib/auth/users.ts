import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";
import { escapeRegExp } from "@/app/lib/utils";

export type AccountStatus = "pending" | "approved";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  accountStatus: AccountStatus;
  referrerUserIdHex?: string;
};

export type PendingRegistrationRow = {
  id: string;
  email: string;
  name: string;
  referrerUserIdHex?: string;
  createdAt: Date;
};

type UserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  password_hash: string;
  createdAt: Date;
  accountStatus?: AccountStatus;
  referrerUserIdHex?: string;
  approvedAt?: Date;
};

function docAccountStatus(doc: UserDoc): AccountStatus {
  return doc.accountStatus ?? "approved";
}

async function getUsersCollection() {
  const db = await getAppDb();
  const col = db.collection<UserDoc>("users");
  await col.createIndex({ email: 1 }, { unique: true });
  await col.createIndex({ accountStatus: 1 });
  return col;
}

function docToUser(doc: UserDoc): DbUser {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    password_hash: doc.password_hash,
    accountStatus: docAccountStatus(doc),
    referrerUserIdHex: doc.referrerUserIdHex,
  };
}

export async function isUserAccountApproved(userIdHex: string): Promise<boolean> {
  if (!ObjectId.isValid(userIdHex)) return false;
  const col = await getUsersCollection();
  const doc = await col.findOne(
    { _id: new ObjectId(userIdHex) },
    { projection: { accountStatus: 1 } },
  );
  if (!doc) return false;
  return docAccountStatus(doc) === "approved";
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const col = await getUsersCollection();
  const normalized = email.trim().toLowerCase();
  const doc = await col.findOne({ email: normalized });
  return doc ? docToUser(doc) : null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  /** Free-form ایدی معرف text (Mongo field name retained for compatibility). */
  referrerUserIdHex: string;
}): Promise<{ id: string; email: string; name: string }> {
  const col = await getUsersCollection();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const referrerStored = input.referrerUserIdHex.trim();

  const result = await col.insertOne({
    _id: new ObjectId(),
    email,
    name,
    password_hash: input.passwordHash,
    createdAt: new Date(),
    accountStatus: "pending",
    referrerUserIdHex: referrerStored,
  });

  return { id: result.insertedId.toHexString(), email, name };
}

export async function listPendingRegistrations(): Promise<
  PendingRegistrationRow[]
> {
  const col = await getUsersCollection();
  const cursor = col.find(
    { accountStatus: "pending" },
    {
      projection: {
        email: 1,
        name: 1,
        referrerUserIdHex: 1,
        createdAt: 1,
      },
    },
  ).sort({ createdAt: -1 });

  const rows: PendingRegistrationRow[] = [];
  for await (const doc of cursor) {
    rows.push({
      id: doc._id.toHexString(),
      email: doc.email,
      name: doc.name,
      referrerUserIdHex: doc.referrerUserIdHex,
      createdAt: doc.createdAt,
    });
  }
  return rows;
}

export async function approveUserById(
  userIdHex: string,
): Promise<boolean> {
  if (!ObjectId.isValid(userIdHex)) return false;
  const col = await getUsersCollection();
  const now = new Date();
  const res = await col.updateOne(
    { _id: new ObjectId(userIdHex), accountStatus: "pending" },
    { $set: { accountStatus: "approved", approvedAt: now } },
  );
  return res.matchedCount > 0;
}

/** Removes a pending registration so the person cannot join; they may register again later. */
export async function rejectPendingUserById(userIdHex: string): Promise<boolean> {
  if (!ObjectId.isValid(userIdHex)) return false;
  const col = await getUsersCollection();
  const res = await col.deleteOne({
    _id: new ObjectId(userIdHex),
    accountStatus: "pending",
  });
  return res.deletedCount > 0;
}

export type PublicUserSearchHit = { id: string; name: string };

/** Approved users only; matches display name (minimum query length enforced by caller). */
export async function searchApprovedUsersByText(
  rawQuery: string,
  limit = 8,
): Promise<PublicUserSearchHit[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const col = await getUsersCollection();
  const pattern = escapeRegExp(q);
  const docs = await col
    .find(
      {
        accountStatus: { $ne: "pending" },
        name: { $regex: pattern, $options: "i" },
      },
      { projection: { name: 1 } },
    )
    .sort({ name: 1 })
    .limit(limit)
    .toArray();

  return docs.map((d) => ({
    id: d._id.toHexString(),
    name: d.name,
  }));
}
