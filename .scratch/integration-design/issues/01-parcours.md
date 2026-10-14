Status: resolved
Blocked by: none

Spec : ../spec.md

## Implémentation

Accueil, catalogue, détail d'ouverture, choix de partie et progression utilisent
les illustrations originales et les surfaces charbon/sauge. Les rails horizontaux
conservent les actions réelles des ouvertures et des exercices. Les sélecteurs
conservent camp, difficulté et thème ; les guides, exercices de mémoire, reprises,
révisions dues et historique conservent leurs callbacks et leurs données.

Les explications secondaires passent dans HelpDisclosure contrôlé par props.
Les cinq vues restent stateless. Les stories montrent l'aide repliée et ouverte ;
les résultats et les états vides restent visibles. Les catégories illustrées
sont des commandes entières accessibles, adaptées à une largeur de 360 px.

## Vérification intermédiaire

Prettier appliqué aux cinq vues et à leurs stories. Typecheck réussi une fois
les deux composants de socle créés. Vérification Storybook/native globale encore
à effectuer. Aucune fonctionnalité ni donnée métier changée.

Critères validés ; preuves et limites dans ../verification.md.
