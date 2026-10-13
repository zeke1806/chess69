# Première APK : validation de l’installation

Status: ready-for-human
Date: 2026-10-13
Périmètre: première livraison Android minimale, du dépôt au téléchargement HTTPS.

## État de livraison au 13 octobre 2026

Application, APK signée et distribution HTTPS implémentées. Essai de la vraie
APK réussi sur émulateur Android ARM64, y compris après arrêt forcé hors ligne.
Les critères 3 à 5 sur Galaxy S22 Ultra restent en attente du retour utilisateur.
Voir [les preuves](verification.md), [la release](release.json) et
[les essais Android](emulator-verification.md). Le cadrage ci-dessous reste
la référence du périmètre.

## Problem Statement

L’utilisateur veut vérifier très tôt que Chess69 peut être téléchargée, installée
et exécutée sur son Samsung Galaxy S22 Ultra. Construire les fonctionnalités
d’échecs avant cette vérification exposerait le projet à découvrir trop tard un
problème de compilation, de distribution ou d’installation.

Le livrable attendu est une APK disponible depuis
<https://apk.rentabe.ovh/chess69>. Cette version peut être très incomplète : son
objectif est de valider le parcours d’installation et l’exécution autonome.

## Solution

Initialiser l’application Android avec la stack validée, préparer l’environnement
de compilation, produire une APK release signée et la publier sur Mustang.
L’adresse demandée ouvre une page adaptée au téléphone avec un bouton explicite
de téléchargement et les instructions nécessaires à l’installation.

L’application affiche uniquement « Chess69 », sa version et un bouton qui change
un message. Elle démarre et répond au toucher sans connexion, y compris après
fermeture et réouverture. L’utilisateur réalise l’essai sur son téléphone.

Le cadrage est confirmé par les réponses aux deux questions du 13 octobre 2026.
La phase de cadrage a produit cette spécification ; son implémentation est
consignée dans l’état de livraison ci-dessus.

## User Stories

1. En tant qu’utilisateur, je veux ouvrir l’adresse demandée depuis mon téléphone pour accéder à la première APK.
2. En tant qu’utilisateur, je veux identifier la version proposée avant de la télécharger pour savoir quel livrable je teste.
3. En tant qu’utilisateur, je veux télécharger directement un fichier APK pour lancer son installation Android.
4. En tant qu’utilisateur, je veux disposer d’instructions courtes pour autoriser l’installation depuis le navigateur utilisé si Android le demande.
5. En tant qu’utilisateur, je veux retrouver Chess69 dans mes applications après l’installation pour l’ouvrir normalement.
6. En tant qu’utilisateur, je veux voir le nom et la version de Chess69 au démarrage pour confirmer que la bonne application s’exécute.
7. En tant qu’utilisateur, je veux appuyer sur un bouton et voir le message changer pour confirmer que l’application répond au toucher.
8. En tant qu’utilisateur, je veux utiliser ce même écran en mode avion pour vérifier son autonomie.
9. En tant qu’utilisateur, je veux fermer puis rouvrir l’application en mode avion pour vérifier qu’un démarrage indépendant fonctionne.
10. En tant qu’utilisateur, je veux transmettre la version et l’étape d’un éventuel échec pour permettre un diagnostic précis.
11. En tant que mainteneur, je veux reconstruire et republier une APK avec une procédure documentée pour poursuivre les livraisons.
12. En tant que mainteneur, je veux conserver l’identité Android et la clé de signature pour permettre des mises à jour ultérieures.
13. En tant que mainteneur, je veux comparer le fichier publié au fichier compilé pour détecter une erreur de transfert ou de publication.

## Implementation Decisions

