# Compilation et livraison Android

## Identité et sources

- Application : `Chess69`, package stable `ovh.rentabe.chess69`.
- Première version : `0.1.0`, `versionCode=1` ; APK ARM64, Android API 24+.
- Le dépôt initial ne contenait ni application Android ni ancienne clé.
  Aucun conflit connu n'a été trouvé dans les deux dépôts. Cette vérification
  locale ne réserve pas le nom sur Google Play (hors périmètre).
- Expo SDK 57, React Native 0.86.3, React 19.2.3, TypeScript strict.
  `package-lock.json` verrouille l'installation JavaScript.

Le dossier `android/` est versionné et maintenu, conformément au choix du projet
de conserver les futures intégrations natives. Il a été créé avec
`CI=1 npx expo prebuild --platform android --no-install`. **Ne pas lancer
`prebuild --clean`** : il écraserait les adaptations de signature, d'icône et
de manifest. Revoir les diffs d'un prebuild lors d'une migration Expo.

`app.json` fournit la version à l'interface. Toute livraison doit aussi mettre
à jour `android/app/build.gradle` (`versionName`, `versionCode`) et `package.json`.
Le vérificateur refuse une APK dont identité ou versions divergent d'`app.json`.
L'avertissement Expo Doctor `appConfigFieldsNotSyncedCheck` est désactivé
explicitement pour ce workflow natif maintenu ; les autres contrôles restent
actifs. Orientation, fond, icône, permissions et liens du manifest sont revus
dans les sources natives, pas régénérés implicitement pendant la compilation.

## Préparer le Mac

```bash
nvm use                         # si nvm est utilisé
npm ci
npm run android:setup
```

Le script installe via Homebrew OpenJDK 17 et Android Command Line Tools,
accepte les licences SDK et installe les composants suivants dans
`~/Library/Android/sdk` (ou `ANDROID_HOME` si défini) :

- platform-tools, plateforme Android 36 et build-tools 36.0.0 (35.0.0 aussi
  pour les sous-projets natifs Expo) ;
- NDK 27.1.12297006, CMake 3.22.1 ;
- Gradle 9.3.1 via le wrapper versionné (téléchargé au premier build).

`scripts/android-env.sh` définit l'environnement pour les commandes. Aucun
changement du profil shell, Android Studio, compte Expo ou service de build
payant n'est requis. Les premiers téléchargements et compilations nécessitent
Internet ; l'APK installée contient son propre bundle et moteur Hermes.

## Signature durable et récupération

La clé RSA 4096 bits a été créée une seule fois pour cette application,
avec une validité de 10 000 jours. Son empreinte publique est versionnée dans
`android-signing-certificate.sha256`. La clé, le mot de passe et la copie de
récupération ne sont jamais envoyés au VPS ni placés dans Git.

Emplacements sur le Mac :

- clé et mot de passe : `~/.local/share/chess69/signing/` ;
- copie de récupération : `~/Library/Application Support/Chess69/signing-recovery/`.

Chaque dossier est en mode `0700`, chaque fichier en `0600`. `release.p12` est
un keystore PKCS12 chiffré ; `password` fournit son secret aux outils via un
fichier, jamais une valeur affichée ou un argument en clair. Alias :
`chess69-release`. Les copies ont été comparées octet par octet à leur création.
Elles sont sur le **même Mac** : cela protège contre une suppression ponctuelle,
pas contre la perte du disque. Une sauvegarde chiffrée externe reste à prévoir.

Pour restaurer après disparition du dossier principal :

```bash
umask 077
mkdir -p "$HOME/.local/share/chess69"
test ! -e "$HOME/.local/share/chess69/signing" && \
cp -R "$HOME/Library/Application Support/Chess69/signing-recovery" \
  "$HOME/.local/share/chess69/signing"
chmod 700 "$HOME/.local/share/chess69/signing"
chmod 600 "$HOME/.local/share/chess69/signing/"*
```

Le prochain build vérifie la signature contre l'empreinte versionnée. Ne jamais
créer une nouvelle clé pour corriger un problème de mot de passe : les mises à
jour Android doivent conserver package et certificat. `python3
scripts/init-signing.py` est seulement la procédure de création initiale ; elle
refuse de remplacer un stockage ou une empreinte publique déjà présents et n'est pas une commande de build.

## Compiler et vérifier

```bash
npm run typecheck
npm test
npx expo install --check
npx expo-doctor
npm run android:build
```

Le script compile `:app:assembleRelease` pour `arm64-v8a`, aligne à 16 Kio,
signe avec `apksigner`, puis vérifie avant de promouvoir l'artefact local :

- signature et empreinte publique attendue ;
- nom de package, version, code, libellé et absence de mode debuggable ;
- API minimale compatible et bibliothèque ARM64 Hermes ;
- bundle `assets/index.android.bundle` embarqué et alignement ;
- taille et SHA-256 du fichier final.

