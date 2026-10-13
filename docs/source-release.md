# Sources correspondant à Chess69 0.2.0, code 4

L’archive `chess69-source.tar.gz` distribuée à côté de l’APK contient le code
original, le module JNI/Kotlin, Stockfish 17.1 et ses deux réseaux NNUE,
les ressources locales, les licences, le lockfile et les scripts de compilation.
`SOURCE-REVISION.txt` identifie le commit source. La clé privée de distribution,
les données d’installation et les dossiers de travail des agents sont exclus.

## Compiler avec sa propre signature

Sur macOS, avec Git, Python 3 et Node 24 :

```bash
npm ci
npm run android:setup
source scripts/android-env.sh
npm run typecheck
npm test
cd android
NODE_ENV=production CI=1 ./gradlew :app:assembleRelease --no-daemon \
  --console=plain --max-workers=4 -PreactNativeArchitectures=arm64-v8a
```

La sortie est `android/app/build/outputs/apk/release/app-release-unsigned.apk`
(relativement à la racine extraite). Stockfish est compilé à partir des sources
vendoriées et les réseaux sont inclus par CMake ; aucun serveur de jeu ni Metro
n’est nécessaire à l’application installée. Le premier build télécharge les
outils et dépendances de développement depuis les lockfiles/wrappers.

Aligner avec `zipalign -P 16`, puis signer avec `apksigner` et un keystore personnel.
Ces deux outils sont fournis dans les build-tools Android 36.0.0. Le script
`npm run android:build` est celui de la distribution officielle : il exige la clé
originale privée et contrôle son certificat public, donc utiliser le build Gradle
ci-dessus pour une compilation personnelle. Une APK signée personnellement ne
peut pas mettre à jour l’installation officielle ; cette restriction Android
protège son identité. Les sources, modifications et compilations restent libres
selon les licences présentes.

## Licences

Le code original et le pont Stockfish sont GPL-3.0-or-later. La licence complète
est dans `LICENSE` et celle de Stockfish dans `android/vendor/stockfish/Copying.txt`.
Pièces Chessnut : Apache-2.0 ; puzzles/finales Lichess : CC0. Voir `THIRD_PARTY.md`,
`docs/catalogue.md` et la provenance incluse avec les pièces. Les dépendances
récupérées par `npm ci` conservent leurs licences respectives.
