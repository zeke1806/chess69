# Vérification Storybook web

## Contrôles réussis

- `npm run typecheck` : contrats et sources, stories et tests inclus.
- `npm test` : 18 suites, 116 tests de comportement réussis.
- `npm run format:check` et `git diff --check` : réussis.
- `npm run check:architecture` : 125 sources, 18 vues stateless avec stories,
  frontières et imports sans cycle. Vingt sondes négatives/positives du contrôle
  ont été exécutées et nettoyées ; détails dans le ticket 02.
- `npm run storybook:test` : build statique réussi, 112 tests Playwright réussis.
  Index : 82 stories, dont 16 pages complètes dans Business/Pages/Application.
- Pages complètes : neuf parcours contrôlés à 360, 412 et 480 px ; sélection
  visuelle de navigation, retour des sous-pages, 64 cases carrées, aucun débordement.
- Premier lancement à 360 × 640 : le contenu défile en intérieur, navigation
  immobile, aucune translation de la fenêtre du navigateur.
- Ordinateur à 1280 × 915 : largeurs 360/412/480 centrées.
- Serveur réel `npm run storybook:dev` : actif sur 127.0.0.1:6006,
  accueil affiché dans Chromium sans erreur JS ; menu « Téléphone · 412 px »
  puis choix « Compact · 360 px » validé, cadre mesuré à 360 px.

## Preuves visuelles

Captures générées et ignorées par Git dans `artifacts/storybook-web/` :
exercice sur ordinateur aux trois largeurs, premier lancement, exercice et
progression à 412 px, catalogue complet sur ordinateur. Inspection du shell,
logo réel, pièces vectorielles, titres, couleurs et navigation. Les captures
existantes de composants restent dans `artifacts/cu-archi-stories/`.

## Corrections avant livraison

Le premier contrôle statique a croisé une sonde temporaire d’architecture ;
relancé après nettoyage. Le cadrage DOM des composants isolés a ensuite révélé
24 px de débordement à 412 px : `box-sizing: border-box` corrige le décorateur.
La suite entière passe après correction, sur la même branche.

## Limites

Les données sont des fixtures représentatives déterministes, les actions des pages
complètes sont des callbacks factices. Les stories d’échiquier interactif utilisent
le vrai service Board. Aucun SQLite ou Stockfish natif n’est démarré par Storybook.
Cette preuve web ne valide ni Android/One UI/TalkBack, ni le moteur ou la persistance
sur téléphone. Aucun changement de dépendance native et aucune APK requise ici.
Le build signale la taille de certains chunks Storybook ; le build réussit.

## Revue et livraison

Revues Standards, Spec et visuelle réalisées : zéro finding sur chaque axe ;
rapports adjacents. Tous les critères sont résolus. Livraison par un seul commit
sur main en avance rapide ; branche de travail supprimée. Serveur de développement
laissé actif sur le port 6006. Aucune publication distante demandée.
