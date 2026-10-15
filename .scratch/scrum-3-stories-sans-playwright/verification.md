# Vérification SCRUM-3

Status: resolved

- Suppression des deux fichiers Playwright, de la configuration, du script et de la dépendance directe.
- Désinstallation npm hors ligne : trois paquets retirés ; absence confirmée dans le manifeste, le lockfile et node_modules.
- Conservation des stories existantes, y compris les démonstrations interactives déjà présentes ; aucune interaction nouvelle ajoutée.
- Chess69 : types, 117 tests / 16 suites, contrôle architectural et compilation Storybook réussis. Aucun navigateur lancé. Le build signale seulement son avertissement de taille des chunks ; la compilation réussit.
- Audit structurel des skills et statut de synchronisation : réussis ; CU Archi actif via le lien symbolique reflète la nouvelle règle.
- Revue documentaire : la règle est centralisée dans CU Archi, les guides actifs ne proposent plus de commande Playwright ; les preuves historiques sont conservées comme historique.
- Aucun fichier applicatif ni story modifié. Les caches de navigateurs partagés et les livraisons natives restent hors périmètre. Les sorties de build restent ignorées par Git.

Livraison : un commit SCRUM-3 par dépôt sur codex/scrum-3-stories-sans-playwright, dépendant de SCRUM-2 ; aucune fusion ni push.
