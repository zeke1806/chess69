# Pages réelles stateless

Status: resolved
Blocked by: none

## Comportement livré

ApplicationScreen assemble les neuf parcours dans le shell réel à partir de props.
ApplicationFeature réutilise cette vue et garde hooks, dimensions, cycle de vie,
retour Android et confirmations natives. Les stories utilisent la même composition.
Les seize états de pages complètes complètent les stories des composants isolés.

## Vérification

TypeScript, Jest (116 tests) et les 112 contrôles Playwright passent : tous les
parcours complets, chargement, erreur, premier lancement, reprise, progression vide,
échiquier et analyse. Preuves et limites dans ../verification.md.
