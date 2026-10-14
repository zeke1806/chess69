# CU-ARCHI-02 — Persistance ciblée et atomique

Blocked by: CU-ARCHI-01
Status: resolved

## Critères d’acceptation

Ports ciblés learning/game/analysis/progression ; aucune lecture de StoredState dans les cas d’usage. Préserver transactions, queues, détection des conflits, sauvegarde de tentative/révision et partie/préférences. Formats et migration SQLite inchangés ; contrats mémoire et réouverture vérifiés. A2.

## Interfaces de test

Contrats publics concernés et assemblages mémoire, conformément à spec.md.

## Vérification

Façade repository ciblée avec ports propriétaires learning/game/analysis/progression. Les services métier n’importent plus StoredState et ne connaissent plus readState/updateState ; la file et le payload installation_state version 1 restent privés au repository. La composition injecte chaque sous-contrat et expose createLearning pour une session éphémère par connexion front.

Red/green : le premier test ciblé échouait faute de saveAttempt ; test atomique vert après façade. Un autre test révèle qu’un remplacement pouvait perdre un coup arrivé depuis la lecture ; correction de la vérification transactionnelle de la version des coups avant remplacement, puis test vert.

Contrôles du 14 octobre 2026 : 70 tests dans 12 suites passent (tests/services-business, tests/business/cu-archi-01 et cu-archi-02). Huit cas du ticket couvrent rollback tentative/révision, atomicité partie/préférences, conflits et anciens états, annulation avant écriture, remplacement obsolète, ouverture d’un payload ancien version 1, rollback SQL et reprise, migration retry et rejet d’une version future. Les tests SQLite exécutent les vraies requêtes et transactions contre SQLite via node:sqlite ; seul le pont Expo est substitué. Ils ne constituent pas une preuve de fonctionnement native Android.

Les fixtures métier historiques utilisent la façade mémoire réelle et décorent seulement les ports pour simuler latence/erreur. Aucun faux clonage des transitions. Les erreurs TypeScript restantes concernent encore l’intégration et les fixtures front, traitées par les tickets suivants. Le chargement Expo SQLite reste paresseux dans initialize (require typé), pour ne pas charger l’infrastructure native dans la composition mémoire ni nécessiter les modules VM expérimentaux de Jest. Aucune nouvelle dépendance ou migration de format.
