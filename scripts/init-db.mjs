// Script d'initialisation de la base de donnees SQLite pour la table options
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('database.db');

db.exec(`
CREATE TABLE IF NOT EXISTS options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  nameAr TEXT,
  priority INTEGER DEFAULT 1,
  tag TEXT,
  depth INTEGER NOT NULL,
  parentID INTEGER,
  FOREIGN KEY (parentID) REFERENCES options(id) ON DELETE CASCADE
);
`);

console.log('Table options creee ou deja existante.');
db.close();
