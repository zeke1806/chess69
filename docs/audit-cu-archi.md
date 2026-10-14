# Audit d’adoption de CU-ARCHI — Chess69

État examiné le 14 octobre 2026 : code du commit
`65ad45f6979ca567b9cdbdec50761fd5c808a3af`, avec la documentation d’adoption
réalisée dans ce travail. Les constats et propositions ci-dessous décrivent cet état initial.
Les corrections ont ensuite été appliquées ; leur bilan figure en fin de document. Ce rapport est un constat daté, pas une nouvelle source de normes.
Le [bilan des corrections finales](#corrections-finales-et-espacement--14-octobre-2026)
constitue le bilan le plus récent ; les audits précédents restent historiques.

## Références et périmètre

Source des normes : [skill CU-ARCHI](/Users/zeke/.agents/skills/cu-archi/SKILL.md)
et [ses règles](/Users/zeke/.agents/skills/cu-archi/references/architecture.md).
Le guide du projet embarqué et les exemples `stateful`, repository et DI front
ont été consultés pour interpréter les contrats.

L’examen couvre les 42 fichiers TypeScript/TSX de `src`, les 11 suites de tests,
les manifestes et configurations applicatives, le pont Kotlin/JNI Stockfish,
ses configurations de build, les scripts Android et la documentation active.
Les sources tierces de Stockfish, les dépendances installées et les sorties de
build sont exclues de l’audit des conventions de code. Le contenu du catalogue
est vérifié par les tests existants, sans nouvelle expertise pédagogique.

Les choix de référence Node/PNPM, Express, TanStack Start et monorepo API/web
ne justifient pas une migration de Chess69. L’application reste un monolithe
React Native/Expo, Android, local et sans API métier. Les fichiers imposés par
Expo (`_layout.tsx`, `+native-intent.tsx`), Kotlin ou CMake ne constituent pas des
écarts de nommage TypeScript. Les classes d’erreur et le module natif imposé
par Expo ont un besoin concret et ne sont pas des violations du style fonctionnel.

## Documentation mise en conformité

- Suppression intégrale de `docs/architecture.md` et des trois documents
  d’exemples business, front et arborescence qui entretenaient les normes locales.
- `AGENTS.md`, le README, le mode de travail et les références des spécifications
  pointent vers CU-ARCHI. Les normes restent maintenues dans le skill global.
- Le mode de travail conserve les adaptations de processus : délégation,
  workflows Matt Pocock, suivi Markdown local, interface cible et preuves Android.
- Le document technologique conserve les technologies, statuts et contraintes
  de Chess69. La revue antérieure est identifiée comme archive ; ses résultats
  de validation restent consultables sans constituer des conventions actuelles.

## Bilan

Le socle respecte déjà une bonne partie de CU-ARCHI : fabriques fonctionnelles,
contrats typés, métier séparé de React et des SDK natifs, composition explicite,
validation Zod aux frontières et tests rapides. Aucun import circulaire n’a
été trouvé dans le graphe des imports locaux statiques de `src`.

Neuf groupes de divergences sont détaillés ci-dessous : sept concernent les
contrats, l’état ou la présentation ; deux concernent l’organisation et le
style. Une proposition supplémentaire de découpage est distinguée des écarts
explicites. Les contrôles exécutés ne révèlent pas de panne fonctionnelle ; les
priorités P2 et P3 expriment ici l’ordre de mise en conformité, pas une urgence APK.

| ID | Priorité | Point | Correction principale |
| --- | --- | --- | --- |
| A1 | P2 | Deux contrats publics dans `clock` | Séparer horloge et identité |
| A2 | P2 | Repository complet injecté partout | Exposer et injecter des ports par besoin métier |
| A3 | P2 | Binding React spécifique à Application | Introduire un contrat de raccordement neutre |
| A4 | P2 | État et décisions dans les vues | Déplacer les transitions vers les services et features |
| A5 | P2 | Présentation sans catégories ni stories | Distinguer common/business et illustrer les états |
| A6 | P2 | Contrats de données partiellement mutables | Rendre les données imbriquées readonly |
| A7 | P2 | Définitions de validation répétées | Réutiliser les schémas communs |
| A8 | P3 | Anciennes conventions de chemins | Adopter types/adapters/services/di et noms d’implémentations |
| A9 | P3 | Style et transformations éloignés de CU-ARCHI | Blocs explicites, lecture aérée et Remeda ciblé |
| D1 | Proposition | Module Application très large | Garder un shell et extraire les responsabilités autonomes |

## Divergences et corrections

### A1 — Deux services autonomes dans le module clock

**Preuve.** `src/services-business/adapter/clock/clock-type.ts:1–2` expose
`ClockService` et `IdentityService`. `clock-service.ts:3–9` construit les deux.
L’un fournit une date, l’autre des identifiants et de l’aléatoire.

**Référence.** CU-ARCHI, « Architecture et style de code » : un seul contrat
public de service par module ; une responsabilité distincte exige un module.

**Correction.** Conserver l’horloge dans `clock`, déplacer le contrat et la
fabrique d’identité dans `identity`, puis modifier la DI et les imports.
La répartition éventuelle identité/aléatoire peut rester une décision ultérieure ;
elle n’est pas imposée pour régler le mélange horloge/identité.

**Validation.** Contrôle des types et tests learning/game avec les doubles
d’horloge et d’identité déjà injectés. Effort faible, sans changement des données.

### A2 — Les consommateurs connaissent tout le stockage de l’installation

**Preuve.** `src/services-business/adapter/repository/repository-type.ts:16–32`
expose `StoredState`, `readState` et `updateState`. Learning, Game, Analysis et
Progression reçoivent tous `RepositoryService` dans leurs fichiers de types.
Par exemple, `learning-service.ts:74–77` reconstruit lui-même `attempts` et
`reviews`, et `game-service.ts:23–27` modifie parties et préférences.

**Référence.** « Architecture et style de code » : injecter le plus petit
contrat public utile et regrouper les opérations du repository par domaine.

**Correction.** Garder un contrat Repository regroupé, avec des ports ciblés
pour apprentissage, parties, analyses et progression/préférences. La DI injecte
chaque port pertinent. Les services calculent les décisions métier ; le
repository masque la représentation persistée et applique les sauvegardes
atomiques. Par exemple, enregistrer une tentative avec sa révision et sauvegarder
un coup avec contrôle de concurrence deviennent des opérations typées.

Préserver les transactions, la queue, l’idempotence et la détection de conflit.
Le stockage JSON dans SQLite peut rester identique : ce constat porte sur le
contrat exposé, pas sur une obligation de créer de nouvelles tables.

**Validation.** Réexécuter les scénarios de sauvegarde/retry, concurrence,
remplacement de partie et checkpoints ; vérifier la conservation de données
existantes sur APK pour la réalisation de ce refactoring. Effort important.

### A3 — Le raccordement React connaît le domaine Application

**Preuve.** `src/services-front/adapter/react/react-type.ts:1–2` importe
`ApplicationService` et `ApplicationSnapshot`. `react-service.ts:4–6` expose
`useApplicationState`. La DI front expose ce binding technique aux features
avec le service déjà construit (`dependency-injection.ts:6–10`).

**Référence.** « Présentation front » et « Encapsulation de la DI front et
raccordement React » : contrat neutre stateful, binding générique, état et
actions par connexion ; la DI expose les services utiles aux consommateurs.

**Correction.** Créer une responsabilité `adapters/stateful`, indépendante
d’Application, avec son implémentation React. Pour les états propres aux futures
features, utiliser `createInitialState` et `connect`, puis fournir un service
stable à la feature depuis la composition. Les bindings restent génériques.

`useSyncExternalStore` n’est pas interdit : un store réellement partagé entre
features peut rester partagé. Le choix local/partagé doit suivre le besoin de
Chess69 ; remplacer le hook seul sans neutraliser son contrat ne corrige pas
le couplage observé. La navigation interne ne nécessite pas de créer des routes
ou un adaptateur Expo supplémentaire tant qu’il n’y a pas de besoin.

**Validation.** Vérifier deux connexions indépendantes, stabilité des actions,
chargements tardifs et démontage, avec conservation des protections existantes.
Effort moyen à important selon le découpage retenu.

### A4 — Des composants possèdent l’état et des actions de présentation

**Preuve.** `application-screen.tsx:86` mémorise le camp d’entraînement et
`:105` le camp/niveau de la nouvelle partie avec `useState`. `chessboard.tsx:11–12`
possède sélection et promotion ; `:20–27` sélectionne et déclenche les coups.
`application-screen.tsx:65,69–70` choisit aussi une cible de révision et compose
navigation/changement de filtre dans la vue.

**Référence.** « Présentation front : components, features et services » : vues
stateless, features de raccordement et transitions déléguées aux services.

**Correction.** Exposer les brouillons de choix, sélection et promotion dans
des services de présentation cohérents ; fournir valeurs et callbacks aux vues.
Créer au besoin une feature d’échiquier et un module de présentation associé.
Les intentions « réviser maintenant » ou « ouvrir les puzzles » deviennent
des actions front, au lieu de plusieurs appels assemblés dans la vue. Le
dimensionnement écran peut être raccordé par la feature et transmis en prop.

**Validation.** Tester choix de camp/niveau, changement de position, annulation
de promotion et déclenchement d’un seul coup ; inspecter le rendu natif après
raccordement. Effort moyen, avec risque de régression des gestes à couvrir.

### A5 — Les vues ne disposent pas des catégories et stories attendues

**Preuve.** Tous les composants résident dans `src/ui/components/application`.
`controls.tsx` regroupe des primitives Button/Choice/Panel avec les vues produit.
Aucun fichier `.stories.*` n’existe dans `src` et aucun outillage Storybook
n’est déclaré dans `package.json`.

**Référence.** « Présentation front » : `common` pour les primitives, `business`
pour les vues produit, avec stories par composant et variantes d’état.

**Correction.** Ranger les primitives dans `ui/components/common` et les vues
d’échecs dans `ui/components/business`. Préparer des stories natives pour les
blocs réutilisables et les états vide, erreur, chargement, promotion et analyse.
Choisir un outillage compatible React Native lors de la réalisation ; le
Storybook Vite de l’exemple web ne doit pas être copié tel quel.

**Validation.** Stories exécutables et vérification sur les surfaces natives
disponibles. L’installation d’une dépendance n’est pas effectuée par cet audit.

### A6 — L’immutabilité des données n’est pas exprimée de bout en bout

**Preuve.** `repository-type.ts:21–27` et `engine-type.ts:9–10` infèrent des
objets et tableaux mutables. `catalogue-type.ts:22,28` applique seulement un
`Readonly` externe : `Exercise.moves`, les alternatives et les tableaux d’Opening
restent mutables pour TypeScript. Les schémas n’utilisent pas `.readonly()`.

Le catalogue et le snapshot Application sont déjà gelés récursivement à
l’exécution ; cet écart n’est donc pas un constat de mutation du snapshot UI.
Le repository retourne des copies validées, mais son contrat autorise encore
la mutation et les autres résultats métier ne bénéficient pas tous de ce gel.

**Référence.** « Architecture et style de code » : données readonly, préservation
des entrées et des anciens états, y compris leurs branches imbriquées.

**Correction.** Rendre les schémas/collections imbriquées readonly, inférer les
types depuis ces définitions et conserver les garanties existantes. Adapter
les fixtures qui modifient actuellement `createEmptyState()` pour construire
des variantes immuables. Un gel profond systématique supplémentaire n’est
pas nécessaire si les contrats et transformations garantissent le besoin.

**Validation.** Vérifier au typage que les tableaux imbriqués ne sont plus
modifiables ; conserver les tests de snapshots et ajouter des assertions sur
les anciens états pendant les transitions concernées. Effort moyen.

### A7 — Des validations communes sont définies plusieurs fois

**Preuve.** `engine-type.ts:3–8` définit les niveaux et évaluations du moteur.
`repository-type.ts:9,13,19` redéfinit les niveaux et le couple type/valeur du
score ; `catalogue-type.ts:10–11` répète l’expression de validation UCI.

**Référence.** « Architecture et style de code » et « Validation commune » :
une définition partagée, réutilisée aux frontières appropriées.

**Correction.** Réutiliser un schéma de niveau et un schéma de score uniques
depuis le module propriétaire ; extraire la définition UCI répétée si elle
sert ces données. Les formats dérivés du stockage utilisent ces schémas sans
les recopier. Aucun package Core séparé n’est nécessaire dans ce monolithe.

**Validation.** Tests de parsing des formes partagées, puis tests moteur,
catalogue et repository. Renforcer un format ou un résultat historique exige
une décision de compatibilité distincte ; ce travail peut conserver les formats.

### A8 — Les chemins reprennent les conventions locales abandonnées

**Preuve.** Les 12 modules de services utilisent `<module>-type.ts` au singulier.
Le front vit dans `services-front`, les adaptateurs dans `adapter` et les points
de composition dans `dependency-injection.ts`. `rules-service.ts` masque
`chess.js` sans nommer la technologie de l’implémentation ; le module `react`
est nommé par le framework. `engine-stockfish-service.ts` et
`repository-sqlite-service.ts` expriment déjà leur technologie.

**Référence.** « Architecture et style de code » : concepts `<module>-types` /
`<module>-service`, regroupement `services/adapters`, point d’exposition `di.ts`,
adaptateurs classés par responsabilité et implémentations nommant leur technologie.
Pour un monolithe, CU-ARCHI distingue `services-business` et `services` front.

**Correction.** Renommer les fichiers de types, `services-front` en `services`,
`adapter` en `adapters`, et les compositions en `di.ts` ; conserver
`services-business` pour le métier. Nommer l’implémentation des règles selon
chess.js et remplacer la responsabilité `react` par `stateful` dans A3.
Mettre à jour ensemble imports et chemins des tests. Ne pas traiter la
présence d’un helper public justifié (`localDay`, `mateWinner`) comme un second
contrat de service autonome.

**Validation.** Typecheck, résolution de tous les imports et suite de tests.
Effort faible à moyen ; changement mécanique à isoler des changements d’état.

### A9 — Style des fonctions et transformations

**Preuve.** L’analyse syntaxique de `src` compte 52 fonctions fléchées affectées
à une variable ou propriété avec corps expression, hors callbacks courts passés
directement en argument/prop. Exemples : `clock-service.ts:3,7–8`, DI front
`:8–11`, `application-service.ts:54–55,130` et `game-service.ts:122`.
Des corps, instructions et JSX sont condensés sur une ligne, notamment dans
`application-screen.tsx` et `application-feature.tsx`. Aucun import Remeda
n’existe dans `src` malgré sa présence dans les dépendances. Les transitions
learning/game/application utilisent des reconstructions par spread et des
transformations natives. La DI business déclare aussi ses `let` après plusieurs
`const`, alors qu’ils peuvent ici être placés avant sans dépendance inverse.

**Référence.** « Architecture et style de code » : corps explicites multilignes,
groupes logiques lisibles, ordre des déclarations et préférence pour Remeda
quand une transformation de données ou d’état s’y prête.

**Correction.** Ajouter les blocs/retours explicites, aérer les groupes et le JSX,
et ajuster l’ordre des déclarations lorsque possible. Utiliser Remeda pour les
transitions ciblées (`set`, `setPath`, `pipe`) et les collections adaptées.
Cette préférence n’impose pas de remplacer tous les spreads, callbacks JSX
ou constructions d’infrastructure. Garder les consommateurs avant leurs helpers
lorsque l’initialisation le permet, notamment dans l’adaptateur Stockfish et la
fonction `view` utilisée par Analysis. Aucun nouvel outil n’est requis par l’audit.

**Validation.** Types et tests ; contrôler le partage structurel et les anciens
états pour les transitions modifiées. Effort moyen, priorité après les contrats.

## Proposition de conception distincte des violations

### D1 — Réduire la portée du service Application

`src/services-front/application/application-service.ts` rassemble 381 lignes
et les actions des ouvertures, exercices, parties, historique, analyse,
progression et cycle de vie. `application-screen.tsx` regroupe neuf vues d’écran
avec un contrat global `ApplicationSnapshot`/Events. Un seul contrat public est
exposé par Application : le constat n’est pas une violation du nombre de services
par module, ni le dépassement d’un seuil de lignes.

Les opérations de ces parcours peuvent évoluer séparément. Je propose de garder
un shell pour navigation, démarrage et coordination, puis d’extraire les modules
de présentation learning, game, analysis et progression à mesure des besoins.
Répartir simplement le fichier derrière `application-service/index.ts` convient
aux détails du shell ; cela ne suffit pas si les responsabilités restent autonomes.

Préserver explicitement les comportements couverts : écriture terminant après
navigation, partie active distincte de la partie consultée, annulation moteur,
préférences et ouverture répétée. Ce choix se prépare avec A3/A4 et doit rester
progressif ; il n’appelle pas une réécriture simultanée de toute l’application.

## Tests, infrastructure et limites

Les tests sont centralisés à la racine, contrôlés par TypeScript et utilisent
un seul runner Jest. Ils couvrent concurrence, reprise, échec de sauvegarde,
annulation et lifecycle avec dépendances injectées. Les tests du catalogue
utilisent chess.js en mémoire ; ils ne constituent pas un effet externe.
Les migrations SQLite sont versionnées, transactionnelles et refusent une
version future. Le pont natif et les adaptateurs restent derrière leurs contrats.

Les doubles de Game et Analysis clonent via JSON, et le repository mémoire
parse ses états avec Zod. Ces protections de stockage sont utiles, mais ne
prouvent pas à elles seules l’immutabilité d’une transition avant clonage.
Lors des corrections A6/A9, tester aussi les anciens objets directement et
leurs branches partagées. C’est une amélioration de preuve, pas une panne constatée.

Les suites historiques sont classées par module et non sous `tests/business/<ticket>`.
L’absence de cette catégorie ne devient pas rétroactivement une violation pour
cet audit sans ticket métier. Appliquer l’organisation française numérotée de
CU-ARCHI lors du traitement de nouveaux tickets identifiés, sans renommer tous
les tests unitaires anglais ni inventer un ticket pour déclencher la catégorie.

Une connexion locale de feature et un store d’application partagé répondent à
des besoins différents. Conserver les protections de lifecycle déjà présentes ;
aucune optimisation de performances ou refonte SQL n’est démontrée nécessaire
par ce rapport. Une nouvelle validation APK/Samsung n’a pas été effectuée pour
ce changement documentaire ; les preuves antérieures restent datées.

## Ordre proposé pour les corrections

1. **Contrats et données** : A1, A7 puis A6 ; clarifier les responsabilités et
   schémas communs avant de déplacer les consommateurs.
2. **Persistance encapsulée** : A2, en gardant transactions et format de stockage.
3. **Organisation mécanique** : A8, sans changer le comportement.
4. **Présentation** : A3/A4 et le découpage D1 retenu, parcours par parcours,
   avec A5 pour rendre chaque vue vérifiable.
5. **Lisibilité et transformations** : A9 progressivement dans les modules
   corrigés, puis contrôle des reliquats.

Pour chaque refactoring de comportement, partir des scénarios existants et du
TDD prescrit par CU-ARCHI. La fin d’une migration exige les preuves pertinentes
pour son périmètre, notamment une mise à jour APK conservant les données si
la persistance ou le cycle de vie natif change.

## Contrôles exécutés

- `npm run typecheck` : succès.
- `npm test -- --watch=false` : 76 tests réussis, 11 suites réussies.
- Analyse syntaxique TypeScript : 42 sources, 12 fichiers `-type.ts`,
  52 fonctions affectées sans bloc ; graphe d’imports locaux statiques sans cycle.
- Inventaire des vues/stories, lecture des contrats, services, adaptateurs,
  tests et composition ; comparaison avec les références CU-ARCHI.
- Liens locaux des neuf documents modifiés : aucune cible manquante.
- `git diff --check` : succès.

Ces contrôles validaient le socle et la précision des constats au moment de
l’audit initial ; une suite verte ne prouve pas la conformité architecturale.
Le travail suivant a implémenté les corrections, décrites dans le bilan final.

## Revue de la livraison documentaire

Deux revues indépendantes selon le workflow `code-review`, depuis le commit
source de cet audit, ont vérifié l’adoption et le rapport.

### Standards

Aucun constat actionnable ni heuristique supplémentaire. Les anciennes normes
sont retirées, les preuves A1–A9 correspondent au code et aux règles consultées,
et le rapport distingue préférences, adaptations et proposition D1.

### Spec

Aucun constat actionnable. La suppression/remplacement, les adaptations propres
à Chess69 et le rapport de divergences avec propositions répondent à la demande.
Aucun refactoring fonctionnel ni changement de stack n’est introduit.

Bilan des revues de cette livraison : Standards 0 constat ; Spec 0 constat.

## Corrections appliquées — 14 octobre 2026

Travail suivant, base `e8f1a65`, conformément à l’ordre proposé. Les preuves
complètes et les limites sont dans [la vérification CU-ARCHI](../.scratch/corrections-cu-archi/verification.md).
Les chemins anciens des constats restent ceux de l’état audité.

| Points | Résultat |
| --- | --- |
| A1 | Horloge et identité sont deux modules d’adaptation distincts. |
| A6/A7 | Schémas de domaine uniques, objets et tableaux imbriqués readonly ; formats V1 conservés. |
| A2 | Ports learning/game/analysis/progression ciblés ; détails de stockage privés, sauvegardes atomiques et contrôles de concurrence maintenus. |
| A8 | `services`, `adapters`, `*-types.ts`, `di.ts` et implémentations natives/chess.js nommées. |
| A3 | Raccordement stateful générique, état/actions par connexion, aucun couplage au domaine Application. |
| A4/D1 | Application remplacé par learning, game, analysis, progression, board et orchestration ; l’orchestrateur coordonne navigation, lifecycle et exclusion moteur. |
| A5 | 17 vues stateless rangées en common/business, 66 stories RNW exécutables, validation Android distincte. |
| A9 | Blocs explicites, groupes et JSX formatés, ordre des déclarations revu et Remeda pour transitions/collections pertinentes. |

Les adaptations Chess69 restent en place : monolithe React Native/Expo Android,
npm, données locales SQLite, moteur Stockfish embarqué, interface française,
assets, package/signature et procédures Matt Pocock/Impeccable. L’outillage de
stories reste exclusivement de développement.

Les revues Standards et Spec de l’implémentation ont identifié trois constats :
arrêt physique du moteur non rappelé après échec, dépendances métier encore
trop larges et reprise lifecycle perdue après navigation depuis une erreur.
Les corrections sont couvertes par quatre reproductions rouges puis vertes.
Les contre-revues ciblées confirment leur résolution, sans nouveau constat.
Ces comptes rendus sont conservés séparément dans
[Standards](../.scratch/corrections-cu-archi/standards-review.md) et
[Spec](../.scratch/corrections-cu-archi/spec-review.md).

Bilan final : 108 tests/15 suites Jest et 67 tests Chromium réussis ; typage,
formatage, contrôle des frontières/imports, compatibilité Expo et APK signée
vérifiés. L’émulateur ARM64 couvre la mise à jour et les parcours hors ligne ;
le Galaxy S22 Ultra reste une validation matérielle distincte.

## Nouveau contrôle après recentrage du skill — 14 octobre 2026

Code examiné : `65ada44a69ce1f5665f694afe7f5fb1ec82cb852`, dépôt propre
au début de la revue. Le contrôle porte sur l'ensemble des sources actuelles,
pas seulement sur un diff. Deux lectures indépendantes ont examiné les
frontières/contrats et les conventions/tests ; les preuves ci-dessous ont
été recoupées. Une revue de spécification produit n'entre pas dans cette demande.

Références : version locale actuelle du [skill CU-ARCHI](/Users/zeke/.agents/skills/cu-archi/SKILL.md),
de [ses règles](/Users/zeke/.agents/skills/cu-archi/references/architecture.md)
et du journal des corrections, avec les adaptations technologiques de Chess69.
Empreintes SHA-256 des sources normatives consultées :

- `SKILL.md` : `acd5a727e2d5b9fdb61cd7a531937503c9ab28d8d8719f1b417a8ab522249d81`.
- `architecture.md` : `b358c044b6a5f571941cfad2ed748164584f447d3883fa6c77cf374babe8f62c`.

Le skill actuel couvre l'architecture, le code et la structure/isolation des
tests. Il ne prescrit plus de TDD systématique, de tests métier par ticket ou
de numérotation française des scénarios. Les passages historiques ci-dessus
qui lui attribuent ces obligations ne décrivent donc plus les normes actuelles.
Les tests existants `tests/business/cu-archi-*` peuvent rester : leur présence
ne crée pas une nouvelle obligation ni un écart.

### Résultat architectural

Aucune violation confirmée des frontières, des responsabilités, de l'injection
ou du cycle de vie dans les sources inspectées. Business, présentation et UI
sont séparés ; les dépendances React, Expo, SQLite et chess.js sont encapsulées
dans l'infrastructure et les adaptateurs. Les modules de présentation exposent
un contrat chacun ; les implémentations réparties en dossiers gardent une entrée
publique minimale. Les helpers purs `localDay` et `mateWinner` ne sont pas des
services autonomes supplémentaires.

La DI sélectionne les ports du repository par domaine. Les services front
consomment les opérations nécessaires : Game exclut `get`, les ports Game et
Rules d'Analysis sont limités à `game.get` et `rules.position`, Learning utilise les trois opérations du
catalogue et les six de son service métier. Le raccordement stateful est
générique, avec actions stables, bindings après commit et gardes de démontage.
SQLite conserve migrations versionnées/transactionnelles, initialisation après
succès et sérialisation des opérations.

La structure des tests est conforme : dossier racine unique, typage strict,
Jest commun aux tests unitaires/intégration, horloges et identifiants injectés,
promesses contrôlées et SQLite temporaire avec nettoyage. Playwright vérifie
le rendu Storybook ; ce besoin distinct ne demande pas de fusionner les runners.

### Écarts explicites de conventions

**R1 — Définitions de validation communes encore répétées.**
`src/services-business/catalogue/catalogue-types.ts:6` et
`src/services-business/learning/learning-types.ts:11` définissent séparément
les mêmes valeurs de `kind`, alors que la tentative reprend le type de
l'exercice. La couleur d'échecs est aussi redéfinie dans
`catalogue/catalogue-types.ts:15`, `game/game-types.ts:11` et
`learning/learning-types.ts:20`. La règle « partager les validations communes »
demande une définition unique réutilisée ou dérivée. Réutiliser le champ du
schéma catalogue pour `kind` et un schéma couleur commun ; les préférences
peuvent dériver leur choix incluant `random`. Conserver les formats persistés.

**R2 — Forme des contrats de services.**
La règle de validation demande explicitement de « conserver les contrats de
services sous forme d'interfaces TypeScript ». Plusieurs contrats sont des
aliases `type … = Readonly<{ … }>`, par exemple
`src/services-business/game/game-types.ts:41`,
`src/services-business/catalogue/catalogue-types.ts:44` et
`src/services-business/adapters/engine/engine-types.ts:21`.
Leur typage structurel et readonly fonctionne ; c'est un écart à la convention
syntaxique actuelle, sans défaut d'injection. Des interfaces avec propriétés
de fonctions `readonly` permettent de conserver les contrats et le comportement.
Les types de données et les types inférés de Zod ne sont pas concernés.

**R3 — Helpers placés avant leurs consommateurs.**
La règle d'ordre de lecture demande les opérations principales avant leurs
détails, avec déclarations de fonctions lorsque le hoisting le permet.
`engine-service/engine-lifecycle.ts:9` définit `enqueue` avant les opérations
publiques ; `repository-service/repository-memory-service.ts:10,15` et
`repository-sqlite-service.ts:15,20,26` font de même pour leurs helpers.
Ils peuvent devenir des déclarations de fonctions placées après les opérations
publiques dans la même portée, en conservant l'état fermé par les closures.
Il s'agit de lecture/navigation, sans panne fonctionnelle constatée.

### Préférences et point de lisibilité

**P1 — Remeda encore peu appliqué au métier.** Les services front utilisent
Remeda, mais plusieurs transitions métier simples restent construites par
spread : `learning/learning-service.ts:64,69,78,95,117,166` et
`game/game-service.ts:64,111`, sous `src/services-business`.
La préférence explicite pour `set`, `setPath` et les compositions courtes
s'applique ici. Ces copies préservent actuellement les anciennes valeurs :
ce constat ne démontre aucune mutation et ne justifie pas de remplacer
mécaniquement tous les spreads ou toutes les opérations Array.

**P2 — Ordre let/const.** Dans
`src/services-business/progression/progression-service.ts:50–56`, `let count`
peut être placé avant les `const` sans modifier les dépendances. C'est une
préférence de lecture, pas une obligation de rendre les autres variables mutables.

**L1 — Lisibilité du pont natif.** Les fonctions C++ `session` et `throwError`
dans `modules/chess69-stockfish/android/src/main/cpp/stockfish-jni.cpp:32–33`
et les `catch` à `:39,64` condensent leurs blocs. Même constat dans
`modules/chess69-stockfish/android/src/main/java/ovh/rentabe/stockfish/Chess69StockfishModule.kt:19,22–23,58`.
La convention générale de blocs multilignes recommande de les aérer.
Les règles et exemples du skill étant principalement TypeScript, ce point
natif reste distingué des écarts TypeScript. Les classes et noms imposés
par Expo/JNI/Kotlin demeurent justifiés ; aucune migration de langage n'est proposée.

### Renvoi documentaire devenu obsolète

`docs/mode-de-travail.md:40–43` attribue encore à CU-ARCHI des conditions de
tests métier par ticket absentes du skill actuel. Retirer ce renvoi ; toute
condition de processus conservée par Chess69 doit être formulée dans son
mode de travail, avec sa propre justification. Les archives de réalisation
restent des traces historiques et n'ont pas à être réécrites rétroactivement.

### Contrôles et limites

- `npm run typecheck` : succès, sources et tests inclus.
- `npm run format:check` : succès.
- `npm run check:architecture` : succès, 95 sources, 17 vues stateless,
  178 fonctions affectées avec blocs ; frontières contrôlées et imports sans cycle.
- `npm test -- --watch=false` : 108 tests, 15 suites réussies.
- `npm run storybook:test` : build réussi et 67 tests Chromium réussis.

Le checker architectural parcourt `src` et `.storybook`, sans analyser les
tests ni le bridge natif. Il ne couvre pas toutes les règles : duplication
des schémas, forme interface/type, préférence Remeda et ordre de lecture ont
nécessité la revue manuelle. Ses résultats verts ne signifient donc pas une
conformité totale. Le warning de taille de bundle Storybook est informatif
pour l'outillage de développement ; aucune régression APK n'en est déduite.

Aucun code applicatif n'a été modifié. Aucune nouvelle compilation ou exécution
APK/Stockfish natif ni mesure Samsung n'a été réalisée pour cet audit.
Le bilan est : architecture conforme sur les points inspectés, trois groupes
d'écarts explicites de conventions, deux préférences à harmoniser, un point
de lisibilité natif et un renvoi documentaire à actualiser.

## Corrections finales et espacement — 14 octobre 2026

Réalisation depuis `3d2ffc4`, à la demande de l'utilisateur. Les preuves et
limites sont dans [la vérification finale](../.scratch/conformite-cu-archi-finale/verification.md).

| Constat du nouveau contrôle | Correction |
| --- | --- |
| R1 — Validations répétées | Schémas kind et couleur uniques, réutilisés ou dérivés ; compatibilité contrôlée. |
| R2 — Contrats type au lieu d'interface | Services/ports et services UI en interfaces readonly. |
| R3 — Ordre de lecture | Helpers hoistables après opérations et consommateurs dans adaptateurs, DI et orchestration. |
| P1/P2 — Remeda et let/const | Transitions et collections métier harmonisées ; ordre des déclarations ajusté. |
| L1 — Blocs natifs compactés | Kotlin et JNI aérés, signatures et logique préservées. |
| Renvoi documentaire | Mode de travail recentré sur son processus ; anciennes conditions par ticket désattribuées à CU-ARCHI. |

L'utilisateur précise aussi que les fonctions définies dans un objet sont
des blocs de lecture distincts. Une ligne vide les sépare désormais de leurs
voisins, notamment createInitialState/connect et les actions. Les propriétés
de données consécutives restent groupées. Le formatage du projet conserve
cette précision et le contrôle architectural couvre aussi les tests.
La séparation des fonctions déclarées et des helpers hors objets est aussi
appliquée et contrôlée, après le dernier constat de la revue Standards.

Typage, formatage, contrôle architectural, 108 tests Jest et 67 contrôles
Storybook réussis ; compilation Android réussie et contre-revues Standards/Spec
sans constat restant, consignées dans la
vérification finale. Cette correction conserve l'organisation des modules,
la stack et les formats SQLite V1. La validation native sur appareil reste
distincte de ces preuves de compilation et de comportement en mémoire.
