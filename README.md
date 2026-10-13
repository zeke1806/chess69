# Chess69

Première application Android autonome : nom, version et bouton de contrôle.
Le toucher affiche « Interaction confirmée ». Aucune donnée persistée, aucun
compte, aucune API ni mise à jour distante du code ne sont nécessaires.

Téléchargement : <https://apk.rentabe.ovh/chess69>.

## Développer

Node 24.18.0 (`.nvmrc`) et npm ; les versions exactes sont dans le lockfile.

```bash
npm ci
npm run typecheck
npm test
npm run web
```

`npm run android` est réservé au développement avec un émulateur ou appareil
connecté. Le livrable utilisateur est la release signée ci-dessous.

## Compiler et distribuer

Voir [la procédure Android](docs/android-release.md) : setup macOS, identité,
signature, récupération de la clé, compilation, validation et publication.
La configuration serveur et la publication appartiennent à `vps-perso`.

## Tester sur le Galaxy S22 Ultra

1. Ouvrir l'adresse de téléchargement dans Chrome ou Samsung Internet,
   puis télécharger la version indiquée et ouvrir l'APK.
2. Si Android le demande, autoriser **ce navigateur** à installer des
   applications inconnues, puis revenir à l'installation. Révoquer cette
   autorisation après installation si souhaité.
3. Ouvrir **Chess69** depuis les applications. Vérifier **Version 0.1.0**, puis
   toucher **Tester** : le message devient **Interaction confirmée**.
4. Activer le mode avion et vérifier que Wi-Fi et données mobiles sont coupés.
   Refaire le test du bouton.
5. Fermer Chess69 depuis les applications récentes (ou utiliser **Forcer
   l'arrêt** dans ses informations), puis la rouvrir en restant en mode avion.
   Le message peut revenir à **Prêt à tester** ; toucher **Tester** à nouveau.
6. Communiquer la version, l'étape et le texte exact d'une éventuelle erreur.

**Validation sur le Galaxy S22 Ultra en attente du retour utilisateur.**
Les captures web et essais sur émulateur ne la remplacent pas. Suivi et preuves :
[première APK](.scratch/premiere-apk/spec.md) et tickets associés.
