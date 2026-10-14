# Revue Standards

Référence : `main` (`601b6ff`) ; checkpoint : `7011ae0` ;
diff : `git diff main...HEAD`.

**Zéro finding.** Aucune violation documentée ni régression identifiable dans
ce diff ; aucun smell Fowler suffisamment concret pour demander une correction.

Sources : `AGENTS.md`, `docs/mode-de-travail.md`,
`docs/architecture-techno.md`, règles CU Archi et exemples de vues stateless
et stories du projet de référence. Le périmètre est celui de la spec
`.scratch/design-validation/spec.md` validée.

Les maquettes et leur kit restent dans `.storybook/design`. `DesignScreen`,
`Moodboard` et les éléments de présentation n’utilisent aucun hook et reçoivent
leurs interactions par callbacks. L’état de démonstration appartient au seul
raccordement `DesignDemo`, sans service métier, stockage, moteur ou effet externe.
Les seuls imports venant de l’application réutilisent ses vues stateless de pièces
et d’icône. Aucun fichier de `src/` ni dépendance applicative n’est modifié.

La racine supplémentaire `Design` et les tokens locaux de palette A respectent
l’exception explicitement autorisée et consignée dans le mode de travail.
Les adaptations du décorateur conservent le cadrage existant des stories de
production ; les changements de fond et de padding visent les seules nouvelles
présentations. Le prototype est clairement indiqué comme proposition temporaire
dans son guide et à l’écran ; `DESIGN.md` continue de décrire l’application livrée.

L’absence de nouveaux modules de services, de types domaine complets ou de
stories individuelles pour chaque helper du kit ne justifie pas une extraction
dans ce prototype jetable. Le fichier de maquettes réunit une seule responsabilité
de présentation et n’introduit pas de couche générique spéculative.

Les contrôles transmis par l’agent principal — TypeScript, format, architecture,
116 tests Jest et 118 tests Playwright — servent de preuves automatisées ; cette
revue ne les réexécute pas. La validation visuelle par le propriétaire et la preuve
Android restent distinctes de cette revue des normes.

Complément après checkpoint : l’ajout de Manrope reste local au catalogue ;
la fonte et sa licence OFL sont embarquées, sa provenance documentée.
`Chess69Display` s’applique uniquement aux styles de la proposition. La déclaration
TypeScript et la reconnaissance des extensions de fonte par le contrôle
architectural adaptent l’outillage aux assets, sans ouvrir de dépendance vers
les services. Aucun finding supplémentaire sur ce delta ; le verdict reste zéro.
