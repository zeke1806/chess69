# Revue Standards

Référence : `42ccb3a06711cada9a25bc907540bd8ce8a834e5` ; réalisation :
`ce9cb99` ; diff : `git diff main...HEAD`.

**Zéro finding.** Aucune violation documentée ni régression identifiable dans
le diff ; aucun smell Fowler suffisamment concret pour demander une correction.

Sources consultées : `AGENTS.md`, `docs/mode-de-travail.md`,
`docs/architecture-techno.md`, skill CU-ARCHI, sections architecture, présentation
front, raccordement React et tests de ses règles, ainsi que l’exemple de page
stateless et ses stories dans le projet de référence.

`ApplicationScreen` reçoit état, actions, logo et taille par props. L’extraction
conserve l’assemblage des écrans précédemment présent dans la feature ; elle
n’ajoute ni stockage ni transition métier. La feature conserve les dimensions,
le raccordement au service et les effets Android. Les imports de contrats dans
la vue sont exclusivement des imports de types.

Les stories réutilisent cette vue et le shell de production, construisent leurs
variantes sans modifier les fixtures partagées et restent regroupées sous
`Common` et `Business`. Le contrôle architectural ajoute des garde-fous cohérents
avec les frontières documentées. Les tests navigateur restent centralisés dans
`tests/`, sans services natifs ni données de production.

Les contrôles automatisés transmis par l’agent principal sont pris comme preuves
de formatage, types, architecture et comportement ; les conventions garanties
par ces outils ne sont pas dupliquées dans cette revue. Le rendu Android natif
n’a pas été vérifié par cette revue web, conformément au périmètre documenté.
