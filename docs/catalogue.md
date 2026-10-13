# Catalogue embarqué de Chess69

Le catalogue de la version 0.2 contient 8 répertoires, 24 variantes, 120 puzzles
et 24 finales. Les identifiants du contenu sont stables ; la progression ne
dépend pas de l’ordre d’affichage. Les données JSON sont intégrées à l’APK.
Aucun téléchargement ou appel à Lichess n’a lieu sur le téléphone.

## Origine et droits

- Les 24 variantes d’ouvertures, leurs idées, erreurs habituelles, annotations
  par coup et tous les textes français sont créés pour Chess69. Les coups
  décrivent des lignes usuelles ; aucun texte ou catalogue ChessFlare n’est copié.
- Les 120 puzzles et 16 finales de pions/tours proviennent de la
  [base publique officielle Lichess](https://database.lichess.org/#puzzles),
  export du 5 octobre 2026, consulté le 13 octobre 2026. Lichess autorise la
  modification et redistribution de ses exports sous
  [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
  Chaque exercice conserve le fournisseur, l’identifiant source, la licence
  et le lien de la partie d’origine dans son champ `source`.
- Les 8 positions de mats élémentaires sont des compositions originales :
  dame et roi, tour et roi, deux tours, deux fous. Elles travaillent la
  coordination des pièces dans des positions de bord différentes.

La licence CC0 porte sur les positions et solutions de l’export Lichess,
pas sur le logo, l’interface ou le code de Lichess. Aucun de ces éléments
n’est intégré. Les explications françaises sont originales.

## Sélection et preuve des objectifs

Les positions Lichess retenues ont une cote de puzzle de 700 à 1750, une
popularité d’au moins 80, une solution de 1 à 9 demi-coups et un identifiant
unique. Les 120 puzzles possèdent 120 FEN différentes : vingt mats,
fourchettes, clouages, enfilades, attaques à la découverte et éliminations
du défenseur. Il ne s’agit pas de positions répétées par symétrie.

Le premier coup de l’export est celui de l’adversaire. Il a été appliqué avant
de fixer la FEN affichée ; les coups suivants constituent la solution du camp
entraîné. Ce format est décrit par la source officielle. Les solutions sont
prévalidées par le processus Stockfish de Lichess ; cette provenance ne
remplace pas la vérification locale.

La suite rapide rejoue toutes les variantes et branches connues avec les
règles `chess.js`. Elle vérifie que la position n’expose pas illégalement le
roi du camp qui vient de jouer, que chaque coup est légal et que le dernier
coup produit le mat, une promotion ou un gain matériel net d’au moins un
point. Le bilan utilise pion 1, cavalier/fou 3, tour 5 et dame 9. Les positions
qui ne réalisent pas un tel objectif ont été exclues de la sélection.

Les finales de pions travaillent la promotion du camp entraîné ou l’arrêt
d’un pion passé adverse. Une promotion utilisée pour dévier une tour puis
sacrifiée est présentée comme un gain matériel, pas comme la conservation
du pion promu. Les objectifs de promotion sont vérifiés pour le camp entraîné,
et jamais sur la seule présence d’une promotion adverse dans la séquence.
Les finales de tours contiennent au maximum neuf pièces et un objectif concret.
Les mats en un coup acceptent
tous les coups de mat légaux trouvés dans la position, consignés comme branches
alternatives. Pour les autres exercices, seules les alternatives connues sont
acceptées ; l’application entraîne la séquence du catalogue, sans promettre
de juger toutes les continuations possibles.

## Usage pédagogique

Le mode guidé montre le coup attendu et compte comme tentative avec aide.
La mémorisation évalue les coups du camp choisi ; les coups adverses sont
automatiques. Les puzzles et finales fixent le camp actif de leur position.
Un coup illégal ne déplace aucune pièce. Un coup légal différent de la solution
reste sur la position courante, donne un retour et invalide le succès sans aide.
Les indices et la solution expliquée sont disponibles hors ligne.

Les objectifs et explications ne constituent pas une couverture exhaustive
des ouvertures ni une évaluation du niveau officiel du joueur. Les variations
permettent de comprendre puis de mémoriser des plans débutant/intermédiaire.

## Répétition espacée

La mémorisation d’une ouverture est suivie par variante et par camp. Le premier
succès sans aide programme la révision à un jour, sans compter comme une révision
consolidante. Les révisions dues réussies programment ensuite 3, 7, 14 puis
30 jours ; au dernier palier, l’intervalle reste de 30 jours. Trois révisions dues
consécutives sans aide rendent l’entraînement consolidé. Une répétition anticipée
est conservée dans les tentatives et garde l’échéance et le palier existants.

Une erreur, un indice, le mode guidé ou une solution montrée invalide le succès
sans aide et remet le camp au palier zéro, à retravailler aujourd’hui. Les résultats
des puzzles et finales sont conservés sans créer de révision d’ouverture. Tentative
et révision sont écrites ensemble ; une erreur de stockage laisse la sauvegarde
réessayable sans annoncer un succès sauvegardé.

Les intervalles ajoutent des jours civils avec l’horloge locale injectée ; les
échéances persistées sont des timestamps ISO. L’activité conserve séparément le
jour civil local pour les statistiques.
