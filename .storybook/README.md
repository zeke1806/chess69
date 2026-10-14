# Catalogue de composants Chess69

Les stories rendent les composants React Native de Chess69 dans le navigateur,
avec le [framework officiel React Native Web](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite).
Le catalogue s’utilise sans appareil Android. Expo et Metro restent les outils
Android ; l’entrée de l’application demeure `expo-router/entry`.

## Lancer le catalogue web

Avec Node 24 (`.nvmrc`) et npm, depuis la racine du dépôt :

```sh
npm ci
npm run storybook:dev
```

Ouvrir [http://localhost:6006](http://localhost:6006) dans un navigateur.
Le port de développement est **6006**. L’aperçu démarre en **Large mobile**,
portrait **414 × 896 px**, via le sélecteur de viewport officiel de Storybook.
Ce sélecteur reste modifiable ; le menu **Largeur** règle le contenu à l’intérieur
de cet aperçu. Arrêter le serveur avec `Ctrl+C`.

## Parcourir l’interface actuelle

Le catalogue suit l’organisation CU Archi :

- `Common/Buttons`, `Common/Inputs` et `Common/Containers` : primitives réutilisables.
- `Business/Pages` : vues des parcours et écrans complets dans `Application`.
- `Business/Layout` : shell et éléments de structure de l’application.
- `Business/Chess` : échiquier, pièces et icônes.

Commencer par `Business/Pages/Application` pour voir l’accueil, les catalogues,
les exercices, les parties, l’historique, l’analyse et la progression dans le
shell réel. Les variantes permettent d’inspecter les états vides, chargements,
erreurs et contenus représentatifs. Le défilement conserve le cadre mobile.
Utiliser **Largeur** dans la barre d’outils pour comparer **360, 412 et 480 px**.

`ApplicationScreen` assemble le shell et les vues stateless, puis reçoit l’état,
les actions, la source du logo et les dimensions par props. Cette composition
est partagée par les stories et l’application ; la feature Android garde les
hooks, les effets et le raccordement aux services. Les composants common/business
ne possèdent ni état applicatif, ni appel à un service exécutable. Le contrôle
architectural vérifie ces frontières et la présence des stories.

Les fixtures sont déterministes et utilisent le catalogue embarqué et les
règles chess.js ; elles n’appellent ni SQLite ni Stockfish natif. Les boutons
des pages complètes exposent leurs intentions par callbacks de démonstration.
Les stories d’interaction de l’échiquier utilisent le vrai service Board.
Le shell fournit la vraie image PNG via `logoSource`. SVG, safe area et modale
utilisent leurs implémentations web officielles.

## Construire et servir une version statique

```sh
npm run storybook:build
python3 -m http.server 6011 --bind 127.0.0.1 --directory storybook-static
```

Le build est généré dans `storybook-static/`. Ouvrir ensuite
[http://127.0.0.1:6011](http://127.0.0.1:6011). Ce serveur local est une option
pour consulter les fichiers statiques ; il s’arrête avec `Ctrl+C`.

## Vérifier le catalogue

Installer Chromium une fois, puis lancer les contrôles :

```sh
npx playwright install chromium
npm run typecheck
npm run check:architecture
npm run storybook:test
```

Le dernier script reconstruit le catalogue puis lance Chromium sur les fichiers
statiques, avec un serveur temporaire Python sur `127.0.0.1:6011`. Libérer ce port
avant le contrôle. Les tests inspectent les stories et leurs interactions ;
les captures sont conservées dans `artifacts/cu-archi-stories/` et
`artifacts/storybook-web/`. Builds, captures
et rapports sont ignorés par Git. Les tests `.spec.ts` du catalogue sont séparés
des tests Jest de l’application.

Ces contrôles prouvent le rendu React Native Web. Ils ne remplacent pas
l’exécution de l’APK Android, la mise à jour avec données ou les contrôles
TalkBack. RNW 0.21 ne traduit pas les champs natifs
`accessibilityState.checked/selected` ; les stories vérifient la sélection
visuelle, tandis que son annonce accessible reste un contrôle natif.
