import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, "..", "database.db");
const MONGO_URI = process.env.MONGODB_URI || ""
console.log("mongo uri = ", MONGO_URI)
 
const MONGO_DB_NAME = process.env.MONGODB_DB_NAME || "options_model";
const MONGO_OPTIONS_COLLECTION =
  process.env.MONGODB_OPTIONS_COLLECTION || process.env.MONGODB_COLLECTION_NAME || "options";
const MONGO_LIEUX_COLLECTION = process.env.MONGODB_LIEUX_COLLECTION || "lieux";

function assertTableExists(sqlite, tableName) {
  const row = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(tableName);
  if (!row) {
    throw new Error(`Table SQLite introuvable: ${tableName}`);
  }
}

async function migrateTable({ sqlite, db, tableName, collectionName }) {
  assertTableExists(sqlite, tableName);

  const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
  console.log(`[sqlite] table=${tableName} rows=${rows.length}`);

  if (rows.length === 0) {
    console.log(`[mongo] collection=${collectionName} aucune ligne a migrer.`);
    return;
  }

  const collection = db.collection(collectionName);
  const operations = rows.map((row) => ({
    updateOne: {
      filter: { _id: row.id },
      update: { $set: { ...row } },
      upsert: true,
    },
  }));

  const result = await collection.bulkWrite(operations, { ordered: false });
  console.log(
    `[mongo] collection=${collectionName} matched=${result.matchedCount}, modified=${result.modifiedCount}, upserted=${result.upsertedCount}`,
  );
}

async function main() {
  const sqlite = new DatabaseSync(SQLITE_PATH, { readOnly: true });
  let mongoClient;

  try {
    console.log(`[sqlite] source=${SQLITE_PATH}`);

    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = mongoClient.db(MONGO_DB_NAME);

    await migrateTable({
      sqlite,
      db,
      tableName: "options",
      collectionName: MONGO_OPTIONS_COLLECTION,
    });
    await migrateTable({
      sqlite,
      db,
      tableName: "lieux",
      collectionName: MONGO_LIEUX_COLLECTION,
    });
    console.log("[mongo] migration terminee.");
  } finally {
    sqlite.close();
    if (mongoClient) {
      await mongoClient.close();
    }
  }
}

main().catch((error) => {
  console.error("[erreur] migration echouee:", error);
  process.exit(1);
});
 