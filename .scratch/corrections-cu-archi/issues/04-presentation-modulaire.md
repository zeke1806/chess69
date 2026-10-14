# CU-ARCHI-04 — Présentation modulaire et orchestration

Blocked by: CU-ARCHI-03
Status: resolved

## Critères d’acceptation

Créer modules de présentation autonomes et orchestration ; connecteur stateful générique ; vues stateless ; choix/préférences, gestes échiquier/promotion, intentions de navigation dans services. Préserver parcours, annulations, résultats tardifs et states antérieurs. Remeda ciblé et blocs lisibles. A3/A4/A9/D1.

## Interfaces de test

Contrats publics concernés et assemblages mémoire, conformément à spec.md.

## Vérification

38 tests front dans trois suites ciblées passent et TypeScript strict global passe. Les 16 tests historiques sont portés sur état/actions imbriqués sans façade Application ; 20 scénarios CU-ARCHI-04 et deux tests du raccordement React vérifient connexions isolées, promotions, générations, annulation réellement attendue et reprises. Reproductions rouges puis corrections du foreground et des rafraîchissements échoués après coup/réponse moteur sauvegardés : le retry relit les données sans rejouer les mutations. Six modules cohérents, DI et bindings neutres ; vues stateless raccordées par la feature. Vérification APK finale portée par CU-ARCHI-05.


## Comments

- Contre-revue Standards/Spec : quatre reproductions rouges au contrat public, puis vertes après correction. Un `EngineService` bloquant injecté dans les vrais services Game et Analysis garde `evaluate` en attente ; le premier `cancel` physique échoue, aucune nouvelle partie/analyse n’est autorisée, et la reprise par l’orchestration rappelle physiquement le moteur avant de continuer. Les contrôleurs sont conservés après échec et libérés seulement après arrêt réussi.
- La reprise lifecycle reste disponible après navigation suivant une erreur de démarrage ou de rafraîchissement au premier plan. Les scénarios vérifient le retour à `ready` et la conservation de la partie persistée.
- Contrats minimaux : Analysis ne reçoit que `rules.position` et `engine.evaluate/cancel`, Game que `engine.evaluate/cancel`, Learning métier que `catalogue.get`. Les contrats front ciblés existants et la DI propriétaire du lifecycle ont été contrôlés.
- Vérification après corrections : TypeScript strict global passe ; **108 tests dans 15 suites** passent, dont 20 scénarios du ticket CU-ARCHI-04. Aucun contrat UI modifié. La nouvelle compilation et les vérifications natives restent sous la responsabilité de CU-ARCHI-05.
