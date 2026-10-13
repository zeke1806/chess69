---
name: Chess69
description: Apprentissage et jeu d’échecs sur Android, noir et orange
colors:
  surface: "#111318"
  surface-container: "#1D2027"
  surface-high: "#292D36"
  on-surface: "#F3F0E8"
  muted: "#BCC1CC"
  primary: "#FF9F43"
  on-primary: "#241506"
  outline: "#454A56"
  error: "#FFB4AB"
  success: "#B7D9AB"
  board-light: "#E4D9C5"
  board-dark: "#7B6553"
  board-last: "#B8A05E"
  board-check: "#BF6057"
  board-capture: "#ED8127"
  board-target: "#29231988"
  coordinate-on-light: "#4F3824"
  coordinate-on-dark: "#FFF3E0"
  navigation-selected: "#54371F"
  error-container: "#442B2B"
  scrim: "#000000BB"
typography:
  title:
    fontFamily: "Android system sans-serif"
    fontSize: "26sp"
    fontWeight: 700
    lineHeight: "34sp"
  focus-title:
    fontFamily: "Android system sans-serif"
    fontSize: "24sp"
    fontWeight: 700
    lineHeight: "32sp"
  section:
    fontFamily: "Android system sans-serif"
    fontSize: "20sp"
    fontWeight: 600
    lineHeight: "28sp"
  action-title:
    fontFamily: "Android system sans-serif"
    fontSize: "18sp"
    fontWeight: 600
    lineHeight: "26sp"
  body:
    fontFamily: "Android system sans-serif"
    fontSize: "16sp"
    fontWeight: 400
    lineHeight: "24sp"
  button-label:
    fontFamily: "Android system sans-serif"
    fontSize: "16sp"
    fontWeight: 700
    lineHeight: "24sp"
  choice-selected-label:
    fontFamily: "Android system sans-serif"
    fontSize: "16sp"
    fontWeight: 600
    lineHeight: "24sp"
  muted:
    fontFamily: "Android system sans-serif"
    fontSize: "14sp"
    fontWeight: 400
    lineHeight: "21sp"
  navigation-label:
    fontFamily: "Android system sans-serif"
    fontSize: "12sp"
    fontWeight: 600
    lineHeight: "16sp"
  app-bar-title:
    fontFamily: "Android system sans-serif"
    fontSize: "20sp"
    fontWeight: 700
  board-coordinate:
    fontFamily: "Android system sans-serif"
    fontSize: "10sp"
    fontWeight: 700
rounded:
  board: "4dp"
  panel: "12dp"
  focus: "16dp"
  dialog: "24dp"
  button: "28dp"
spacing:
  compact: "8dp"
  stack: "12dp"
  panel: "16dp"
  section: "24dp"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "14dp 20dp"
  button-secondary:
    backgroundColor: "{colors.surface-high}"
    textColor: "{colors.on-surface}"
    typography: "{typography.button-label}"
    rounded: "{rounded.button}"
    padding: "14dp 20dp"
  choice:
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.panel}"
    padding: "12dp 16dp"
  choice-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.choice-selected-label}"
    rounded: "{rounded.panel}"
    padding: "12dp 16dp"
  panel:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  action-row:
    textColor: "{colors.on-surface}"
    typography: "{typography.action-title}"
    padding: "16dp 0dp"
  navigation-indicator:
    backgroundColor: "{colors.navigation-selected}"
    rounded: "16dp"
    width: "64dp"
    height: "32dp"
  chessboard:
    rounded: "{rounded.board}"
    width: "100%"
  promotion-dialog:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.dialog}"
    padding: "{spacing.section}"
---

# Design System: Chess69

## Overview

**Creative North Star: "L’échiquier à portée de main"**

L’application étend l’identité noir/orange existante. Le logo et le splash
Android sont conservés. Les surfaces servent la lecture d’une position et
l’action suivante : apprendre, jouer, revoir ou consulter un résultat.
La densité vient d’une colonne lisible, de listes séparées par un trait et de
panneaux réservés aux groupes utiles.

Ce document décrit le code Android livré : [thème](src/ui/components/application/theme.ts),
[commandes](src/ui/components/application/controls.tsx), [écrans](src/ui/components/application/application-screen.tsx)
et [échiquier](src/ui/components/application/chessboard.tsx). Les dimensions sont
en dp et les textes en sp ; la famille système est laissée au moteur natif.
Les exemples HTML/CSS du sidecar sont des traductions de présentation au facteur
1 dp/sp vers 1 px. Leurs états de survol et de focus clavier servent uniquement
le panneau web ; ils ne décrivent pas un comportement Android livré. Les rampes
tonales du panneau sont synthétiques, pas de nouveaux tokens de l’application.

**Key Characteristics:**

