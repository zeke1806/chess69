# Documentation du domaine

Le projet possède un seul contexte métier : l’apprentissage des échecs hors ligne.
Les blocs business et front sont des responsabilités techniques, pas des contextes
métier distincts.

Avant d’explorer le domaine, lire `GLOSSARY.md` s’il existe et les décisions
pertinentes de `docs/adr/`. Leur absence ne bloque pas le travail. Les créer
progressivement avec `domain-modeling` quand des termes ou décisions durables
nécessitent d’être consignés.

Le glossaire contient les termes métier et leurs définitions, sans configuration
technique. Réutiliser ce vocabulaire dans les interfaces, tickets et tests.
Les ADR consignent les décisions qui justifient une trace durable.

L’architecture et les technologies restent définies dans leurs documents dédiés.
Lorsqu’une proposition contredit une convention ou décision existante, signaler
la contradiction et sa raison plutôt que la remplacer silencieusement.
