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
testés dans le ticket. Appliquer les conditions de CU-ARCHI pour les tests
métier par ticket pendant les workflows Matt Pocock.

Le périmètre d’une réalisation vient du besoin exprimé par l’utilisateur ; ce
mode de travail n’est pas une demande de construire toute l’application.

## Suivi local et livraison

Les tickets et spécifications vivent dans `.scratch/`, selon
[le suivi local](agents/issue-tracker.md). Pour un effort long, maintenir une
carte du travail avec décisions, tickets restants et points bloquants. À la
reprise, lire cette carte, les tickets concernés et l’état Git.

Consigner les contrôles réellement effectués et leurs limites dans le ticket.
La livraison Git suit les instructions de livraison de la session. Push,
publication et distribution APK suivent le périmètre autorisé ; un commit
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
