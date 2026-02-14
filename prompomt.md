Objectif Global
CrÃ©er une application web full-stack avec pnpm Next.js 15 pour administrer des donnÃ©es hiÃ©rarchiques appelÃ©es "optionsModel". L'application doit inclure un backend avec une API RESTful pour les opÃ©rations CRUD sur une base de donnÃ©es SQLite, et une interface frontend dynamique pour visualiser et gÃ©rer ces options dans une vue Ã  colonnes.

Phase 1 : Backend et Base de DonnÃ©es
TÃ¢che 1.1 : Initialisation du Projet et de la Base de DonnÃ©es

Projet : Initialise un nouveau projet Next.js 15 en utilisant TypeScript.

DÃ©pendances : Installe la bibliothÃ¨que node:sqlite pour l'interaction avec la base de donnÃ©es.

Base de DonnÃ©es : CrÃ©e un fichier de base de donnÃ©es Ã  la racine du projet nommÃ© database.db.

Script d'Initialisation : CrÃ©e un script (/scripts/init-db.mjs) qui Ã©tablit une connexion Ã  database.db et exÃ©cute la requÃªte SQL suivante pour crÃ©er la table options. Ce script est destinÃ© Ã  Ãªtre exÃ©cutÃ© manuellement une seule fois.

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

TÃ¢che 1.2 : CrÃ©ation de l'API RESTful
CrÃ©e les routes d'API suivantes dans le rÃ©pertoire /app/api/options/.

TÃ¢che 1.2.1 : Route pour LIRE les options (GET)

Chemin : CrÃ©e un fichier de route pour GET /api/options.

Logique :

La route doit accepter un paramÃ¨tre de requÃªte optionnel : parentId.

Si parentId n'est pas fourni, retourne un tableau JSON de toutes les options oÃ¹ depth = 1.

Si parentId est fourni, retourne un tableau JSON de toutes les options oÃ¹ le champ parentID correspond Ã  la valeur du parentId fourni.

En cas d'erreur, retourne un statut 500.

TÃ¢che 1.2.2 : Route pour CRÃ‰ER une option (POST)

Chemin : CrÃ©e un fichier de route pour POST /api/options.

Logique :

Accepte un corps de requÃªte JSON contenant name, nameAr, priority, tag, depth, et parentID.

InsÃ¨re une nouvelle ligne dans la table options avec les donnÃ©es reÃ§ues.

Retourne l'objet option nouvellement crÃ©Ã© (y compris son id auto-gÃ©nÃ©rÃ©) avec un statut 201.

TÃ¢che 1.2.3 : Routes pour METTRE Ã€ JOUR et SUPPRIMER (PUT, DELETE)

CrÃ©e les routes dynamiques /api/options/[id] pour les mÃ©thodes PUT et DELETE afin d'assurer une gestion complÃ¨te des donnÃ©es.

Phase 2 : Interface Frontend (React / Next.js)
CrÃ©e une page unique Ã  la racine (/app/page.tsx) pour l'interface utilisateur.

TÃ¢che 2.1 : Mise en Page et Structure des Colonnes

Utilise Tailwind CSS (inclus dans Next.js) pour crÃ©er une mise en page principale.

Cette mise en page doit consister en une grille ou un conteneur flexbox affichant 5 colonnes de largeur Ã©gale.

Chaque colonne doit avoir un en-tÃªte clair, par exemple : "Niveau 1", "Niveau 2", etc.

TÃ¢che 2.2 : Affichage et Interaction des DonnÃ©es

Ã‰tat React : Utilise des hooks useState pour gÃ©rer les donnÃ©es de chaque colonne et les sÃ©lections actives. CrÃ©e un Ã©tat pour chaque colonne, par exemple const [column1Data, setColumn1Data] = useState([]), etc.

Chargement Initial : Au chargement de la page, utilise un useEffect pour appeler l'API (GET /api/options) et peupler la premiÃ¨re colonne avec les options de depth = 1.

Interaction de SÃ©lection :

Quand un utilisateur clique sur un nom d'option dans une colonne N, cet Ã©lÃ©ment doit Ãªtre visuellement mis en surbrillance (ex: changement de couleur de fond).

L'ID de cet Ã©lÃ©ment est enregistrÃ© dans un Ã©tat selectedInColumnN.

Le contenu de toutes les colonnes suivantes (N+1 Ã  5) est vidÃ©.

Un nouvel appel API est dÃ©clenchÃ© : GET /api/options?parentId={ID_sÃ©lectionnÃ©}.

Les rÃ©sultats de cet appel sont utilisÃ©s pour peupler la colonne N+1.

Bouton d'Ajout : Ã€ cÃ´tÃ© de chaque nom d'option affichÃ© dans les colonnes, inclus une petite icÃ´ne ou un bouton "+".

TÃ¢che 2.3 : Formulaire d'Ajout en Popup (Modale)

Composant Modale : CrÃ©e un composant React pour une modale/popup qui est cachÃ© par dÃ©faut.

DÃ©clenchement : Quand l'utilisateur clique sur un bouton "+", la modale devient visible.

Ã‰tat de la Modale : L'Ã©tat de la modale doit stocker l'ID et la profondeur du parent (parentID et parentDepth) pour savoir oÃ¹ la nouvelle option doit Ãªtre ajoutÃ©e.

Champs du Formulaire : La modale doit contenir un formulaire avec les champs suivants :

name (champ de texte, obligatoire)

nameAr (champ de texte)

priority (champ numÃ©rique, valeur par dÃ©faut 1)

tag (champ de texte)

Logique de Soumission :

Ã€ la soumission, rÃ©cupÃ¨re les valeurs du formulaire.

Construis l'objet de donnÃ©es complet en ajoutant depth (qui est parentDepth + 1) et parentID (qui a Ã©tÃ© stockÃ© Ã  l'ouverture de la modale).

Envoie cet objet via un appel POST Ã  /api/options.

En cas de succÃ¨s, ferme la modale et rafraÃ®chis la colonne enfant appropriÃ©e pour afficher la nouvelle option sans recharger la page.



TÃ¢che 2.4 : Formulaire d'actualisation en Popup (Modale)

Composant Modale : CrÃ©e un composant React pour une modale/popup qui est cachÃ© par dÃ©faut.

DÃ©clenchement : Quand l'utilisateur clique sur un bouton ayant un icon d'actualisation (Ã  cote du bouton "+"), la modale devient visible.

Ã‰tat de la Modale : L'Ã©tat de la modale doit stocker l'ID et la profondeur du parent (parentID et parentDepth) pour savoir oÃ¹ la nouvelle option doit Ãªtre ajoutÃ©e.

Champs du Formulaire : La modale doit contenir un formulaire avec les champs suivants :

name (champ de texte, obligatoire)

nameAr (champ de texte)

priority (champ numÃ©rique, valeur par dÃ©faut 1)

tag (champ de texte)

Logique de Soumission :

Ã€ la soumission, rÃ©cupÃ¨re les valeurs du formulaire.

Construis l'objet de donnÃ©es complet en ajoutant depth (qui est parentDepth + 1) et parentID (qui a Ã©tÃ© stockÃ© Ã  l'ouverture de la modale).

Envoie cet objet via un appel POST Ã  /api/options.

En cas de succÃ¨s, ferme la modale et rafraÃ®chis la colonne enfant appropriÃ©e pour afficher la nouvelle option sans recharger la page.
