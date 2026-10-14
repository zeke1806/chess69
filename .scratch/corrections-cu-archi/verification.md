# Vérification et livraison CU-ARCHI — Chess69 0.2.1/code 5

14 octobre 2026. Base `e8f1a65`, travail sur branche dédiée dans le dépôt
principal, sans worktree. A1–A9 et D1 sont traités dans l’ordre de
[l’audit](../../docs/audit-cu-archi.md). Les normes restent dans le skill global ;
les procédures et contraintes Chess69 restent dans ce dépôt.

## Résultat et contrats

- Horloge/identité séparées ; schémas uniques par domaine et données imbriquées readonly.
- Repository façade avec ports ciblés, storage privé, transactions/queue/conflits
  préservés. Même payload et table SQLite, version 1 ; aucune migration destructrice.
- Front : learning, game, analysis, progression, board, orchestration. Le shell
  coordonne navigation/lifecycle/exclusion moteur ; les modules possèdent leurs
  états/actions. Binding stateful générique avec connexions isolées et garde de démontage.
- Vues common/business stateless ; choix, sélection et promotion dans les services.
  Assets, palette, français, signature et procédures natives conservés.
- Noms/chemins CU-ARCHI, blocs explicites, Remeda ciblé et format vérifié.
- 17 composants, 66 stories RNW ; aucune entrée Storybook dans la production Expo.

## Vérifications automatisées

- TypeScript strict global : succès, y compris stories/configurations/tests.
- Jest : **108 tests dans 15 suites passent**. Les 76 tests historiques sont
  conservés/adaptés ; 32 scénarios supplémentaires vérifient les corrections.
- Le ticket 02 utilise le vrai `node:sqlite` avec bases temporaires, fermeture
  des connexions et suppression en fin de suite. La frontière Expo seule est
  substituée. Réouverture V1, transactions/rollback, concurrence et migrations
  ne sont pas prouvées uniquement par des mocks de ports.
- Régressions front : écriture tardive, anciens états, deux connexions, sélection,
  promotion/annulation, exclusion moteur, retry après mutation déjà sauvegardée.
- Les quatre reproductions de contre-revue sont rouges avant correction puis
  vertes : arrêt physique échoué Game/Analysis avec vrais services injectés ;
  navigation puis récupération d’erreur lifecycle startup/foreground.
- `npm run format:check` : succès.
- `npm run check:architecture` : 95 sources, 17 vues stateless, 178 fonctions
  affectées avec blocs ; chemins/frontières/imports statiques sans cycle.
  Ce contrôle ciblé complète la revue, sans prétendre prouver toute l’architecture.
- `npm run storybook:test` : build réussi, **67 tests Chromium réussis** (dernier
  passage 14,8 s), rendu réel RNW/SvgXml/Modal, interactions échiquier et promotion,
  sans erreur JS/console/requête ; captures 412/480 px dans `artifacts/cu-archi-stories`.
- `npx expo install --check` : dépendances compatibles ; Expo Doctor : 20/20.
  Script `storybook:dev` nommé pour éviter la collision avec le binaire Storybook.
- Build APK final : Gradle release ARM64 réussi après correctifs de contre-revue
  (23 s), bundle Hermes et Stockfish 17.1/NNUE intégrés, sans Metro.
- `git diff --check` : succès.

## APK et sources

Fichier local : `artifacts/chess69-0.2.1-5-arm64.apk`.
Métadonnées : [release.json](release.json).
Taille : 124 049 077 octets ; SHA-256
`9c7754f0e507dccb6500ae5183694290fbf15fa1aea608cc366d94eaf6bd63df`.
Certificat identique :
`e0795076a4d2d489b5f774ff2d1ca605ee3b1117ce1717ad02e5e683fb4b5b3a`.
Package `ovh.rentabe.chess69`, API 24+, code 5, ARM64, non-debuggable,
alignement 16 Kio, SQLite présent, permission Internet et backup absents.

L’archive locale `artifacts/chess69-0.2.1-5-source.tar.gz` est préparée depuis
le commit final ; `SOURCE-REVISION.txt` identifie cette révision. Elle conserve
sources originales/native/Stockfish/NNUE, assets, licences, lockfile et scripts ;
exclut secrets, builds/dépendances et dossiers d’agents. Recompilation avec sa
propre signature : [instructions](../../docs/source-release.md).
Aucun push ni publication VPS n’est effectué dans ce travail.

## Android natif

