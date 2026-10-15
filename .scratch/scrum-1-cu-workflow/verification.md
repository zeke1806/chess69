# Vérification de SCRUM-1

## Réalisé

- Audit structurel du dépôt ai-skills : réussi, y compris les références de CU Workflow.
- Validateur du dépôt : réussi ; 31 tests des outils de skills passent. Seuls les ensembles attendus ont changé pour enregistrer CU Workflow.
- Installation : CU Workflow est un lien utilisateur vers sa source ; status --check confirme les cinq skills synchronisés.
- Liens documentaires locaux de CU Workflow et des consignes Chess69 : cibles existantes.
- Exclusions : git check-ignore confirme les captures SCRUM, sorties Impeccable et .scratch/artifacts ; les specs restent visibles à Git.
- Revue du diff : extraction du processus, conservation des contraintes Android/design et suppression de la fusion automatique ; aucun changement de code applicatif.

## Scénarios relus

- Projet simple : racine tests unique ; monorepo avec plusieurs interfaces web : package de tests possible, groupes selon leurs vrais noms.
- Nouvelle demande : recherche des identifiants, spec SCRUM, tickets internes facultatifs, un commit final sur branche conservée. Une précision du besoin reste sur cette branche.
- Business : un dossier par SCRUM, un seul fichier de tests, fixtures/helpers possibles, describe lié à la spec, descriptions françaises et trois niveaux maximum.
- Impeccable : sorties identifiées et ignorées avant génération ; preuves textuelles conservées ; absence d’effacement des assets historiques.
- Skill nécessaire absent : signaler le manque, ne pas prétendre l’utiliser ni l’installer implicitement ; poursuivre les étapes indépendantes.
- Jira : référence source distincte du numéro local, texte à copier-coller sur demande, aucune écriture automatique.

## Limites

Le validateur quick_validate du skill-creator n’a pas pu démarrer faute de PyYAML dans les Python disponibles ; le validateur et l’audit natifs du dépôt ont réussi sans ajout de dépendance. Les scénarios ci-dessus sont une revue documentaire, pas une évaluation indépendante par un autre agent.

Les suites historiques de Chess69 et de la to-do list de référence utilisent encore des effets réels et ne sont pas migrées ici ; cet écart est explicitement documenté. Aucun test applicatif, build APK ou contrôle visuel n’est nécessaire à cette extraction de consignes. Pas de migration rétroactive des identifiants ni de réécriture de l’historique.

## Livraison

Un commit par dépôt sur codex/scrum-1-cu-workflow ; branches conservées pour revue, sans fusion ni push. Les consignes Git globales ont aussi été alignées en place (fichier hors dépôt).
