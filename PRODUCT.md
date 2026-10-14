# Chess69

<!-- impeccable:product-schema 1 -->

## Platform

android

## Stack

React Native, Expo Router et TypeScript strict, selon
[les technologies validées](docs/architecture-techno.md).

## Users

Utilisateur débutant à intermédiaire apprenant les échecs en français sur son Samsung Galaxy S22 Ultra, avec ou sans connexion.

## Product Purpose

Apprendre les ouvertures et les mémoriser, résoudre des puzzles et finales, jouer contre Stockfish, analyser ses parties et suivre une progression propre à cette installation.

## Operating Context

La distribution passe par `https://apk.rentabe.ovh/chess69`. Une fois l'APK
installée, l’application doit se lancer et fonctionner en mode avion, y compris après
fermeture puis réouverture. La validation sur téléphone attend un retour réel.

## Capabilities and Constraints

Huit ouvertures et 24 variantes, 120 puzzles et 24 finales embarqués. Parties contre trois niveaux Stockfish, reprise et analyse locale progressive annulable. Persistance SQLite, révisions espacées et activité par jour civil local.
L'application embarque son code et ses ressources, sans connexion à Metro,
à Expo Go ou au VPS. La spécification est la source du périmètre :
[application locale](.scratch/application-locale/spec.md).

## Brand Commitments

Nom Chess69, interface en français et palette validée charbon, ivoire et sauge.
Cartes en relief, illustrations originales en volume et textes courts ; les
explications ponctuelles s’ouvrent dans des aides compactes.

## Product Principles

- Vérifier tôt un parcours réel sur le téléphone cible.
- Rendre l'action principale et son résultat immédiatement lisibles.
- Conserver l'autonomie hors ligne comme contrainte de fonctionnement.
- Distinguer les preuves obtenues des validations encore attendues.
