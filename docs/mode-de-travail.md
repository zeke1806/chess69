# Adaptations du mode de travail de Chess69

[CU Workflow](/Users/zeke/.agents/skills/cu-workflow/SKILL.md) définit le processus, le suivi SCRUM et la livraison Git. [CU Archi](/Users/zeke/.agents/skills/cu-archi/SKILL.md) définit l'architecture, le code et les tests. Ce document conserve uniquement les adaptations du projet ; les technologies sont dans [leur document dédié](architecture-techno.md).

## Exécution locale

Travailler dans le dépôt principal sans worktree, y compris pour les sous-agents lorsqu'une délégation est autorisée. Les emplacements des skills et outils sont indiqués dans [les technologies retenues](architecture-techno.md).

Pour le suivi et le triage, consulter les [adaptations du tracker](agents/issue-tracker.md). Les emplacements locaux de génération sont définis dans `.gitignore` ; leur gestion suit CU Workflow.

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

## Emplacements des propositions Storybook

Le catalogue applique la structure de CU Archi. Adaptations Chess69 : le moodboard est dans `Common/Design/Moodboard`, les maquettes dans la racine `Design`, et leurs sources textuelles dans `.storybook/design`. Les tokens proposés restent locaux au prototype jusqu'au jalon de validation défini par CU Workflow ; `DESIGN.md` décrit l'application intégrée.
