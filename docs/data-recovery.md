# Reprise utilisateur et restauration de la base

## Deux mécanismes distincts

La reprise d'un utilisateur est assurée par `user_progress`, relié à l'identifiant UUID du compte. Le stockage du navigateur n'est qu'un cache hors ligne séparé par compte. Après une nouvelle connexion, y compris sur un autre appareil, la source serveur est chargée puis fusionnée avec le cache de ce même compte.

La restauration après incident de base de données est différente : elle dépend du fournisseur PostgreSQL configuré par `DATABASE_URL` ou `POSTGRES_URL`. Le dépôt est compatible avec plusieurs fournisseurs et ne permet donc pas, à lui seul, de prouver qu'une sauvegarde managée ou une restauration ponctuelle est activée.

## Contrôle obligatoire avant production

1. Identifier le fournisseur et le projet PostgreSQL réellement utilisés en production.
2. Activer une politique de sauvegarde adaptée et consigner sa rétention, son RPO et son RTO.
3. Vérifier que `users`, `user_progress`, les jetons d'authentification et les abonnements sont inclus.
4. Restaurer la sauvegarde dans une base isolée, jamais par-dessus la production.
5. Sur cette base isolée, contrôler avec des comptes synthétiques A et B que leurs lignes et leurs progressions restent séparées, puis supprimer l'environnement de test selon la politique interne.
6. Archiver la date du test, l'identifiant de la sauvegarde, le résultat et la personne responsable, sans copier de secret ni de données personnelles dans le dépôt.

Tant que cette procédure n'a pas été exécutée sur l'infrastructure réelle, on peut valider le comportement applicatif et les migrations, mais pas affirmer qu'une restauration fournisseur a été prouvée.