- Identité noir/orange et ressources locales.
- Échiquier carré, pièces vectorielles et repères de jeu explicites.
- Texte système ajustable et commandes qui grandissent avec leur contenu.
- Profondeur tonale et retour d’état utile.

## Colors

La surface sombre porte les textes clairs. L’orange désigne l’action principale,
la sélection et le prochain entraînement. Le résultat est toujours nommé en
français ; erreur, aide et réussite ne reposent pas uniquement sur une couleur.
Les deux tons de l’échiquier sont distincts de la palette des panneaux.

### Primary

- **Orange d’action** (`primary`) : boutons remplis, choix sélectionnés, icône et label de destination active, case sélectionnée et panneau du prochain entraînement.
- **Encre sur orange** (`on-primary`) : textes du bouton principal, du choix actif et du panneau orange.
- **Fond de destination active** (`navigation-selected`) : capsule derrière l’icône orange, distincte du fond de navigation.

### Neutral

- **Fond sombre** (`surface`) : écran et barre supérieure.
- **Panneau sombre** (`surface-container`) : groupes, navigation et dialogue de promotion.
- **Commande secondaire** (`surface-high`) : fond des boutons secondaires.
- **Texte clair** (`on-surface`) et **texte secondaire** (`muted`) : information principale puis contexte, version et métadonnées.
- **Trait de séparation** (`outline`) : bord des choix et séparateurs de listes.
- **Cases claires et brunes** (`board-light`, `board-dark`) : grille de travail ; les coordonnées emploient leurs deux encres dédiées.
- **Dernier coup** (`board-last`), **roi en échec** (`board-check`), **destination vide** (`board-target`) et **prise possible** (`board-capture`) : repères fonctionnels de l’échiquier.
- **Erreur** (`error`, `error-container`) et **journée active** (`success`) : états nommés, jamais un résultat transmis par couleur seule.
- **Voile de promotion** (`scrim`) : atténuation de l’arrière-plan pendant le choix obligatoire d’une pièce.

**The Action and Position Rule.** L’orange exprime l’action ou la sélection. Les repères de position restent accompagnés de coordonnées, d’une forme ou d’un libellé ; ils ne remplacent pas l’explication du résultat.

## Typography

La police système Android suit la taille de texte de l’appareil. Les titres,
sections, explications et informations secondaires utilisent les rôles du
frontmatter. Les commandes grandissent avec leur texte. Le label visuel court
« Progrès » conserve le nom accessible « Progression ». Aucune police distante.

### Hierarchy

- **Titre** (`title`) : nom du parcours ou de la position travaillée.
- **Titre du prochain entraînement** (`focus-title`) : texte dans le panneau orange de l’accueil.
- **Section** (`section`) : groupe d’informations ; espace au-dessus supérieur à l’espace au-dessous.
- **Titre d’action** (`action-title`) : ligne d’ouverture, d’exercice ou d’historique.
- **Corps** (`body`) et **contexte** (`muted`) : explication puis information secondaire.
- **Commande** (`button-label`, `choice-selected-label`) : action en gras, sélection légèrement renforcée.
- **Navigation** (`navigation-label`, `app-bar-title`) : destinations courtes et contexte du parcours. La hauteur de ligne du titre de barre est gérée par Android, sans valeur inventée.
- **Coordonnée** (`board-coordinate`) : repère discret dans le coin d’une case, pas un label de commande.

**The System Text Rule.** Conserver l’ajustement natif du texte. Les boutons ont une hauteur minimale et des marges intérieures, sans hauteur fixe qui couperait leur libellé.

## Layout

Les insets protègent les barres système. Une top app bar d’au moins 64 dp porte
le titre du parcours et, dans les sous-écrans, une action de retour de 48 dp.
Le contenu défile, avec 12 dp de marge horizontale et une largeur maximale de
480 dp. La navigation à quatre destinations reste en bas, dans une zone d’au
moins 80 dp ; ses commandes mesurent au moins 64 dp de haut. Les groupes utilisent
les espacements du frontmatter. L’échiquier occupe la largeur disponible et
reste carré ; ses cases sont proches de 48 dp sur le téléphone émulé de 411 dp.
Les lignes de choix peuvent revenir à la ligne. Les sections ont 24 dp au-dessus
et 8 dp au-dessous ; les panneaux regroupent leurs enfants avec 8 dp. Le contenu
a 24 dp de marge en bas. Aucun breakpoint n’est défini : la largeur est fluide
jusqu’au maximum du conteneur. Les pièces ont une taille calculée depuis la
largeur de fenêtre, plafonnée à 54 dp dans le code actuel.

## Elevation & Depth

