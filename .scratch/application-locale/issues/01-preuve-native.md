# 01: Stockfish et SQLite dans une APK hors ligne

**What to build:** Stockfish et SQLite dans une APK hors ligne.

**Blocked by:** None

**Status:** resolved

- [x] Stockfish ARM64 répond à UCI et joue un coup légal dans la vraie APK.
- [x] SQLite écrit, relit et migre sans effacement ; erreur récupérable.
- [x] Signature, logo, splash et identité sont conservés ; sauvegardes automatiques désactivées.

## Tests et interfaces

Contrats publics des services business/front avec adaptateurs en mémoire ; comportements observables et erreurs. Les adaptateurs natifs et la distribution ont des contrôles Android/HTTP distincts.

## Livraison et preuves

Le module Expo Stockfish 17.1 JNI ARM64, les deux NNUE, les repositories SQLite/mémoire et le cycle de vie explicite sont implémentés.
Voir [preuve native](../native-verification.md) : véritable APK signée hors ligne, coups/score de mat, annulation, SQLite/migration/retry, remplacement de version avec données.
Les contrats publics mémoire passent cinq tests ajoutés ; typecheck et suite complète (10 tests) passent.
La revue globale des deux axes est prise en charge par l’orchestrateur avant publication. Les parcours finaux et le Galaxy restent des contrôles distincts.

## Validation

Preuve native sur vraie APK signée Android API36 ARM64 en mode avion, mise à jour avec données, SQLite migration et erreur/retry, UCI trois niveaux, mat, annulation et réutilisation. Voir [rapport](../native-verification.md). Contrôles Samsung et UI finale restant distincts.