- Conserver React Native, Expo, Expo Router et TypeScript strict, ainsi que les conventions fonctionnelles et l’injection manuelle déjà validées. Utiliser des versions compatibles entre elles et un lockfile versionné.
- Configurer les outils prévus au scaffold, dont Zod, Remeda et Jest avec le preset Expo. Ne pas intégrer les briques fonctionnelles d’échecs ou de stockage pour ce seul écran de contrôle.
- Préparer le JDK, le SDK Android et les outils nécessaires à une compilation locale reproductible. Privilégier la chaîne locale prévue par le projet ; cette livraison ne nécessite pas de service de compilation payant ni de compte Expo supplémentaire.
- Produire une véritable APK release signée dont le code et les ressources nécessaires à cet écran sont embarqués. Le démarrage ne dépend ni d’Expo Go, ni de Metro, ni du VPS, ni d’un téléchargement initial de code.
- Choix d’implémentation délégué à l’agent : identité Android stable `ovh.rentabe.chess69`, nom affiché `Chess69`, version initiale `0.1.0` et code de version initial `1`. Vérifier l’absence de conflit connu avant la première signature et consigner tout ajustement justifié.
- Générer une clé de signature durable, la conserver et documenter sa récupération dans un stockage protégé hors Git. Ne jamais publier la clé, ses mots de passe ou des secrets dans les fichiers servis par le VPS, les logs ou le dépôt.
- Inclure l’architecture ARM64 nécessaire au Galaxy S22 Ultra dans l’APK directement installable. Vérifier la compatibilité déclarée et les caractéristiques du paquet avant publication.
- Réaliser un seul écran lisible en français : titre, version, message initial et bouton « Tester ». L’appui affiche « Interaction confirmée ». La réouverture peut réinitialiser le message ; aucune persistance utilisateur n’est requise.
- Respecter le découpage front/présentation existant : un service front porte l’état et l’action, un composant affiche les valeurs et callbacks, une feature les raccorde. Ne pas créer de service métier fictif, de repository ou de backend pour cet écran.
- Adopter une interface simple et tactile, avec la direction noir/orange déjà documentée. Limiter le design à ce qui facilite le contrôle sur téléphone.
- Le VPS héberge uniquement les fichiers de distribution. Gérer le routage, TLS et les ressources serveur dans le projet `vps-perso`, avec Ansible et la plateforme Caddy Docker existante.
- L’URL canonique demandée est `https://apk.rentabe.ovh/chess69`. Une redirection vers `/chess69/` est acceptable si elle aboutit à la page attendue. L’ancienne mention `/chess-69/` ne remplace pas cette URL.
- La page de distribution affiche la version, un lien de téléchargement APK, sa taille, son SHA-256 et un guide de test court. Le téléchargement est public, sans compte utilisateur.
- Publier un fichier APK identifié par sa version et promouvoir la page seulement après transfert et vérification complets. Une publication ratée ne doit pas exposer un fichier partiel ou une page pointant vers un fichier absent.
- Prévoir des commandes documentées de compilation et publication, ainsi qu’une procédure de correction ou de retour à la version précédemment publiée lorsqu’elle existe. Préserver les autres services du VPS lors de la configuration et du rechargement Caddy.
- Conserver les décisions, commandes de validation et preuves utiles au suivi local. Le setup et la livraison font partie du travail d’implémentation ; ils ne sont pas laissés à l’utilisateur.

## Testing Decisions

Tester les comportements observables aux interfaces publiques existantes, avec
la suite rapide sans effets externes. Le dépôt ne possède actuellement aucune
suite applicative servant de précédent ; suivre les conventions du projet.

- Au niveau du service front, vérifier le message initial, sa modification après l’action et la stabilité du résultat lors d’appuis répétés. Utiliser l’interface publique, sans dépendance native ni serveur.
- Exécuter les contrôles de typage, les tests pertinents et les validations de configuration adaptées au scaffold.
- Compiler réellement l’APK release. Vérifier sa signature, son identité, ses versions, son support ARM64 et son contenu embarqué avec les outils Android adaptés.
- Valider la configuration Caddy avant rechargement et vérifier les services existants concernés après publication.
- Vérifier depuis l’extérieur la page à l’adresse exacte demandée, une éventuelle redirection finie, le TLS valide et le téléchargement sans authentification. Vérifier un type de contenu adapté à une APK et l’intégrité du fichier téléchargé par comparaison SHA-256 avec l’artefact compilé.
- Inspecter le rendu disponible de l’écran et de la page. Préciser tout contrôle effectué sur émulateur et toute absence de contrôle sur appareil réel. Une capture navigateur ne prouve pas l’installation Android.

