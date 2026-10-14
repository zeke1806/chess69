# Audit d’adoption de CU-ARCHI — Chess69

État examiné le 14 octobre 2026 : code du commit
`65ad45f6979ca567b9cdbdec50761fd5c808a3af`, avec la documentation d’adoption
réalisée dans ce travail. Les corrections du code ci-dessous sont proposées,
pas implémentées. Ce rapport est un constat daté, pas une nouvelle source de normes.

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

Ces contrôles valident le socle actuel et la précision des constats ; une suite
verte ne prouve pas la conformité architecturale. Les refactorings proposés
restent à implémenter dans un travail ultérieur.

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
