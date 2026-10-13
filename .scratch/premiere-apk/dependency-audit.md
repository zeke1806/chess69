# Audit des dépendances de la première APK

Date : 2026-10-13. Analyse de `package.json`, `package-lock.json`, des sources
installées et du rapport `/tmp/chess69-npm-audit.json`. Aucun changement de
dépendance ni installation effectué pendant cette analyse.

## Résultat

Le rapport compte 64 paquets signalés (49 high, 15 moderate, aucun critical),
mais seulement cinq avis racines. Les autres alertes remontent leurs dépendances.
Ce nombre n'est donc ni un nombre de failles indépendantes, ni une mesure du
code effectivement embarqué dans l'APK.

La stack reste Expo `57.0.28`, Expo Router `57.0.26` et React Native `0.86.3`.
Les propositions automatiques du rapport incluent une régression vers Expo 44
et des changements majeurs de Jest/React Native : ne pas appliquer
`npm audit fix --force`. Aucun remplacement de dépendance n'est recommandé
pour cette première livraison sans vérifier ses contrats et sa compatibilité.

| Dépendance signalée | Version du lockfile | Surface observée | Correction disponible et décision |
| --- | --- | --- | --- |
| `braces` | 3.0.3 | Motifs traités par Metro et Jest sur la machine de développement | Aucun correctif publié dans l'avis et dernière version npm 3.0.3. Conserver et suivre l'amont ; ne pas traiter de motifs de build non fiables. |
| `node-forge` | 1.4.0 | Expo CLI et certificats de signature Expo | Aucun correctif publié ; dernière version npm 1.4.0. La signature Android de ce projet utilise `keytool` et `apksigner`, indépendamment de cette bibliothèque. |
| `sprintf-js` | 1.0.3 | `argparse` / `js-yaml` / configuration de couverture Jest | Aucun correctif publié ; dernière version npm 1.1.3 également affectée. Conserver ; entrées de configuration maîtrisées par le dépôt. |
| `uuid` | 7.0.3 | `xcode` / plugins de configuration Expo, outillage iOS | Correctif à partir de 11.1.1, donc changement majeur. `xcode/lib/pbxProject.js` appelle `uuid.v4()` ; l'avis concerne v3/v5/v6 avec buffer de sortie. Pas de chemin vulnérable identifié dans cet usage. |
| `decode-uri-component` | 0.2.2 | `query-string` 7.1.3 / Expo Router ; peut appartenir au bundle de l'application | Correctif 0.5.0, mais passage CommonJS vers ESM. Ne pas forcer cette version sous le `require` direct de query-string 7.1.3. Neutraliser les liens entrants inutiles pour cet écran ; suivre une mise à jour Expo compatible. |

Sources des avis : [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
[node-forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv),
[sprintf-js](https://github.com/advisories/GHSA-hp3w-g68c-fv3c),
[uuid](https://github.com/uuidjs/uuid/security/advisories/GHSA-w5hq-g745-h8pq),
[decode-uri-component](https://github.com/SamVerschueren/decode-uri-component/security/advisories/GHSA-vcc3-ghjq-m6fr).
Versions et contrats de publication vérifiés dans les métadonnées du
[registre npm pour decode-uri-component](https://registry.npmjs.org/decode-uri-component),
[query-string](https://registry.npmjs.org/query-string),
[braces](https://registry.npmjs.org/braces),
[node-forge](https://registry.npmjs.org/node-forge) et
[sprintf-js](https://registry.npmjs.org/sprintf-js).

## Entrées natives : mitigation appliquée

La seule fonctionnalité de cette APK est l'écran de contrôle ; elle n'a pas
besoin de routes issues de liens externes. Le risque identifié dans le routeur
est un blocage par décodage d'une longue entrée malformée, sans divulgation ni
exécution arbitraire annoncée par l'avis.

1. Supprimer le `scheme` explicite d'`app.json` et le filtre d'activité Android
   `VIEW` / `BROWSABLE` pour ne pas proposer l'application comme destination
   des liens du navigateur.
2. Ajouter le point d'entrée Expo `app/+native-intent.tsx`, avec
   `redirectSystemPath` qui retourne toujours `/`, sans analyser son entrée.
   Il ne faut conserver ni query string ni fragment externe pour cette version.
3. Vérifier cette redirection sur des entrées ordinaires, malformées et longues,
   ainsi que le manifeste fusionné de la release.

La suppression du filtre seule réduit l'exposition, mais ne constitue pas une
barrière complète : l'activité du lanceur reste exportée, et un intent explicite
peut cibler cette activité. La [documentation Android des intents](https://developer.android.com/guide/components/intents-filters)
fait cette distinction.

La [documentation Expo de `+native-intent`](https://docs.expo.dev/router/advanced/native-intent/)
décrit la réécriture des liens natifs. Les sources installées du SDK 57 confirment
que `getLinkingConfig.js` applique cette fonction à l'URL initiale et que
`link/linking.js` l'applique aux événements reçus à chaud, avant le parsing de
l'état de navigation par query-string. Ce constat concerne l'APK autonome ;
ce point d'entrée n'est pas une mitigation des URLs de l'aperçu web.

Ces mesures ont été intégrées par le responsable : scheme et filtre BROWSABLE
supprimés, `src/app/+native-intent.tsx` retourne uniquement `/`. Le typage passe.
La validation sur émulateur est consignée séparément ; cette revue de code
ne démontre pas à elle seule le comportement Android.
Le compteur `npm audit` restera non nul après mitigation : la dépendance
transitive affectée reste installée. Une fonctionnalité future de liens entrants
devra reconsidérer cette décision avant de réactiver leur parsing.

## Signature et limites

Les scripts observés génèrent une clé RSA 4096 via `keytool`, conservent la clé
et le mot de passe hors Git, signent avec `apksigner` et comparent l'empreinte
du certificat attendu avant de distribuer l'APK. La faille node-forge ne
s'applique pas à ces opérations. La copie de récupération observée se trouve
sur le même Mac ; elle protège contre la perte du répertoire principal, pas
contre la perte complète de la machine.

Cette analyse vérifie les chemins de dépendances et de parsing identifiables ;
elle n'est pas une revue exhaustive des bibliothèques natives ou une preuve de
fonctionnement sur Galaxy S22 Ultra. L'installation, l'interaction et la
réouverture en mode avion restent à confirmer sur le téléphone de l'utilisateur.
