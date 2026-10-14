# Revue Standards

Base : `3d2ffc4`. Sources : CU-ARCHI et ses références, AGENTS.md,
mode de travail et précision utilisateur d'espacement. Revue indépendante
du diff avant squash, puis contre-revue ciblée.

## Premier constat

Une convention restait à corriger : les fonctions hors objets étaient
accolées dans game (`mutate/session/active/save/finish`), learning
(`canPlay/advance/scheduleReview`) et analysis (`view/assessments`).
La règle CU-ARCHI demande une ligne vide entre les blocs de lecture.

## Résolution et contre-revue

Séparation corrigée et formateur étendu aux déclarations de fonctions et
variables initialisées avec une fonction, dans les fichiers et blocs.
Les groupes de déclarations de données restent compacts. Les changements
applicatifs après le premier contrôle sont uniquement des lignes vides.

La contre-revue ne relève aucun nouvel écart actionnable ni heuristique
supplémentaire. Schémas partagés, interfaces readonly, transformations,
ordre des helpers, frontières et aération native examinés sont conformes.

Standards : **0 constat restant**, constat initial résolu.
