# Écran de contrôle — direction de réalisation

Date: 2026-10-13
Mode: Operate, Android natif, réalisation directe en code.

La surface est précisément bornée par la spécification : quatre éléments,
une action synchrone, aucun chargement ni échec distant. Les choix visuels
ci-dessous sont des décisions d'implémentation réversibles prises dans le
cadre de la délégation ; ce ne sont pas de nouvelles préférences utilisateur.

## Premier écran

Une surface noire, une colonne de lecture limitée à 480 dp, Chess69 et sa
version groupés, puis le message et un large bouton orange. L'espace sépare
l'identification de l'action. Le message reste visible après l'appui et devient
orange pour renforcer le changement sans dépendre de la couleur seule.

La typographie système Android évite tout téléchargement de police. Le titre
utilise le rôle headline, le message title, la version body et le bouton label.
Les insets protègent le contenu ; le défilement absorbe les petits écrans et
les grandes tailles de texte. Le bouton mesure au moins 56 dp de haut.

## États et contrôle

- Initial : « Prêt à tester ».
- Appui : retour tactile visuel natif et « Interaction confirmée ».
- Nouvel appui : état confirmé inchangé.
- Nouvelle instance : retour à l'état initial autorisé.

Pas d'animation décorative, d'image ou d'icône ; pas d'état de chargement ou
d'erreur inventé pour une action locale synchrone sans possibilité d'échec.
La confirmation est annoncée par une zone `accessibilityLiveRegion` polie.

## Vérification attendue

Contrôle de contraste des tokens, typage et tests du service. Inspection du
rendu par l'intégration, avec distinction explicite entre navigateur,
émulateur et téléphone réel. Le Galaxy S22 Ultra reste en attente du retour
utilisateur, même si un aperçu navigateur est disponible.
