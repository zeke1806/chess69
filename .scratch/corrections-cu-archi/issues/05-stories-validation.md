# CU-ARCHI-05 — Stories et validation Android

Blocked by: CU-ARCHI-04
Status: resolved

## Critères d’acceptation

Composants common/business ; stories exécutables avec chargement, erreur, vide, positions et promotion. Typage/test/build des stories ; APK signée et mise à jour avec données sur émulateur, parcours hors ligne, rendu normal et texte élargi. Revues, docs de livraison et limites Galaxy. A5 et clôture A1–A9/D1.

## Interfaces de test

Contrats publics concernés et assemblages mémoire, conformément à spec.md.

## Vérification

Résultats complets : [verification.md](../verification.md), métadonnées APK dans [release.json](../release.json).

### Stories — contrôles effectués le 14 octobre 2026

- Catalogue réellement exécutable avec le framework officiel
  `@storybook/react-native-web-vite` 10.6.2, Storybook 10.6.2 et Vite 7.3.7,
  uniquement comme outillage de développement. Entrée production vérifiée :
  `expo-router/entry` ; aucune route ni dépendance Storybook importée par les
  vues de production.
- 17 composants couverts par 66 stories : quatre primitives Common, shell,
  échiquier, douze pièces SVG, cinq icônes et les neuf écrans Business.
  États : chargé, chargement, erreur/réessai, catalogue/historique/progression
  vides, onboarding, reprise, réflexion du moteur, guide/mémoire/indice,
  réussite, analyse partielle/en cours/terminée, orientations et sélection,
  lecture seule, échec et promotion.
- Les données d’apprentissage viennent du catalogue réel embarqué ; les
  positions sont construites par les règles chess.js. Les variantes utilisent
  Remeda. Les vues originales et leurs dépendances RNW/SvgXml/safe-area/Modal
  sont rendues, sans remplacer ces composants par des mocks. Le logo PNG est
  importé comme URL par la story et fourni via le contrat `logoSource`.
- `npm run typecheck` : succès avec contrôle des stories et configurations.
  `npm run storybook:build` : build statique complet réussi.
  `npm run storybook:test` : **67 tests Chromium passent** (66 stories et une
  vérification responsive), en 14,7 secondes pour la dernière suite.
- La suite charge chaque story compilée depuis le serveur statique, contrôle
  le texte attendu, les SVG et le PNG effectivement chargé, les états
  sélectionné/désactivé et les 64 cases. Aucune erreur JavaScript,
  `console.error` ou requête échouée constatée. Elle utilise Playwright
  1.64.0, un script dédié et des fichiers `.spec.ts` hors découverte Jest.
- La story interactive d’échiquier utilise le vrai service de présentation
  Board et son raccordement stateful : sélection e2 puis e4 transmet e2e4 ;
  annuler la promotion ne transmet aucun coup ; rouvrir puis choisir Cavalier
  transmet a7a8n et ferme la vraie Modal RNW.
- Huit captures à 412 et 480 px dans `artifacts/cu-archi-stories/` : premier
  accueil, erreur du shell, promotion et analyse partielle. Pas de
  débordement horizontal ; inspection visuelle groupée effectuée. Les
  animations sont désactivées uniquement pendant la capture pour figer la
  modale dans son état visible.

Portée : ces preuves utilisent React Native Web. RNW 0.21 ne traduit pas
`accessibilityState.checked/selected` comme Android ; les tests web vérifient
l’état sélectionné visuel, pas une certification TalkBack. Retour matériel,
barres système, Stockfish natif, persistance et mise à jour demandent la preuve
APK distincte pilotée par l’agent principal. Les contrôles Android et les revues complémentaires sont désormais terminés
et consignés dans verification.md.

Source de l’adaptation : [framework RNW officiel](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite).

### Clôture Android et revues

APK finale 0.2.1/code5 signée et vérifiée, mise à jour sans effacement depuis
0.2.0/code4 sur émulateur API 36 ARM64. Données anciennes conservées ; guide,
puzzle avec aide, réponses Stockfish/noirs puis blancs, reprise après arrêt,
confirmation/remplacement/abandon, historique et nouvelle analyse native
sauvegardée contrôlés hors ligne. Rendu normal et font_scale 1.3/mode sombre
inspectés en un lot ; configuration restaurée. Logcat sans erreur JS/native
fatale. Source GPL locale correspondante préparée depuis le commit final.

Suite finale 108 tests/15 suites, format/architecture/types/Expo et 67 contrôles
Chromium réussis. Les constats Standards/Spec sont corrigés et contre-revus ;
aucun constat restant. Documents d’audit, stack, sources, release et README
actualisés ; livraison Git regroupée et fusionnée selon le workflow du projet.
Aucun push/publication ni test Galaxy physique revendiqué.
