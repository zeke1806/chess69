# Intégration du design charbon et sauge

Status: resolved

## Problem Statement

Le design Storybook est validé. Les vrais parcours Chess69 doivent l’utiliser en
préservant comportements, données, fonctionnement local et navigation réelle.
La section Design doit devenir durable dans CU Archi pour les propositions.

## Solution

Appliquer palette A, illustrations originales, Manrope, cartes en relief et aides
courtes à tous les écrans réels. Accueil, Apprendre, Jouer et Progression restent
les destinations ; historique et analyse restent dans leurs vrais parcours.

## User Stories

1. Comme joueur, je retrouve mon interface validée sur Android et dans Storybook.
2. Comme joueur, je conserve ouvertures, puzzles, finales, parties, analyse et progression.
3. Comme joueur, je vois consignes, erreurs et résultats immédiatement.
4. Comme joueur, je demande les explications secondaires via Comprendre ou Aide.
5. Comme joueur, je consulte la vraie position, évaluation et liste des coups en analyse.
6. Comme joueur, je conserve mes données lors de la mise à jour de l’APK signée.
7. Comme concepteur, je garde Design avec propositions, designs approuvés et intégrés.
8. Comme développeur, je dispose de CU Archi mis à jour et synchronisé dans le dossier actif.

## Implementation Decisions

- Refactorer les vues et le raccordement nécessaires ; préserver les services métier et SQLite.
- Garder les composants stateless ; confier l’ouverture des aides au service de présentation.
- Promouvoir les assets validés dans l’application, sans import de .storybook depuis src.
- Charger Manrope et les illustrations localement, utilisables hors ligne.
- Conserver les confirmations Android d’abandon/remplacement et le retour natif.
- Design conserve la proposition approuvée avec statut intégré après cette livraison.
- Modifier CU Archi dans ai-skills uniquement, valider puis synchroniser avec UpSkill.
- Un seul commit par dépôt sur main, après vérifications et APK ; aucune publication VPS demandée.

## Testing Decisions

Contrats publics et comportements conservés via tests existants ; tester le contrôle
nouveau de divulgation d’aide au niveau du service de présentation. TypeScript,
format, architecture, Jest, Storybook/Playwright, build APK signé et inspection
native ; consigner les limites Samsung réelles sans les annoncer réussies.

## Out of Scope

Nouvelles règles métier, synchronisation, compte, économie de points et déploiement VPS.

## Further Notes

Les cinq réponses sont oui ; exécution directement autorisée sans nouvelle validation.
