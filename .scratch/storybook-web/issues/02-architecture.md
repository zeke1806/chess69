# Frontières et couverture

Status: resolved
Blocked by: none

## Comportement et critères d’acceptation

Vérifier les imports runtime des vues, leur caractère stateless et la présence de stories ; conserver les contrôles existants.

## Vérification

`scripts/check-architecture.mjs` inspecte les imports de valeurs, les re-exports,
les imports dynamiques et `require` des vues (et de leurs helpers dans components).
Les imports exclusivement de types restent autorisés. Les dépendances vers les
services, le métier, les adaptateurs, les features et les bibliothèques natives
d'I/O sont refusées ; les API natives opérationnelles et le réseau direct aussi.
Les hooks sont détectés sous leur nom d'origine, via un alias nommé, un namespace,
un import par défaut, une réaffectation de namespace ou une déstructuration.
Chaque fichier de vue `.tsx` doit posséder son fichier adjacent `.stories.tsx`.
Les contrôles préexistants de cycles, DI, données de services et conventions
de code sont conservés.

Contrat testé : sortie et code de retour de `node scripts/check-architecture.mjs`.
Le contrôle positif du dépôt passe. Vingt sondes temporaires ont vérifié le rejet
des services de présentation, du métier et d'un adaptateur ; les hooks React
nommés/aliasés, namespace, défaut, namespace réaffecté, déstructurés et `use` ; les
hooks natifs et safe-area ; les API natives nommées et par namespace ; SQLite ;
les imports dynamiques, `require`, re-exports ; le réseau direct ; une vue sans
stories. La sonde d'imports `import type` et `import { type ... }` est acceptée.
Les sondes ont été retirées dans un bloc `finally`, puis le contrôle positif
a été réexécuté avec succès. Aucune sonde ne reste dans les sources.

Limite : ce contrôle syntaxique détecte les formes courantes ; il ne remplace
pas la revue des responsabilités métier et ne prouve pas la totalité des effets
possibles d'une bibliothèque tierce.
