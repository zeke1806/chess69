# Mode de travail de Chess69

Ce document adapte le processus d’ingénierie au projet. Les normes de
développement et d’architecture viennent du skill
[CU-ARCHI](/Users/zeke/.agents/skills/cu-archi/SKILL.md) et de ses références.
Les choix de stack et les contraintes locales sont dans
[les technologies retenues](architecture-techno.md).

## Délégation et skills

L’utilisateur décrit le besoin et donne ses retours sur les résultats. Dans le
périmètre demandé, l’agent pilote le cadrage, le découpage, les décisions
d’implémentation, le design, la vérification et la livraison.

Utiliser les skills locaux de [Matt Pocock](../.agents/skills/) pour le processus
d’ingénierie, CU-ARCHI pour les normes, et
[Impeccable](../.agents/skills/impeccable/SKILL.md) pour l’interface.
Lire le skill applicable ; les documents du projet conservent seulement les
adaptations et décisions propres à Chess69.

Avant de concevoir, créer, modifier ou revoir du code, lire et appliquer
[CU-ARCHI](/Users/zeke/.agents/skills/cu-archi/SKILL.md) et les sections applicables
de ses [règles](/Users/zeke/.agents/skills/cu-archi/references/architecture.md).
Consulter les exemples utiles du projet de référence, puis adapter la réalisation
aux technologies de Chess69. Les vues common et business sont stateless : leurs
données et callbacks arrivent par props ; les services portent les transitions
et les features raccordent l’état, les effets et les dimensions au framework.
Le catalogue Storybook garde deux racines, `Common` et `Business`, regroupées
par thèmes ; chaque composant réutilisable dispose de variantes représentatives.

| Besoin | Skills à utiliser selon le travail |
| --- | --- |
| Cadrage et critères de fin | `to-spec` |
| Découpage et continuité d’un effort long | `to-tickets`, `wayfinder`, `handoff` |
| Architecture, contrats, codage et conventions de tests | `cu-archi` |
| Implémentation et tests de comportement | `implement`, `implement-spec`, `tdd`, `codebase-design`, avec `cu-archi` |
| Diagnostic | `diagnosing-bugs` |
| Revue de réalisation | `code-review`, avec CU-ARCHI comme source des normes |
| Interface mobile | `impeccable`, avec les références natives et CU-ARCHI |
| Vocabulaire métier et décisions durables | `domain-modeling` |

Adaptation explicitement demandée par l’utilisateur : les interviews `grill-me`
et `grill-with-docs` ne sont pas le passage par défaut. L’agent décide du
découpage, des dépendances entre tickets et des détails d’implémentation. Les
confirmations systématiques prévues par les skills pour le setup, les tickets
ou les interfaces de test sont remplacées par cette délégation dans le
périmètre validé. Une information réellement manquante ou une décision humaine
nécessaire reste une raison de question ciblée.

Les interfaces de test autorisées par défaut sont les contrats publics des
modules et leurs assemblages en mémoire. Noter le comportement et l’interface
testés dans le ticket. Le skill `tdd` guide les nouveaux comportements et les
corrections quand une reproduction rouge est utile ; une correction mécanique
de conventions s'appuie sur les tests de comportement existants. L'organisation
et l'isolation des tests viennent de CU-ARCHI ; le processus de réalisation et
le suivi par ticket restent définis ici et dans les skills Matt Pocock.

Précision d'espacement demandée pour Chess69 : dans un objet, considérer chaque
membre qui définit une fonction avec corps comme un bloc de lecture. Séparer
ce bloc du membre voisin par une seule ligne vide, notamment entre
`createInitialState` et `connect`, entre actions et dans les connecteurs.
La séparation des fonctions hors objets suit la même règle de blocs de
CU-ARCHI. Conserver ensemble les propriétés de données et les déclarations d'une
même étape. Le formatage du projet conserve cet espacement et le contrôle
architectural le vérifie aussi dans les tests et les stories.

Le périmètre d’une réalisation vient du besoin exprimé par l’utilisateur ; ce
mode de travail n’est pas une demande de construire toute l’application.

## Suivi local et livraison

Les tickets et spécifications vivent dans `.scratch/`, selon
[le suivi local](agents/issue-tracker.md). Pour un effort long, maintenir une
carte du travail avec décisions, tickets restants et points bloquants. À la
reprise, lire cette carte, les tickets concernés et l’état Git.

Consigner les contrôles réellement effectués et leurs limites dans le ticket.
Tout travail se fait dans le dépôt principal, sur une nouvelle branche dédiée,
sans worktree, y compris pour les sous-agents. Créer cette branche dès le cadrage
et la spec, puis y garder l’implémentation, les corrections de vérification ou de
revue et les éventuelles specs complémentaires jusqu’à la livraison complète.
La création d’une nouvelle spec avant livraison poursuit le même travail sur
la même branche. Après l’implémentation et les vérifications, regrouper les
éventuels commits intermédiaires en un seul commit
avec un titre clair et un corps décrivant les modifications, les décisions et
les contrôles. Fusionner cette branche sur `main` par avance rapide, puis la
supprimer sans attendre les retours utilisateur. Une correction après livraison
constitue un nouveau travail et suit le même processus.

Push, publication et distribution APK suivent le périmètre autorisé ; un commit
ne signifie pas un déploiement.

## Interface et validation Android

Le rendu cible le Galaxy S22 Ultra : échiquier lisible, gestes accessibles,
commandes tactiles confortables et hiérarchie visible. Le noir et l’orange
constituent une direction initiale issue de la conversation ; l’apprentissage
et la facilité d’utilisation restent la priorité.

Utiliser le workflow natif d’Impeccable et conserver les décisions produit/design
durables dans les documents attendus par ce skill. Distinguer les preuves
sur navigateur, émulateur et téléphone.

L’installation sur Samsung, le fonctionnement hors ligne, SQLite, le moteur
embarqué et la conservation des données après mise à jour demandent des
contrôles sur la vraie APK. Les planifier tôt. Si le téléphone de l’utilisateur
est nécessaire, préparer l’APK et les instructions ; garder le contrôle comme
restant à faire jusqu’à son retour ou une observation directe.

La [procédure Android](android-release.md) conserve l’identité de signature et
les étapes de compilation. La publication depuis Mustang appartient au projet
`vps-perso` ; Chess69 conserve ses données et calculs sur le téléphone.

## Validation visuelle dans Storybook

Quand l’utilisateur demande une exploration de design avant les features,
valider d’abord la spec, puis livrer un moodboard dans Common et les maquettes
isolées dans une racine temporaire Design. Cette troisième racine est une
exception pour la proposition à valider ; le catalogue des composants livrés
conserve Common et Business. Les maquettes et leurs assets restent dans
.storybook/design, avec des vues stateless et un raccordement de démonstration
pour les seules interactions locales. Le code Android et les services métier
ne dépendent pas de cette proposition.

La validation de la spec autorise la réalisation des maquettes. La validation
visuelle du moodboard et des écrans est un second jalon avant toute intégration
aux features. Les tokens proposés restent locaux au prototype jusqu’à cette
validation ; DESIGN.md continue de décrire l’application réellement livrée.
