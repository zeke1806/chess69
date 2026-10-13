disposition: ship

Disposition courante après les deux corrections. La revue initiale et le premier scoring sont conservés ci-dessous ; le scoring final se trouve à la fin. Ce ship couvre les corrections scorées.

Paquet adapté : contrat formel à cinq blocs et seed non fournis ; adaptation établie par le parent : extension de l’identité existante en Operate/code-led, sans nouveau monde ni roll/comp. Direction et Quality bar dans `interface.md`. Aucun détecteur HTML/CSS exécuté sur cette interface native.

## persistence

**fail** — [PRODUCT.md](../../PRODUCT.md) existe et décrit le produit livré. [DESIGN.md](../../DESIGN.md:53) décrit encore l’écran initial et son bouton « Tester » ; ses composants, tailles et espacements ne décrivent pas l’application actuelle. L’étendre avant livraison.

Les sept captures requises existent, sont décodables, montrent les parcours annoncés et mesurent 1080 × 2400 px. `phone-analysis-android.png` représente volontairement la position 4/4 et son résultat après défilement : ce cadrage est valide. Les deux vues `font130` montrent effectivement un texte agrandi. Splash sombre avec logo visible, sans région manquante. Preuve limitée au téléphone ARM64 émulé API 36, environ 411 dp ; aucune preuve Galaxy supplémentaire. Aucun état/diff de reproduction de comp requis pour ce build code-led.

## fidelity

| Élément | Verdict | Preuve |
| --- | --- | --- |
| TYPE | match | Police système Android, niveaux de titre/texte distincts et ajustement système visibles ; choix autorisé par la référence Android et l’identité existante. |
| MATERIAL | match | Surfaces numériques planes, logo raster réel ; aucune promesse de matériau physique ni comp à reproduire. |
| GROUND | match | Fond noir `#111318`, orange `#FF9F43` et texte clair conformes aux tokens et à l’identité conservée. |
| Première vue / prochaine action | match | `phone-home-android.png` montre découverte, reprise et pratique dès le premier viewport, selon la Quality bar. |
| Échiquier / orientation | adaptation | Échiquier presque pleine largeur, noirs en bas en partie et exercice ; environ 48 dp par case, ajustement explicitement admis par `interface.md:7,15`. |
| Navigation principale | contradicted | Quatre pavés textuels ; absence de structure de navigation bar Material avec icônes et indicateur. `application-screen.tsx:45,118`, toutes les captures hors splash. |
| Contexte / retour | contradicted | Le haut reste « Chess69 » ; « Retour » est un grand bouton dans le contenu plutôt qu’une action de top app bar contextualisée. `phone-game-android.png`, `phone-exercise-android.png`, `application-screen.tsx:26,32`. |
| Texte à 130 % | contradicted | `phone-font130-android.png` coupe « Progression » en « Progressio » puis « n » isolé ; le réglage de texte ne doit pas dégrader une destination. |
| Pièces | contradicted | Le système de pièces repose sur des glyphes Unicode (`chessboard.tsx:7,35`), refusés par le craft floor pour un système de pictogrammes. |
| Résultat / vérité | match | Analyse terminée, annonce de mat explicite, résultat sauvegardé ; données réellement créées pour les essais selon le paquet et `interface.md:15`, sans attribution à l’utilisateur. |
| Logo / splash | adaptation | Icône actuelle conservée dans le masque système Android ; exigence explicite de maintien du logo/splash. |

Le récit utile, l’identité et la première action sont tenus. L’adaptation établie conserve le monde existant ; aucun nouveau choix de direction ni roll n’est demandé. Les états d’erreur, chargement, sélection légale, promotion et TalkBack ne sont pas jugés visuellement faute de capture correspondante.

## ceiling

La Quality bar Operate est atteinte pour la focalisation sur l’action et l’échiquier, la lisibilité française, les surfaces planes et l’absence de mouvement décoratif. Les dispositifs natifs Material de navigation et de contexte restent inutilisés. Les tokens texte passent les contrastes calculés : principal 16,32:1, secondaire 10,30:1, libellé sur orange 8,69:1. Les boutons croissent avec le texte et dépassent 48 dp. Une partie de contenu sous le bas du viewport dans les captures est normalement défilable ; elle n’est pas assimilée à un défaut d’insets. Retour système, gestes, TalkBack, animation système et performance matérielle restent hors de cette preuve statique ; voir `phone-test.md`.

## material_fixes