Émulateur `chess69-api36`, `emulator-5556`, Android API 36 ARM64, téléphone
1080 × 2400 (override AVD ; résolution physique 1344 × 2992) (surface compacte). Lancement sans fenêtre/audio/snapshot-save.
Pas de wipe, désinstallation ni effacement des données. Installation release
par `adb -s emulator-5556 install -r` ; fonctionnement sans Metro.
Mode avion 1 et `Active default network: none` confirmés.

- Base native 0.2.0/code 4 déjà installée avec progression et partie active.
  Captures `before-update` et `before-update-progression` avant installation.
- Mise à jour 0.2.1/code 5 conserve 2 réussites, série 1 jour, ouverture/finale
  réussies, puzzle aidé, révision et 2 parties historiques.
- Partie Amateur/noirs retrouvée avec e3 ; e7e5 obtient Nc3 hors ligne.
  L’APK finale est reconstruite après les correctifs, installée en mise à jour,
  et retrouve ces coups. g8f6 obtient d4 avec Stockfish natif ; arrêt forcé,
  relancement puis reprise conservent `1.e3 e5 2.Nc3 Nf6 3.d4`.
- Confirmation de remplacement affichée ; Garder ma partie conserve la partie active.
- Historique antérieur conservé ; position/coup suivant et évaluations déjà
  sauvegardées consultables, sans remplacer la partie active.

- Guide Giuoco Piano : Suivant passe à 1/12 ; sortie vers l’écran Android puis
  retour au premier plan conserve le curseur 1/12 et la position e4. Retour
  système Android mène au détail d’ouverture.
- Puzzle Mat 01 : indice puis d5g2, fin avec aide et progression mise à jour.
  Les tentatives antérieures restent présentes ; total de 2 puzzles aidés et
  série de 2 jours après la tentative du 14 octobre.
- Remplacement confirmé : partie précédente conservée dans l’historique,
  nouvelle partie Découverte/blancs créée avec les options choisies.
  e2e4 reçoit e7e5 ; abandon confirmé conserve les 2 demi-coups.
- Analyse de cette nouvelle partie : calcul sur Stockfish natif hors ligne,
  « Analyse terminée et sauvegardée », scores/meilleurs coups affichés.
  Après recréation Android liée au changement de configuration, historique
  et analyse sont relus depuis SQLite ; Suivant retrouve l’évaluation +0.38
  et c7c5. Les 4 parties terminées, anciennes et nouvelles, sont conservées.
- Inspection visuelle groupée sur téléphone : accueil, partie, progression,
  options et détails d’analyse ; rendu normal puis font_scale 1.3 avec mode
  système sombre. Palette/typographie/pièces/navigation maintenues, paragraphes
  et choix passent à la ligne, contenu long accessible par défilement, barres
  système dégagées. Aucun défaut bloquant constaté, aucune retouche visuelle
  supplémentaire. font_scale restauré à 1.0, nuit système auto.
- Logcat depuis l’installation de l’APK finale : aucune exception JS ou panne
  native fatale détectée par le filtre documenté dans `native-errors.txt`.

Captures natives PNG/XML dans `artifacts/cu-archi/screenshots`, notamment
`final-new-engine-answer`, `final-guide-foreground`, `final-puzzle-complete`,
`final-new-analysis-complete`, `final-font-home`, `final-font-play`,
`final-font-progression` et `final-font-analysis`. Les fichiers sont des preuves
locales générées, ignorées par Git ; le compte rendu et les métadonnées sont versionnés.

## Revues et limites

[Standards](standards-review.md) : deux constats corrigés et contre-revus,
aucun nouveau constat sur corrections ciblées. [Spec](spec-review.md) : un
constat corrigé et contre-revu, aucun nouveau constat sur son correctif.
Les axes restent séparés ; aucun défaut identifié n’est laissé en attente.

Les stories RNW ne certifient pas TalkBack natif. L’émulateur ne valide pas
performances/gestes/installation sur le Galaxy S22 Ultra ; cette vérification
matérielle reste à réaliser sur le téléphone. Aucune validation tablette
n’est revendiquée (cible de cette livraison : téléphone Android).

## Livraison Git

Les commits intermédiaires sont regroupés en un commit final depuis `e8f1a65`,
avec corps décrivant contrats, décisions, validations et livraison. Fusion par
avance rapide sur `main`, puis suppression de la branche de travail. La
révision exacte est consignée dans l’historique Git et l’archive des sources.
