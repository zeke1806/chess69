Status: resolved
Blocked by: none

Spec : ../spec.md

## Implémentation

- Exercice et partie : vraie position au centre, consignes/résultats visibles dans une bulle, aides secondaires contrôlées par props.
- Analyse : vraie évaluation, transport précédent/suivant conservé ; toute la liste SAN cliquable sélectionne le demi-coup (index + 1).
- Historique : cartes avec miniature de la position finale réelle depuis `RulesPosition.board`, sans reconstruire les règles dans la vue.
- Échiquier : palette sauge, coins arrondis ; promotions, coups possibles, orientation et interactions conservés.
- Stories : aides compactes et variantes développées, états guidé/de mémoire/indice/résultat/calcul/partie sauvegardée inchangés.
- Vérification : `npm run typecheck` passe ; inspection visuelle et vérifications complètes coordonnées à la racine.

Critères validés ; preuves et limites dans ../verification.md.
