# Mise en conformité CU-ARCHI de Chess69

Source : demande utilisateur du 14 octobre 2026 et docs/audit-cu-archi.md.
Base Git : e8f1a65. Tout le travail utilise la branche codex/corrections-cu-archi
sur le dépôt principal, sans worktree. Livraison finale : un commit, avance
rapide sur main, suppression de la branche. Aucun push/publication demandé.

## Résultat attendu

Résoudre A1–A9 et D1 dans l’ordre du rapport. Préserver Android/Expo, npm,
SQLite local, Stockfish embarqué, données existantes, identité de signature,
interface française et visuels actuels. Aucune stack serveur/web ne remplace
le monolithe mobile. La structure et les contrats suivent le skill CU-ARCHI.

Application devient un assemblage de modules cohérents : orchestration du
cycle de vie et navigation, apprentissage, partie, analyse, progression et
interaction de l’échiquier. Les vues deviennent stateless ; les services portent
les décisions et transitions. Un raccordement stateful générique gère les
connexions et protège le démontage ; l’orchestrateur assure l’exclusion moteur
et les transitions entre parcours sans publications asynchrones obsolètes.

## Invariants à préserver

- Une sauvegarde atomique garde tentative/révision et parties/préférences ensemble.
- Reprise après erreur, arrêt forcé et mise à jour sans effacer les données.
- Une seule partie active ; remplacement confirmé, conflit détecté et coup non perdu.
- Annulation native attendue avant une nouvelle opération du moteur.
- Analyse partielle reprise, score pour les blancs et mat zéro interprété correctement.
- Une écriture engagée peut terminer après navigation sans remplacer le nouvel écran.
- Choix du camp/niveau, sélection et promotion testables hors des vues.
- Anciens états et branches imbriquées immuables ; connecteurs de test sans clonage.
- Palette, textes, assets locaux, retour Android et échelles de texte conservés.
- Stories exécutables des primitives et vues avec états significatifs, hors APK normale.

## Vérification

Contrats publics et assemblages mémoire autorisés par le mode de travail.
Seams : services métier et ports repository ; services de présentation et
connecteur stateful ; orchestration intégrée ; raccordement React et vues.
Les tests ne traversent pas les helpers privés. Tests métier par ticket dans
 tests/business/cu-archi-NN/, un fichier et au besoin un fichier de fixtures.
Noms français numérotés ; conserver les tests historiques utiles.

Typecheck, tests ciblés à chaque incrément puis suite finale, contrôle architecture
(imports, cycles, blocs, readonly, absence d’état dans components), stories,
bundle et APK signée. Vérifier sur émulateur ARM64 sans Metro : mise à jour
conservant les données, apprentissage, partie, analyse, navigation, redémarrage.
Contrôles Galaxy indisponibles restent explicitement séparés des preuves émulateur.

## Livraison

Actualiser documentation technologique/design et audit avec corrections et preuves.
Préparer APK locale versionnée, même package/certificat, sans publication distante.
Revues indépendantes Standards/Spec et finition native selon les skills applicables.
