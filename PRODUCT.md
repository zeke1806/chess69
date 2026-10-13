# Chess69

<!-- impeccable:product-schema 1 -->

## Platform

android

## Stack

React Native, Expo Router et TypeScript strict, selon
[les technologies validées](docs/architecture-techno.md).

## Users

L'utilisateur teste l'installation sur son Samsung Galaxy S22 Ultra.
Le contexte métier cible est l'apprentissage des échecs hors ligne.

## Product Purpose

Le premier jalon vérifie le téléchargement d'une APK signée, son installation,
son lancement et une interaction élémentaire sans connexion. Les fonctions
d'échecs viendront ensuite ; elles ne sont pas présentes dans cette livraison.

## Operating Context

La distribution passe par `https://apk.rentabe.ovh/chess69`. Une fois l'APK
installée, cet écran doit se lancer et répondre en mode avion, y compris après
fermeture puis réouverture. La validation sur téléphone attend un retour réel.

## Capabilities and Constraints

L'écran affiche le nom, la version, un message et un bouton « Tester ».
L'appui produit « Interaction confirmée ». Aucune persistance n'est requise.
L'application embarque son code et ses ressources, sans connexion à Metro,
à Expo Go ou au VPS. La spécification est la source du périmètre :
[première APK](.scratch/premiere-apk/spec.md).

## Brand Commitments

Nom Chess69, interface en français et direction noir/orange déjà documentée.

## Product Principles

- Vérifier tôt un parcours réel sur le téléphone cible.
- Rendre l'action principale et son résultat immédiatement lisibles.
- Conserver l'autonomie hors ligne comme contrainte de fonctionnement.
- Distinguer les preuves obtenues des validations encore attendues.
