# Revue Spec

Diff figé : `git diff 0da42a21f47fc7b72563610b1643de09dfcfa19f...f68ad560ee16311b5e23e90cff5af2f78319ccd2`.

- **[P2] Quatre objectifs de promotion concernent le mauvais camp.** Spec : « Chaque exercice comporte […] solution vérifiée » et « objectif clair ». Dans `src/services-business/catalogue/catalogue-service/exercises.json:4917-4919`, `endgame-lichess-02prs` entraîne les noirs mais demande « Atteindre la promotion sans perdre le pion ». La solution `Kf7 e8=Q+ Kxe8` fait promouvoir puis capturer le pion blanc. Même défaut : `puzzle-lichess-00blC`, `endgame-lichess-005gP`, `endgame-lichess-00Qlc`. L’application valide ces suites comme réussites alors que l’objectif affiché n’est jamais atteint par le joueur. Le test vérifie une promotion de n’importe quel camp ; corriger objectif/explication et vérifier le camp.

- **[P2] Une sauvegarde tardive corrompt l’échiquier du parcours suivant.** Spec : « actions concurrentes et résultats tardifs après annulation » ; « réponses […] sans blocage du fil d’interface ». `src/services-front/application/application-service.ts:113` applique inconditionnellement `position` et `message` après `await game.play`. Reproduction : retenir l’écriture d’un coup, naviguer vers Apprendre puis ouvrir un guide d’ouverture, libérer l’écriture. Le guide affiche la FEN de la partie avec les coups légaux de l’ouverture, donc les déplacements deviennent incohérents. Les commandes de navigation restent actives pendant `busy`. Appliquer les résultats uniquement au parcours encore concerné, tout en conservant la sauvegarde.

- **[P2] Consulter une analyse masque la partie active.** Spec : « reprendre une partie interrompue ». `src/services-front/application/application-service.ts:118` remplace `state.game` par la partie terminée consultée ; `back`/`navigate` ne restaurent pas la partie active. Reproduction : abandonner une première partie, commencer une seconde, ouvrir l’analyse de la première, revenir à Accueil/Jouer. Les boutons Reprendre disparaissent (`application-screen.tsx:56,96`) malgré la seconde partie toujours sauvegardée. Il faut une relance ou un retour d’arrière-plan pour la retrouver. Distinguer la partie active de la partie consultée ou la recharger à la sortie.

Vérification : 168 exercices, 169 branches légales ; 285 annotations concordent avec SAN ; finales réparties 8/8/8 ; tous les mats légaux des 17 mats en un coup sont acceptés. Les deux défauts front sont reproduits via les vrais services avec adaptateur mémoire. Aucun débordement de périmètre identifié. Contrôles Galaxy/publication exclus de cette revue, conformément au statut documenté.

## Contre-revue des trois findings

Révision contrôlée : `6c6c569173646a1a982dd2bac8964d2abf9a86c2`.

- **Objectifs de promotion : résolu.** Les quatre contenus signalés annoncent maintenant un gain matériel et expliquent la capture de la promotion adverse. Le cinquième correctif (`00Aae`) explique aussi la promotion volontairement sacrifiée. Les solutions légales produisent le gain net attendu. Le test exige désormais une promotion du camp entraîné pour tout objectif `promote`.
- **Sauvegarde tardive : résolu.** `gameMove` conditionne position et message au contexte encore courant ; la sauvegarde conserve son effet et ne rafraîchit que les données globales. Le test reproduit le coup retenu, l’ouverture du guide puis la libération : FEN et message du guide restent intacts, le coup est sauvegardé.
- **Reprise après analyse : résolu.** `activeGame` est distinct de la partie consultée ; Accueil/Jouer proposent Reprendre via ce champ. Navigation/Retour restaurent la partie active. Le scénario avec ancienne partie terminée et seconde partie active conserve l’accès et reprend la seconde.

Contrôle indépendant : lecture des correctifs et preuves ; les deux suites ciblées existantes passent, **18 tests**. Aucun nouveau test ni changement de code. Aucun de ces trois findings ne reste partiel ou non résolu. Ce recontrôle ne constitue pas une validation APK/Galaxy.
