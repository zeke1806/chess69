# Conformité CU-ARCHI et aération des fonctions

Demande du 14 octobre 2026 : corriger les écarts restant dans le nouvel audit,
actualiser le mode de travail et refaire les vérifications. Ajouter une ligne
vide entre les membres d'objet qui définissent des fonctions : ce sont des
blocs de lecture distincts, notamment createInitialState/connect et les actions.

Base : `3d2ffc4`. Source normative : skill CU-ARCHI local et ses références,
avec la stack React Native/Expo de Chess69. Aucun changement fonctionnel,
format de données persistées, dépendance ou publication demandé.

## Critères de fin

- Schémas kind/couleur partagés sans changement des valeurs acceptées.
- Contrats de services et ports sous forme d'interfaces readonly.
- Opérations principales avant leurs helpers quand le hoisting le permet ;
  préférences let/const et Remeda appliquées aux transformations pertinentes.
- Corps Kotlin/C++ lisibles et multilignes, intégration native préservée.
- Une ligne vide sépare les fonctions définies dans les objets ; les groupes
  de données et déclarations d'une même étape restent compacts.
- Mode de travail désattribuant les anciennes obligations par ticket/TDD à
  CU-ARCHI, précision d'espacement conservée localement.
- Typage, formatage, contrôle architectural, tests Jest/Storybook et compilation
  Android vérifiés ; limites de preuve native explicites.
- Revue Standards et Spec, puis un commit final fusionné sur main.

## Interfaces de vérification

Contrats publics existants learning/game/progression, repository, moteur,
stateful et orchestration ; assemblages en mémoire et SQLite temporaire.
Les tests existants protègent les comportements. Ajouter une preuve ciblée
d'immutabilité seulement si elle manque pour une transition modifiée.
