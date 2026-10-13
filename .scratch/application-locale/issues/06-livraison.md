# 06: Publier la release signée et le protocole téléphone

**What to build:** Publier la release signée et le protocole téléphone.

**Blocked by:** 05

**Status:** resolved

- [x] Types, 76 tests, contre-revues Standards/Spec résolues et revue visuelle Android Impeccable ship.
- [x] APK 0.2.0 code 4 autonome, même signature/package ; update et données testées sur émulateur.
- [x] Page, manifeste, APK et sources concordent ; ancienne release supprimée après succès HTTP, aucune sauvegarde de release ni staging restant.
- [x] Guide installation/mise à jour et contrôles Galaxy restant à faire consignés.

## Tests et interfaces

Contrats publics des services business/front avec adaptateurs en mémoire ; comportements observables et erreurs. Les adaptateurs natifs et la distribution ont des contrôles Android/HTTP distincts.

## Comments

Publication réussie sur https://apk.rentabe.ovh/chess69 : 0.2.0 code 4,
123913853 octets, package/certificat originaux. Playbook 22 opérations sans
échec. Téléchargements complets APK et sources vérifiés par SHA-256 ; inventaire
SSH de la seule release 0.2.0-4, staging/backups vides, ancienne APK HTTP404.
Source commit f015d04cbe4a9a09222bbb370ec6e587028ba492, réseaux et licences inclus.
Clé privée/récupération conservées sur le Mac, exclues de la publication.

76 tests / 11 suites, types, Expo Doctor20/20, native ARM64 et update avec données
passent ; revues Standards/Spec résolues et Impeccable ship, documenter frais
achevé. [Métadonnées](../release.json), [preuves](../verification.md),
[acceptation et limites](../acceptance.md), [guide appareil](../phone-test.md).
Le contrôle du Galaxy demeure non effectué ; aucune observation Samsung inventée.
