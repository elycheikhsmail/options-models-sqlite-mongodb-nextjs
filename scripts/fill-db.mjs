import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the base directory for your optionsModel data
const BASE_DATA_DIR = path.join(__dirname, "seed_data");
const ANNONCE_DATA_PATH = path.join(
  __dirname,
  "seed_data",
  "annonces",
  "data.json",
);

async function processOptionsModelFile(filePath, parentId, depth) {
  console.log("  start seed options        ");
  console.log("=============================================");
  console.log("  filePath", filePath);
  console.log("  parentId", parentId);
  console.log("  depth", depth);

  try {
    await fs.access(filePath);
    const rawData = await fs.readFile(filePath, "utf-8");
    const optionsModels = JSON.parse(rawData);
    const db = new DatabaseSync("database.db");

    for (const optionsModel of optionsModels) {
      let actualParentId = parentId;
      if (optionsModel.parentName) {
        const parentRow = db
          .prepare("SELECT id FROM options WHERE name = ?")
          .get(optionsModel.parentName);
        if (parentRow) {
          actualParentId = parentRow.id;
        }
      }

      db.prepare(
        "INSERT INTO options (name, nameAr, priority, tag, parentID, depth) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(
        optionsModel.name,
        optionsModel.nameAr,
        optionsModel.priority,
        optionsModel.tag,
        actualParentId,
        depth
      );
    }

    db.close();
  } catch (error) {
    if ((error && error.code) !== "ENOENT") {
      console.error("Error processing options model file:", filePath, error);
    }
  }
}

// Recursive function to seed optionsModels from the directory structure
async function seedOptionsModels(dirPath, parentId = null, depth = 0) {
  try {
    const items = await fs.readdir(dirPath);

    // First, process the optionsModels.json file in current directory
    const optionsModelPath = path.join(dirPath, "optionsModels.json");
    await processOptionsModelFile(optionsModelPath, parentId, depth);

    // Then, process subdirectories
    const db = new DatabaseSync("database.db");
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        // Cherche l'option parent dans la table options
        const parentRow = db
          .prepare("SELECT id FROM options WHERE parentID IS ? AND name = ?")
          .get(parentId, item);
        const nextParentId = parentRow ? parentRow.id : parentId;
        // Recursively process subdirectories with the correct parent ID
        await seedOptionsModels(itemPath, nextParentId, depth + 1);
      }
    }
    db.close();
  } catch (error) {
    console.error("Error reading directory:", dirPath, error);
  }
}

async function main() {
  // Clear existing data in a specific order
  const db = new DatabaseSync("database.db");
  db.prepare("DELETE FROM options").run();
  db.close();

  // Seed optionsModels from the directory structure
  await seedOptionsModels(BASE_DATA_DIR);
  console.log("  end seed options        ");
  console.log("=============================================");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
