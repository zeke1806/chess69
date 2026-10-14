# disposition

disposition: ship

Le verdict couvre la résolution de l'unique correction matérielle TYPE de la
revue initiale, initialement `fix`, et les régressions éventuelles introduites par
ce changement. Les douze recaptures aux mêmes chemins ont été examinées ;
aucune régression visible, aucun reste matériel à corriger. Cette revue porte
sur le prototype Storybook proposé ; elle ne constitue pas l'approbation
utilisateur du design.

# coverage

Inspection visuelle individuelle des douze captures attendues dans
`artifacts/design-validation/` :

| Surface | 360 px | 414 px | Constats |
| --- | --- | --- | --- |
| `design-proposition--home` | Présente, 360 × 896 | Présente, 414 × 896 | Marque, action principale, illustration, rails, navigation |
| `design-proposition--learn` | Présente, 360 × 896 | Présente, 414 × 896 | Trois catégories, rail, sélection, aide compacte, action |
| `design-proposition--exercise` | Présente, 360 × 896 | Présente, 414 × 896 | Échiquier entier, coordonnées, question, indice et analyse |
| `design-proposition--history` | Présente, 360 × 896 | Présente, 414 × 896 | Marque visible en haut, périodes, résultats et reprise |
| `design-proposition--analysis` | Présente, 360 × 896 | Présente, 414 × 896 | Échiquier entier, précédent/suivant, résultat explicitement démonstratif |
| `common-design-moodboard--palette-a` | Présente, 360 × 1289 | Présente, 414 × 1289 | Palette et codes, typographie, matière, cartes, boutons, navigation |

Le charbon et la sauge, les cartes arrondies, les illustrations raster en volume
et les textes courts suivent le contrat de direction. Les panneaux d'aide restent
compacts. Les images sont suffisamment présentes pour porter le caractère
matériel de la proposition. La sélection se distingue par la teinte, la bordure
et le libellé. Les titres et commandes principales restent lisibles à 360 px.

Les parties de cartes visibles à droite correspondent aux rails horizontaux.
Le contenu coupé en bas appartient au défilement vertical derrière la navigation
basse fixe ; il ne signale pas un débordement de texte. Les captures d'historique
actuelles affichent bien `Chess69` et `Aperçu design` en haut.

# materialfindings

1. **TYPE — resolved.** La revue initiale relevait une voix display héritée de
   la plateforme, refusée par le craft floor. Manrope est maintenant embarquée
   dans `assets/manrope.ttf`, accompagnée de sa licence OFL, déclarée comme
   `Chess69Display` via `@font-face` et appliquée aux titres, à la marque et aux
   titres de cartes du prototype. Les douze recaptures montrent une voix sans
   serif cohérente et lisible ; le titre du moodboard, les cinq titres de pages,
   le premier panneau à 360 px et les titres de cartes gardent un cadrage correct.
   Le parent confirme le chargement effectif de la FontFace avant chaque capture.

Régressions introduites par la correction : aucune visible. Remaining : clear.
Le verdict `ship` couvre cette correction scorée ; il complète la revue initiale
sans ouvrir une nouvelle recherche de défauts.

# advisories

- Préserver l'importance de l'échiquier, le grand motif du cavalier et le relief
  sobre des illustrations. Le brief demande cette proximité visuelle ; les cartes
  et les rayons généreux sont donc intentionnels.
- Les contrastes calculés sur les tokens sont lisibles : texte principal sur
  fond 14,68:1, secondaire sur carte 7,56:1, secondaire sur panneau 6,32:1,
  secondaire sur sélection 5,74:1 et texte sur sauge 8,22:1. Ces mesures valident
  ces paires ; elles ne remplacent pas une mesure de chaque pixel ou état.
- Conserver la mention de démonstration de l'analyse et la provenance de
  `illustrations.png.json`, actuellement `approved: false`. Les positions,
  résultats et évaluations restent des données de maquette.
- Lors de la présentation, rappeler que le propriétaire valide l'apparence
  proposée après livraison. La palette A choisie n'approuve pas les cinq écrans.

# evidenceLimits

- Revue sur PNG Storybook web, à 360 et 414 px, sans nouvelle capture ni contrôle
  sur Android. Aucune preuve de rendu Galaxy S22 Ultra, de safe area native ou
  de gestes Android n'est produite ici.
- Les captures originales ChessFlare de l'utilisateur et une composition
  approuvée n'ont pas été fournies à cette revue. La proximité est évaluée contre
  les caractéristiques consignées dans la spec et la direction, sans comparaison
  pixel à pixel ni prétention de fidélité à une composition approuvée.
- Navigation, défilement, sélection et contrôles automatiques réussis sont
  rapportés par l'agent parent ; cette revue n'a pas relancé ces interactions.
  Les captures seules ne prouvent pas focus clavier, mouvement, chargement,
  erreur, lecture assistée ou fonctionnement d'un moteur d'échecs.
- Avant chaque recapture finale, le parent a confirmé
  `document.fonts.load('800 29px Chess69Display')`, `document.fonts.ready` et une
  FontFace `Chess69Display` dont le statut vaut `loaded`. La déclaration et les
  usages de la fonte ont été lus ; ce contrôle navigateur n'a pas été relancé
  par le reviewer.
- Le contexte Impeccable a été lu manuellement suivant le fallback signalé par
  le parent pour un launcher non exécutable. Aucun détecteur HTML/CSS n'a été
  appliqué au rendu React Native. Le seed indiqué indisponible ne peut être
  corroboré par le launcher dans cette revue.
- `PRODUCT.md`, la spec, la direction, le craft floor, le README du prototype,
  la palette, la provenance raster et des styles représentatifs ont été lus.
  Cette revue ne remplace pas la revue d'architecture ou de comportement.
