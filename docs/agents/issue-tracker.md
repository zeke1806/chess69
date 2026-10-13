# Issue tracker : Markdown local

Les spécifications et tickets vivent dans `.scratch/` et sont versionnés.
Le dépôt GitHub héberge le code ; le suivi de travail reste local par défaut.

- Un dossier par fonctionnalité ou effort : `.scratch/<feature>/`.
- Spécification : `spec.md`.
- Un fichier par ticket : `issues/<NN>-<slug>.md`, numéroté en ordre de dépendance.
- Chaque ticket indique le comportement livré, ses critères d’acceptation,
  `Blocked by:` et `Status:` près du début du fichier.
- Un ticket prêt porte `Status: ready-for-agent`, puis `claimed` pendant le
  travail et `resolved` après validation de ses critères.
- Avant de résoudre, noter les contrôles réellement effectués et les limites.
  Un contrôle requis mais non réalisé ne devient pas un contrôle réussi.
- Les commentaires complémentaires vont sous `## Comments`.

« Publier au tracker » signifie écrire ces fichiers. « Lire un ticket » signifie
lire son fichier, ses dépendances et la spécification correspondante.
La création des tickets est déléguée à l’agent selon le mode de travail du projet.

Pour `wayfinder`, conserver `map.md` avec décisions, travail restant et questions.
Les tickets de décision portent également `Type:` ; après résolution, ajouter
la réponse dans `## Answer` et une référence depuis la carte. La prochaine tâche
est un ticket non réclamé dont tous les bloqueurs sont résolus.
