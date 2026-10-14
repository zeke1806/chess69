# Direction proposée : charbon et sauge

Mode : Operate. Proposition temporaire Storybook, pour validation de l’apparence
de Chess69 avant le travail sur les features. L’utilisateur apprend sur téléphone
et a choisi une ambiance sombre, proche des captures fournies de ChessFlare.

## Direction contract

**THESIS.** Faire respirer le jeu : cartes arrondies en relief, grands motifs
d’échecs et mots courts. Une aide utile tient dans une bulle ; les écrans évitent
les paragraphes d’explication permanents.

**OWN-WORLD.** Charbon chaud `#191C1A`, feutre `#292E2A`, ivoire `#F0EDE5`,
sauge `#B6C7A8`. Illustrations originales en volume doux, navigation basse,
surface sélectionnée lisible, échiquier ivoire/sauge. La palette est confirmée,
sa réalisation visuelle complète reste proposée.

**STORY.** Le propriétaire compare les cinq parcours, fait défiler les rangées
et sélectionne les cartes. Les données sont fictives, sans persistance ni métier.

**FIRST VIEWPORT.** Moodboard : titre « Charbon & sauge » à gauche et cavalier
en volume à droite ; quatre aplats avec leurs codes couleur dessous. Les
maquettes privilégient une action principale, des cartes tactiles et une
navigation ancrée en bas. Les explications restent courtes et encapsulées.

**FORM.** Composition mobile en colonne avec rangées horizontales, héritée de
la référence demandée ; code-led pour cette proposition. `seed: none (unavailable)`.
Interaction signature : sélection tactile des cartes avec relief et teinte
sauge ; aucune animation décorative qui détourne de la lecture des positions.

**FINISH.** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance.

Adaptation de périmètre : la règle DESIGN.md vise la documentation de la
proposition dans ce document et `.storybook/design/README.md`. Le système Android
livré reste inchangé ; son `DESIGN.md` ne sera remplacé qu’après approbation de
la direction, lors d’un travail d’implémentation distinct.

## Validation suivante

La spec est validée. Après livraison sur main, demander la validation du moodboard
et des cinq maquettes avant toute implémentation de feature. L’approbation de la
palette A ne constitue pas encore une approbation des maquettes finales.

## Typographie proposée

Manrope locale pour les titres et les noms de cartes ; sans système pour les corps.
Fonte libre OFL, embarquée seulement dans Storybook. Ajustement de la revue visuelle.

## Référence locale de la proposition construite

Ces valeurs documentent le prototype, sans remplacer les tokens Android.
Source couleur : `.storybook/design/palette.ts` ; styles : `kit.tsx`,
`design-screen.tsx` et `moodboard.tsx` du même dossier.

| Rôle | Token local | Usage |
| --- | --- | --- |
| Fond | background `#191C1A` | Toile des maquettes |
| Carte | card `#292E2A` | Cartes et navigation |
| Surface haute | raised `#333B34` | Bulle et bouton secondaire |
| Texte principal | ink `#F0EDE5` | Titres et contenus |
| Texte secondaire | muted `#BAC2B6` | Durée et contexte |
| Action | accent `#B6C7A8` | Bouton principal et sélection |
| Texte sur action | onAccent `#202B1E` | Libellés sur sauge |
| Contour | border `#465044` | Délimitation des cartes |
| Fond sélectionné | selected `#354332` | Carte et navigation actives |
| Case claire | boardLight `#E7E5D8` | Échiquier |
| Case sombre | boardDark `#7F9276` | Échiquier |

Titres des maquettes : Manrope 29/34, graisse 800 ; sections 21/27,
graisse 700 ; noms de cartes 20/26, graisse 700. Corps et aides : sans système
14/21 ; métadonnées 13/19. Le titre du moodboard utilise Manrope 34/38,
graisse 800. Valeurs de présentation web en px, issues des styles React Native.

Cartes : rayon 24, padding 16 et bord inférieur 5 pour le relief ; sélection
avec contour sauge et fond dédié. Boutons : rayon 18, minimum 52 de haut,
padding 14 × 20 ; secondaire tonal et désactivé à opacité 0,45. Bulles : rayon
20 avec pointe et padding 16. Navigation : rayon 26 et commandes de minimum
66 de haut. Le panneau principal porte une ombre noire, offset vertical 5,
rayon 8 et opacité 0,22 ; les illustrations apportent leur propre volume.

La colonne des maquettes conserve 20 de marge horizontale et des espacements
de 14 ; les rangées de cartes se parcourent horizontalement. Le cadre Storybook
est fluide jusqu’à la largeur de catalogue choisie : 360, 412 ou 480. Ces valeurs
sont proposées pour validation ; aucune validation Android n’est impliquée.

Illustrations : atlas ImageGen original et prompt dans
`.storybook/design/assets/illustrations.png.json`. Typographie : Manrope locale
dans `assets/manrope.ttf`, licence SIL OFL 1.1 conservée avec la fonte. Les pièces
et la flèche réemploient les composants stateless de Chess69 ; aucun service de
l’application n’est raccordé. Les hooks de démonstration restent dans `demo.tsx`.
