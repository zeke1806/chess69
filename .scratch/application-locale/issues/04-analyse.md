# 04: Analyser les parties localement et progressivement

**What to build:** Analyser les parties localement et progressivement.

**Blocked by:** 03

**Status:** resolved

- [x] Évaluations, mats, meilleurs coups et écarts documentés par position.
- [x] Annulation et navigation réactive ; résultats partiels conservés.

## Tests et interfaces

Contrats publics des services business/front avec adaptateurs en mémoire ; comportements observables et erreurs. Les adaptateurs natifs et la distribution ont des contrôles Android/HTTP distincts.

## Comments

Métier livré : interface `AnalysisService` (`analyze/get/cancel`), checkpoints
persistés avant `onProgress`, reprise sans doublon, génération et `AbortSignal`.
Les seams couvrent évaluations de chaque ply et de la dernière FEN, convention
blancs, centipions/mats distincts, seuils documentés, erreur moteur/stockage,
annulation avec réponse native tardive ou écriture en attente, et conservation
sans effacement d'un checkpoint incohérent.

Validation métier : 17 tests analysis réussis ; TypeScript strict réussi.
Budget initial : 250 ms par position au niveau club ; fluidité réelle et budget
sur Galaxy restent à mesurer. Navigation/analyse native sur APK sont des
contrôles d'intégration distincts. Décisions : [règles et analyse](../../../docs/game-analysis.md).

## Validation intégrée

Suite finale : 76 tests / 11 suites, TypeScript strict et Expo Doctor 20/20.
Revues Standards et Spec : tous les constats reproduits puis corrigés et
contre-revus indépendamment. Parcours de la vraie APK, persistence et moteur
hors ligne : [vérification globale](../verification.md). Les essais Galaxy
restent distincts et sont remis dans [le protocole appareil](../phone-test.md).
