# Vérification de la première APK

Date : 2026-10-13, fuseau Indian/Antananarivo.
Base de revue : c8e72d6aa93b1542088feb34bc8cad5fc49f5224.
Statut : livraison côté agent terminée ; validation sur Galaxy S22 Ultra en attente.

## Scaffold et comportement

- `npm run typecheck` réussi, TypeScript strict.
- `npm test` : 5 tests front réussis ; RED/GREEN documenté dans le ticket 01.
- `npx expo install --check` : versions compatibles.
- `npx expo-doctor` : 20/20 contrôles actifs passent. Le contrôle de synchronisation
  app.json/native est désactivé explicitement car Android est maintenu dans Git ;
  justification et garde-fou de version dans la procédure Android.
- `CI=1 npx expo export --platform web` réussi.
- Inspection Chrome : largeur réelle vérifiée à 412 px, hauteur 915 px,
  aucune largeur de débordement, bouton 56 px, nom/version/messages lisibles.
  Cliquer affiche « Interaction confirmée » ; les appuis suivants sont stables.
  Une autre observation a eu lieu en fenêtre 500 × 772. Ces rendus web ne
  constituent pas une validation d'installation Android.

## Revue séparée

- Standards : architecture front/DI/test conforme ; 2 points procéduraux trouvés
  puis corrigés. Le script d'initialisation refuse aussi une empreinte publique
  déjà présente ; le SHA-256 est calculé en flux sans exiger Python 3.11.
- Spec : 1 point trouvé sur le rejeu du Caddyfile statique. La préparation Ansible
  recrée maintenant seulement le serveur APK après un changement validé ;
  le rejeu et l'absence de redémarrage des autres services sont vérifiés côté VPS.
- Audit npm : 64 alertes propagées issues de 5 avis ; voir dependency-audit.md.
  Pas d'upgrade majeure forcée. Les intents natifs sont normalisés vers `/`.
- `git diff --cached --check` passe après normalisation Git du wrapper Windows.
  Aucune clé privée, mot de passe, .env ni APK n'est indexé.

## Signature

- Clé RSA 4096 et certificat public SHA-256
  `e0795076a4d2d489b5f774ff2d1ca605ee3b1117ce1717ad02e5e683fb4b5b3a`.
- Keystore et mot de passe hors dépôt et VPS ; modes 0700/0600 contrôlés.
- Copie de récupération comparée octet par octet. Même Mac : aucune preuve de
  sauvegarde externe et aucune prétention de protection contre perte du disque.
- Nouvelle invocation de l'initialisation refusée, sans modifier la clé.

## Téléphone

Critères d'acceptation 3 à 5 : **à confirmer sur le Galaxy S22 Ultra**.
L'utilisateur doit tester installation, ouverture, interaction, puis arrêt et
réouverture en mode avion. Aucune validation sur son appareil n'est annoncée.

## Compilation réelle

- Premier `:app:assembleRelease` réussi en 11 min 34 s, 494 tâches.
- Signature initiale refusée : deux options demandaient deux lectures successives
  du même fichier contenant une seule ligne de mot de passe. Aide `apksigner`
  vérifiée ; `--key-pass` retiré, PKCS12 réutilise le mot de passe du keystore.
  Aucun secret affiché ni clé régénérée.
- Le premier contrôle de contenu attendait l'ancien nom `libhermes.so`.
  Inspection ZIP : React Native 0.86 embarque `libhermesvm.so` ; contrôle corrigé
  pour cette version verrouillée. Bundle Hermes embarqué : 2 147 060 octets.
- Métaspace Gradle ajustée de 512 à 1 024 Mio après avertissement du premier
  build ; reconstruction incrémentale réussie en 17 s. Les avertissements de
  dépréciation des dépendances Gradle restent non bloquants (wrapper 9.3.1 fixé).

- Chaîne complète `npm run android:build` réussie après correction :
  SHA-256 `fcdb18fd9f1aaa660627e0d7c7c95fe0f2702df1f0a9019acb41b338d1691efd`,
  40 248 544 octets. Signature v2/v3 vérifiée par apksigner, RSA 4096.
  aapt confirme package ovh.rentabe.chess69, version 0.1.0, code 1, minSDK 24,
  targetSDK 36, ARM64 et absence de debuggable. Métadonnées : release.json.

## Android émulé

- La même APK, avec le SHA-256 ci-dessus, a été installée sur API 36 ARM64.
- Titre/version et bouton observés ; avion activé, Wi-Fi/données désactivés,
  aucun réseau actif ; arrêt forcé, démarrage à froid et nouveau toucher réussis.
- Texte à 130 % lisible, intent malformé normalisé, aucun journal d'erreur ciblé.
- Capture native hors ligne inspectée par l'agent principal. Détail des commandes
  et limites : emulator-verification.md. L'émulateur est arrêté.
- Copie de récupération relue par keytool : même empreinte publique de certificat.

## Publication HTTPS et re-téléchargement

- `https://apk.rentabe.ovh/chess69` répond 308 vers `/chess69/`, puis 200 ;
  TLS vérifié sans option insecure, sans authentification.
- APK : https://apk.rentabe.ovh/chess69/releases/0.1.0-1/chess69-0.1.0-1.apk
- Deux vérifications externes indépendantes (Ansible puis curl sur le Mac)
  téléchargent 40 248 544 octets. SHA-256 et certificat identiques à la release
  locale ; le fichier retéléchargé passe aussi `scripts/verify-apk.py`.
- HTTP 200, `application/vnd.android.package-archive`, `Content-Disposition:
  attachment`, cache immutable. Page mobile réelle : version 0.1.0, lien
  exact, taille 40.2 Mo, aucune largeur de débordement à 412 × 915.
- Premier vérificateur Python 3.9 incapable de suivre 308 : retrait automatique
  de la page observé, support 308 corrigé et tests de redirection/boucle ajoutés.
- Un curl lancé pendant la correction des en-têtes Caddy a été interrompu ;
  après reconfiguration terminée, retéléchargement complet réussi avec la même
  empreinte. Aucun fichier partiel n'est exposé côté serveur.
- Les 7 URLs contrôlées côté VPS répondent avec leurs statuts attendus ; les
  services antérieurs n'ont pas été redémarrés par la configuration statique.
- Procédure et preuves serveur dans vps-perso : docs/chess69-apk.md et
  .scratch/chess69-apk/verification.md. Critères 1, 2, 6 et 7 vérifiés ;
  critères 3 à 5 en attente utilisateur sur Galaxy S22 Ultra.