### Critères d’acceptation

1. L’adresse `https://apk.rentabe.ovh/chess69` est accessible en HTTPS et permet le téléchargement de l’APK annoncée.
2. Le fichier téléchargé correspond à l’APK release signée produite et vérifiée ; les informations de version de la page et du paquet concordent.
3. L’utilisateur peut installer cette APK sur son Galaxy S22 Ultra et ouvrir Chess69 depuis les applications du téléphone.
4. L’écran affiche le nom, la version et le bouton ; un appui change visiblement le message.
5. Le même parcours fonctionne en mode avion, puis après fermeture et réouverture de l’application en mode avion.
6. La compilation, la signature et la publication sont documentées et réexécutables ; la clé durable est conservée hors Git et hors exposition publique.
7. Les validations effectivement réalisées et les éventuels échecs sont consignés. Les critères 3 à 5 restent « à confirmer sur téléphone » jusqu’au retour utilisateur ou à une observation directe sur cet appareil.

La préparation du livrable peut être terminée côté agent alors que la validation
sur téléphone attend encore le retour utilisateur. Ne pas annoncer la validation
de bout en bout comme réussie avant cette confirmation. En cas d’échec sur le
téléphone, reprendre le diagnostic à l’étape concernée et fournir une APK corrigée.

## Out of Scope

- Échiquier, parties, puzzles, apprentissage, moteur Stockfish et validation de coups.
- Intégration et validation de SQLite, sauvegardes ou conservation de données entre versions.
- Deuxième APK dédiée à un essai de mise à jour : la signature et l’identité sont préparées pour la suite, mais ce parcours n’est pas un critère de cette première version.
- Application iOS, publication sur Google Play, comptes, API métier et synchronisation distante.
- Pipeline CI/CD complet, automatisation récurrente et mise à jour à distance du code installé.
- Validation de toutes les versions Android ou de tous les téléphones.

## Further Notes

### État observé le 13 octobre 2026

- Chess69 contient la documentation et les skills ; aucun scaffold applicatif ou package applicatif n’est encore présent.
- Node et npm sont disponibles sur le Mac. Aucun SDK Android n’a été détecté à l’emplacement usuel ; `adb` et `sdkmanager` sont absents du PATH. La présence du lanceur `java` ne confirme pas un JDK compatible.
- Le DNS de `apk.rentabe.ovh` pointe vers Mustang et l’accès SSH est fonctionnel.
- Lors des contrôles en lecture seule, HTTP redirige vers HTTPS, mais HTTPS échoue pendant la négociation TLS. Ni le modèle Caddy versionné ni le Caddyfile actif ne déclarent ce domaine. Aucune page de distribution n’a donc été observée malgré l’indication initiale « déjà accessible ».
- Aucune procédure APK existante n’a été trouvée dans `vps-perso`. La distribution HTTPS fait partie du setup à réaliser, et non d’un prérequis déjà vérifié.
- Ces constats sont datés : les revalider au démarrage de l’implémentation.

### Références

- [Mode de travail](../../docs/mode-de-travail.md), [architecture](../../docs/architecture.md), [technologies](../../docs/architecture-techno.md) et [suivi local](../../docs/agents/issue-tracker.md).
- [Projet VPS : instructions](../../../vps-perso/AGENTS.md), [exploitation](../../../vps-perso/README.md) et [décision Caddy](../../../vps-perso/docs/adr/0001-docker-caddy-platform.md).
- [Expo : compilation locale](https://docs.expo.dev/guides/local-app-development/) et [signature des applications](https://docs.expo.dev/app-signing/app-credentials/), consultés pendant le cadrage.

Ce jalon valide uniquement les éléments présents dans cette APK. Son succès ne
valide pas encore les futurs modules natifs SQLite ou Stockfish.
