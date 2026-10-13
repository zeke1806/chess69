# Sources correspondant à Chess69 0.2.0

Cette archive accompagne l’APK ARM64 distribuée sur https://apk.rentabe.ovh/chess69. Le code original de Chess69 lié à Stockfish est sous GPL-3.0-or-later ; les composants externes conservent leurs licences (LICENSE et THIRD_PARTY.md). Les sources Stockfish 17.1 et réseaux NNUE épinglés sont inclus dans android/vendor/stockfish.

## Recompiler

Sur macOS avec Node 24, Python 3 et Homebrew : `npm ci`, puis `npm run android:setup`. Le projet natif est maintenu dans android/ ; ne pas exécuter prebuild --clean. `npm run typecheck` et `npm test` vérifient les contrats en mémoire. `source scripts/android-env.sh && cd android && ./gradlew :app:assembleRelease --no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a` compile l’APK non signée ; scripts/android-env.sh fournit JDK/SDK. Signer avec sa propre clé via apksigner pour installer son build. La clé privée de distribution n’est ni dans l’archive ni sur le serveur.

Les dépendances exactes sont dans package-lock.json. Le moteur, le catalogue, SQLite et les images sont embarqués ; aucune ressource n’est récupérée par l’application à son démarrage. Le manifeste de la release fournit les empreintes APK et archive sources. Cette compilation avec une autre signature ne permet pas de mettre à jour une installation signée par la clé originale.
