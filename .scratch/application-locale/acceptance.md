# Critères d’acceptation et portée des preuves

Le résultat public est une application complète ; les preuves techniques ne
remplacent pas une observation du Galaxy. Voir `verification.md`, les rapports
natifs/revues et `phone-test.md` pour les contrôles détaillés.

| Critère de la spec | Vérification obtenue | Limite appareil |
| --- | --- | --- |
| 1. Mise à jour sans désinstallation | Même package/certificat ; APK release installée par `adb install -r`, codes 1→2 puis 3→4 avec données | Installation depuis le navigateur du Galaxy à réaliser |
| 2. Entièrement hors ligne | APK sans permission Internet, bundle/contenus/NNUE locaux ; moteur, SQLite et parcours en mode avion API36 ARM64 | Premier démarrage Galaxy à réaliser |
| 3. Logo, splash, français et tactile | Actifs natifs originaux conservés ; captures natives et revue Impeccable, texte 100/130 %, toucher origine/destination | Rendu, gestes One UI et TalkBack Galaxy à réaliser |
| 4. Ouvertures | 8 répertoires, 24 variantes, 285 notes ; catalogue rejoué, guide et mémorisation testés | Aucun contenu distant |
| 5. Puzzles/finales | 120 puzzles distincts, 24 finales, 169 branches légales ; objectifs/alternatives/camp promotion contrôlés ; aide et finale sans aide dans APK | Aucun résultat du téléphone utilisateur présumé |
| 6. Révisions/maîtrise | Horloge injectée, 1/3/7/14/30 jours, trois révisions dues sans aide et camps séparés ; erreur/aide reset | Les échéances réelles demandent naturellement du temps |
| 7. Parties | Trois réglages moteur natifs ; roque, en passant, promotions/fins aux contrats publics ; partie réelle jusqu’au mat, abandon, historique, reprise | Vitesse réelle du Galaxy à mesurer |
| 8. Analyse | Scores cp/mats, meilleurs coups/PV, seuils, checkpoints/reprise/annulation testés ; historique réellement analysé hors ligne dans APK | Performance/annulation sous charge Galaxy à observer |
| 9. Persistance | SQLite réel, force-stop/réouverture, partie active et données retrouvées ; lifecycle sérialisé | Arrière-plan Samsung à observer |
| 10. Update/migration | Mise à jour avec résultats/historique/analyses ; migrations versionnées et erreur/retry sans effacement dans APK native | Prochaine update avec progression réelle selon protocole |
| 11. Sauvegardes/transferts | allowBackup=false et exclusions cloud/device-transfer vérifiées dans le paquet release | Outils Samsung de transfert non observés |
| 12. Distribution/nettoyage | APK et sources entièrement téléchargées/validées ; seule release 0.2.0-4, zéro backup/staging, ancienne APK HTTP404 | Publication réussie, métadonnées exactes dans release.json |
| 13. Distinction des contrôles | Protocoles et rapports séparent suite mémoire, Android émulé, HTTP et Galaxy | Aucun Galaxy connecté, tests téléphone non effectués |
