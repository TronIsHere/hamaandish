import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var -- module cache for dev HMR
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error(
      "DATABASE_URL is not set. Add a MongoDB connection string to .env.local",
    );
  }
  const client = new MongoClient(uri);
  return client.connect();
}

let productionClientPromise: Promise<MongoClient> | undefined;

/** Returns a connected MongoClient. Use only in server contexts. */
export function getDb(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "production") {
    if (!productionClientPromise) {
      productionClientPromise = createClientPromise();
    }
    return productionClientPromise;
  }

  // In development, store promise on globalThis to survive HMR module reloads.
  // Storing the PROMISE (not the client) prevents the race condition where two
  // concurrent requests both see an undefined client and both try to connect.
  if (!globalThis.__mongoClientPromise) {
    globalThis.__mongoClientPromise = createClientPromise();
  }
  return globalThis.__mongoClientPromise;
}

/** Returns the main application database. */
export async function getAppDb() {
  const client = await getDb();
  return client.db();
}
