# Vérifications de l’intégration 0.3.0/code6

## Contrôles réussis

- TypeScript, format:check, check:architecture et git diff --check.
- 18 suites Jest, 117 tests réussis, dont l’aide immuable et sa remise à zéro en navigation.
- Build Storybook et 133 contrôles Playwright réussis sur les vrais composants,
  états d’aide, images, sélection, échiquier et pages cadrées aux trois largeurs.
- Expo install --check à jour et Expo Doctor 20/20 après quatre correctifs compatibles SDK57.
- APK ARM64 release signée, identité/version/certificat et alignement vérifiés par
  scripts/verify-apk.py. Métadonnées publiques dans release.json.

## Preuves Android

Émulateur téléphone ARM64 API36, installation `adb install -r` depuis 0.2.1/code5,
sans effacement. Les 2 réussites sans aide, 2 jours actifs, 4 parties terminées
et la révision Giuoco Piano sont conservés. Réinstallation de l’APK finale avec
les correctifs SDK57 et les trois fontes statiques effectuée également sans effacement.

Parcours natifs inspectés : accueil, progression, aide ouverte, historique et
miniatures réelles, analyse conservée, catalogue, ouverture, guide, options et partie.
En analyse, Suivant passe de 0/2 à 1/2, déplace le pion de e2 à e4 et retrouve
l’évaluation +0.38 ainsi que c7c5 depuis les données persistées.
Une nouvelle partie reçoit e2e4 puis Stockfish répond d7d5, avec retour du trait
aux blancs. L’appareil est en mode avion (airplane_mode_on=1) ; l’APK n’a pas la
permission Internet. Reprise de la partie après arrêt forcé vérifiée.

Inspection de la typographie native après correction de la fonte variable trop
fine : instances statiques 400/600/700 locales, mêmes assets dans Storybook.
Accueil et options inspectés à font_scale=1.3, puis échelle restaurée à 1.0.
Captures PNG/XML locales dans artifacts/integration-design/native, ignorées par Git.
Le contrôle initial web a révélé des attentes de couleur/navigation/copie anciennes
et des stories sans preuves : elles sont remplacées par les assertions du nouveau
visuel, sans retirer les contrôles de rendu. Tous passent sur les versions finales.

## Revues

Standards : P3 de duplication historique corrigé, contre-revue sans finding restant.
Spec : zéro finding d’implémentation ; documentation pré-intégration nettoyée.
Visuelle native : disposition ship, accueil chargé et texte à 130 % inspectés.
DESIGN.md et son sidecar documentent le système intégré et les trois familles natives.

## CU Archi et UpSkill

Source canonique ai-skills/cu-archi : Common/Business intégrés, Design durable avec
statuts proposition/approuvé/intégré et démonstrations isolées. Audit sans finding,
validation ai-skills et 19 tests réussis. Synchronisation ciblée repo vers actif,
status --check : aucune différence. Commit unique de ce dépôt : 7f6a56a.

## Livraison et limites

Un commit final Chess69 sur main, branche supprimée, APK 0.3.0/code6 et archive des
sources correspondantes disponibles sous artifacts. Aucun push ni déploiement VPS.
Le Galaxy S22 Ultra, TalkBack et les gestes One UI restent à vérifier sur téléphone.
Installer la nouvelle APK avec Mettre à jour, sans désinstaller ni effacer les données.
