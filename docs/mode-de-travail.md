# Adaptations du mode de travail de Chess69

[CU Workflow](/Users/zeke/.agents/skills/cu-workflow/SKILL.md) définit le processus, le suivi SCRUM et la livraison Git. [CU Archi](/Users/zeke/.agents/skills/cu-archi/SKILL.md) définit l'architecture, le code et les tests. Ce document conserve uniquement les adaptations du projet ; les technologies sont dans [leur document dédié](architecture-techno.md).

## Exécution locale

Travailler dans le dépôt principal sans worktree, y compris pour les sous-agents lorsqu'une délégation est autorisée. Les skills Matt Pocock et Impeccable sont locaux dans `.agents/skills` ; les skills CU sont installés au niveau utilisateur. Leur vérification et leur orchestration relèvent de CU Workflow.

Le suivi conserve `.scratch/` et ses anciens dossiers. Les nouvelles demandes utilisent les identifiants SCRUM selon CU Workflow. Les sorties lourdes vont dans `.scratch/artifacts/` ou les sorties Impeccable ignorées ; conserver les rapports et décisions textuels. Les ressources applicatives déjà versionnées ne sont pas supprimées par cette extraction.

## Convention locale de lecture

Précision d'espacement demandée pour Chess69 : dans un objet, considérer chaque
membre qui définit une fonction avec corps comme un bloc de lecture. Séparer
ce bloc du membre voisin par une seule ligne vide, notamment entre
`createInitialState` et `connect`, entre actions et dans les connecteurs.
La séparation des fonctions hors objets suit la même règle de blocs de
CU-ARCHI. Conserver ensemble les propriétés de données et les déclarations d'une
même étape. Le formatage du projet conserve cet espacement et le contrôle
architectural le vérifie aussi dans les tests et les stories.

## Interface et validation Android

Le rendu cible le Galaxy S22 Ultra : échiquier lisible, gestes accessibles,
commandes tactiles confortables et hiérarchie visible. Le design charbon, ivoire et sauge est validé ; l’apprentissage et la facilité
d’utilisation restent la priorité.

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

Pour les explorations graphiques conduites selon CU Workflow, livrer le moodboard dans Common et les maquettes dans une racine durable Design. Les propositions portent les statuts
proposition, approuvé et intégré ; garder la référence approuvée après intégration.
Common et Business cataloguent les composants réellement utilisés. Les sources textuelles des maquettes restent dans `.storybook/design`, avec des vues stateless et un raccordement de démonstration pour les seules interactions locales. Les captures et images lourdes générées restent dans les dossiers ignorés définis par CU Workflow ; une référence approuvée conserve sa description et ses sources textuelles. Le code Android et les services métier
ne dépendent pas de cette proposition.

Les tokens proposés restent locaux au prototype jusqu’à la validation visuelle ; `DESIGN.md` décrit l’application réellement livrée.
