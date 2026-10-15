# Vérification de SCRUM-2

Status: resolved

## Contrôles effectués

- Chess69 : 117 tests, 16 suites réussies ; typecheck, contrôle architectural et formatage réussis.
- Exemple CU Archi : 37 tests réussis, dont 2 parcours Business de bout en bout en mémoire ; types des trois packages et tests, formatage réussis.
- Les 30 cas Business historiques Chess69 sont conservés dans un seul fichier SCRUM-2, avec origines indiquées ; leurs specs historiques restent inchangées.
- Le réseau et les écritures de fichiers courantes sont interdits par les setups des runners. La lecture du code par Jest/tsx n’est pas interdite : bloquer celle-ci empêcherait le chargement tardif des dépendances de test.
- Une migration ciblée a d’abord révélé un alias d’import perdu lors du regroupement ; il a été corrigé et les 30 cas passent. Aucun comportement produit n’a changé.

## Limites de preuve

Les fixtures SQLite modélisent seulement les commandes nécessaires, avec état isolé et rollback simulé. Elles vérifient le protocole demandé par les vrais adaptateurs, pas le moteur SQLite, sa durabilité ni sa sémantique SQL complète. La suppression du serveur réel ne prouve pas les propriétés d’un transport TCP réel. Ces contrôles appartiennent aux vérifications explicites d’infrastructure/APK.

Les vérifications Playwright ont été déplacées hors de tests/ et n’ont pas été exécutées ; aucun rendu produit ne change. La lecture des sources par le runner est nécessaire, mais aucun test ne lit ni ne crée de fichier de données.

## Livraison

Branche codex/scrum-2-tests-isoles dépendante de SCRUM-1 ; un commit par dépôt pour cette demande, sans fusion ni push. Revues Standards/Spec terminées ; constats corrigés et résolutions confirmées, voir review.md.

## Vérification après revue

Le double SQLite met désormais à jour la version uniquement lorsqu’il reçoit le PRAGMA correspondant. Une mutation temporaire du vrai adaptateur supprimant ce PRAGMA a fait échouer les assertions (0 !== 1) ; les sources ont ensuite été restaurées. Les 37 tests de l’exemple repassent avec les types et le formatage. Les 117 tests Chess69 repassent également avec les types, l’architecture et le formatage. Aucun fichier produit n’a changé.

La spec SCRUM-2 est embarquée dans le projet d’exemple pour conserver une référence autonome lors de sa copie. L’audit structurel des skills et leur synchronisation ont également été vérifiés.
