# AGENTS.md

## Objectif du projet
Application Next.js 15 (TypeScript) pour administrer des donnees hierarchiques sur 5 niveaux:
- `options`
- `lieux`

Le front peut cibler soit SQLite soit MongoDB via `NEXT_PUBLIC_BASE_API`.

## Architecture rapide
- UI admin:
  - `src/app/admin/options/page.tsx`
  - `src/app/admin/lieux/page.tsx`
- API MongoDB:
  - `src/app/api/mongodb/_lib.ts`
  - `src/app/api/mongodb/options/route.ts`
  - `src/app/api/mongodb/options/[id]/route.ts`
  - `src/app/api/mongodb/lieux/route.ts`
  - `src/app/api/mongodb/lieux/[id]/route.ts`
- API SQLite:
  - `src/app/api/sqlite/options/route.ts`
  - `src/app/api/sqlite/options/[id]/route.ts`
  - `src/app/api/sqlite/lieux/route.ts`
  - `src/app/api/sqlite/lieux/[id]/route.ts`
- Migration:
  - `scripts/sqlite-options-to-mongodb.mjs`

## Modele de donnees (attendu par le front)
Champs a conserver:
- `id: number`
- `name: string`
- `nameAr: string | null`
- `priority: number`
- `tag: string | null`
- `depth: number`
- `parentID: number | null`

En MongoDB, `_id` est numerique et aligne avec `id`.

## Regles de travail pour Codex
1. Conserver la parite fonctionnelle entre routes SQLite et MongoDB (GET/POST/PUT).
2. Ne pas casser le contrat JSON consomme par les pages admin.
3. Si changement sur la logique d'ID Mongo, respecter le mecanisme `counters` dans `src/app/api/mongodb/_lib.ts`.
4. Preferer des changements minimaux et localises; eviter les refactors larges sans demande explicite.
5. Eviter d'exposer des secrets dans les logs (URI Mongo, credentials).

## Variables d'environnement
- `NEXT_PUBLIC_BASE_API` (ex: `/api/mongodb/` ou `/api/sqlite/`)
- `MONGODB_URI`
- `MONGODB_DB_NAME` (defaut: `options_model`)
- `MONGODB_OPTIONS_COLLECTION` (defaut: `options`)
- `MONGODB_LIEUX_COLLECTION` (defaut: `lieux`)
- `SQLITE_DB_PATH` (utilise par le script de migration)

Note: les fichiers `.env*` sont ignores par git (`.gitignore`).

## Commandes utiles
- Installer: `pnpm install`
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Build: `pnpm build`
- Migration SQLite -> MongoDB: `pnpm run migrate:options:mongo`

## Point d'attention connu
Avec certains DNS, `mongodb+srv://` peut echouer avec `querySrv ECONNREFUSED` dans Node.
Dans ce cas, utiliser une URI Atlas standard `mongodb://host1,host2,host3...` dans `MONGODB_URI`.

## Verification minimale apres changement
1. Verifier que les pages admin chargent les listes racines.
2. Verifier ajout et mise a jour sur `options` et `lieux`.
3. Si changement migration/API Mongo: executer `pnpm run migrate:options:mongo` sur un environnement valide.
