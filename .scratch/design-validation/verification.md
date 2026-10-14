# Preuves de livraison du design Storybook

## Contrôles

- TypeScript, format:check, architecture et git diff --check : réussis.
- Jest : 18 suites, 116 tests réussis, source de l’application inchangée.
- Storybook : build statique réussi et 118 tests Playwright réussis, 88 stories
  dont le moodboard et les cinq maquettes nouvelles.
- Navigation locale, filtres, carte sélectionnée, indice, cases, lecteur de coups,
  historique et retour à l’accueil testés avec Chromium sans erreur de page.
- Douze captures aux largeurs 360 et 414 px dans artifacts/design-validation,
  à 896 px de haut pour les écrans ; moodboard complet. Données de démonstration.
- Après l’ajout de Manrope, contrôle explicite FontFace.status loaded, attente
  du titre exact, des images et des fontes, marque en haut et navigation en bas,
  absence de débordement horizontal. Les seules parties de cartes masquées
  appartiennent aux rails horizontaux ; les sections inférieures sont défilantes.
- Revues Standards et Spec : zéro finding. Revue visuelle : correction TYPE
  demandée, résolue après inspection des douze captures finales ; disposition ship
  au périmètre de cette correction. Cela ne constitue pas l’approbation du design.

## Isolation et assets

Le code et les tokens proposés restent dans .storybook/design ; aucun fichier
src, Android ou service métier n’est modifié. Hooks de démo dans demo.tsx,
vues stateless dans design-screen.tsx, moodboard.tsx et kit.tsx. La troisième
racine Design est autorisée uniquement pour cette proposition temporaire.

Illustrations originales générées pour cette palette, raster PNG transparent,
exact prompt et provenance dans assets/illustrations.png.json. Manrope variable
locale, source Google Fonts, licence OFL conservée. Pas de dépendance ajoutée.
DESIGN.md conserve les tokens et l’état de l’application Android livrée.

## Limites et suite

Les positions, résultats et évaluations sont illustratifs ; le lecteur de coups
change sa sélection sans recalculer l’échiquier. Pas de stockage ou moteur natif.
Le web ne valide ni Samsung ni TalkBack. Le propriétaire doit valider le moodboard
et les maquettes avant toute intégration aux features.

Livraison : un commit final sur main en avance rapide, branche supprimée,
serveur de développement laissé sur le port 6006. Aucun déploiement ni APK.
