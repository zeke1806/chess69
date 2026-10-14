## Disposition

disposition: ship

Revue visuelle native finale du 14 octobre 2026, mode Operate, effectuée en
lecture seule sur les captures fournies par l’agent d’intégration. Aucun défaut
matériel de la nouvelle interface n’est identifié dans ce périmètre.

Le launcher Impeccable n’a pas pu s’exécuter (permission denied) ; le contexte
du projet a été lu directement. Le rapport suit le périmètre demandé par
l’orchestrateur, avec les critères natifs Android et le craft floor.

## Coverage

Toutes les captures requises existent, sont des PNG de 1080 × 2400 et montrent
le parcours annoncé après chargement. La première capture `final-font-home.png`
montrait le chargement ; son remplacement au même chemin a été relu et validé.

| Surface | Preuve inspectée | Résultat visible |
| --- | --- | --- |
| Accueil | `final-home.png` | Révision due, pratique, cartes et navigation lisibles |
| Progression | `final-progress.png`, `final-progress-bottom.png` | Résultats, mémoire, révisions et activité en français |
| Historique | `final-history.png` | Positions réelles miniatures, résultat, niveau, date et accès à la revue |
| Analyse | `final-analysis.png`, `final-analysis-next.png` | Position initiale puis e4, trait, navigation de coups et évaluation actualisés |
| Apprentissage | `final-learn.png` | Catégories, sélection, ouvertures et rangée horizontale |
| Ouverture | `final-opening.png` | Camp choisi, variantes et deux modes d’apprentissage |
| Exercice | `final-exercise.png` | Position, contexte, consigne et transport guidé |
| Préparation de partie | `final-play.png` | Camp, niveau, début de partie et historique |
| Aide ouverte | `final-help.png` | Libellé « Fermer l’aide » et début de bulle ; contenu sous le viewport |
| Texte Android 1,3 | `final-font-home.png`, `final-font-play.png` | Reflow des textes, actions et quatre destinations sans chevauchement |

Les sources échantillonnées sont le thème, la coque d’application, les boutons,
les choix, l’aide et l’analyse. Les documents lus sont la spec d’intégration,
PRODUCT.md, DESIGN.md, la direction et la référence Storybook approuvée,
les règles CU-ARCHI applicables et les références natives Impeccable.

## Findings

Aucun correctif visuel matériel demandé.

| Élément de la direction approuvée | État | Évidence |
| --- | --- | --- |
| Fond et palette | match | Charbon `#191C1A`, surfaces feutre, ivoire et action sauge dans le thème et les captures |
| Typographie | match | Manrope locale ; corps 400, sections 600 et titres/actions 700 issus de fontes statiques, hiérarchie visible |
| Matière | match | Atlas original en volume présent sur les cartes et la navigation ; relief des cartes conservé |
| Structure | match | Colonne mobile, rangées horizontales et quatre destinations basses persistantes |
| Interaction principale | match | Révision, démarrage de partie, exploration ou mémorisation trouvent une commande explicite |
| Échiquier | match | Cases ivoire/sauge, pièces contrastées et coordonnées lisibles ; e4 et changement de trait visibles dans l’analyse |
| Données et copie | adaptation | Vraies données locales remplacent les données fictives du prototype, conformément à la spec d’intégration |
| Logo orange | adaptation | Identité originale conservée explicitement dans le brief de revue |

Les grands rayons, le bord inférieur des cartes et les illustrations de
navigation appartiennent au design approuvé ; ils ne sont pas traités comme
des écarts au craft floor. Les rangées partiellement visibles à droite invitent
au défilement horizontal prévu. Les contenus partiellement visibles en bas
appartiennent au ScrollView situé au-dessus de la navigation fixe.

Les contrastes calculés depuis les tokens des textes inspectés dépassent le
seuil de 4,5:1 : texte principal/fond 14,68:1, secondaire/fond 9,39:1,
secondaire/carte 7,56:1, sauge/surface haute 6,46:1 et texte/action 8,22:1.
Les contrôles échantillonnés utilisent des hauteurs minimales de 48 ou 52 dp ;
les commandes de navigation et de retour ont leurs rôles et états accessibles.

## Advisories

Aligner la documentation des fontes avec la correction Android finale :
le DESIGN.md lu mentionne encore `src/assets/manrope.ttf` et `Chess69Display`,
alors que l’application charge `manrope-400.ttf`, `manrope-600.ttf`,
`manrope-700.ttf` via `Chess69Regular`, `Chess69Semibold`, `Chess69Bold`.
L’orchestrateur indique que cet alignement documentaire est pris en charge.
Cette observation ne demande aucun changement de l’interface inspectée.

Préserver la palette, les illustrations, les fontes statiques, la lisibilité
de l’échiquier et les aides à la demande lors des corrections éventuelles.

## Limitations

Les captures proviennent de l’émulateur téléphone API 36 ARM64, en mode avion,
selon le packet de l’orchestrateur. Cette revue ne vaut pas validation sur
le Samsung Galaxy S22 Ultra, ni contrôle de performances, TalkBack, gestes
matériels ou retour prédictif sur téléphone. Aucune tablette n’est revendiquée.

Le contrôle Android du texte 1,3 couvre ici l’accueil et la préparation de
partie ; il ne couvre pas visuellement tous les écrans à cette échelle.
L’orchestrateur confirme le rétablissement de l’échelle 1,0.

Les captures d’analyse montrent position et évaluation ; la liste des coups
et la totalité des aides sont sous le viewport. Leur présence est constatée
dans la source échantillonnée, leur rendu intégral n’est pas certifié par
ces captures. Les états erreur, promotion et fin de partie ne figurent pas
dans ce packet natif. Les tests Storybook annoncés par l’orchestrateur restent
une preuve distincte, non réexécutée par ce reviewer.

Aucun détecteur HTML/CSS n’a été appliqué à l’application native. La référence
approuvée est conservée en code dans Storybook ; aucun comp raster ni rapport
de différence pixel à pixel n’a été fourni. La fidélité est donc évaluée contre
le brief, la direction approuvée et les captures, pas contre une égalité pixel.

La mise à jour signée, SQLite, le moteur hors ligne et la conservation des
données sont contrôlés par l’agent d’intégration ; leurs résultats ne sont pas
requalifiés comme vérifications indépendantes dans cette revue visuelle.
