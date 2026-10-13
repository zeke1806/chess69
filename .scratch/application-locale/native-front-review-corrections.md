# Correctifs après les revues Spec et Standards

Base intégrée : `0e96d97`. Implémentation dans le worktree natif, sans contrôle
APK ni interaction avec l'émulateur de l'orchestrateur.

## Parcours et écritures concurrentes

Le contexte d'écran et le cycle de vie possèdent des générations distinctes.
Chaque action asynchrone applique ses messages, positions et flags seulement
si son contexte est encore courant. Une sauvegarde déjà engagée continue ;
elle actualise uniquement les données globales (progression, historique et
partie active), sans remplacer l'échiquier d'un autre parcours. Les lectures
concurrentes de ces données ignorent aussi les réponses plus anciennes.

Le snapshot sépare `activeGame` de `game`, la partie consultée. Accueil et Jouer
utilisent la première pour proposer Reprendre. L'analyse conserve son viewer
et ne masque plus la partie interrompue. Retour/navigation restaurent le
contexte de partie active.

Reproductions en rouge puis vert : coup retenu à l'écriture → ouverture guidée
avant libération ; consultation d'une ancienne partie alors qu'une seconde
est active ; mutation directe d'un palier de révision.

## Présentation et immutabilité

Le service front expose `analysisDetails` : messages d'évaluation, meilleur
coup, continuation, qualité, progression et libellé d'action. Le composant
reçoit ces textes. Le gagnant d'un mat utilise l'opération pure `mateWinner`
exportée par le module business d'analyse : la règle FEN/mat zéro a une seule
source. Aucun champ de persistance n'est modifié.

`ApplicationSnapshot` est profondément readonly ; ses objets et collections
sont gelés récursivement, y compris les enfants d'objets déjà gelés. Un WeakSet
par assemblage évite de retraverser les valeurs immuables. Les contrats publics
`ProgressionSummary.due` et `AnalysisView.score` ferment également les deux
mutabilités signalées.

Tests : évaluations cp positives/négatives, annonces de mat pour les deux camps,
mat zéro gagnant noir, qualité et continuation, score non modifiable,
initialisation tardive après dispose/remount, lecture d'analyse tardive,
callbacks/résultat après annulation. Le snapshot reste stable sans action.

## Jour civil commun

Le module pur `calendar` expose `localDay` depuis son point d'entrée service.
Exercices, parties terminées et calcul de série partagent cette convention,
sans dépendre d'une implémentation concrète de l'horloge. Une date locale près
de minuit et le passage d'année couvrent le comportement du helper.

## Vérification

Typecheck, `git diff --check` et suite complète : 10 suites, 71 tests passent.
Les tests ajoutés restent aux contrats publics avec stockage/moteur en mémoire.
Aucune nouvelle preuve Galaxy ni APK n'est revendiquée ; la compilation et le
parcours sur l'APK finale sont du ressort de la livraison de l'orchestrateur.
