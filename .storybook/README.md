# Catalogue de composants Chess69

Les stories rendent les composants React Native de Chess69 dans le navigateur,
avec le [framework officiel React Native Web](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite).
Expo et Metro restent les outils de l’application Android ; son entrée demeure
`expo-router/entry`. Le catalogue est un outil séparé, absent du parcours utilisateur.

Depuis la racine du dépôt :

```sh
npm ci
npx playwright install chromium
npm run storybook:dev
```

Le catalogue s’ouvre sur `http://localhost:6006`. Pour les contrôles :

```sh
npm run typecheck
npm run storybook:build
npm run storybook:test
```

Le dernier script reconstruit le catalogue puis lance Chromium sur les fichiers
statiques, avec un serveur temporaire Python sur `127.0.0.1:6011`. Il vérifie
chaque story et les interactions de sélection/promotion via le vrai service
Board. Il génère huit captures aux largeurs 412 et 480 px dans
`artifacts/cu-archi-stories/`. Builds, captures et rapports sont ignorés par Git.
Les tests `.spec.ts` du catalogue sont séparés des tests Jest de l’application.

Les fixtures sont déterministes et utilisent le catalogue embarqué et les
règles chess.js ; elles n’appellent ni SQLite ni Stockfish natif. La story du
shell fournit la vraie image PNG via `logoSource`. SVG, safe area et modale
utilisent leurs implémentations web officielles.

Ces contrôles prouvent le rendu React Native Web. Ils ne remplacent pas
l’exécution de l’APK Android, la mise à jour avec données ou les contrôles
TalkBack. RNW 0.21 ne traduit pas les champs natifs
`accessibilityState.checked/selected` ; les stories vérifient la sélection
visuelle, tandis que son annonce accessible reste un contrôle natif.
