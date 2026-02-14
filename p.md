
Tâche 2.4 : Formulaire d'actualisation en Popup (Modale)

Composant Modale : Crée un composant React pour une modale/popup qui est caché par défaut.

Déclenchement : Quand l'utilisateur clique sur un bouton ayant un icon d'actualisation (à cote du bouton "+"), la modale devient visible.

État de la Modale : L'état de la modale doit stocker l'ID et tous les attributs du l'objet option en cour d'actualisation

Champs du Formulaire : La modale doit contenir un formulaire avec les champs suivants :

name (champ de texte, obligatoire)

nameAr (champ de texte)

priority (champ numérique, valeur par défaut 1)

tag (champ de texte)

Logique de Soumission :

À la soumission, récupère les valeurs du formulaire.

Construis l'objet de données complet en ajoutant depth (qui est parentDepth + 1) et parentID (qui a été stocké à l'ouverture de la modale).

Envoie cet objet via un appel PUT à /api/options.

En cas de succès, ferme la modale et rafraîchis la colonne enfant appropriée pour afficher la nouvelle option sans recharger la page.
si les instruction ne sont pas suffisement claire pose des question avant d'executer la tache