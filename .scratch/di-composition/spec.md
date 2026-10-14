# DI strictement limitée à la composition

Demande du 14 octobre 2026 : retirer de la DI tout comportement dépassant la
sélection, la construction et l’injection des modules. Base : `86b159d`.
Les normes réutilisables restent dans le skill CU-ARCHI du dépôt ai-skills.

## Critères de fin

- DI business et front sans état opérationnel, file, initialisation ou nettoyage.
- Cycle de vie partagé dans un module avec un seul contrat public.
- Fabriques différées autorisées uniquement pour composer les dépendances.
- Initialisation unique, échec partiel, fermeture de toutes les ressources,
  retry et séquence ouverture/fermeture/remontage préservés.
- Contrôle architectural détectant les comportements introduits dans une DI.
- Typage, formatage, contrôle architectural et tests Jest vérifiés.
- Règle générale persistée et skill synchronisé ; un commit par dépôt sur main.

## Interfaces de vérification

Contrat public LifecycleService et assemblages ServicesBusiness en mémoire.
Aucune modification d’interface visuelle, de stockage ou du pont natif.
