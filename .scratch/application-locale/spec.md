# Chess69 : application d’apprentissage locale

Status: delivered
Validation Galaxy : non effectuée ; protocole fourni.
Date: 2026-10-13
Autorisation d’implémentation, compilation et publication : feu vert explicite reçu le 13 octobre 2026, avec nettoyage serveur après succès.

Les cinq réponses de l’interview sont acceptées. L’utilisateur a ensuite autorisé
l’implémentation complète, la compilation et la publication de cette spec.

## Problem Statement

La première APK valide une installation et une interaction, mais ne permet pas
encore d’apprendre ou de jouer aux échecs. L’utilisateur souhaite une application
Android inspirée de ChessFlare, utilisable sur son Galaxy S22 Ultra, sans compte
et entièrement hors ligne. La progression appartient à cette installation sur
ce téléphone. Les nouvelles APK sont téléchargées manuellement et les anciennes
versions ne doivent pas être conservées sur le serveur.

## Solution

Livrer une APK autonome avec apprentissage des ouvertures, mémorisation par
répétition espacée, puzzles tactiques et finales, parties contre Stockfish,
analyse locale et statistiques. Le contenu initial et le moteur sont embarqués.
Interface française débutant/intermédiaire, organisation inspirée de ChessFlare,
identité noir/orange et logo existant, splash screen bref et accueil de progression.
La livraison comprend l’APK, sa page de téléchargement et un guide de mise à jour.

### Décisions validées par les cinq réponses

1. Ouvertures, mémorisation, puzzles, adversaire local, analyse et statistiques.
2. Organisation inspirée de ChessFlare, noir/orange, logo actuel et splash screen.
3. Niveau débutant à intermédiaire ; interface et explications en français.
4. Exercices réussis et à revoir, maîtrise des ouvertures, activité quotidienne et historique des parties ; aucun classement en ligne.
5. Progression propre à cette installation, conservée après fermeture et mise à jour ; sans export/import ni restauration automatique sur un autre téléphone. Désinstallation ou effacement des données : perte de progression.

## User Stories

1. En tant qu’utilisateur, je veux installer la nouvelle APK comme mise à jour pour conserver Chess69 sur mon téléphone.
2. En tant qu’utilisateur, je veux lire les instructions de téléchargement et d’installation pour obtenir la bonne version.
3. En tant qu’utilisateur, je veux reconnaître le logo au démarrage pour identifier l’application.
4. En tant qu’utilisateur, je veux arriver rapidement à l’accueil après le splash screen pour commencer une activité.
5. En tant qu’utilisateur, je veux utiliser tous les parcours dès le premier lancement en mode avion pour apprendre sans connexion.
6. En tant qu’utilisateur, je veux accéder aux activités sans inscription pour commencer directement.
7. En tant qu’utilisateur, je veux voir ma progression et mes révisions dues à l’accueil pour choisir quoi travailler.
8. En tant qu’utilisateur débutant, je veux découvrir le fonctionnement des exercices pour comprendre ce qui est attendu.
9. En tant qu’utilisateur, je veux choisir une ouverture et le camp travaillé pour apprendre un répertoire adapté.
10. En tant qu’utilisateur, je veux parcourir des variantes sur l’échiquier pour comprendre les positions.
11. En tant qu’utilisateur, je veux lire des explications françaises pour comprendre les idées et erreurs courantes.
12. En tant qu’utilisateur, je veux jouer une variante de mémoire pour tester mon apprentissage.
13. En tant qu’utilisateur, je veux recevoir un retour après une erreur pour apprendre le coup attendu.
14. En tant qu’utilisateur, je veux revoir les variantes aux échéances prévues pour consolider leur mémorisation.
15. En tant qu’utilisateur, je veux choisir des puzzles par thème et difficulté pour travailler mes faiblesses.
16. En tant qu’utilisateur, je veux résoudre des séquences de plusieurs coups pour pratiquer le calcul.
17. En tant qu’utilisateur, je veux demander un indice ou voir une solution expliquée pour débloquer un exercice.
18. En tant qu’utilisateur, je veux pratiquer des finales de base pour apprendre à convertir ou défendre une position.
19. En tant qu’utilisateur, je veux choisir mon camp et une difficulté pour jouer contre le téléphone.
20. En tant qu’utilisateur, je veux déplacer les pièces et choisir une promotion pour jouer tous les coups légaux.
21. En tant qu’utilisateur, je veux voir les échecs et la fin de partie pour comprendre le résultat.
22. En tant qu’utilisateur, je veux reprendre une partie interrompue pour ne pas perdre mon activité.
23. En tant qu’utilisateur, je veux retrouver mes parties et leurs coups pour consulter mon historique.
24. En tant qu’utilisateur, je veux analyser une partie jouée dans Chess69 pour repérer mes erreurs et les continuations conseillées.
25. En tant qu’utilisateur, je veux parcourir les positions analysées pour comprendre les moments importants.
26. En tant qu’utilisateur, je veux annuler une analyse et continuer à naviguer pour garder le contrôle.
27. En tant qu’utilisateur, je veux consulter réussites, révisions et maîtrise des ouvertures pour observer ma progression.
28. En tant qu’utilisateur, je veux voir mon activité quotidienne et ma série de jours actifs pour suivre ma régularité.
29. En tant qu’utilisateur, je veux retrouver mes résultats après arrêt forcé pour faire confiance à la sauvegarde locale.
30. En tant qu’utilisateur, je veux conserver ma progression après une mise à jour pour poursuivre l’apprentissage.
31. En tant qu’utilisateur, je veux comprendre une erreur et pouvoir réessayer pour poursuivre mon activité.
32. En tant qu’utilisateur, je veux des commandes lisibles et confortables sur téléphone pour jouer sans difficulté tactile.

