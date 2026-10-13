# Parcours Android

Mode Impeccable : Operate. Identité existante conservée : noir/orange, logo et splash. Écran mobile français, navigation Material à quatre destinations. La composition sert la prochaine action et l’échiquier, sans étape de connexion.

Accueil : prochaine révision, reprise active, accès direct aux exercices et aperçu de pratique. Apprendre : ouvertures à idées/erreurs/variantes, sélection du camp, guide puis mémoire ; puzzles et finales filtrables. Jouer : camp/niveau, reprise, échiquier légal avec promotion, historique/analyse. Progression : résultats sans aide/avec aide/à revoir, mémoire et jours actifs.

Les boutons ont au moins 48 dp, l’échiquier occupe la largeur disponible (environ 48 dp/case sur le format téléphone cible), pièces contrastées, coordonnées, repères de destination/dernier coup/échec. Texte système ajustable, zones sûres et retour Android gérés. Un chargement explicite et une erreur récupérable accompagnent l’ouverture SQLite/moteur. Les résultats annoncent la sauvegarde uniquement après écriture.

Signature interaction : toucher origine/destination avec destinations marquées sur le vrai échiquier. Pas de mouvement décoratif. Interface entièrement utilisable sans ressource distante.

Vérification prévue : captures de la vraie APK sur téléphone ARM64 émulé en mode avion, rendu normal et texte à 130 %. Inspection distincte du Galaxy restant à effectuer.

## Quality bar

La première vue doit montrer l’action utile (révision ou découverte) et la reprise éventuelle. L’échiquier est la surface centrale de travail, contrastée et orientée, avec retour légal et erreur explicite. Les destinations sont immédiatement nommées ; la copie française explique le résultat plutôt que d’afficher une évaluation sans contexte. Les contrôles natifs respectent zones sûres, retour système, 48 dp minimum hors ajustement naturel des cases, état pressé/disabled et texte système. Les captures représentent des données de test réellement créées sur l’émulateur, pas la progression du téléphone de l’utilisateur.
