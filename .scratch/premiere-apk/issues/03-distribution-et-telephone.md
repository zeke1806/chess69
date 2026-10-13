# Télécharger la release et confirmer sur téléphone

Status: ready-for-human
Blocked by: 02-apk-signee

Publier par Ansible dans vps-perso ; vérifier HTTPS, MIME, taille et SHA-256
en retéléchargeant l'APK. Contrôler le rendu de la page et de l'écran.

L'utilisateur confirme le téléchargement, l'installation et le message attendu
après appui sur le bouton sur son Galaxy S22 Ultra (critères 3 et 4).
La réouverture en mode avion reste à confirmer explicitement (critère 5).

## Validation côté agent

- Page canonique accessible, release publiée par Ansible, transfert SHA-256
  vérifié ; procédures de correction/rollback présentes dans vps-perso.
- L'APK réelle passe installation, interaction et réouverture hors ligne
  sur émulateur API 36 ARM64. Voir ../emulator-verification.md.
- Prochaine action : confirmation de la réouverture en mode avion (critère 5).

## Retour utilisateur

Téléchargement et installation réussis ; bouton testé et message attendu obtenu.
Le retour ne mentionne pas explicitement le mode avion et la réouverture.
