---
name: Chess69
description: Apprentissage des échecs sur Android, charbon ivoire et sauge
colors:
  surface: "#191C1A"
  surface-container: "#292E2A"
  surface-high: "#333B34"
  on-surface: "#F0EDE5"
  muted: "#BAC2B6"
  primary: "#B6C7A8"
  on-primary: "#202B1E"
  outline: "#465044"
  error: "#FFB4AB"
  success: "#B7D9AB"
  board-light: "#E7E5D8"
  board-dark: "#7F9276"
  board-selected: "#B6C7A8"
  navigation-selected: "#354332"
  error-container: "#442B2B"
  board-check: "#BF6057"
  board-target: "#29231988"
  scrim: "#000000BB"
typography:
  title:
    fontFamily: "Chess69Bold"
    fontSize: "26sp"
    lineHeight: "34sp"
    fontWeight: 400
  section:
    fontFamily: "Chess69Semibold"
    fontSize: "20sp"
    lineHeight: "28sp"
    fontWeight: 400
  body:
    fontFamily: "Chess69Regular"
    fontSize: "16sp"
    lineHeight: "24sp"
    fontWeight: 400
  muted:
    fontFamily: "Chess69Regular"
    fontSize: "14sp"
    lineHeight: "21sp"
    fontWeight: 400
  button-label:
    fontFamily: "Chess69Bold"
    fontSize: "16sp"
    lineHeight: "24sp"
    fontWeight: 400
  action-title:
    fontFamily: "Chess69Semibold"
    fontSize: "18sp"
    lineHeight: "26sp"
    fontWeight: 400
  navigation-label:
    fontFamily: "Chess69Semibold"
    fontSize: "12sp"
    lineHeight: "16sp"
    fontWeight: 400
  focus-title:
    fontFamily: "Chess69Bold"
    fontSize: "24sp"
    lineHeight: "32sp"
    fontWeight: 400
rounded:
  panel: "24dp"
  button: "18dp"
  help: "20dp"
  navigation: "26dp"
  navigation-item: "22dp"
  board: "16dp"
spacing:
  compact: "8dp"
  stack: "12dp"
  panel: "16dp"
  focus: "20dp"
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
    rounded: "{rounded.button}"
  panel:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  help:
    backgroundColor: "{colors.surface-high}"
    rounded: "{rounded.help}"
    padding: "{spacing.panel}"
---

# Design System: Chess69

## Overview

**Creative North Star: "Le jeu prend du relief"**

La direction validée charbon, ivoire et sauge est intégrée aux vues réelles.
Les cartes tactiles et les illustrations originales en volume reprennent
l’esprit des références ChessFlare. Les mots restent courts ; les détails utiles
s’ouvrent dans des aides compactes plutôt que de remplir l’écran.

Ce document décrit le code dans `src/ui/components`, partagé avec Storybook.
Les anciens prototypes restent des références de proposition, pas la source des
fonctionnalités. La preuve web et la vérification Android sont distinctes ;
la validation sur le Samsung de l’utilisateur reste à obtenir.

## Colors

La sauge porte l’action et la sélection ; le charbon chaud organise les surfaces,
l’ivoire porte la lecture. Les fonds secondaires restent teintés dans cette famille.
Les erreurs et résultats sont aussi nommés en français. Les cases de l’échiquier
emploient leurs deux tons propres ; coups possibles, échec et promotion conservent
leurs repères de forme et leur contexte accessible.

## Typography