## Implementation Decisions

### Détails de cadrage proposés par l’agent

Les choix suivants rendent la livraison finie et vérifiable. Ils ne sont pas
attribués à l’utilisateur ; ils peuvent être ajustés lors de l’implémentation
sans réduire les activités et garanties validées.

- **Catalogue initial** : huit répertoires d’ouvertures avec trois variantes guidées et entraînables chacun (24 variantes) ; 120 puzzles répartis entre mat, fourchette, clouage, enfilade, attaque à la découverte et élimination du défenseur ; 24 finales couvrant mats élémentaires, finales de pions et finales simples de tours. Chaque exercice comporte position légale, solution vérifiée, difficulté et explication française. Les ouvertures expliquent les idées derrière les coups. Contenu créé pour Chess69 ou provenant de sources dont la réutilisation est autorisée et documentée ; aucun catalogue ChessFlare n’est présumé disponible.
- **Navigation** : accueil, apprendre, jouer et progression. Ouvertures, puzzles et finales dans apprendre ; historique et analyse accessibles depuis jouer. Toutes les destinations correspondent à des parcours utilisables.
- **Ouvertures** : mode guidé puis mémorisation. Évaluer tous les coups du camp étudié ; réponses adverses automatiques selon la variante. Erreur ou indice empêche la validation sans aide de la tentative.
- **Révisions** : échéances à 1, 3, 7, 14 et 30 jours après succès sans aide. Échec : remise au premier palier et proposition de retravailler. Maîtrise : non commencé, en apprentissage, consolidé après trois révisions consécutives sans aide. Cet indicateur décrit l’entraînement, pas un classement officiel.
- **Puzzles et finales** : objectif clair, séquence complète, réponses adverses prévues, retour sur erreur, indice et solution expliquée. Accepter les alternatives équivalentes connues, consignées dans le contenu. Distinguer réussite sans aide, tentative avec aide et exercices à revoir.
- **Parties** : Stockfish embarqué, trois difficultés nommées, choix blanc/noir/aléatoire, sans pendule. Règles légales et fins de partie via chess.js : roque, prise en passant, promotion, mat, pat, matériel insuffisant et conditions de nulle documentées. Abandon possible. Une partie active ; confirmer son abandon avant d’en commencer une autre. Persister les coups pour reprendre après interruption et conserver les parties terminées dans l’historique.
- **Analyse** : parties jouées dans Chess69 ; évaluations, meilleurs coups et principaux écarts. Distinguer centipions et annonces de mat. Qualificatifs d’erreur fondés sur une règle déterministe documentée, sans prétendre reproduire ceux de ChessFlare. Analyse progressive, annulable, résultats calculés conservés ; traitement natif sans blocage du fil d’interface. Fixer et vérifier un budget de calcul adapté au Galaxy pendant l’intégration.
- **Progression** : résultats par activité, réussite sans aide, paliers d’ouvertures, révisions dues, jours actifs, série quotidienne et historique. Jour actif : exercice ou entraînement terminé, ou partie terminée. Jour civil local ; une réouverture ou un changement d’heure ne duplique pas les activités. Une écriture échouée ne doit pas annoncer un résultat sauvegardé.

