# Exploration visuelle de Chess69 dans Storybook

Status: resolved — proposition livrée, validation visuelle utilisateur à venir

## Problem Statement

L’utilisateur veut retrouver l’esprit visuel de ses captures ChessFlare dans
Chess69 : cartes arrondies, rangées horizontales, relief et illustrations.
L’interface actuelle contient trop de texte. La nouvelle direction doit être
validée visuellement avant tout développement de features.

## Solution

Livrer uniquement un moodboard dans Common et des maquettes temporaires dans
une racine Design de Storybook, à côté de Common et Business. Préparer cinq
écrans : accueil, catalogue d’apprentissage, exercice avec échiquier, historique
et analyse de partie. Le catalogue démarre en Large mobile.

## User Stories

1. Comme propriétaire, je veux comprendre la palette à partir d’exemples visuels.
2. Comme propriétaire, je veux un moodboard pour juger l’essence du design.
3. Comme propriétaire, je veux un design très proche de l’esprit ChessFlare.
4. Comme propriétaire, je veux peu de texte, des libellés courts et des espaces de respiration.
5. Comme propriétaire, je veux les explications ponctuelles encapsulées en bulles ou panneaux compacts.
6. Comme propriétaire, je veux des illustrations originales avec un volume doux.
7. Comme propriétaire, je veux comparer l’accueil, l’apprentissage et l’exercice.
8. Comme propriétaire, je veux voir l’agencement de l’historique et de l’analyse de partie.
9. Comme propriétaire, je veux naviguer entre les maquettes, faire défiler les cartes et voir les sélections.
10. Comme propriétaire, je veux valider la spec avant la réalisation et le design avant les features.

## Implementation Decisions

- Le périmètre est uniquement la présentation, avec données de démonstration et interactions locales.
- Le moodboard présente palette, typographie, illustrations, cartes, boutons et navigation.
- Les références fournies guident la composition et le caractère ; produire des illustrations originales.
- Réduire les textes visibles, sans perdre les informations nécessaires à la compréhension.
- Les bulles/panneaux portent les aides ponctuelles ; ne pas transformer chaque libellé en bulle.
- Réutiliser les concepts Chess69 ; les captures ne définissent pas de nouvelles fonctionnalités.
- Vues de maquettes stateless ; état de démonstration et navigation uniquement dans le raccordement Storybook.
- La racine temporaire Design est une exception explicitement demandée à la règle habituelle Common/Business.
- Palette A confirmée : fond charbon chaud #191C1A, cartes #292E2A,
  texte ivoire #F0EDE5 et accent sauge #B6C7A8. Les couleurs complémentaires
  et les états restent dans cette direction et doivent conserver un contraste lisible.
- Le design actuel de l’application reste la référence livrée jusqu’à validation de la proposition.
- Garder cadrage, éventuelles corrections et réalisation autorisée sur cette branche avant livraison unique.

## Testing Decisions

Vérifier le rendu et les interactions de démonstration dans Storybook Large mobile,
la lisibilité à petite largeur, les images locales, le défilement et l’absence de
croisement avec les services métier. TypeScript, format et architecture restent
applicables au code de la proposition. Une preuve web ne remplace pas Android.

## Out of Scope

Features métier, économie de points ou d’énergie, classement, routines nouvelles,
stockage, connexion SQLite/Stockfish, modification de l’application Android et APK.

## Further Notes

Réponses confirmées : Q2 proximité forte, peu de texte et aides encapsulées ;
Q3 illustrations en volume ; Q4 cinq écrans après ajout historique/analyse ;
Q5 navigation, défilement et états sélectionnés de démonstration.
Q1 confirmée : palette A, après présentation visuelle des trois propositions.
Aucune implémentation avant validation explicite de cette spec.
La validation du design viendra ensuite, à partir du moodboard et des maquettes
Storybook livrés. Le développement des features attendra cette seconde validation.

## Critères d’acceptation de la livraison design

- Moodboard accessible dans Common : couleurs, typographie, illustrations,
  formes, cartes, boutons et navigation cohérents avec la palette A.
- Racine temporaire Design visible au même niveau que Common et Business.
- Cinq maquettes consultables : accueil, catalogue d’apprentissage, exercice avec
  échiquier, historique et analyse de partie.
- Proximité visuelle forte avec les captures fournies : cartes arrondies avec
  relief, rangées horizontales et illustrations originales en volume.
- Textes courts, aérés ; explications ponctuelles dans des bulles ou panneaux
  compacts, sans occuper l’ensemble de l’écran.
- Navigation de démonstration, défilement et sélections utilisables ; données
  fictives, sans persistance ou service métier.
- Aperçu Large mobile par défaut ; absence de coupure du texte ou des commandes
  à petite largeur, navigation et échiquier lisibles.
- Aucune modification du rendu Android livré ni développement de feature métier.
- Livraison Git après contrôles : un seul commit sur main, branche supprimée ;
  liens directs Storybook du moodboard et des maquettes fournis pour validation.
