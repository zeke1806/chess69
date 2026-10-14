# Storybook web de l’interface actuelle

Status: resolved

## Problem Statement

L’utilisateur veut inspecter la disposition actuelle de Chess69 dans un navigateur,
sans appareil Android, et vérifier que les vues respectent CU Archi. Le socle
existant couvre les composants isolés mais pas les pages assemblées dans leur shell.

## Solution

Compléter le catalogue web existant avec les écrans complets utilisés par l’application,
leurs états représentatifs et un cadrage mobile. Livrer la commande, l’URL et le port.

## User Stories

1. Comme propriétaire, je veux ouvrir le catalogue sur mon Mac avec une commande.
2. Comme propriétaire, je veux accéder au catalogue par HTTP sur le port annoncé.
3. Comme propriétaire, je veux voir l’accueil avec son logo et sa navigation réelle.
4. Comme propriétaire, je veux voir le premier lancement et la progression existante.
5. Comme propriétaire, je veux voir le catalogue d’ouvertures, puzzles et finales.
6. Comme propriétaire, je veux voir une ouverture et ses variantes dans leur écran.
7. Comme propriétaire, je veux inspecter un exercice avec son échiquier.
8. Comme propriétaire, je veux inspecter les options de partie et une partie en cours.
9. Comme propriétaire, je veux voir l’historique et l’analyse dans le cadre de l’app.
10. Comme propriétaire, je veux voir la progression et ses états vides.
11. Comme propriétaire, je veux inspecter le chargement et une erreur récupérable.
12. Comme développeur, je veux retrouver les primitives dans Common et les vues dans Business.
13. Comme développeur, je veux que les stories utilisent les vues réellement rendues sur Android.
14. Comme développeur, je veux que les composants reçoivent uniquement des props et callbacks.
15. Comme développeur, je veux détecter une vue sans stories ou liée à un service exécutable.
16. Comme propriétaire, je veux inspecter les écrans à plusieurs largeurs de téléphone.
17. Comme développeur, je veux construire un catalogue statique distribuable.
18. Comme propriétaire, je veux une livraison unique sur main après toutes les corrections.

## Implementation Decisions

- Conserver le framework officiel Storybook React Native Web/Vite déjà installé.
- Extraire l’assemblage de présentation de la feature vers une vue stateless partagée.
- La feature garde hooks, dimensions, effets Android et raccordement au service d’orchestration.
- Les services gardent transitions et règles métier ; les fixtures restent déterministes.
- Regrouper les stories exclusivement sous Common et Business, par thématique.
- Fournir des pages complètes avec le shell réel et une hauteur de fenêtre bornée pour son défilement.
- Renforcer le contrôle architectural des vues stateless et de leur couverture en stories.
- Documenter CU Archi et conserver la même branche pour toute correction ou spec complémentaire avant livraison.
- Livrer un seul commit sur main par avance rapide, puis supprimer la branche.

## Testing Decisions

- Contrôle des contrats publics avec TypeScript et suite de comportement existante.
- Contrôle architectural et formatage sur les vues, les stories et les raccordements.
- Contrôles Playwright existants sur toutes les stories, puis preuves des pages complètes,
  du défilement, de la navigation visible et de l’absence de débordement à 360, 412 et 480 px.
- Vérifier le serveur de développement sur son URL réelle et le build statique.
- Revue séparée des normes et de la spec avant livraison ; corriger sur la même branche.

## Out of Scope

Refonte graphique, fonctionnalités métier nouvelles, connexion au moteur natif ou à
SQLite depuis Storybook, déploiement VPS, APK et validation du rendu Android.

## Further Notes

Le navigateur prouve React Native Web ; les détails Android restent une preuve native.
Les boutons des stories statiques exposent les intentions via callbacks factices ;
les interactions d’échiquier existantes utilisent le service Board réel sans I/O natif.
