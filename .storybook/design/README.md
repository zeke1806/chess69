# Proposition design temporaire

Cette livraison sert la validation visuelle, avant l’implémentation des features.
Le code est jetable : aucun écran Android, service métier ou stockage ne dépend
de ce dossier. Les maquettes utilisent des données et interactions de démonstration.

- `Common / Design / Moodboard / Palette A` expose la palette, la typographie,
  les illustrations originales, les cartes et les commandes.
- La racine `Design`, au même niveau que `Common` et `Business`, contient les
  cinq maquettes de parcours. Cette troisième racine est l’exception temporaire
  explicitement demandée par l’utilisateur.
- Les vues sont stateless ; leur raccordement Storybook gère les interactions
  de démonstration. Les images restent locales au catalogue.

Lancer `npm run storybook:dev` depuis le dépôt, puis ouvrir
<http://localhost:6006>. Le catalogue démarre en Large mobile.

La palette A est choisie ; la composition complète et les composants proposés
attendent la validation du propriétaire. `DESIGN.md` continue de décrire
l’application livrée, jusqu’à l’approbation de cette proposition. Une preuve
Storybook web ne vaut pas validation Android.

La direction et les limites sont documentées dans
[`direction.md`](../../.scratch/design-validation/direction.md).
La provenance des illustrations est conservée avec les ressources de ce dossier.

La voix des titres est Manrope, servie localement, sous licence SIL OFL 1.1.
Source : https://github.com/google/fonts/tree/main/ofl/manrope ; licence conservée
avec le fichier de fonte. Les corps utilisent le sans système. Le chargement de
Manrope appartient au catalogue ; aucun composant Android ne l’importe.

Les quatre illustrations (cavalier, livres, puzzle, tour) proviennent d’un atlas
original généré par ImageGen pour cette proposition. Le prompt exact et la grille
sont conservés dans [`illustrations.png.json`](assets/illustrations.png.json).
Les captures ChessFlare guident la composition ; leurs illustrations ne sont
pas réutilisées. Les pièces de l’échiquier et la flèche réemploient les composants
stateless actuels de Chess69.

Liens directs : [moodboard](http://localhost:6006/?path=/story/common-design-moodboard--palette-a)
et [accueil de la proposition](http://localhost:6006/?path=/story/design-proposition--home).
Dans `Design / Proposition`, choisir également Apprentissage, Exercice,
Historique ou Analyse. Les boutons du moodboard sont des spécimens d’états ;
les interactions locales sont raccordées dans les maquettes.
