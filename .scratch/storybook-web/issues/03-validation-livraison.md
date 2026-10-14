# Catalogue et livraison

Status: resolved
Blocked by: 01-pages, 02-architecture (resolved)

## Comportement livré

Catalogue Common/Business par thématique ; pages complètes cadrées et défilantes,
largeur sélectionnable 360/412/480 px. Commande `npm run storybook:dev`, URL
http://localhost:6006, port 6006 exact ; build statique dans storybook-static.
Mode de travail : CU Archi obligatoire, même branche pour specs complémentaires
et corrections avant livraison, un seul commit main puis suppression de branche.

## Vérification

Tous les contrôles, captures et limites figurent dans ../verification.md.
116 tests Jest et 112 tests Playwright réussis, TypeScript, format et architecture
réussis. Serveur de développement et changement de largeur testés dans Chromium.
Revues Standards, Spec et visuelle : zéro finding. Livraison unique sur main ;
aucune APK ni publication VPS n’entre dans le périmètre demandé.
