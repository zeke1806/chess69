# CU-ARCHI-01 — Contrats cohérents et données immuables

Blocked by: none
Status: resolved

## Critères d’acceptation

Séparer Clock/Identity ; schémas communs niveaux, scores et coups ; collections imbriquées readonly ; consommateurs et fixtures adaptés. Ports publics métier et parsing couvrent les anciennes valeurs sans durcir le format persisté. Tester directement anciennes valeurs et branches. A1/A6/A7.

## Interfaces de test

Contrats publics concernés et assemblages mémoire, conformément à spec.md.

## Vérification

Red : les deux nouveaux tests de parsing direct échouaient sur le gel absent des branches. Green : 62 tests métier et contrats dans 11 suites passent (14 octobre 2026). Types compilent dans les sources métier ; le contrôle global identifie seulement les fixtures front mutables, à adapter pendant le ticket de présentation. Clock et Identity sont séparés ; schémas propriétaires learning/game/analysis/progression et validations moteur/UCI partagées ; parsing version 1 inchangé. Les schémas imbriqués readonly protègent objets et collections à l’exécution et dans les types. Les fixtures historiques métier construisent des valeurs neuves.
