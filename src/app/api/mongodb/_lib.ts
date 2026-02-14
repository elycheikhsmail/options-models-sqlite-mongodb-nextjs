import { Collection, Db, MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || ""
//"mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "options_model";
const COUNTERS_COLLECTION = "counters";

type CounterDocument = {
  _id: string;
  seq: number;
};

export type OptionMongoDocument = {
  _id: number;
  id: number;
  name: string;
  nameAr: string | null;
  priority: number;
  tag: string | null;
  depth: number;
  parentID: number | null;
};

export type OptionApiDocument = Omit<OptionMongoDocument, "_id">;

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalThis.__mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI);
    globalThis.__mongoClientPromise = client.connect();
  }
  return globalThis.__mongoClientPromise;
}

async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(MONGODB_DB_NAME);
}

export async function getOptionCollection(
  collectionName: string,
): Promise<Collection<OptionMongoDocument>> {
  const db = await getDb();
  return db.collection<OptionMongoDocument>(collectionName);
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

async function ensureCounterInitialized(collectionName: string): Promise<void> {
  const db = await getDb();
  const counters = db.collection<CounterDocument>(COUNTERS_COLLECTION);
  const counterId = `${collectionName}:id`;

  const existing = await counters.findOne(
    { _id: counterId },
    { projection: { _id: 1 } },
  );
  if (existing) {
    return;
  }

  const collection = db.collection<OptionMongoDocument>(collectionName);
  const maxIdDoc = await collection
    .find({}, { projection: { id: 1 } })
    .sort({ id: -1 })
    .limit(1)
    .next();
  const seq = typeof maxIdDoc?.id === "number" ? maxIdDoc.id : 0;

  try {
    await counters.insertOne({ _id: counterId, seq });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }
  }
}

export async function getNextOptionId(collectionName: string): Promise<number> {
  await ensureCounterInitialized(collectionName);
  const db = await getDb();
  const counters = db.collection<CounterDocument>(COUNTERS_COLLECTION);
  const counterId = `${collectionName}:id`;

  const updated = (await counters.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { returnDocument: "after" },
  )) as CounterDocument | null;

  if (!updated || typeof updated.seq !== "number") {
    throw new Error("Impossible de generer un nouvel id.");
  }
  return updated.seq;
}

export function sanitizeOptionDocument(
  doc: OptionMongoDocument | null,
): OptionApiDocument | null {
  if (!doc) {
    return null;
  }
  const { _id, ...rest } = doc;
  return rest;
}

export function sanitizeOptionDocuments(
  docs: OptionMongoDocument[],
): OptionApiDocument[] {
  return docs.map(({ _id, ...rest }) => rest);
}

export function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function toNumberOrDefault(value: unknown, defaultValue: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}
