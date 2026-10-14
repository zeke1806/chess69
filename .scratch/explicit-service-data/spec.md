# Logique de services et données explicites

Demande du 14 octobre 2026 : généraliser la séparation logique/données dans CU
Archi et appliquer à Learning, au projet Chess69 et à l’exemple Todo.

Les services exécutent leurs règles à chaque appel ; un adaptateur explicite
conserve les données entre appels. Une instance de service ne possède pas de
session cachée dans ses variables. Learning devient un service partagé dont les
opérations prennent un stockage de session propre au consommateur. État front
et coordination entre appels ont des ports explicites ; les ressources natives
restent dans les adaptateurs appropriés. Pas de modification du format SQLite.

## Critères de fin

- DI expose learning directement ; sessions isolées par connexion.
- Recréer la logique Learning avec le même stockage conserve la session.
- Sauvegarde unique, retry, couleurs, alternatives, immutabilité préservés.
- État métier et informations front conservées entre appels externalisés.
- Todo illustre stockage séparé de logique et isolation des connexions.
- Règle, exemples et carte de modules cohérents ; dossier actif synchronisé.
- Typage, formatage, architecture et tests publics réussis ; revue puis un
  commit par dépôt sur main. Préserver le déplacement local des déclarations DI.

Interfaces de test autorisées : LearningService, adaptateur de données en
mémoire, contrats stateful et assemblages publics existants. Ressources mémoire
ou SQLite temporaires uniquement ; aucun test d’implémentation privée.
