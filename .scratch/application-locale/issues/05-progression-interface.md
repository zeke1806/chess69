# 05: Accueil et progression dans une interface Android française

**What to build:** Accueil et progression dans une interface Android française.

**Blocked by:** 02, 03, 04

**Status:** resolved

- [x] Accueil, apprendre, jouer, progression, révisions et historique utilisables.
- [x] Activité par jour local, série, réussites sans aide et maîtrise exactes.
- [x] Échiquier orienté, coups possibles, dernier coup, échec, grandes cibles et états accessibles.

## Tests et interfaces

Contrats publics des services business/front avec adaptateurs en mémoire ; comportements observables et erreurs. Les adaptateurs natifs et la distribution ont des contrôles Android/HTTP distincts.

## Validation intégrée

Suite finale : 76 tests / 11 suites, TypeScript strict et Expo Doctor 20/20.
Revues Standards et Spec : tous les constats reproduits puis corrigés et
contre-revus indépendamment. Parcours de la vraie APK, persistence et moteur
hors ligne : [vérification globale](../verification.md). Les essais Galaxy
restent distincts et sont remis dans [le protocole appareil](../phone-test.md).
