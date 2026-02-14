tu doit adapter le code dans les fichiers qui se trouve dans 
src/app/api/tursor
 pour utiliser tursor cloud au lieu de better-sqlite.
les cridentials de connexion doit etre recuperer depuis les variable d'environement comme dans l'exemple :
```shell 
TURSO_AUTH_TOKEN=your_api_secret_here
TURSOR_CLOULD_API_URL=https://api.tursor.cloud/v1
```
utiliser 
pnpm install @libsql/client
puis le sdk js comme dans le doc :
 
```ts
import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

```

puis

```ts
await turso.execute("SELECT * FROM users");
```

comme dans le fichier  .env.local

rappel :
tu est dans un projet nextjs 15 et ts