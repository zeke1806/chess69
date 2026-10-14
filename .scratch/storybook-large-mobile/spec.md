# Aperçu mobile par défaut

Status: resolved
Blocked by: none

## Problem Statement

Le catalogue d’une application mobile doit démarrer avec le viewport Large mobile.

## Solution

Utiliser le viewport officiel mobile2, 414 × 896 px portrait, dans les globals initiaux.
Conserver les sélecteurs modifiables et réutiliser les composants natifs via RN Web.

## User Stories

1. Comme propriétaire, je veux ouvrir les stories en Large mobile par défaut.
2. Comme propriétaire, je veux continuer à changer le viewport depuis la barre d’outils.
3. Comme propriétaire, je veux comprendre pourquoi les mêmes vues s’affichent sur le web.

## Implementation Decisions

Configurer MINIMAL_VIEWPORTS et initialGlobals.viewport, sans nouvelle dépendance.
Le cadrage interne reste indépendant du viewport du navigateur de la story.

## Testing Decisions

Vérifier dans Chromium neuf que le manager applique 414 × 896 px puis changer le
viewport. TypeScript, format et architecture doivent passer ; build statique vérifié.

## Out of Scope

Rendu Android, APK et refonte des composants.

## Verification

TypeScript, contrôle architectural, Prettier du fichier modifié et git diff --check
réussis ; build Storybook statique réussi. Chromium neuf : viewport initial mesuré
414 × 896, sélection Small mobile mesurée 320 × 568, retour Large mobile mesuré
414 × 896. Capture inspectée : artifacts/storybook-large-mobile/default.png (ignorée).
Revue du diff : configuration isolée à Storybook, pas de composant applicatif modifié.
Les premières sondes cherchaient le texte visuel comme nom accessible du bouton ;
la sonde corrigée utilise « Viewport size Large mobile » et passe.
Aucune validation Android nécessaire pour ce changement du catalogue web.
