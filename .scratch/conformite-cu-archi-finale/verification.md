# Vérification de conformité finale — 14 octobre 2026

Base : `3d2ffc4`. Périmètre : [spec](spec.md), ticket [01](issues/01-conformite.md).

## Corrections

- R1 : kind et couleur ont chacun un schéma unique ; les consommateurs et
  préférences les réutilisent/dérivent. Comparaison avant/après sur 39 entrées :
  mêmes succès/échecs, données et erreurs de validation.
- R2 : services métier, ports d'adaptation et services UI sont des interfaces
  readonly ; les services UI étendent StatefulService. Les données restent
  inférées des schémas ou définies par des aliases readonly.
- R3 : helpers hoistables des adaptateurs, DI et orchestration placés après
  leurs consommateurs, closures et initialisation conservées.
- P1/P2 : transformations métier pertinentes via Remeda, let avant const lorsque
  les dépendances le permettent. Copies de tableaux/score conservées lorsqu'elles
  expriment une copie intentionnelle ; aucun structuredClone ajouté.
- L1 : blocs Kotlin/JNI multilignes, opérations avant helpers avec déclarations
  anticipées C++ ; signatures, verrous et logique conservés.
- Renvoi obsolete : mode de travail corrigé, processus Matt Pocock distingué
  de l'organisation/isolation des tests CU-ARCHI.
- Demande d'espacement : une ligne vide entre fonctions définies dans un objet
  et leurs voisins ; propriétés de données consécutives gardées ensemble.
  Précision dans le mode de travail, formatage automatique et contrôle couvrant
  sources/tests/stories et fonctions déclarées hors objets. Les types des
  contrats sans corps restent compacts.

## Contrôles terminés

- `npm run typecheck` : succès.
- `npm run format:check` : succès ; aucun espacement restant à ajuster.
- `npm run check:architecture` : 113 sources, 17 vues, 350 fonctions affectées
  avec blocs ; contrôles de frontières et graphe d'import sans cycle réussis.
- `npm test -- --watch=false` : 108 tests, 15 suites réussies. Trois scénarios
  learning existants vérifient maintenant directement les anciens snapshots
  et branches après progression, erreur, indice, révélation et sauvegarde.
- `npm run storybook:test` : build réussi, 67 contrôles Chromium réussis.
- Outils dans un répertoire temporaire : détection d'un espacement manquant,
  correction de méthodes/getter/fonctions fléchées/objets inline, conservation
  des commentaires et groupes de données, idempotence ; refus d'un alias
  de contrat Service et d'une fonction nommée sans bloc. Nettoyage garanti.
- Première compilation Gradle `:app:assembleRelease`, ARM64 : succès,
  Kotlin et C++ recompilés. Compilation finale après dernière correction
  d'espacement : succès en 19 secondes, 572 tâches (23 exécutées, 549 à jour). Le bundle
  JavaScript release est régénéré à partir des sources finales.
- `git diff --check` : succès avant revue.

## Revues

Première revue depuis la base : Standards 1 constat d'aération hors objets,
Spec 0 constat. La séparation des helpers/fonctions déclarées est corrigée et
ajoutée au formateur. Détection rouge puis correction et idempotence vérifiées
sur fonctions nommées et déclarées dans un répertoire temporaire.

Les modifications applicatives suivant les suites complètes sont exclusivement
des lignes vides : la comparaison avant/après le correctif de revue, en ignorant
les lignes vides, ne produit aucun diff dans src/tests/.storybook. Les tests
de comportement ne sont donc pas répétés pour ce seul espacement.

Contre-revues : [Standards](standards-review.md) 0 constat restant,
[Spec](spec-review.md) 0 constat. Derniers contrôles de formatage, architecture
et diff check réussis. Liens locaux des documents modifiés vérifiés.

## Limites et livraison

Les warnings de taille de bundle Storybook et de dépréciation Gradle ne sont
pas des échecs des contrôles. Le checker ne remplace pas la revue manuelle de
cohésion, validation partagée et ordre de lecture, ni une preuve native.

Le build local sert à vérifier la compilation ; aucune publication ni nouvelle
version d'application n'est demandée. Aucune nouvelle exécution sur émulateur
ou Galaxy S22 Ultra n'est revendiquée. Les formats SQLite V1 restent identiques.

Livraison Git : un seul commit final regroupant les corrections et leurs
preuves, fusionné sur main par avance rapide ; branche de travail supprimée.
