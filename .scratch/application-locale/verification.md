# Vérification de l’application locale

13 octobre 2026. Les résultats rapides, les exécutions de la vraie APK sur Android ARM64 émulé et les contrôles Galaxy sont distingués.

## Vérifications déjà obtenues

- 76 tests / 11 suites réussis aux contrats publics : règles, mémoire, stockage en mémoire, sessions/exercices multi-coups, aides/erreurs, promotions/alternatives, échéances/maîtrise par camp, jours actifs, parties/concurrence/reprise, analyses/checkpoints/annulation et erreurs front. Source/corpus : 168 exercices, 169 branches légales, 120 FEN puzzles distinctes, 285 annotations de variantes et objectifs réalisés. Les promotions sont vérifiées pour le camp entraîné.
- TypeScript strict ; dépendances Expo compatibles ; Expo Doctor 20/20. Les tests rapides n’accèdent ni au réseau ni au disque/SQLite/moteur natif.
- [Preuve native](native-verification.md) dans une vraie APK release signée : Stockfish ARM64/NNUE, trois niveaux, UCI et mat, annulation/réutilisation/dispose, SQLite réel/reopen/migration/retry et mise à jour avec données conservées.
- Parcours APK prépublication en mode avion API36 ARM64 : accueil/catalogue, déplacement par toucher, Stockfish répond à e4 ; arrêt forcé/reprise conserve e4/e6. Abandon confirmé et analyse locale sauvegardée sur trois positions. Finale Dame et roi 1 g6-g7 réussie sans aide ; Progression montre le résultat et un jour actif. Partie niveau Club f3/e5/g4/Qh4# termine en mat 0-1 et reste dans l’historique.
- Manifest release : aucune permission Internet ; bibliothèques libchess69_stockfish.so et libexpo-sqlite.so, bundle Hermes et ressources embarquées ; allowBackup=false et règles explicites cloud/device-transfer. Package et certificat originaux conservés, alignement 16 Kio vérifié par android:build.
- Revue Standards et Spec indépendantes depuis le commit initial 0da42a21 ; rapports et correctifs de reproduction conservés. Tous les constats initiaux ont été corrigés, reproduits par les tests et contre-revus ; voir les rapports Standards/Spec et leur résolution.

## Contrôles finaux prépublication

- Installation réussie du code 4 par mise à jour du code 3 avec données ; réinstallation de l’APK finale code 4 réussie sans effacement. Deux réussites sans aide, puzzle assisté, variantes, deux parties historiques analysées et partie active Amateur/noirs e3 conservés. Force-stop et retour après analyse historique vérifiés. Captures finales normales et texte à 130 % ; AndroidRuntime/ReactNativeJS sans erreur.
- Revue visuelle Impeccable sur sept captures natives ; premier batch corrige navigation/scaling, top app bar/retour, pièces SVG locales et documentation. Verdict final **ship** après deux batches ; les quatre findings sont résolus.
- Empreinte/taille/signature finale et archive des sources correspondant au commit `f015d04cbe4a9a09222bbb370ec6e587028ba492` vérifiées. Téléchargement APK public complet validé par le playbook : TLS, MIME APK/attachment, 123913853 octets et SHA-256 exact.
- Après succès HTTP, release 0.1.0-1 supprimée. Inventaire SSH indépendant : une seule release 0.2.0-4, une seule APK, staging vide et aucun backup de release.

## Galaxy S22 Ultra

Aucun Galaxy n’est connecté et aucun contrôle de cette nouvelle APK n’a été effectué sur le téléphone. Installation/mise à jour depuis son navigateur, gestes/rendu One UI, performance réelle, arrière-plan et transferts Samsung restent à vérifier selon [le protocole court](phone-test.md). Les données appartiennent à l’installation, sans sauvegarde cloud/export/import.

## Métadonnées de l’APK finale

- 0.2.0 / code 4, ARM64, minSdk24 / targetSdk36 ; 123913853 octets.
- SHA-256 : `c6b4b6a425a49d673092ba07f7aafe25e955d69fe39a3bf6bcd711db6ae2e426`.
- Certificat original : `e0795076a4d2d489b5f774ff2d1ca605ee3b1117ce1717ad02e5e683fb4b5b3a`.
- Aucun accès Internet déclaré ; sauvegardes cloud/transfert exclues ; Stockfish/NNUE, SQLite, bundle et ressources locaux vérifiés par le script APK. Build release et alignement 16 Kio réussis.

## Publication réussie

[Page et installation](https://apk.rentabe.ovh/chess69) ;
[APK 0.2.0 code 4](https://apk.rentabe.ovh/chess69/releases/0.2.0-4/chess69-0.2.0-4.apk).
Playbook : 22 opérations réussies, aucun échec ni rescue. L’APK a été entièrement
téléchargée et vérifiée avant le nettoyage. La clé privée/récupération restent
sur le Mac, exclues du serveur et des sources.

Sources : 65372511 octets, SHA-256
`9cad4be22e09d5645358ee46b6e9fb0751182d7d5390196a55a31d3031889fd8`.
Le téléchargement public complet des sources concorde avec ce SHA-256 et cette
taille. Le manifeste correspond aux deux fichiers. L’ancienne URL APK renvoie
HTTP 404. Métadonnées dans [release.json](release.json).