Manrope est embarquée en trois instances statiques locales :
`src/assets/manrope-400.ttf` (Chess69Regular), `manrope-600.ttf`
(Chess69Semibold) et `manrope-700.ttf` (Chess69Bold), avec sa licence SIL OFL 1.1.
`ApplicationFeature` les charge via `expo-font`. Les composants choisissent
explicitement la famille, avec `fontWeight: normal` : la graisse intrinsèque
400/600/700 appartient au fichier de fonte. Le frontmatter décrit cette sélection,
sans demander une synthèse de graisse. Les titres et commandes utilisent Bold,
les sections, lignes d’action et navigation Semibold, les corps et contexte Regular.
La fonte variable unique produisait un rendu trop fin sur Android ; les trois
instances corrigent ce défaut. Le catalogue charge ces mêmes ressources pour
les vues de production. Seul le prototype conserve l’alias variable Chess69Display.
La provenance et la conversion sont dans `src/assets/fonts.md`.
Elle sert les rôles communs du thème, y compris les corps ; certaines métadonnées
locales et coordonnées conservent le rendu système. Pendant le chargement, un
indicateur apparaît ; si le chargement échoue, l’application peut rendre la vue
avec le repli du moteur natif. Aucun téléchargement de fonte n’est requis.

Les tailles du frontmatter sont celles du thème actuel. Les labels peuvent
s’ajuster au texte Android ; les commandes ont une hauteur minimale, pas fixe.

## Layout

Une colonne défilante, 12 dp de marge horizontale, largeur maximale 480 dp,
12 dp entre les groupes, et 24 dp de marge basse. La barre supérieure mesure
au moins 64 dp et le retour 48 dp. Les destinations restent en bas dans une
navigation d’au moins 80 dp. L’accueil et l’apprentissage comportent des rangées
horizontales de cartes de 198 dp, espacées de 12 dp. Les insets protègent les
barres Android ; l’échiquier est carré, fluide et limité à 480 dp.

## Elevation & Depth

Les panneaux et lignes d’action gagnent du relief avec un bord inférieur de
5 dp, un contour de 1 dp et une surface tonale. Les cartes d’historique utilisent
une ombre noire décalée de 4 dp, rayon 8 dp, opacité 0,2. Les illustrations
apportent leur propre éclairage volumétrique. Pas de mouvement décoratif ajouté ;
l’appui sur les boutons baisse l’opacité à 0,8 et conserve le ripple Android.

## Shapes

Cartes et panneaux à rayon 24 dp, boutons et choix 18 dp, aides 20 dp avec
une petite pointe. La navigation forme une capsule de 26 dp avec destinations
arrondies à 22 dp ; l’échiquier est clippé à 16 dp. La modal de promotion garde
24 dp de rayon et de marge intérieure.

## Components

La structure des composants et leur catalogue suivent [CU Archi](/Users/zeke/.agents/skills/cu-archi/references/architecture.md). Les choix visuels propres à Chess69 sont décrits ci-dessous.

- Boutons : minimum 52 dp, primaire sauge, secondaire tonal, désactivé à opacité
  0,45 ; la désactivation bloque l’action et est exposée à l’accessibilité.
- Choix : minimum 48 dp, contour au repos ; remplissage et contour sauge quand
  sélectionné, avec état radio accessible.
- Aide : `HelpDisclosure` reçoit `expanded` et `onToggle`. La commande
  « Comprendre » devient « Fermer l’aide » ; le texte est encapsulé dans une bulle.
- Navigation : quatre destinations, Accueil, Apprendre, Jouer et Progrès ;
  illustrations de 38 dp, label 12/16, surface et bord sauge pour la sélection.
- Illustration : atlas original local cavalier/livres/puzzle/tour, décliné depuis
  un PNG à quatre cellules. La provenance ImageGen est conservée avec le travail
  de proposition dans `.storybook/design/assets/illustrations.png.json`.
- Échiquier : pièces SVG Chessnut Apache-2.0, coordonnées de 10 sp, cibles visibles,
  sélection, dernier coup, état d’échec et choix de promotion conservés.

## Do's and Don'ts

- Garder une action principale immédiatement visible et des textes courts.
- Encapsuler les détails explicatifs ; préserver les noms et retours métier utiles.
- Utiliser les vrais composants dans Storybook et contrôler Android séparément.
- Conserver toutes les ressources embarquées et l’autonomie hors ligne.
- Ne pas confondre une maquette approuvée avec une nouvelle règle métier.
