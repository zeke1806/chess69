# Documentation du design intégré

`DESIGN.md` et `.impeccable/design.json` ont été confrontés aux composants réels :
thème, Button, Choice, Panel, ActionRow, HelpDisclosure, shell, styles d’écrans,
illustration et échiquier. La palette A, les formes et états constatés remplacent
la description noir/orange. Les snippets du sidecar traduisent les formes natives
en CSS ; leurs focus clavier appartiennent uniquement au panneau web.

Manrope est chargée par `useFonts` dans ApplicationFeature via `expo-font ~57.0.4`,
depuis la fonte locale et sa licence SIL OFL 1.1. Les rôles communs du thème utilisent
Manrope, y compris le corps ; certaines métadonnées locales restent système.
Atlas d’illustrations original embarqué ; provenance de génération conservée
dans le dossier de proposition Storybook. Aucun nouvel état métier documenté.

PRODUCT.md enregistre la direction validée. architecture-techno.md consigne
la dépendance, les ressources hors ligne et la version 0.3.0/versionCode 6.
Les contrôles Android de la livraison restent ceux du parent ; aucune réussite
Samsung n’est annoncée. Pas de modification de code ni commit dans cette passe.


## Correction de la graisse native

La documentation a été réalignée sur les trois instances statiques 400/600/700 :
Chess69Regular, Chess69Semibold et Chess69Bold. Les styles choisissent explicitement
la famille et utilisent fontWeight normal. Le frontmatter et les snippets CSS
reprennent ces alias ; ils ne demandent plus la synthèse de graisse de l’ancienne
fonte variable. Les vues de production Storybook et Android chargent les mêmes
ressources ; Chess69Display reste réservé au prototype. Le diagnostic et la
preuve native relèvent du parent, sans généralisation à une validation Samsung.
