# OptionsModel - Administration Hierarchique (SQLite + MongoDB)

Application Next.js 15 (TypeScript) pour administrer des arbres d'options sur 5 niveaux:
- `options`
- `lieux`

Le front appelle une API configurable via `NEXT_PUBLIC_BASE_API`, ce qui permet d'utiliser:
- les routes SQLite (`/api/sqlite/...`)
- ou les routes MongoDB (`/api/mongodb/...`)

## Fonctionnalites
- Interface admin en colonnes (5 niveaux).
- Ajout et mise a jour d'elements hierarchiques.
- API REST pour `options` et `lieux` (GET, POST, PUT).
- Script de migration SQLite -> MongoDB.

## Prerequis
- Node.js recent (avec support `node:sqlite`).
- pnpm.
- Un cluster MongoDB (si vous utilisez les routes MongoDB).

## Installation
1. Installer les dependances:
```bash
pnpm install
```

2. Initialiser SQLite:
```bash
node scripts/init-db.mjs
node scripts/init-db-lieux.mjs
```

3. (Optionnel) Ajouter des donnees de test:
```bash
node scripts/fill-db.mjs
```

## Configuration `.env`
Exemple minimal:
```env
NEXT_PUBLIC_BASE_API=/api/mongodb/
MONGODB_URI=mongodb://127.0.0.1:27017
```

Variables utiles:
- `NEXT_PUBLIC_BASE_API`: `/api/mongodb/` ou `/api/sqlite/`
- `MONGODB_URI`: URI MongoDB
- `MONGODB_DB_NAME`: base Mongo (defaut: `options_model`)
- `MONGODB_OPTIONS_COLLECTION`: collection options (defaut: `options`)
- `MONGODB_LIEUX_COLLECTION`: collection lieux (defaut: `lieux`)
- `SQLITE_DB_PATH`: chemin SQLite pour la migration (defaut: `database.db`)

Le repo contient un fichier d'exemple: `.en-exemple`.

## Migration SQLite -> MongoDB
Commande:
```bash
pnpm run migrate:options:mongo
```

Le script lit SQLite puis upsert les donnees dans MongoDB:
- table `options` -> collection `options`
- table `lieux` -> collection `lieux`

### Cas courant: `querySrv ECONNREFUSED`
Si votre DNS bloque les requetes SRV (`mongodb+srv://...`), utilisez l'URI standard Atlas (`mongodb://host1,host2,host3...`) dans `MONGODB_URI`.

## Lancement
```bash
pnpm dev
```

Pages principales:
- `http://localhost:3000/admin/options`
- `http://localhost:3000/admin/lieux`

## API
Base MongoDB:
- `GET /api/mongodb/options`
- `GET /api/mongodb/options?parentId=ID`
- `POST /api/mongodb/options`
- `PUT /api/mongodb/options/:id`
- `GET /api/mongodb/lieux`
- `GET /api/mongodb/lieux?parentId=ID`
- `POST /api/mongodb/lieux`
- `PUT /api/mongodb/lieux/:id`

Base SQLite:
- memes endpoints sous `/api/sqlite/...`

## Structure utile
- `src/app/admin/options/page.tsx`: UI admin options
- `src/app/admin/lieux/page.tsx`: UI admin lieux
- `src/app/api/mongodb/_lib.ts`: connexion Mongo + compteur d'IDs
- `scripts/sqlite-options-to-mongodb.mjs`: migration SQLite -> MongoDB
