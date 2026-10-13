# 02: Apprendre et réviser le catalogue embarqué

**What to build:** Apprendre et réviser le catalogue embarqué.

**Blocked by:** 01

**Status:** resolved

- [x] Métier : huit ouvertures et 24 variantes guidées et mémorisables, annotées par coup.
- [x] Métier : 120 puzzles et 24 finales vérifiés, filtrables, multi-coups, avec indice et solution.
- [x] Métier : tentatives atomiques, révisions 1/3/7/14/30 jours par camp et maîtrise après trois révisions dues.
- [x] Parcours intégrés et rendus vérifiés sur APK ARM64 émulée : guide/mémoire, finale sans aide, puzzle avec aide, résultats conservés.
- [ ] Contrôle matériel distinct : tests Galaxy à exécuter par l’utilisateur ; aucune validation téléphone revendiquée.

## Tests et interfaces

Contrats publics CatalogueService et LearningService, avec vrai RulesService et
RepositoryService en mémoire, horloge et identifiants déterministes. Suite sans
effet externe, native ou réseau.

## Preuves du 13 octobre 2026

- `tests/services-business/catalogue.test.ts` : trois tests ; 168 objectifs et leurs
  branches connues entièrement rejoués. Huit répertoires / 24 variantes, 120 FEN de
  puzzles différentes / 20 par thème, 24 finales. Mat, promotion et gain matériel
  contrôlés. Répertoires référencés et filtres vérifiés.
- `tests/services-business/learning.test.ts` : dix tests ; réponses adverses,
  erreur/aide/guidage, SRS par camp, absence de consolidation anticipée, échéances,
  échec/retry de sauvegarde, idempotence, concurrence, alternatives et promotion.
- `npm run typecheck` et `git diff --check` passent.
- Suite complète du worktree : 4 suites, 19 tests passent.
- Commits exclusifs : `3afcbf9`, `af659bf`, `e657dce` ; type review.color parent
  `d90b5f3` récupéré sous `9c50e48`.

## Décisions et limites

Catalogue documenté dans `docs/catalogue.md` : 120 puzzles et 16 finales CC0
Lichess, huit mats composés originaux, textes français et variantes créés pour
Chess69. Source et licence conservées par exercice. Aucune copie de catalogue
ChessFlare, aucune ressource téléchargée par l’application.

SRS uniquement ouvertures, clé `${contentId}:${color}`. Premier succès streak0,
révision due à un jour ; seules les révisions dues augmentent la maîtrise.
Échec/aide reset palier zéro et échéance aujourd’hui. Puzzles/finales restent des
résultats statistiques et ne créent aucune révision d’ouverture. Les intervalles
ajoutent des jours civils locaux, puis stockent un timestamp ISO.

Le service d’apprentissage et les parcours ont été intégrés et vérifiés par le
parent dans la vraie APK sur émulateur. Aucune validation Galaxy revendiquée.

## Correctif après revue Spec

Le contrôle de promotion initial acceptait aussi une promotion adverse. Le test
a été rendu rouge en exigeant une promotion effectuée par le camp entraîné.
Les exercices `005gP`, `02prs`, `00Qlc` et le puzzle `00blC` sont désormais
présentés comme des gains matériels avec arrêt du pion passé adverse. La finale
`00Aae` explique le sacrifice de promotion pour dévier et gagner une tour.
Leurs identifiants, positions et solutions sont conservés, avec objectifs honnêtes
et bilan matériel vérifié. Les textes des indices utilisent les articles corrects
pour la dame et la tour. Typecheck, diff et 19 tests du worktree passent.

## Validation intégrée

Suite finale : 76 tests / 11 suites, TypeScript strict et Expo Doctor 20/20.
Revues Standards et Spec : tous les constats reproduits puis corrigés et
contre-revus indépendamment. Parcours de la vraie APK, persistence et moteur
hors ligne : [vérification globale](../verification.md). Les essais Galaxy
restent distincts et sont remis dans [le protocole appareil](../phone-test.md).
