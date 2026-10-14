# Homogénéiser les retours de DI

Status: resolved
Blocked by: none

Appliquer `../spec.md` sans changer les responsabilités ou cycles de vie.

## Vérifications

- Typage, formatage/espacement et contrôle architectural réussis.
- 16 suites Jest, 111 tests existants réussis.
- Deux probes négatives : anciennes DI business et front rejetées ; DI actuelles acceptées.
- Exemple Todo : typage, formatage et 34 tests existants réussis.
- Skill : validation du dépôt (19 tests Python), audit ciblé et synchronisation sans écart.
- Revues Standards et Spec : aucun constat. Changement mécanique sans nouvelles dépendances,
  modification native, visuelle ou du stockage ; pas de reconstruction APK/Storybook.