Les surfaces sont planes, sans ombre. Les panneaux tonaux et
les séparateurs organisent les groupes. Aucun mouvement décoratif ; le ripple
natif matérialise l’appui, l’indicateur de chargement nomme une opération réelle.
La transparence est limitée aux destinations légales, au ripple et au voile de
promotion. La modal de promotion utilise le fondu natif ; aucune durée ou courbe
personnalisée n’est définie.

**The Tonal Depth Rule.** Utiliser les surfaces et les séparateurs pour organiser les groupes ; ne pas ajouter d’ombre décorative aux composants de ce système.

## Shapes

Les panneaux sont légèrement arrondis, les boutons remplis ou secondaires sont
arrondis à 28 dp et mesurent au moins 52 dp de haut. L’indicateur de navigation
est une capsule. L’échiquier reste une grille nette.
Ses coins sont arrondis selon `board`, puis clippés. Les choix gardent un trait
de 1 dp. Le retour est un contrôle circulaire de 48 dp. Le dialogue de promotion
utilise `dialog`, avec 24 dp de marge intérieure.

## Components

### Buttons

Les deux variantes partagent forme, dimensions et label : action orange ou
commande secondaire sombre, au moins 52 dp de haut, avec les marges du
frontmatter. L’appui applique une opacité de 0,8 et un ripple Android blanc
translucide ; la désactivation applique une opacité de 0,45 et bloque l’action.
Ces états modifient l’opacité, sans token de fond orange pressé supplémentaire.

### Choices

Un contrôle de sélection d’au moins 48 dp, bordé et arrondi comme un panneau.
L’état sélectionné remplit fond et bord d’orange et renforce le label. Le rôle
accessible est `radio` avec son état `checked`. Le composant actuel ne définit
pas de ripple ni de changement d’opacité à l’appui : ne pas lui attribuer ceux
du bouton.

### Panels and Lists

Les panneaux rassemblent aide, explication, reprise ou analyse sur une surface
tonale. Les listes d’actions restent planes : minimum 64 dp, titre et détail
séparés par 4 dp, trait inférieur de 1 dp et ripple Android. Les lignes de
statistiques utilisent le même séparateur et une marge verticale de 12 dp.

### Navigation

La navigation inspirée de Material 3 utilise quatre icônes SVG locales cohérentes de 24 dp,
un indicateur sélectionné et des labels. La top app bar porte le retour natif
et le contexte. L’accueil garde le logo actuel et la version. La capsule active
a les dimensions du frontmatter et clippe son fond dans une vue native. Les
icônes sont des tracés géométriques d’épaisseur 1,8, avec extrémités et jointures
arrondies. Le label visuel « Progrès » garde le nom accessible « Progression ».

### Chessboard and Promotion

L’échiquier utilise douze pièces Chessnut SVG locales (Apache 2.0, provenance
dans `THIRD_PARTY.md`). Le contour sombre des blancs reste visible sur une case
claire. Orientation, coordonnées et labels nommant case/camp/pièce sont conservés.
Toucher l’origine puis la destination ; destinations légales, dernier coup et
roi en échec sont marqués. La promotion affiche les quatre choix dans une modal.
Les échiquiers d’analyse sont consultables sans déplacement. Une destination
vide porte un point de 12 dp ; une prise possible porte un anneau couvrant 92 %
de la case, bordé à 3 dp. Les coordonnées sont placées dans les coins des cases.
La modal de promotion propose Dame, Tour, Fou, Cavalier et Annuler ; elle protège
un choix nécessaire au coup, sans créer un nouveau type de panneau décoratif.

### States and Evidence

Boutons, choix et lignes d’activité conservent leurs labels accessibles et le
retour Android. Chargement, moteur en réflexion, erreur avec réessai, contenu
vide, aide, succès, reprise et analyse annulable sont des états explicites.
Les abandons et remplacements d’une partie active demandent confirmation native.

La preuve visuelle couvre une APK ARM64 sur téléphone émulé API 36, texte normal
et à 130 %. Elle ne valide pas le Galaxy S22 Ultra, TalkBack, les gestes One UI
ou la performance du matériel ; voir `.scratch/application-locale/phone-test.md`.

## Do's and Don'ts

### Do

- Do — Conserver le logo, le splash et l’identité noir/orange.
- Do — Respecter le texte système, les zones sûres et le retour Android.
- Do — Garder les pièces, icônes et contenus embarqués pour un premier lancement hors ligne.
- Do — Nommer erreurs, résultats et opérations en français.
- Do — Conserver les formes, coordonnées et labels qui expliquent une position sans dépendre de sa couleur seule.

### Don't

- Don't — Ne pas utiliser de glyphes Unicode comme système de pièces ou d’icônes.
- Don't — Ne pas attribuer à un téléphone réel une validation obtenue sur émulateur.
- Don't — Ne pas traiter les traductions web ni les rampes synthétiques du sidecar comme des tokens ou des preuves Android.
