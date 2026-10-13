# Écran Android de contrôle

Status: resolved
Blocked by: aucun (scaffold installé)
Date: 2026-10-13

## Comportement livré

Un écran natif français affiche Chess69, la version injectée depuis la
configuration de compilation, « Prêt à tester » et un bouton « Tester ».
L'action affiche « Interaction confirmée ». Les appuis répétés sont stables ;
une nouvelle instance d'application repart dans l'état initial.

## Critères d'acceptation

- L'état et les messages appartiennent au service front, indépendant de React.
- Un binding React abonne la feature au snapshot stable et immuable.
- Le composant affiche uniquement ses props et invoque le callback reçu.
- Les routes Expo raccordent une seule instance de DI à l'application.
- L'écran noir/orange tient compte des insets et de la taille de texte système,
  avec un bouton d'au moins 48 dp. Aucun asset distant n'est nécessaire.
- Tests rapides et typage réussis ; rendu inspecté par l'agent responsable
  de l'intégration. Le test réel Galaxy S22 Ultra reste à confirmer.

## Interface testée avant implémentation

Le contrat public `InstallationCheckFrontService` expose `getSnapshot`,
`subscribe` (avec désabonnement) et `testInteraction`. La dépendance `version`
est injectée. Ce seam couvre le message initial, le résultat de l'action,
l'idempotence, l'abonnement et l'isolation des instances. Il ne valide pas
le rendu Android, la compilation, ni l'installation.

Les interfaces publiques des services front sont autorisées sans nouvelle
confirmation par [le mode de travail](../../../docs/mode-de-travail.md).

## Validation

- RED observé : module absent pour le test initial ; GREEN après création
  du service et de son snapshot initial.
- RED observé : `testInteraction` absente ; GREEN après publication du résultat.
- RED observé : nouvelle référence aux appuis répétés ; GREEN après la garde
  idempotente.
- RED observé : `subscribe` absente ; GREEN après ajout de l'abonnement et
  du désabonnement. Le test vérifie les messages reçus, sans mock interne.
- Contrôle de non-régression supplémentaire : une nouvelle instance revient
  au message initial sans modifier l'ancienne.
- `npm test` : 1 suite, 5 tests réussis le 13 octobre 2026.
- `npm run typecheck` : réussi en TypeScript strict. Les tests importent
  explicitement `@jest/globals`.
- `git diff --check` : réussi.
- Contrastes calculés sur les couleurs sRGB : texte principal 16,32:1,
  secondaire 10,30:1, confirmation 9,11:1, libellé du bouton 8,69:1
  (6,82:1 en état pressé).
- Inspection du rendu web 412 × 915 et revue finale effectuées, voir ../verification.md.
  Installation, toucher et réouverture sur Galaxy S22 Ultra restent en attente
  du retour utilisateur ; les tests de service n'en constituent pas la preuve.

## Comments

- Skills lus : implement, tdd (tests et mocking), codebase-design, impeccable.
- `impeccable context` indisponible : lanceur non exécutable. Contexte lu
  directement ; références Android, Operate et Craft floor appliquées.
- Aucun service métier, repository, réseau ou stockage ajouté pour ce jalon.
