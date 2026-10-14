# Carte du travail

Livraison : un commit sur main, branche codex/storybook-web supprimée.

- ApplicationFeature → adaptateur stateful / service Orchestration : état et actions.
- ApplicationFeature → ApplicationScreen : props, logo et taille des pièces.
- ApplicationScreen → Shell, pages et Chessboard : assemblage de présentation pur.
- Storybook → ApplicationScreen : mêmes vues, fixtures déterministes, aucun démarrage natif.
- Contrôle architectural → composants : stateless et stories.

Tickets 01, 02 et 03 résolus. Revues Standards, Spec et visuelle : zéro finding.
Toutes les corrections avant livraison ont conservé la même branche.
Livraison complète : commit unique, fusion en avance rapide et suppression de la branche.
Voir verification.md pour les preuves et limites.
