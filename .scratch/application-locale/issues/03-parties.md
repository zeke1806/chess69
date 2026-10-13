# 03: Jouer et reprendre une partie contre Stockfish

**What to build:** Jouer et reprendre une partie contre Stockfish.

**Blocked by:** 01

**Status:** resolved

- [x] Trois niveaux et choix du camp ; tous les coups légaux, promotion et fins.
- [x] Une partie active persistée, abandon confirmé, reprise et historique.
- [x] État de réflexion et erreur récupérable sans perdre de coups.

## Tests et interfaces

Contrats publics des services business/front avec adaptateurs en mémoire ; comportements observables et erreurs. Les adaptateurs natifs et la distribution ont des contrôles Android/HTTP distincts.

## Comments

Métier livré : interface `GameService` (`start/resume/play/think/cancelThinking/resign/history/get`)
avec `RulesService` injecté. Les seams de test couvrent reprise après nouvelle
instance, sauvegarde avant résultat, remplacement confirmé atomique, tour et
légalité, mat du joueur/moteur, abandon, erreurs et retry, actions concurrentes
et réponse moteur tardive après annulation. Le vrai adaptateur de règles couvre
roque, prise en passant, quatre promotions et les cinq fins documentées.

Validation métier : 10 tests game + 7 tests rules réussis ; TypeScript strict réussi.
Interface tactile et véritable Stockfish/SQLite sur APK restent des contrôles
séparés de l'intégration. Décisions : [règles et analyse](../../../docs/game-analysis.md).

## Validation intégrée

Suite finale : 76 tests / 11 suites, TypeScript strict et Expo Doctor 20/20.
Revues Standards et Spec : tous les constats reproduits puis corrigés et
contre-revus indépendamment. Parcours de la vraie APK, persistence et moteur
hors ligne : [vérification globale](../verification.md). Les essais Galaxy
restent distincts et sont remis dans [le protocole appareil](../phone-test.md).
