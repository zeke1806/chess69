Status: done
Blocked by: none

Spec : ../spec.md

## Réalisation

Palette A exacte dans common/theme, Manrope locale sous Chess69Display, atlas
original promu dans src/assets. Primitives cartes rayon24 et relief5, boutons52,
nav quatre destinations réelles illustrée, coque et chargement dans la palette.
Aucun import .storybook depuis les sources runtime. expo-font ~57.0.4 ajouté en
dépendance directe selon compatibilité SDK57 déclarée par Expo local.

HelpDisclosure stateless, ouverture contrôlée par OrchestrationActions.toggleHelp
et ShellState.helpVisible. Entrée dans un parcours ferme explicitement l’aide.
ApplicationScreen transmet ce contrat aux vrais écrans ; les features raccordent
le chargement local de police et les confirmations Android existantes.

## Vérifications

TypeScript passe. Architecture passe : frontières, absence de cycles,20 vues
stateless avec stories. Suite orchestration 17 tests passent, dont comportement
nouveau aide à la demande/immutabilité/navigation via contrat public du service.
Build web/APK et inspection visuelle globale confiés au parent après assemblage.

## Correction après preuve native

L’inspection APK a révélé que la variable Manrope donnait un corps trop fin sur
Android. Trois instances statiques 400/600/700 ont été dérivées du fichier
approuvé via fontTools 4.60.1 dans un venv temporaire. Expo-font et Storybook
chargent les mêmes familles nommées ; les styles sélectionnent explicitement
la famille régulière, demi-grasse ou grasse. Origine et reproduction dans
src/assets/fonts.md. TypeScript et architecture passent après correction.

## Compatibilité Expo finale

Après `expo install --check`, seuls les quatre correctifs SDK57 requis ont été
appliqués via Expo install : expo~57.0.29, expo-constants~57.0.22,
expo-linking~57.0.13, expo-router~57.0.27. Aucun prebuild ni changement de stack.
Contrôles après mise à niveau : Expo install --check à jour, expo-doctor20/20,
TypeScript sans erreur, 18 suites Jest /117 tests passent. Parent reconstruit
l’APK avec ces dépendances finales.

Critères validés ; preuves et limites dans ../verification.md.
