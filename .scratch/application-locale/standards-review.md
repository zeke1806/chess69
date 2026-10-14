# Standards — 0da42a21…f68ad56

Archive de la revue d’octobre 2026 selon les anciennes conventions locales,
supprimées lors de l’adoption de CU-ARCHI. Les constats et leurs résolutions
ci-dessous conservent la preuve du travail réalisé ; les normes actuelles
viennent de [CU-ARCHI](/Users/zeke/.agents/skills/cu-archi/SKILL.md).
Voir [l’audit d’adoption](../../docs/audit-cu-archi.md) pour l’état actuel.

Revue en lecture du diff `git diff 0da42a21f47fc7b72563610b1643de09dfcfa19f...HEAD`. Sources Stockfish vendoriées exclues. Les imports métier restent indépendants des SDK ; les tests rapides inspectés n’effectuent aucun effet externe.

## Violations documentées

- **[P2] Raccorder la libération au propriétaire de l’assemblage.** `src/ui/features/application-feature.tsx:15` retire seulement les listeners. Aucun appel à `applicationService.dispose()` n’existe dans `src`, alors que `src/app/_layout.tsx` possède l’assemblage et que le dispose ferme SQLite et Stockfish. Un démontage du propriétaire laisse les ressources et calculs ouverts jusqu’à la destruction du runtime natif. La convention locale de cycle de vie utilisée lors de cette revue exigeait une initialisation **et une libération explicites** au démarrage/arrêt. Brancher le cycle de vie au propriétaire, en préservant les remounts React.

- **[P2] Sortir les résultats d’analyse du composant.** `src/ui/components/application/application-screen.tsx:107–108` détermine le gagnant d’un mat zéro depuis la FEN, choisit les messages d’analyse et traduit la qualité. Cette interprétation métier du mat reproduit `analysis-service.ts:107`, et les messages n’existent pas dans le snapshot front ; les tests du service ne protègent donc pas ce rendu. La convention locale de présentation utilisée lors de cette revue réservait les règles au business et le choix des messages de résultat/chargement au front. Exposer ces valeurs interprétées par le service front.

- **[P2] Fermer les mutabilités imbriquées du snapshot.** `src/services-front/application/application-service.ts:67` retourne directement son état. `ProgressionSummary.due` contient des `Review` mutables (`progression-type.ts:6`) et `AnalysisView` conserve un `score` mutable (`analysis-type.ts:8`). Un appelant peut donc changer `snapshot.summary.due[0].stage` ou un score sans action ni notification. La convention locale d’immutabilité utilisée lors de cette revue exigeait des snapshots immuables. Rendre ces contrats profondément readonly et préserver cette garantie à la construction du snapshot.

## Heuristique Fowler

- **[P3] Possible Duplicated Code.** Le formatage du jour civil `${année}-${mois}-${jour}` apparaît dans `learning-service.ts:130`, `progression-service.ts:36` et `game-service.ts:121`. Toute correction de ce concept doit toucher trois modules ; exposer une opération commune justifiée par ces usages. Il s’agit d’un jugement de conception, pas d’une erreur fonctionnelle constatée.

Total : trois violations documentées P2 ; un smell P3.

## Contre-revue — 6c6c569

Périmètre : les quatre constats précédents, après lecture de `native-front-review-corrections.md`. Vérification du code et des tests existants ; aucun nouveau test exécuté.

- **Cycle de vie : partiel.** `_layout.tsx:15` appelle désormais `applicationService.dispose()` au démontage du propriétaire. Cependant, `services-business/dependency-injection.ts:37–46` ne sérialise pas initialize/dispose. Un cleanup→setup pendant l’initialisation peut placer la fermeture SQLite après la seconde initialisation, puis laisser `initialized=true` avec le repository fermé. Les générations front empêchent les publications tardives, mais pas ce conflit de ressources. Le test `application.test.ts:170` utilise des dépendances personnalisées, sans cet assemblage concret.
- **Résultats d’analyse : résolu.** `application-service.ts:359–379` projette messages et qualité ; `application-screen.tsx:104–107` les affiche. Le gagnant vient de l’opération business unique `mateWinner`.
- **Snapshots : résolu.** `ApplicationSnapshot` est profondément readonly ; `application-service.ts:345–351` gèle récursivement ses enfants. `ProgressionSummary.due` et `AnalysisView.score` sont readonly. Tests existants : `application.test.ts:123,160`.
- **Jour civil : résolu.** `calendar/calendar-service.ts:4` porte l’unique formatage ; learning, game et progression l’importent.

Bilan : trois constats résolus ; un P2 partiellement résolu.

## Contre-revue finale du cycle de vie — a3b0958

**Résolu.** `services-business/dependency-injection.ts:38–42,57–69` sérialise désormais les opérations initialize/dispose complètes dans une queue commune. Le cleanup ne peut plus fermer le repository après l’initialisation du remount. `closeResources` tente les deux fermetures (`44–49`) ; une initialisation échouée libère ses ressources partielles avant le retry (`63–66`). Le propriétaire React conserve son raccordement au dispose.

Les trois tests publics de `dependency-injection.test.ts` couvrent l’ouverture suspendue suivie de cleanup/remount, l’échec d’initialisation moteur puis retry et l’échec de fermeture moteur. Ils observent progression conservée et partie/moteur utilisables, avec adaptateurs en mémoire. La preuve d’exécution est consignée dans `business-lifecycle-verification.md` ; cette contre-revue vérifie leur code sans les relancer.

Bilan final des quatre constats initiaux : **tous résolus**, sans reliquat Standards identifié dans ce périmètre. Cette revue n’ajoute aucune preuve APK ou Galaxy.
