# Cycle de vie de l’assemblage business

Base : contre-revue Standards, `ceae380`. Scope : DI business et tests publics
avec adaptateurs en mémoire. Aucun changement d’interface ni contrôle APK.

`createServicesBusiness` accepte des overrides optionnels repository, moteur,
horloge et identifiants. Sans override, les mêmes fabriques natives SQLite et
Stockfish sont conservées. Les types propres à cet assemblage restent dans
`dependency-injection.ts`, conformément à l’architecture.

Une queue par assemblage sérialise les opérations complètes initialize/dispose.
Ainsi, init → cleanup → remount ne peut plus terminer avec un repository fermé
et un flag initialized vrai. Une erreur ne bloque pas les opérations suivantes.
Un échec d’initialisation ferme les ressources partielles et conserve l’erreur
initiale ; la fermeture tente les deux adaptateurs même si le moteur échoue.
Ces opérations ne suppriment aucune donnée.

Le premier test a reproduit le P2 en rouge : repository initialisation retenue,
dispose puis initialize demandés, libération de l’ouverture ; une lecture de
progression via l’assemblage rejetait « Le stockage local doit être initialisé ».
En vert, la progression sauvegardée est lue, le moteur joue un coup légal et la
partie active peut être relue après ce remount. Le repository double conserve
la queue de ressources du véritable adaptateur ; le test n’inspecte pas les
compteurs d’appels ni les internals de la DI.

Deux autres comportements sont couverts : échec du moteur pendant l’init avec
libération du stockage puis retry conservant les données ; fermeture moteur
rejetée avec fermeture effective du stockage et réinitialisation utilisable.

Vérification : 3 tests d’assemblage, typecheck et `git diff --check` passent.
Suite complète : 11 suites, 75 tests passent. La compilation et les contrôles
sur l’APK finale restent à l’orchestrateur ; aucune validation Galaxy nouvelle.
