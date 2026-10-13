# Vérification réelle de l'APK sur émulateur Android

Date : 2026-10-13.
Résultat : parcours observé avec succès sur émulateur ; **Galaxy S22 Ultra
toujours en attente du retour utilisateur**.

## Artefact installé

- `artifacts/chess69-0.1.0-1-arm64.apk` — release signée.
- Package : `ovh.rentabe.chess69`, version affichée `0.1.0`.
- Taille annoncée par le build : 40 248 544 octets.
- SHA-256 recalculé avant installation :
  `fcdb18fd9f1aaa660627e0d7c7c95fe0f2702df1f0a9019acb41b338d1691efd`.
- `adb install` a répondu `Success` sur une nouvelle instance d'émulateur.

## Environnement observé

AVD `chess69-api36`, profil Pixel 8 Pro, Google APIs Android API 36,
ABI `arm64-v8a`, émulateur `37.2.12.0`, série `emulator-5556`.
Exécution headless sans audio, deux vCPU et 2 Gio de RAM, rendu logiciel.
Dimensions de contrôle : 1080 × 2400 pixels, densité 420 (environ 411 dp de
largeur), thème sombre. Tailles de texte système 1,0 puis 1,3.

L'image système et l'émulateur ont été installés par le setup d'intégration.
`avdmanager` Homebrew nécessite ici d'indiquer le SDK réel :

```bash
source scripts/android-env.sh
avdmanager="$(brew --prefix)/share/android-commandlinetools/cmdline-tools/latest/bin/avdmanager"
printf 'no\n' | AVDMANAGER_OPTS="-Dcom.android.sdkmanager.toolsdir=$ANDROID_HOME/cmdline-tools/latest" \
  "$avdmanager" create avd --name chess69-api36 \
  --package 'system-images;android-36;google_apis;arm64-v8a' --device pixel_8_pro
emulator -avd chess69-api36 -port 5556 -no-window -no-audio -no-snapshot \
  -gpu swiftshader -memory 2048 -cores 2
```

La création n'est nécessaire qu'une fois. Attendre
`adb -s emulator-5556 shell getprop sys.boot_completed` égal à `1` avant
les commandes de contrôle. Les premières tentatives de réglage pendant le
premier boot n'étaient pas exploitables ; tous les essais ci-dessous ont
été effectués après son achèvement.

## Observations

1. Démarrage normal via `am start -W -n ovh.rentabe.chess69/.MainActivity` :
   `Status: ok`, `LaunchState: COLD`, 1 071 ms. La hiérarchie native expose
   `Chess69`, `Version 0.1.0`, `Prêt à tester` et un bouton accessible `Tester`.
2. Appui au centre du bouton identifié dans la hiérarchie native : le texte
   devient `Interaction confirmée`. Le bouton garde son libellé.
3. Activation via `cmd connectivity airplane-mode enable`, puis `svc wifi
   disable` et `svc data disable`. Résultats : mode avion `enabled`, Wi-Fi
   `disabled`, `mobile_data=0`.
4. `am force-stop ovh.rentabe.chess69`, puis nouveau lancement : `Status: ok`,
   `LaunchState: COLD`, 1 050 ms. L'écran revient à `Prêt à tester`. Un nouvel
   appui produit `Interaction confirmée` avec les mêmes états réseau coupés.
5. Taille de texte `font_scale=1.3`, arrêt forcé et relancement toujours hors
   ligne : titre, version, message et bouton restent entièrement visibles.
   Le bouton fonctionne et la confirmation est lisible sans troncature.
6. Retour à `font_scale=1.0`, arrêt forcé puis intent explicite :

   ```bash
   adb -s emulator-5556 shell am start -W \
     -n ovh.rentabe.chess69/.MainActivity \
     -a android.intent.action.VIEW -d 'chess69://bad?x=%E0%A4%A'
   ```

   Résultat : `Status: ok`, `LaunchState: COLD`, écran initial normal et aucun
   écran de route inconnue. Un appui fonctionne encore après cet intent.
7. `adb reverse --list` est vide. Aucun Metro de développement n'est utilisé.
   Le relevé `logcat` ciblé `AndroidRuntime:E` et `ReactNativeJS:E`, remis à
   zéro avant l'essai, ne contient aucune erreur à la fin du parcours.
   Le dernier relevé réseau indique `Active default network: none`.

L'émulateur a été arrêté avec `adb -s emulator-5556 emu kill` à la fin des
contrôles ; le processus s'est terminé normalement. Le profil AVD reste
disponible pour reproduire le parcours.

## Captures et pièces locales

Les captures sont issues de `adb exec-out screencap -p`, ouvertes et inspectées
après acquisition. Elles sont ignorées par Git, comme les exports de hiérarchie
dans `artifacts/screenshots/emulator-*.xml`.

- [État initial](../../.impeccable/review/phone-android-initial.png).
- [Confirmation](../../.impeccable/review/phone-android-confirmed.png).
- [Confirmation après réouverture hors ligne](../../.impeccable/review/phone-android-offline-confirmed.png).
- [Confirmation avec texte à 130 %](../../.impeccable/review/phone-android-fontscale-1.3.png).
- [Écran après intent malformé](../../.impeccable/review/phone-android-malformed-intent.png).

## Limites

Ce test exécute la vraie APK sur Android ARM64 émulé ; il ne démontre pas
l'installation, les gestes, la performance ni le comportement Samsung One UI
sur le téléphone de l'utilisateur. Aucune mise à jour conservant des données,
aucun stockage et aucun module d'échecs n'ont été testés dans ce jalon.
La validation Galaxy S22 Ultra reste à confirmer, notamment téléchargement
dans son navigateur, installation et réouverture en mode avion.
