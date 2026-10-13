# Télécharger la release et confirmer sur téléphone

Status: ready-for-human
Blocked by: 02-apk-signee

Publier par Ansible dans vps-perso ; vérifier HTTPS, MIME, taille et SHA-256
en retéléchargeant l'APK. Contrôler le rendu de la page et de l'écran.

L'installation, l'interaction et la réouverture en mode avion sur le Galaxy
S22 Ultra restent en attente du retour utilisateur (critères 3 à 5).

## Validation côté agent

- Page canonique accessible, release publiée par Ansible, transfert SHA-256
  vérifié ; procédures de correction/rollback présentes dans vps-perso.
- L'APK réelle passe installation, interaction et réouverture hors ligne
  sur émulateur API 36 ARM64. Voir ../emulator-verification.md.
- Prochaine action : retour utilisateur sur Galaxy S22 Ultra. Le ticket reste
  ouvert pour les critères 3 à 5 ; aucune réussite téléphone n'est présumée.
