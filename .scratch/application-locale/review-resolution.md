# Résolution des revues indépendantes

## Standards

Revue depuis 0da42a21 : trois violations documentées et une duplication possible.

- Libération explicite : raccordée au propriétaire RootLayout ; reprise de lifecycle vérifiée par les tests front du correctif.
- Messages/interprétation des résultats d’analyse dans UI : projection déplacée dans le snapshot front, règle de gagnant d’un mat partagée depuis le business ; tests cp/mats/qualité.
- Snapshot imbriqué mutable : contrats profondément readonly et freeze à la publication ; tests de protection des données observables.
- Jour civil dupliqué : module calendar pur partagé entre apprentissage, parties et progression.

Les quatre constats ont été intégrés et jugés résolus par la contre-revue indépendante. La fermeture et la réinitialisation sont sérialisées dans l’assemblage concret ; ses trois tests publics vérifient aussi le nettoyage et le retry. Le rapport original est conservé séparément de cette résolution.

## Spec

Trois défauts P2 démontrés :

- Objectifs de promotion faux pour le camp entraîné : corrigés avec objectifs de gain matériel/arrêt du pion adverse ou sacrifice ; identifiants et positions inchangés. Le test catalogue vérifie le camp de la promotion et le gain réel. La vérification élargie a corrigé cinq contenus.
- Réponse tardive après sauvegarde d’un coup qui remplace l’échiquier d’un guide : tokens de contexte et test de sauvegarde suspendue ; l’écriture reste persistée sans toucher l’écran quitté.
- Consultation d’une analyse qui masque la partie active : état actif distinct du viewer, test de retour Accueil/Jouer.

Les trois findings sont jugés résolus par la contre-revue indépendante. La vraie APK conserve aussi l’accès à la partie active après consultation de l’analyse historique. Aucune divergence SRS/calcul moteur supplémentaire n’a été démontrée. Les contrôles Galaxy n’ont pas été effectués.