1. **Navigation / scaling** — Remplacer les pavés de `application-screen.tsx:45,118` par une navigation bar Material 3 : icônes locales de 24 dp cohérentes, indicateur sélectionné, label de rôle Material ; garder le texte système et un nom entier à 130 % (par exemple « Progrès », label accessible « Progression »). Recapturer accueil/partie à 100 % et 130 % ; aucune lettre isolée. Sources : `phone-font130-android.png`, `reference/android.md`, `interface.md:3,7,15`.
2. **Contexte natif** — Porter le retour et le titre du parcours dans une top app bar Material 3 avec cible de retour de 48 dp ; supprimer le bouton « Retour » pleine largeur du contenu. Garder une identification Chess69 discrète sur l’accueil et préserver le retour système déjà câblé. Sources : captures partie/exercice, `application-screen.tsx:26,32`, `reference/android.md`.
3. **Craft floor / pièces** — Produire ou intégrer douze assets locaux SVG/raster homogènes et licenciés pour les six pièces dans les deux camps, puis remplacer `glyphs` ; conserver les labels accessibles, la taille des cases et l’orientation. Les pièces blanches doivent avoir un contour sombre perceptible sur les cases claires : leur remplissage seul n’a que 1,37:1 de contraste. Sources : `chessboard.tsx:7,35,50`, captures échiquier, `reference/craft-floor.md`.
4. **Persistance du design** — Étendre `DESIGN.md` à l’application : tokens réellement utilisés, navigation et top app bar, échiquier/pièces, contrôles, scaling, états et limites de preuve. Remplacer les descriptions obsolètes du seul bouton « Tester » et des anciennes marges. Sources : `DESIGN.md:55,74,86,91`, `theme.ts`, `application-screen.tsx:118`.

## keep

Conserver le noir/orange, le logo/splash actuel, l’action utile et la reprise dès l’accueil, l’échiquier large orienté, le français explicatif, le texte système et la distinction explicite entre preuve émulateur et validation Galaxy.

---

## verdict

Pass après correction, limité aux quatre material_fixes précédents. Les sept fichiers ont été relus aux mêmes chemins : captures valides de 1080 × 2400 px ; analyse 4/4 volontairement défilée et splash antérieur inchangé acceptés. Aucun détecteur HTML/CSS exécuté.

1. **partiel — Navigation/scaling** : quatre icônes SVG, labels entiers « Progrès »/« Apprendre » à 100 % et 130 %, label accessible « Progression » confirmés (`application-screen.tsx:24,55`). L’indicateur actif est toutefois un rectangle aux coins nets dans `phone-game-android.png`, `phone-exercise-android.png`, `phone-analysis-android.png` et `phone-game-font130-android.png` ; seuls les deux accueils montrent la capsule attendue. Le `borderRadius:16` déclaré ne constitue pas une preuve de rendu.
2. **résolu — Contexte natif** : les captures partie/exercice/analyse montrent le retour et le contexte dans la top app bar ; le bouton Retour pleine largeur a disparu. Cible 48 dp et label accessibles présents (`application-screen.tsx:28,34,128`). Le titre de partie reste entier à 130 %.
3. **résolu — Pièces** : les captures d’échiquier montrent les pièces SVG homogènes avec un contour sombre net sur les blancs et des noirs distincts. Les glyphes ont été supprimés ; labels, cases et orientation conservés (`chessboard.tsx:32,35`). Douze SVG locaux, copie bundle et provenance/licence Apache 2.0 présentes dans `pieces/` et `THIRD_PARTY.md`.
4. **résolu — Persistance du design** : `DESIGN.md` décrit désormais l’application, les tokens en usage, navigation/top app bar, pièces, contrôles, scaling, états et limites émulateur/Galaxy ; la description « Tester » a disparu.

## remaining

Reste le dessin de la capsule sélectionnée sur les sous-écrans : garantir le conteneur arrondi dans le rendu Android après changement de destination, puis vérifier les quatre captures concernées aux mêmes chemins. Aucune autre régression introduite par ce batch relevée. Le futur verdict ship couvrira les quatre corrections scorées, sans étendre la validation au Galaxy ou aux parcours non capturés.

disposition: fix

---

## verdict

Scoring final du seul reliquat de navigation, sans nouvelle chasse. Sept captures relues aux mêmes chemins, valides, 1080 × 2400 px ; analyse 4/4 défilée et splash inchangé acceptés.

1. **résolu — Navigation/scaling** : les quatre captures concernées (`phone-game-android.png`, `phone-exercise-android.png`, `phone-analysis-android.png`, `phone-game-font130-android.png`) montrent désormais la même capsule aux extrémités arrondies que l’accueil. Icônes et labels restent lisibles, entiers à 100 % et 130 %. Le conteneur natif non collapsable, le clipping et le fond explicite sont présents dans `application-screen.tsx:55,128` ; le rendu confirme cette fois le correctif.
2. **résolu — Contexte natif** : score résolu conservé ; retour et contexte restent visibles dans la top app bar des recaptures.
3. **résolu — Pièces** : score résolu conservé ; pièces locales homogènes et contours blancs robustes restent visibles dans les recaptures.
4. **résolu — Persistance du design** : score résolu conservé ; mise à jour minimale du document vérifiée au pass précédent, documentation finale traitée séparément sans modification du code capturé.

## remaining

clear — Aucune régression introduite par le correctif de capsule relevée. Ce ship couvre les quatre corrections scorées ; il ne vaut pas validation Galaxy, TalkBack ou des parcours non capturés. Aucun détecteur HTML/CSS exécuté sur le natif.

disposition: ship
