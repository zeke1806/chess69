# SCRUM-3 : Privilégier les stories par état et retirer Playwright

Status: resolved

## Problem Statement

Les contrôles Playwright existants ajoutent une automatisation navigateur que l’utilisateur ne souhaite pas par défaut. Il veut inspecter les états dans Storybook et demander explicitement les interactions ou tests navigateur nécessaires.

## Solution

Supprimer les tests, configuration, commande et dépendance directe Playwright de Chess69. Conserver Storybook et ses stories existantes. Centraliser la politique réutilisable dans CU Archi.

## User Stories

1. Je veux inspecter chaque état utile dans une story déterministe.
2. Je veux des démonstrations interactives supplémentaires seulement lorsque je les demande.
3. Je veux réserver les tests Playwright ou équivalents en vrai navigateur à un besoin explicitement demandé.

## Implementation Decisions

Retirer les contrôles navigateur existants et actualiser les guides actifs. Conserver les preuves historiques comme historique. Les stories existantes et les contrôles Android restent disponibles ; aucune nouvelle interaction n’est ajoutée. La règle appartient à CU Archi, propriétaire des conventions de présentation et de tests.

## Testing Decisions

Vérifier le manifeste et le lockfile, l’absence de fichiers ou scripts Playwright actifs, les types et l’architecture, les tests isolés existants et la compilation Storybook. Aucun nouveau test pour cette suppression et aucune exécution de navigateur réel.

## Acceptance Criteria

- Playwright n’est plus une dépendance directe ni un script de Chess69 ; sa configuration et ses deux fichiers de tests sont supprimés.
- Les stories et leur build sont conservés.
- CU Archi précise les états par défaut, les interactions sur demande et le besoin explicite pour les tests navigateur.
- Un commit par dépôt sur une nouvelle branche dépendante de SCRUM-2, sans fusion ni push.

## Out of Scope

Suppression des navigateurs ou caches partagés de la machine, réécriture de l’historique, redesign et suppression des stories interactives existantes.
