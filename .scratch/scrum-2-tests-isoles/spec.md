# SCRUM-2 : Isoler les tests et regrouper les comportements par spec

Status: resolved

## Problem Statement

Les suites Chess69 et Todo de référence contiennent encore de vrais accès SQLite, fichiers temporaires et serveur HTTP. Les tests Business historiques ne référencent pas de spec SCRUM.

## Solution

Exécuter les vrais services et adaptateurs avec des frontières externes simulées en mémoire. Rassembler les comportements Business dans un seul fichier lié à cette spec de migration, en français et numéroté. Préserver la couverture des contrats, sans prétendre prouver les garanties des drivers natifs.

## User Stories

1. Je veux lancer les tests sans ouvrir de base, serveur ni fichier de données.
2. Je veux conserver les assertions CRUD, validation, reprise après échec, migration et protection des données.
3. Je veux un seul projet de tests par dépôt applicatif, avec un dossier Business lié à la spec.
4. Je veux distinguer les contrôles visuels réels des tests isolés.

## Implementation Decisions

Les ports publics et assemblages en mémoire sont les interfaces testées. Les doubles se limitent aux frontières Expo SQLite, SQLite natif et HTTP. Les tests de drivers simulent leur protocole ; les preuves réelles de persistance et de transport restent des vérifications séparées. Les contrôles Storybook sont déplacés hors de la suite unitaire/intégration. Les anciennes specs restent historiques ; les comportements migrés sont rattachés à SCRUM-2 avec traçabilité de leurs origines. La branche dépend de SCRUM-1 et contient un seul commit propre à SCRUM-2.

## Testing Decisions

Migrer une frontière à la fois, lancer ses tests ciblés puis les suites complètes, types et contrôles architecturaux. Vérifier l'absence d'import de driver réel dans les tests et rendre les effets externes interdits dans les runners isolés. Aucun appel réel n'est nécessaire à la validation.

## Acceptance Criteria

- Les deux suites passent sans vraie base, réseau ni fichiers de données temporaires.
- Les tests Business ont un describe SCRUM-2, des descriptions françaises et une numérotation de profondeur maximale trois.
- Les cas historiques significatifs sont conservés, leurs limites de simulation documentées.
- Les contrôles réels restent séparés, exécutés uniquement sur demande appropriée.

## Out of Scope

Modification du comportement produit, nouvelle dépendance, installation native, APK, exécution Playwright réelle, fusion et push.
