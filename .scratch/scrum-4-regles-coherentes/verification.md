# Audit des règles — SCRUM-4

Status: resolved

## Sources examinées

Chess69 : AGENTS.md, mode de travail, tracker, triage, contexte métier, choix technologiques, README, DESIGN/PRODUCT, guides Storybook et procédures Android. Skills : entrées et références de CU Workflow et CU Archi ; journal et guide de l’exemple consultés comme contexte historique/illustratif. Les copies installées sont des liens vers ces sources.

## Répartition vérifiée

| Sujet | Source propriétaire | Adaptation Chess69 |
| --- | --- | --- |
| Orchestration, questions, validations humaines, branche et commit | CU Workflow | Exécution sans worktree |
| Numérotation SCRUM, tickets, triage et échanges Jira | Référence suivi-local de CU Workflow | Conservation des anciens dossiers et point de départ SCRUM-1 |
| Artefacts ignorés et rapports textuels versionnés | Référence artefacts de CU Workflow | Chemins concrets dans .gitignore |
| Architecture, code, tests et stories | CU Archi | Espacement local supplémentaire, outillage Jest/Expo et contrôle architectural |
| Produit, palette, appareil et publication | Documents Chess69 | Galaxy S22 Ultra, direction visuelle et procédures APK/VPS |

## Nettoyage réalisé

- Retrait des répétitions génériques du mode de travail, du tracker/triage, du contexte métier, du README et de DESIGN ; renvois vers les propriétaires conservés.
- CU Archi ne prescrit plus de rédiger une nouvelle spec après la validation graphique : CU Workflow porte seul les jalons, sans imposer nouveau numéro ni nouvelle branche pour la même demande.
- Conventions de tests conservées dans leur référence unique ; entrées de skill transformées en points de lecture plutôt qu’en copies de ces règles.
- Le code testé reste sans effets externes ; les lectures de sources/configuration par le runner sont explicitement distinguées. Les changements documentaires ne déclenchent pas de tests qui assertent leur formulation.
- Les rapports textuels à conserver doivent être placés hors des dossiers ignorés en bloc ; la politique d’artefacts reste inchangée.
- L’exemple API/web est explicitement un exemple, pas une contrainte sur les applications des autres projets. Les anciens audits sont signalés comme historiques.

## Validation

Audit structurel des skills et des instructions ciblées : réussi. Statut de synchronisation : cinq skills cohérents. Les 42 liens locaux des documents modifiés existent ; git diff --check réussi. Les sorties lourdes de .scratch/artifacts restent ignorées ; les nouveaux rapports Markdown sont suivis.

Revue documentaire des scénarios : demande courante, complément de spec, exploration visuelle, tests navigateur uniquement sur demande, demande documentaire, rapport textuel avec capture, lecture d’un audit ancien. Aucun conflit restant identifié dans les consignes actives examinées. Les renvois de navigation et descriptions factuelles d’implémentation sont conservés ; ils ne constituent pas des normes concurrentes.

Aucun code, dépendance, test ou comportement produit modifié. Pas de relance des suites applicatives pour ce nettoyage documentaire. Les preuves historiques ne sont pas réécrites. La règle Git reste un commit supplémentaire par dépôt sur branche SCRUM-4 dépendante de SCRUM-3, sans fusion ni push.
