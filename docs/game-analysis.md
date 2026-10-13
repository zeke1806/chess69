# Parties locales et analyse

## Règles et sauvegarde

L'adaptateur de règles est seul à importer `chess.js`. Le métier reçoit son
contrat `RulesService` par injection. Chaque position d'une partie est reconstruite
à partir de tous ses coups UCI, et non de la seule dernière FEN : cela conserve
l'historique nécessaire à la répétition. Les coups affichables sont aussi fournis
en notation SAN. Le roque, la prise en passant et les quatre promotions sont
légaux selon ce moteur de règles ; une promotion exige le suffixe `q`, `r`, `b`
ou `n`, choisi par le joueur.

Une partie active est conservée. Créer sa remplaçante exige la confirmation de
l'abandon ; l'abandon et la nouvelle partie sont écrits ensemble. Une partie
terminée reste dans l'historique, présenté de la plus récente à la plus ancienne.
Un coup, un abandon et une fin de partie ne sont annoncés qu'après sauvegarde.
Une erreur de stockage ou du moteur permet de réessayer depuis les coups déjà
sauvegardés. Les actions concurrentes reçoivent une erreur `busy`, et une écriture
fondée sur une ancienne partie reçoit `conflict`.

Les résultats sont `1-0` (blancs), `0-1` (noirs) ou `1/2-1/2` (nulle).
Le mat finit la partie. Le pat, le matériel insuffisant détecté par `chess.js`,
la troisième occurrence d'une même position et les 50 coups de chaque camp
sans mouvement de pion ni prise sont automatiquement déclarés nuls. Ce choix
évite une procédure de réclamation dans l'application sans pendule ; il n'est
pas présenté comme la procédure d'un tournoi officiel. L'abandon fait perdre
le camp du joueur. Le jour d'activité est le jour civil local de la fin, fourni
par l'horloge injectée.

## Évaluations et qualificatifs

L'analyse porte sur les parties terminées dans Chess69. Elle calcule la position
initiale (`ply = 0`) puis chaque position après un demi-coup, y compris la dernière.
`assessment.ply = 1` désigne donc le premier coup et la position qu'il produit.
Le meilleur coup et la continuation principale restent des coups UCI, associés
à la position avant de les jouer. Une position déclarée nulle par les règles
reconstruites reçoit directement 0 cp, sans meilleur coup ni continuation :
une FEN seule ne conserve pas l'historique de troisième répétition, donc une
ouvelle recherche moteur ne peut pas décider de cette nulle.

Les scores Stockfish sont reçus du point de vue du camp au trait. Le stockage
et l'affichage de l'analyse les convertissent au point de vue des blancs : un
score positif favorise les blancs, un score négatif favorise les noirs. Un pion
vaut 100 centipions (`cp`). Une annonce de mat conserve le type `mate` et sa
distance native ; elle n'est jamais convertie en un nombre artificiel de pions.
`mate = 0` désigne une position déjà matée ; son camp au trait dans la FEN est
le perdant, même après sérialisation de zéro.

Pour un coup dont les deux évaluations sont en centipions, la perte est
`max(0, avant - après)` pour les blancs et `max(0, après - avant)` pour les noirs.
Les seuils inclusifs suivants déterminent les qualificatifs :

| Perte | Code métier | Libellé français |
| --- | --- | --- |
| Moins de 50 cp | `good` | Bon coup |
| De 50 à moins de 100 cp | `inaccuracy` | Imprécision |
| De 100 à moins de 200 cp | `mistake` | Erreur |
| 200 cp ou plus | `blunder` | Gaffe |

Si un mat intervient dans l'une des évaluations, la perte en centipions est
absente (`null`). Perdre un mat favorable donne `missed-mate` (mat manqué) ;
introduire un mat adverse auparavant absent donne `allows-mate` (mat permis).
Les autres transitions de mat donnent `good` : conserver un mat favorable,
sortir d'un mat adverse ou rester dans un mat adverse déjà forcé n'invente pas
une perte en centipions. Un changement de distance seul n'est pas pénalisé.
Ces règles déterministes décrivent l'analyse de Chess69 ; elles ne reproduisent
pas les qualificatifs de ChessFlare ni un classement officiel.

## Calcul, annulation et reprise

Le budget initial est de 500 ms par réponse en partie, avec le niveau choisi,
et de 250 ms par position en analyse, au niveau `club`. Threads et Hash sont
configurés dans l'adaptateur natif : leur validation et la mesure sur Galaxy
appartiennent aux contrôles Android, distincts de ces tests métier. Ce budget
est un choix réversible à ajuster si la mesure réelle le justifie.

Chaque évaluation est enregistrée avant de déclencher la notification de
progression. Annuler ou interrompre l'analyse conserve ses checkpoints. Le
prochain appel reprend à la première position manquante. `AbortSignal` et un
numéro de génération empêchent les réponses tardives, ou les écritures encore
en attente, d'annoncer un résultat annulé comme sauvegardé. Un checkpoint
incohérent provoque une erreur récupérable, sans effacement automatique.

## Vérifications

Les tests rapides utilisent le vrai adaptateur `chess.js`, un repository en
mémoire, une horloge fixe et des réponses moteur déterministes. Ils vérifient
roque, prise en passant, promotions, mat et nulles, sauvegarde/reprise, abandon,
concurrence, retry après erreur, scores et seuils, dernière position analysée,
annulation native simulée, checkpoints et réponses tardives. Aucun de ces tests
n'accède à SQLite natif ou à Stockfish réel. Installation, fluidité, SQLite,
Stockfish hors ligne et budget sur Galaxy exigent les vérifications APK/appareil.
