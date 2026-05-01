import { ObjectId } from "mongodb";
import { getAppDb } from "@/app/lib/db/client";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
};

type UserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  password_hash: string;
  createdAt: Date;
};

async function getUsersCollection() {
  const db = await getAppDb();
  const col = db.collection<UserDoc>("users");
  await col.createIndex({ email: 1 }, { unique: true });
  return col;
}

function docToUser(doc: UserDoc): DbUser {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    password_hash: doc.password_hash,
  };
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
}): Promise<{ id: string; email: string; name: string }> {
  const col = await getUsersCollection();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();

  const result = await col.insertOne({
    _id: new ObjectId(),
    email,
    name,
    password_hash: input.passwordHash,
    createdAt: new Date(),
  });

  return { id: result.insertedId.toHexString(), email, name };
}
