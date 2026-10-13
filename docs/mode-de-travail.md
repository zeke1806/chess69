# Mode de travail autonome

## Délégation de l’utilisateur

L’utilisateur décrit le besoin et donne ses retours sur les résultats. L’agent
pilote le cadrage utile, le découpage, les décisions d’implémentation, le design,
les tests et la livraison progressive. Il produit une application utilisable,
dans l’architecture et avec les technologies déjà validées.

Travailler à partir de la conversation et des documents existants. Choisir les
détails raisonnables et réversibles, consigner les hypothèses qui affectent le
produit, puis avancer. Une hypothèse reste identifiée comme telle ; elle ne
devient pas une préférence attribuée à l’utilisateur.

Poser une question seulement quand l’information manque réellement pour avancer,
qu’un choix change sensiblement le besoin ou qu’une action exige une décision
humaine. Continuer le travail indépendant de cette réponse. Les décisions
d’architecture confirmées sont conservées ; signaler une incompatibilité concrète
plutôt que modifier silencieusement ces conventions.

## Skills et adaptation au projet

Utiliser les skills locaux de [Matt Pocock](../.agents/skills/) pour le travail
d’ingénierie, et [Impeccable](../.agents/skills/impeccable/SKILL.md) pour l’interface.
Lire le skill concerné avant de l’appliquer ; cette page ne remplace pas ses
instructions techniques.

| Travail | Skills à utiliser selon le besoin |
| --- | --- |
| Transformer le besoin en comportement vérifiable | `to-spec` |
| Découper en incréments complets avec dépendances | `to-tickets` ; `wayfinder` pour les efforts longs |
| Implémenter progressivement | `implement`, `tdd`, `codebase-design` |
| Coordonner une spécification avec plusieurs tickets | `implement-spec` lorsque ce workflow est utile |
| Diagnostiquer un défaut | `diagnosing-bugs` |
| Vérifier l’implémentation et les conventions | `code-review` |
| Concevoir et vérifier les écrans mobiles | `impeccable` et ses références adaptées au natif |
| Préserver les décisions et la continuité | `domain-modeling`, `handoff` |

Adaptation explicitement demandée par l’utilisateur : les interviews `grill-me`
et `grill-with-docs` ne sont pas le passage par défaut. L’agent décide du découpage,
des dépendances entre tickets et des détails d’implémentation. Les confirmations
systématiques prévues par les skills pour le setup, les tickets ou les interfaces
de test sont remplacées par cette délégation, dans le périmètre validé.

Les interfaces de test autorisées par défaut sont les contrats publics des modules
business/front et leurs assemblages en mémoire, conformément à l’architecture.
Noter le comportement et l’interface testés dans le ticket avant l’implémentation.
Les questions restent ciblées sur les décisions que le contexte ne permet pas
de résoudre. Cette adaptation conserve les exigences techniques des skills.

L’agent reste responsable du résultat quand un skill prévoit des sous-agents :
leur fournir des tâches délimitées, les références nécessaires et vérifier leur
travail avant intégration. La délégation ne dispense pas de livrer et valider.

## Cycle de livraison

1. Lire le besoin, le contexte pertinent, les conventions et les technologies.
   Définir les comportements attendus et les critères de fin à partir du besoin.
2. Pour un travail conséquent, écrire une spécification et des tickets locaux.
   Chaque ticket livre un comportement utilisable ou vérifiable de bout en bout,
   avec ses dépendances ; ne pas construire toutes les couches séparément.
3. Implémenter un incrément à la fois. Sur la logique et les bugs, utiliser une
   boucle TDD ciblée : test de comportement en échec, implémentation minimale,
   puis revue. Respecter les conventions fonctionnelles et la DI.
4. Pour l’interface, appliquer Impeccable et les conventions de services front,
   components et features. Fournir les états de chargement, d’absence de données,
   d’erreur et de résultat nécessaires au parcours.
5. Vérifier les types, les tests pertinents et le rendu pour les surfaces modifiées.
   Faire la revue du travail, corriger les défauts, puis lancer les contrôles finaux
   requis. Éviter les répétitions sans changement ou problème à résoudre.
6. Mettre à jour le ticket avec la preuve de validation et ses limites. Les
   incréments d’implémentation terminés donnent lieu à des commits locaux
   cohérents selon le workflow Matt Pocock. Push et publication suivent les
   instructions de l’utilisateur ; un commit ne signifie pas un déploiement.
7. Donner un retour bref : résultat utilisable, contrôles effectués, limite
   importante éventuelle et prochain incrément. Continuer le périmètre demandé
   sans imposer une validation après chaque choix de détail.

Une modification de documentation seule se vérifie par son contenu et ses liens.
Les tests d’exécution portent sur les comportements qui le nécessitent.

## Interface mobile et Impeccable

Le rendu doit être moderne, lisible et adapté au Galaxy S22 Ultra : échiquier
clair, gestes accessibles, commandes tactiles confortables et hiérarchie visible.
Le noir et l’orange constituent une direction initiale issue de la conversation ;
la facilité d’apprentissage et d’utilisation reste la priorité.

Suivre le contexte, les références natives et le cycle de vérification d’Impeccable.
Conserver les décisions durables dans les documents produit/design attendus par
ce skill lorsqu’ils deviennent nécessaires. Inspecter le rendu réellement
disponible et préciser les surfaces ou appareils qui n’ont pas pu être vérifiés.
Une capture de navigateur ne prouve pas le rendu ni l’installation d’une APK.

## Continuité et validation Android

Les tickets et spécifications sont conservés dans `.scratch/`, selon
[le suivi local](agents/issue-tracker.md). Pour un effort long, maintenir une
carte du travail avec les décisions, tickets restants et points bloquants.
Avant une reprise, lire ces références et l’état Git ; poursuivre le travail
existant plutôt que recréer le plan.

Les tests rapides utilisent des doubles en mémoire et restent sans effets externes.
La validation de l’installation sur Samsung, du fonctionnement hors ligne,
de SQLite et du moteur natif demande des contrôles distincts sur la vraie APK.
Les planifier tôt, notamment l’installation et une mise à jour conservant les
données. Si une étape exige le téléphone de l’utilisateur, préparer l’APK et
des instructions précises ; noter le contrôle comme restant à faire jusqu’au
retour utilisateur ou à une observation directe.

Ce mode de travail n’est pas à lui seul une demande de construire toute
l’application : le périmètre d’une réalisation vient du besoin exprimé par
l’utilisateur, puis l’agent en orchestre la livraison.
