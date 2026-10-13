---
name: Chess69
description: Écran Android de contrôle, lisible et tactile
colors:
  surface: "#111318"
  on-surface: "#F3F0E8"
  on-surface-variant: "#BCC1CC"
  primary: "#FF9F43"
  primary-pressed: "#E9892D"
  on-primary: "#241506"
typography:
  headline:
    fontFamily: "Android system sans-serif"
    fontSize: "32sp"
    fontWeight: 700
    lineHeight: "40sp"
  title:
    fontFamily: "Android system sans-serif"
    fontSize: "24sp"
    fontWeight: 500
    lineHeight: "32sp"
  body:
    fontFamily: "Android system sans-serif"
    fontSize: "16sp"
    fontWeight: 400
    lineHeight: "24sp"
  label:
    fontFamily: "Android system sans-serif"
    fontSize: "16sp"
    fontWeight: 700
    lineHeight: "24sp"
rounded:
  button: "28dp"
spacing:
  compact: "8dp"
  related: "16dp"
  gutter: "24dp"
  section: "48dp"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "16dp 24dp"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
---

# Design System: Chess69

## Overview

Le premier écran applique la direction noir/orange confirmée dans les documents
du projet. L'identification et l'action sont séparées par l'espace, sans décor
ni carte superflue. Ces décisions restent limitées à la première APK ; elles
ne préjugent pas du dessin d'un futur échiquier.

## Colors

La surface sombre porte un texte clair. L'orange désigne le bouton principal
et le résultat confirmé ; le libellé rend toujours l'état compréhensible sans
se fier à la couleur. La version utilise `on-surface-variant`.

## Typography

La police système Android suit les tailles de texte de l'appareil. Le titre
Chess69 utilise `headline`, le message `title`, la version `body` et le bouton
`label`. Aucune police n'est téléchargée au lancement.

## Layout

Une colonne de 480 dp maximum, avec 24 dp de marge intérieure, s'aligne dans
la zone sûre. Les groupes sont séparés de 48 dp et les éléments liés de 8 ou
16 dp. Le contenu peut défiler si la hauteur ou une grande taille de texte le
requiert. Les insets protègent la caméra et les barres système.

## Elevation & Depth

Surface plane sans ombre ni effet translucide. La hiérarchie repose sur la
typographie, le contraste et l'espacement.

## Shapes

Le seul contrôle est un bouton Material rempli, arrondi à 28 dp, d'au moins
56 dp de haut. Sa hauteur grandit avec le texte.

## Components

Le bouton « Tester » garde son libellé après l'appui. Son état pressé assombrit
le fond et utilise le retour natif Android. La confirmation est persistante
à l'écran pendant la session, avec une annonce d'accessibilité polie. L'action
étant locale et synchrone, aucun chargement ou état d'erreur artificiel n'est
affiché.

## Do's and Don'ts

- Conserver l'action et son résultat dans la même colonne.
- Respecter la taille de texte système et les zones sûres.
- Ne pas ajouter de ressource distante pour cet écran hors ligne.
- Ne pas présenter l'inspection d'un navigateur comme preuve du rendu Android.
