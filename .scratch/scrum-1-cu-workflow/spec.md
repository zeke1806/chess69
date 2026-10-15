# SCRUM-1 : Extraire CU Workflow et préciser les conventions de tests

Status: resolved

## Problem Statement

Le mode de travail réutilisable est mêlé aux adaptations de Chess69. Les consignes Git imposent encore une fusion automatique et les normes de tests autorisent des effets réels que l’utilisateur souhaite exclure.

## Solution

Centraliser le processus dans CU Workflow, les normes de tests dans CU Archi et conserver les adaptations produit dans Chess69. Livrer la demande sur une branche avec un seul commit par dépôt.

## User Stories

1. En tant que développeur, je veux réutiliser mon workflow dans plusieurs projets sans recopier ses règles.
2. Je veux une spec SCRUM numérotée pour mon besoin et des tickets internes facultatifs, tous versionnés localement.
3. Je veux vérifier les skills utiles et exclure les artefacts générés lourds avant leur génération.
4. Je veux une branche disponible pour revue, sans fusion automatique.
5. Je veux un unique projet de tests TypeScript, dossier racine ou package de monorepo, avec les noms réels des applications.
6. Je veux des tests Business isolés, français, numérotés sur trois niveaux maximum et rattachés à chaque spec.
7. Je veux pouvoir préparer ponctuellement des échanges Jira sans synchronisation automatique.

## Implementation Decisions

- CU Workflow possède orchestration, suivi, Git et artefacts ; CU Archi possède structure, code et tests.
- Les tests isolés excluent réseau, fichiers et drivers réels, même temporaires ; les intégrations assemblent des modules en mémoire.
- Business conserve un fichier de tests par spec et des helpers locaux possibles.
- Les numéros sont locaux par projet, distincts des clés Jira ; les anciennes références restent stables.
- Les consignes globales Git doivent déléguer au workflow sans imposer une fusion contradictoire.

## Testing Decisions

Cette demande modifie des consignes, sans comportement applicatif nouveau : revue de scénarios d’application, audits structurels des skills, suite existante des outils de skills, vérification des liens et exclusions Git. Aucun test Business artificiel de contenu documentaire.

## Acceptance Criteria

- Le skill existe, se découvre et s’installe via la synchronisation actuelle.
- Les responsabilités sont séparées, les duplications génériques de Chess69 retirées, les particularités locales conservées.
- Les règles couvrent SCRUM, Jira ponctuel, artefacts, branche non fusionnée et les deux formes du projet de tests.
- Chaque dépôt concerné termine sur sa branche avec un seul commit pour ce travail.

## Out of Scope

Migration des suites applicatives et du projet d’exemple historiques, renommage rétroactif des specs, suppression d’assets existants, réécriture d’historique, modifications distantes Jira, push et fusion.

## Further Notes

Les contrôles et limites sont consignés dans verification.md. La migration des suites historiques n’est pas une condition de l’extraction documentaire ; leur non-conformité à la nouvelle norme doit rester visible.
