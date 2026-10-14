# Externaliser les données des services

Status: resolved
Blocked by: none

Implémenter les critères de `../spec.md` et noter les contrôles réellement
exécutés. Interfaces publiques : learning, data, stateful et assemblages.

## Vérifications

- TDD : tests publics de session rouge avant la modification de Learning,
  puis isolation, reconstruction et sauvegarde partagée réussies.
- Typage, formatage/espacement et architecture réussis ; 122 sources sans cycle.
- Jest : 18 suites, 116 tests (après ajout de la sauvegarde partagée).
- Trois probes négatives : ancienne session capturée, variable globale et cache
  capturé rejetés ; version actuelle acceptée.
- Storybook : build réussi et 67 contrôles Playwright réussis.
- Todo : 35 tests, contrôle TypeScript et formatage réussis.
- Skill : validation du dépôt (19 tests Python) et audit ciblé réussis.
- Revues Standards et Spec : aucun constat. Skill actif synchronisé sans écart.
- JSON embarqués déplacés sans changement de contenu. SQLite et pont natif
  inchangés ; aucune APK reconstruite ni preuve téléphone supplémentaire.