### Architecture et données

- Conserver les conventions fonctionnelles et technologies validées : React Native/Expo, TypeScript strict, Zod, fabriques et DI manuelle.
- Modules business selon les comportements : catalogue/exercices, ouvertures/révisions, parties/règles, analyse et progression. Services front pour les parcours, actions et états ; affichage par props et callbacks. Approfondir les modules selon les besoins réels.
- Repository SQLite, règles et moteur derrière des contrats injectés ; horloge, hasard et identifiants injectés. Aucun accès natif direct dans les composants ou les règles métier.
- Persister tentatives, paliers/échéances, activité quotidienne, partie active/historique, analyses et préférences utiles. Identifiants de contenu stables entre versions.
- Écritures cohérentes et migrations versionnées transactionnelles. Échec d’ouverture/migration : erreur récupérable et possibilité de réessayer, sans effacement automatique de progression.
- Désactiver sauvegardes Android et transfert/restauration automatique des données de progression, avec les règles adaptées aux versions ciblées. Le manifest actuel autorise les sauvegardes ; cette configuration doit être modifiée pendant l’implémentation.
- Aucun compte, identifiant matériel, télémétrie, API métier ou téléchargement nécessaire aux parcours. La progression appartient aux données de l’installation, sans registre de téléphones.

### Interface et démarrage

- Interface et explications françaises ; noir/orange, logo actuel et principes de navigation inspirés de la référence. Conception et vérification avec Impeccable.
- Splash natif bref avec logo, sans attente artificielle. Si l’initialisation dure, afficher un chargement explicite puis une erreur récupérable si nécessaire.
- Échiquier contrasté et orienté pour le camp, déplacement par toucher origine/destination, coups possibles, dernier coup et roi en échec visibles. Glisser les pièces est facultatif ; le toucher suffit partout.
- Cibles tactiles confortables, labels accessibles, information ne dépendant pas uniquement de la couleur. États vides, erreurs, moteur en réflexion, analyse en cours et reprise après arrière-plan.

### APK et distribution

- Release ARM64 autonome, package et certificat actuels conservés, code de version augmenté ; SQLite et Stockfish réellement intégrés et vérifiés.
- Guide : télécharger depuis l’adresse existante, ouvrir l’APK, autoriser le navigateur si Android le demande, accepter la mise à jour, ouvrir Chess69. Ne pas désinstaller. Expliquer la perte de progression après désinstallation ou effacement des données.
- VPS uniquement pour téléchargement ; page avec version, taille, empreinte et instructions concordant avec l’APK.
- Transfert complet et vérifié avant promotion ; supprimer ensuite les anciennes APK et sauvegardes de releases du serveur. Nettoyer les fichiers temporaires après opération. Adapter les procédures actuelles de rollback/rétention : aucune ancienne release conservée en secours.
- Conserver la clé durable et sa récupération sur le Mac ; la suppression des anciennes versions serveur ne vise pas la clé de signature.

## Testing Decisions

Tester les comportements observables aux interfaces publiques et aux assemblages
business/front avec doubles en mémoire. Ce choix suit la délégation du mode de
travail du projet ; aucune sixième question sur les interfaces de test. Les tests
front existants servent de précédent pour snapshots, abonnements et actions.

