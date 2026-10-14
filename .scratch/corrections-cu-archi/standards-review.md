# Standards — revue de la mise en conformité

Base e8f1a65, première implementation 6ae3b5f. Lecture indépendante.

## Constats initiaux

- P2 : reprise d’annulation inefficace. Game.cancelThinking et Analysis.cancel
  effacent le contrôleur dans finally même si engine.cancel rejette. Le retry
  de l’orchestration n’effectue ensuite aucun nouvel arrêt physique. Repro avec
  vrais services : une seule tentative d’arrêt après deux cancel ; nouvelle
  opération acceptée avec une ancienne évaluation en attente. Défaut hérité,
  à corriger pour la garantie de reprise demandée.
- P3 : dépendances métier encore trop larges. Analysis utilise seulement
  rules.position ; Analysis/Game utilisent seulement engine.evaluate/cancel.
  Réduire les contrats avec Pick et laisser lifecycle à la composition.

Aucune heuristique facultative supplémentaire concrète. Découpage front,
pureté du raccordement et format SQLite V1 cohérents. Corrections en cours,
puis contre-revue ciblée prévue.

## Contre-revue ciblée

Standards : P2/P3 résolus ; aucun nouveau constat sur les corrections ciblées. Les contrôleurs sont conservés après un arrêt physique échoué, le retry rappelle le moteur et les nouveaux travaux restent bloqués. Les Picks Analysis/Game/Learning ne contiennent que les méthodes utilisées. Tests ciblés : 48/48 dans trois suites.
