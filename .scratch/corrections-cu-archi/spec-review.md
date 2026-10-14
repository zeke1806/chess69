# Spec — revue de la mise en conformité

Base e8f1a65, première implementation 6ae3b5f. Lecture indépendante.

## Constat initial

- P2 : navigation après erreur de foreground perd retryLifecycle en conservant
  shell.status=error. Réessayer délègue au parcours sans reprise, les vues
  restent masquées. Repro mémoire : initialize, summary rejetée, foreground,
  navigate(play), lecture réparée, retry : status reste error. Exigence :
  « Reprise après erreur, arrêt forcé et mise à jour sans effacer les données ».

Autres parcours inspectés cohérents : écritures tardives, partie active/consultée,
attente d’annulation, immutabilité, promotion et retry de mutation déjà sauvée.
Preuves APK et finalisation document/Git encore en cours, explicitement
séparées des défauts de code. Correction puis contre-revue ciblée prévues.

## Contre-revue ciblée

Spec : P2 résolu ; aucun nouveau constat sur le correctif. Les deux variantes startup/foreground vérifient erreur → navigation → retry → ready, erreur effacée et partie active conservée. Reprise lifecycle préservée uniquement tant que le shell est en erreur. Tests ciblés : deux variantes réussies.
