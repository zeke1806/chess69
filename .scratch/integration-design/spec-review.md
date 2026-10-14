# Revue Spec — Intégration charbon et sauge

Comparaison : `git diff main...HEAD`, main `11d6eed`, checkpoint `eecb093`.
Source : `spec.md` dans ce dossier.

**0 finding sur l’implémentation.** Aucun manque de fonctionnalité, ajout hors périmètre ou comportement incorrect relevé.

- Les neuf vues réelles utilisent palette A, cartes arrondies et relief, Manrope et les illustrations locales. `ApplicationScreen` reste partagé avec Android et Storybook ; sa vraie navigation conserve Accueil, Apprendre, Jouer et Progression. Les actions ouvertures, variantes, filtres puzzles/finales, exercices, parties, historique, analyse et progression sont préservées (spec, lignes 13–20).
- Consignes, résultats, meilleur coup et messages restent visibles sans ouvrir l’aide. Les explications secondaires passent par `HelpDisclosure` stateless ; l’orchestration contrôle sa visibilité avec une transition immutable et referme l’aide en changeant de parcours. Son contrat public est testé (lignes 21–22, 31, 41–42).
- L’analyse utilise la vraie position synchronisée par orchestration, les évaluations projetées du service et toute l’histoire SAN de la session. Chaque coup sélectionne le bon demi-coup via `index + 1`. Les miniatures d’historique rendent la position finale réelle (ligne 23).
- Les assets sont promus dans `src/assets` sans dépendance runtime vers `.storybook`. Manrope est chargée localement par la feature ; retour natif et confirmations d’abandon/remplacement restent présents (lignes 32–34).
- Identifiant Android et stockage métier restent inchangés ; version 0.3.0/code 6 permet la mise à jour. La capture native inspectée montre le nouveau rendu et les données de progression. Les limites de preuve sur Samsung doivent rester explicites (lignes 24, 30, 43–44).
- CU Archi actif contient la section durable Design et ses trois statuts ; la référence approuvée possède le statut intégré (lignes 25–26, 35–36).

Clôture documentaire et contrôles Storybook en cours restent coordonnés par l’agent principal, ainsi que la livraison du commit unique et de l’APK. Le README de la référence Design garde encore certaines phrases pré-intégration, déjà signalées pour nettoyage.

Total Spec : **0 finding d’implémentation**.