Sorties actuelles : `artifacts/chess69-0.3.0-6-arm64.apk` et son fichier `.json` public.
Les APK sont ignorées par Git. Gradle produit volontairement une APK non signée ;
seul `android:build` fournit la release distribuable. Les clés debug standard
Android ne sont jamais utilisées pour cette release.

Vérification indépendante d'un fichier téléchargé :

```bash
source scripts/android-env.sh
python3 scripts/verify-apk.py /chemin/vers/telechargement.apk
```

## Contrôle Android sur émulateur

Les preuves de la version publique 0.2.0 sont dans
[le contrôle de l’application locale](../.scratch/application-locale/verification.md).
La mise en conformité locale 0.2.1/code5 est vérifiée séparément dans
[les preuves CU-ARCHI](../.scratch/corrections-cu-archi/verification.md).
L'émulateur n'est pas nécessaire à la compilation. Pour préparer ses composants :

```bash
source scripts/android-env.sh
sdkmanager --sdk_root="$ANDROID_HOME" \
  'emulator' 'system-images;android-36;google_apis;arm64-v8a'
```

Les commandes AVD, lancement à froid et coupure réseau sont dans ce compte rendu.
Elles ne remplacent pas le test de téléchargement et d'installation sur le Galaxy.

## Publier et corriger

Depuis le dépôt `vps-perso` :

```bash
ansible-playbook playbooks/publish-chess69-apk.yml \
  -e apk_source=/Users/zeke/Documents/Projects/chess69/artifacts/chess69-0.2.0-4-arm64.apk \
  -e apk_version=0.2.0 -e apk_version_code=4 \
  -e apk_source_archive=/Users/zeke/Documents/Projects/chess69/artifacts/chess69-source.tar.gz
```

La première préparation du serveur, la promotion atomique, les validations HTTP
et le nettoyage après succès sont documentés dans le README et les procédures de `vps-perso`.
Ne jamais remplacer le contenu d'une version déjà publiée. Pour corriger,
incrémenter `versionCode`, adapter le nom de version, reconstruire avec la même
clé, puis publier une nouvelle URL. Un retour de page à une ancienne release
n'entraîne pas une rétrogradation d'une application déjà installée.

## Références et limites

- [Build local Expo](https://docs.expo.dev/guides/local-app-production/).
- [Projets natifs et Prebuild](https://docs.expo.dev/workflow/continuous-native-generation/).
- [Vérification Android apksigner](https://developer.android.com/tools/apksigner).
- [Audit des dépendances](../.scratch/premiere-apk/dependency-audit.md).

Le routeur reçoit chaque intent natif comme `/`, sans décoder de paramètres.
Aucun lien entrant n'est annoncé dans le manifest. Les alertes transitives sans
correctif compatible restent documentées, sans prétendre à un audit nul.
L'essai final sur le Galaxy S22 Ultra reste en attente du retour utilisateur.

## Application locale 0.2.0

Stockfish 17.1 est compilé en bibliothèque JNI ARM64 dans le module Expo local `modules/chess69-stockfish`. Les sources et les deux réseaux NNUE épinglés sont dans `android/vendor/stockfish`. SQLite initialise/migre transactionnellement `chess69.db` ; aucune erreur de migration n’efface les données. Les règles de sauvegarde cloud et transfert Android sont explicitement exclues.

Version livrée : 0.2.0, code 4 (les codes 2 et 3 ont servi aux preuves natives et aux contrôles privés de parcours avec données). Le package, certificat, icône et splash sont ceux de la première APK. Le nouveau build embarque catalogue, moteur et données initiales.

La publication reçoit aussi l’archive des sources correspondantes GPL. Après succès de la vérification HTTP complète, seules la release courante, son empreinte, sa page et ses sources restent sur le serveur ; anciennes APK et sauvegardes de releases sont supprimées. La récupération de la clé privée sur le Mac est conservée. Il n’existe plus de rollback serveur vers une ancienne version : une correction augmente le code de version.

Pour mettre à jour, ouvrir la nouvelle APK et accepter **Mettre à jour**. Ne pas désinstaller : la progression appartient aux données de cette installation. Voir le guide appareil de la livraison locale.

## Mise en conformité CU-ARCHI 0.2.1

Release locale 0.2.1/code5 : contrats ciblés, persistance V1 inchangée, modules
front séparés et orchestration. Même package et certificat. L’APK signée et
l’archive de sources correspondantes sont préparées sous `artifacts/`.
Cette livraison ne publie pas la nouvelle version sur le VPS. Le protocole de
mise à jour et les preuves Android sont dans le [compte rendu CU-ARCHI](../.scratch/corrections-cu-archi/verification.md).

## Intégration visuelle 0.3.0

Version locale 0.3.0/code6 : palette charbon/ivoire/sauge, Manrope statique,
illustrations et aides à la demande. Même package et certificat ; mise à jour
avec conservation des données contrôlée sur émulateur ARM64 API36. Source et
preuves dans .scratch/integration-design/verification.md. Installation Samsung
à effectuer avec Mettre à jour, sans désinstaller. Aucune publication VPS ici.
