# SCRUM-4 : Clarifier les sources de règles et retirer les doublons

Status: resolved

## Problem Statement

Des règles génériques restent répétées dans Chess69 ; CU Archi contient encore une étape de rédaction de spec relevant de CU Workflow. Les audits historiques et certaines formulations des tests peuvent sembler concurrencer les consignes actuelles.

## Solution

Conserver chaque règle dans sa source propriétaire et utiliser des renvois ailleurs, tout en préservant les adaptations locales et les preuves historiques.

## User Stories

1. Je veux trouver le processus dans CU Workflow et les normes dans CU Archi.
2. Je veux que Chess69 conserve seulement ses contraintes et adaptations.
3. Je veux des règles cohérentes pour les jalons visuels, les tests, les artefacts et les livraisons.

## Implementation Decisions

Le processus conserve les validations humaines et la continuité d’une demande sur sa branche. Les normes définissent les stories et tests ; les lectures nécessaires au runner sont distinguées des accès aux fichiers de données. Les demandes documentaires ne déclenchent pas de tests artificiels. Les rapports textuels à conserver sont placés hors des sorties ignorées en bloc. Les anciens bilans restent historiques.

## Testing Decisions

Audit documentaire des règles actives, revue des différences, vérification des liens et audit structurel des skills. Aucun code applicatif modifié ni test supplémentaire nécessaire.

## Acceptance Criteria

- Les règles de suivi, Git et artefacts sont possédées par CU Workflow ; architecture, code et tests par CU Archi.
- Chess69 conserve ses contraintes Android, son espacement local et ses emplacements de design.
- Aucun jalon de validation ni contrainte existante ne disparaît avec les doublons.
- Les liens actifs existent, la synchronisation et l’audit structurel réussissent.

## Out of Scope

Code et dépendances, migration d’anciens bilans, réécriture d’historique, push ou fusion. La branche SCRUM-4 dépend de SCRUM-3, avec un seul commit supplémentaire par dépôt.
