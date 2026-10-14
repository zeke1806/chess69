# Extraire le cycle de vie de la DI

Status: resolved
Blocked by: none

Déplacer la gestion des ressources vers un module lifecycle et exposer son
contrat aux consommateurs. Vérifier les critères de `../spec.md` sur les
contrats publics et les assemblages en mémoire. Ajouter le garde architectural.

## Vérifications

- TypeScript : réussi.
- Formatage Prettier et espacement AST : réussis.
- Contrôle architectural : réussi, 116 sources ; aucun cycle.
- Six probes négatives : ancienne DI, état mutable, await, condition,
  mutation de propriété et appel opérationnel rejetés. DI courante acceptée.
- Jest : 16 suites, 111 tests réussis ; trois nouveaux tests du contrat lifecycle.
- Assemblages : ouverture/cleanup/remount, échec moteur et retry préservés.
- Skill CU-ARCHI : règles modifiées dans ai-skills, validées et synchronisées.
- Revue Standards et Spec : aucun constat sur le diff Chess69.
- Aucun changement natif, visuel ou du format des données ; APK et stories
  non reconstruites pour cette extraction de code TypeScript.
