# Preuve native Stockfish et SQLite

Date : 13 octobre 2026. Ticket : `issues/01-preuve-native.md`.
Contrôle sur une vraie APK release signée, exécutée sur l'AVD `chess69-api36`,
API 36 Google APIs, ARM64, série `emulator-5556`. Aucun Metro, mode avion activé,
Wi-Fi/données désactivés ; `Active default network: none` observé.
Ce contrôle précède l'intégration des parcours ; il ne valide pas encore leur UI.

## Artefacts de preuve

APK temporaire 0.1.0/code 1 : 121 865 712 octets,
SHA-256 `b0fe2f84f605d9f0ac2c5c359cc3cebdb043f0e32113b2b4396fe29cb51b3bf4`.
Puis mise à jour `adb install -r` par APK temporaire 0.2.0/code 2 :
121 869 808 octets,
SHA-256 `72c6c0f69c4a43bc634c9e4ac3c349ab83b0f458adb1bc44fef912079e04b25c`.
Les deux APK ont le package `ovh.rentabe.chess69` et le certificat conservé
`e0795076a4d2d489b5f774ff2d1ca605ee3b1117ce1717ad02e5e683fb4b5b3a`.
Ces APK de preuve ne sont pas les artefacts à publier.

Le [log natif](native-proof/emulator-log.txt) et le
[parcours de preuve temporaire](native-proof/probe.tsx) sont conservés.
L'écran temporaire a été retiré de `src/app/index.tsx` après le contrôle.
La capture inspectée reste locale dans `artifacts/native-proof/screenshot.png`.

## Résultats observés

- SQLite réel via `expo-sqlite` : écriture, fermeture et réouverture conservent
  une tentative. Après arrêt forcé, le prochain démarrage retrouve la première.
- Après remplacement de l'APK code 1 par code 2, `SQLITE_INITIAL attempts=2`
  confirme la conservation des deux tentatives précédentes ; la nouvelle
  écriture et réouverture retournent `attempts=3`.
- Migration transactionnelle 0→1 d'une base préexistante : la préférence
  `onboarded=true` reste vraie. Le cas initial de la première APK est sans
  table de progression ; aucun DROP ni DELETE n'est exécuté.
- Erreur de callback d'écriture : résultat rejeté ; état antérieur retrouvé ;
  lecture suivante possible. Version SQL future 2 : initialisation rejetée
  avec message récupérable ; après correction de la version de la fixture,
  un retry retrouve les données intactes.
- Stockfish 17.1 réellement compilé depuis les sources upstream, JNI C++ avec
  deux réseaux NNUE incorporés dans `libchess69_stockfish.so`. Les symboles UCI,
  les options et la réponse `uciok/readyok` proviennent du moteur/pont.
- Trois niveaux 0/5/20 : coups légaux validés par chess.js après 150 ms de
  recherche chacun (`e2e3`, `e2e4`, `e2e4` au run conservé).
  La variation optimale peut différer du coup volontairement affaibli aux
  niveaux débutant et détente. Le niveau club 20 sert également à l'analyse.
- Calcul de 5 secondes annulé après 60 ms : rejet `AbortError` vers 65 ms ;
  nouvelle recherche de 100 ms et libération/réinitialisation réussies.
- Position `7k/6pp/5KQ1/8/8/8/8/8 w - - 0 1` : `bestMove=g6g7`, score
  `{type:mate,value:1}`, variation `[g6g7]` ; les annonces de mat sont distinctes
  des centipions.
- La bibliothèque Stockfish porte des segments ELF LOAD alignés `0x4000`
  (16 Kio). `android:build` vérifie APK alignée, package, signature, ARM64,
  bundle JavaScript embarqué, version et intégrité.
- Manifest APK : `allowBackup=false`, `fullBackupContent=@xml/backup_rules`,
  `dataExtractionRules=@xml/data_extraction_rules`. Tous les domaines sont
  exclus de la sauvegarde cloud et du transfert de données Android 12+.
  L'icône et les ressources de splash natives n'ont pas été modifiées.
- Typecheck et 10 tests rapides passent ; les cinq tests ajoutés traversent les
  contrats publics mémoire (sauvegardes simultanées, snapshots isolés,
  retry après erreur, annulation, fermeture/réinitialisation).

## Décisions et références

Module Expo local : [documentation officielle](https://docs.expo.dev/modules/module-config/).
JNI utilise l'Engine Stockfish directement ; aucun exécutable n'est copié ou
lancé depuis les données modifiables de l'application. Un worker Kotlin unique
possède ses ressources ; Stockfish exécute sa recherche sur son fil natif.
Les imports ne démarrent ni moteur ni base ; initialisation/libération explicites.

SQLite persiste un snapshot de domaine validé Zod dans une table privée :
[transactions exclusives Expo](https://docs.expo.dev/versions/latest/sdk/sqlite/).
Chaque mise à jour relit et sauvegarde dans la même transaction, avec queue
sérialisée et `synchronous=FULL`. Aucune erreur de migration ne déclenche un
réinitialisation de données.

Les exclusions suivent [Auto Backup Android](https://developer.android.com/identity/data/autobackup).
`allowBackup=false` seul ne couvre pas tous les transferts constructeur ; les
règles explicites excluent aussi device-transfer. Les transferts Samsung
restent à contrôler sur appareil pour confirmer le comportement One UI.

La [notice des composants](../../THIRD_PARTY.md) donne versions, hashes NNUE et
licence ; l'archive des sources correspondants accompagne la distribution.

## Contrôles restants

Sur l'APK finale : assemblage front, partie/analyse hors ligne et reprise dans
les véritables parcours. Sur Galaxy S22 Ultra : téléchargement/installation,
performance, gestes, reprise/arrière-plan et politique de transfert One UI.
Une exécution émulateur ne constitue pas un contrôle sur ce téléphone.
