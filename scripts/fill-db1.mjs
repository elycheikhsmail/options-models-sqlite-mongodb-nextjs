// Script pour remplir la table options avec des donnees de test
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('database.db');

const data = [
  { name: 'Categorie 1', nameAr: 'الفئة 1', priority: 1, tag: 'A', depth: 1, parentID: null },
  { name: 'Categorie 2', nameAr: 'الفئة 2', priority: 2, tag: 'B', depth: 1, parentID: null },
  { name: 'Sous-categorie 1.1', nameAr: 'فرع 1.1', priority: 1, tag: 'A1', depth: 2, parentID: 1 },
  { name: 'Sous-categorie 1.2', nameAr: 'فرع 1.2', priority: 2, tag: 'A2', depth: 2, parentID: 1 },
  { name: 'Sous-categorie 2.1', nameAr: 'فرع 2.1', priority: 1, tag: 'B1', depth: 2, parentID: 2 },
  { name: 'Option 1.1.1', nameAr: 'خيار 1.1.1', priority: 1, tag: 'A1a', depth: 3, parentID: 3 },
];

const stmt = db.prepare('INSERT INTO options (name, nameAr, priority, tag, depth, parentID) VALUES (?, ?, ?, ?, ?, ?)');
data.forEach((opt) => {
  stmt.run(opt.name, opt.nameAr, opt.priority, opt.tag, opt.depth, opt.parentID);
});

db.close();
console.log('Table options remplie avec des donnees de test.');
