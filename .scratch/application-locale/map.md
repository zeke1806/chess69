# Livraison de l’application locale

## Destination

Implémenter toute la spec, compiler et publier une APK utilisable sur l’adresse existante. Autorisation explicite reçue le 13 octobre 2026, y compris nettoyage des anciennes versions après publication réussie.

## Workflow

Tickets locaux en incréments ; TDD aux contrats publics ; revue standards et spec ; Impeccable Android. Branches isolées pour les tâches déléguées. Aucun arrêt entre incréments. Les contrôles Galaxy sont préparés et restent signalés comme non effectués tant que l’appareil n’est pas disponible.

## Décisions

- Préserver package, certificat, logo et splash existants.
- Catalogue et moteur intégralement embarqués ; progression attachée à cette installation.
- UI française, navigation à quatre destinations, noir/orange et échiquier tactile.
- Le serveur conserve uniquement la dernière release après validation complète du téléchargement.

## Progression

1. Intégrations natives Stockfish/SQLite : validées en premier, ticket 01 résolu.
2. Catalogue/apprentissage/révisions : intégrés, ticket 02 résolu.
3. Parties et reprise : intégrées, ticket 03 résolu.
4. Analyse progressive : intégrée, ticket 04 résolu.
5. Accueil/progression/parcours : intégrés, ticket 05 résolu ; revue visuelle finale ship et documentation achevée.
6. Release signée 0.2.0 code 4 publiée, téléchargement APK complet validé, seule release courante conservée. Sources publiques entièrement téléchargées et vérifiées ; ancienne URL APK renvoie 404. Ticket 06 résolu.

## Décisions d’intégration

- Stockfish 17.1, Threads=1, Hash=16 Mio, trois skills 0/5/20 ; 500 ms par réponse en partie, 250 ms par position en analyse. Les performances Galaxy restent à mesurer.
- Révisions dues seules consolident une variante ; camp séparé, calendriers civils locaux 1/3/7/14/30 jours.
- Mise à jour conserve les identifiants du contenu et toute progression ; aucun effacement automatique après erreur de migration.
- Pièces Chessnut Apache-2.0 SVG embarquées et icônes originales locales ; navigation Material 3 et label court « Progrès », accessible « Progression ».
- Même certificat original et package ; codes 2/3 réservés aux essais privés, livraison publique 0.2.0 code 4.
- Sources GPL correspondantes et NNUE fournis avec l’APK ; clé privée et sa récupération conservées uniquement sur le Mac.

## Obstacles

Aucun identifié à ce stade. Le téléphone Galaxy n’est pas connecté au Mac ; les essais matériels restent à réaliser par l’utilisateur.

## Suite sur téléphone

Aucun travail d’implémentation/publication restant. Les observations propres au
Galaxy sont remises à l’utilisateur dans phone-test.md et conservent leur statut
non effectué. Les preuves ne sont pas assimilées à un contrôle Samsung.