- Métier : coups spéciaux/fins, exercices multi-coups, aide et erreurs, échéances/maîtrise, jours actifs, cohérence des résultats, reprise de partie et annulation d’analyse.
- Front : parcours, états vides, erreurs d’adaptateurs, actions concurrentes et résultats tardifs après annulation.
- Catalogue : volumes, identifiants uniques, positions légales, solutions/objectifs vérifiés, explications françaises et droits de réutilisation.
- Typage, tests pertinents et rendu mobile. Suite rapide sans réseau, disque, SQLite natif ou Stockfish réel.
- Valider tôt Stockfish natif, SQLite et leur cycle de vie sur véritable APK avant de multiplier les parcours dépendants ; signaler les obstacles concrets. Ces essais appartiennent à l’implémentation future.
- APK : installation/mise à jour, premier démarrage à froid en mode avion, persistance après arrêt, moteur/analyse hors ligne, migrations avec données, arrière-plan/reprise, configuration de sauvegardes et transferts.
- Vérifier signature, identité, versions, bundle embarqué, ARM64 et intégrité du téléchargement ; absence d’anciennes APK/sauvegardes sur le serveur après publication.
- Vérifier le rendu réel disponible ; émulateur ou navigateur ne prouve pas une validation Galaxy. Fournir un protocole court pour les contrôles nécessitant le téléphone et conserver leur statut réel.

### Critères d’acceptation

1. La nouvelle APK s’installe comme mise à jour de la première, sans désinstallation.
2. Premier lancement et tous les parcours fonctionnent sans connexion ni téléchargement initial.
3. Splash et logo sont visibles ; interface française lisible et tactile sur Galaxy S22 Ultra.
4. Huit répertoires et 24 variantes consultables et entraînables, avec explications.
5. 120 puzzles et 24 finales avec solutions vérifiées, retours, aide et résultats distincts.
6. Révisions et maîtrise respectent les règles documentées.
7. Partie complète contre le moteur pour trois difficultés, coups spéciaux, résultat et reprise.
8. Analyse locale des parties de l’historique avec évaluations/continuations ; annulable et interface réactive.
9. Progression, échéances, historique et partie active retrouvés après arrêt forcé/redémarrage.
10. Mise à jour avec données existantes : progression conservée ; erreur de migration sans effacement.
11. Sauvegardes/restaurations et transferts automatiques des données de progression désactivés selon les versions Android ciblées.
12. APK, page, version et instructions concordent ; aucune ancienne APK ou sauvegarde de release sur le serveur après publication réussie.
13. Contrôles effectués et validations restant à faire sur téléphone consignés sans confusion.

## Out of Scope

- Comptes, authentification, synchronisation, serveur métier et cloud de progression.
- Multijoueur local/en ligne, classements, connexions Chess.com/Lichess.
- Coach IA distant, chatbot et génération de leçons par API.
- Export/import de progression, PGN et répertoires personnels ; analyse de parties externes.
- Copie exhaustive du catalogue, des ressources ou de toutes les fonctionnalités ChessFlare.
- Catalogue avancé exhaustif, pendules et notifications système de révision.
- Restauration après désinstallation, données effacées, changement/perte du téléphone.
- Anciennes APK de secours sur VPS, iOS et Google Play.

## Further Notes

Le retour utilisateur du 13 octobre confirme que la première APK fonctionne sur
son téléphone et que le bouton s’active. Aucun nouveau contrôle appareil effectué
par l’agent ; les essais précis en mode avion ne sont pas détaillés.

État lors du cadrage (avant implémentation) : la première APK ne possède pas de progression à migrer ; tester aussi une mise
à jour après création de données dans la future application. Stockfish, SQLite
et chess.js sont validés technologiquement mais ne sont pas encore intégrés.
Aucun délai ni performance moteur sur Galaxy n’est présumé validé par cette spec.

### Références

- [Mode de travail](../../docs/mode-de-travail.md), [architecture](../../docs/architecture.md), [technologies](../../docs/architecture-techno.md).
- [Procédure Android](../../docs/android-release.md), à adapter lors de l’implémentation pour la politique serveur.
- [Vocabulaire](../../GLOSSARY.md), [suivi local](../../docs/agents/issue-tracker.md).
- [ChessFlare](https://chessflare.com/) et [fiche Android](https://play.google.com/store/apps/details?id=com.chessflare.app), consultés pendant le cadrage. Inspection exhaustive de l’application Android non effectuée ; fidélité exacte des écrans non vérifiée.
- [Mises à jour Android](https://developer.android.com/google/play/app-updates?hl=fr).

Le cadrage a été suivi du feu vert explicite de l’utilisateur. L’état réel de
l’implémentation et les preuves par critère sont dans [acceptance.md](acceptance.md)
et [verification.md](verification.md).
