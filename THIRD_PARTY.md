# Composants distribués avec Chess69

Stockfish 17.1, tag `sf_17.1`, commit upstream `03e2748`, est lié à la
bibliothèque Android `libchess69_stockfish.so`. Copyright 2004–2025 The Stockfish
developers ; GNU GPL version 3 ou ultérieure. Les sources upstream sont conservées
sans modification dans `android/vendor/stockfish`. Le pont JNI et Kotlin se
trouve dans `modules/chess69-stockfish` ; son code suit GPL-3.0-or-later.

Réseaux NNUE embarqués dans la bibliothèque, provenant de Fishtest :

- `nn-1c0000000000.nnue`, SHA-256 `1c0000000000a67d629999d932d0c373f7450ce43cd12d0562868f4eaf9ae2ad`.
- `nn-37f18f62d772.nnue`, SHA-256 `37f18f62d772f3107e1d6aaca3898c130c3c86f2ab63e6555fbbca20635a899d`.

La licence complète se trouve dans `android/vendor/stockfish/Copying.txt`.
La distribution de l'application fournit l'archive des sources correspondantes,
réseaux et scripts de compilation, aux côtés de l'APK. La clé privée de signature
est exclue ; le destinataire peut compiler et signer avec sa propre clé.

Sources : [Stockfish 17.1](https://github.com/official-stockfish/Stockfish/releases/tag/sf_17.1),
[réseau principal](https://tests.stockfishchess.org/api/nn/nn-1c0000000000.nnue),
[réseau secondaire](https://tests.stockfishchess.org/api/nn/nn-37f18f62d772.nnue).

Les licences des bibliothèques JavaScript/Expo/React Native/SQLite/chess.js sont
incluses dans leurs packages, avec leurs versions dans `package-lock.json`.

## Chess69

Le code original de cette application liée à Stockfish est distribué sous GPL-3.0-or-later (voir LICENSE). L’archive publique contient les sources correspondant à la release, les sources Stockfish et les réseaux NNUE épinglés, ainsi que les scripts de compilation. Les dépendances JavaScript conservent leurs licences respectives ; `npm ci` les récupère depuis le lockfile. La clé de signature privée n’est pas distribuée et n’est pas nécessaire à la compilation d’une APK avec sa propre signature.

## Dessins et rendu SVG

Les douze pièces Chessnut d’Alexis Luengas sont sous Apache-2.0, issues d’une version épinglée du dépôt officiel Lichess. SVG originaux, provenance et licence sont inclus dans src/ui/components/application/pieces. Les icônes géométriques de navigation sont originales Chess69 sous GPL-3.0-or-later. react-native-svg conserve sa licence MIT. Toutes ces ressources sont locales dans l’APK.
