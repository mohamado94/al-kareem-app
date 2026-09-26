# Al-Kareem

Application éducative Next.js disponible comme site installable (PWA), avec projets natifs iOS et Android gérés par Capacitor.

## Développement Web

```bash
pnpm install
pnpm dev
```

Copier `.env.example` vers `.env.local` et renseigner la base PostgreSQL, le secret JWT et les clés Web Push pour activer les comptes et notifications.

Appliquer les migrations SQL dans l’ordre, notamment `003_account_security.sql`. La réinitialisation par e-mail nécessite également `PUBLIC_APP_URL`, `RESEND_API_KEY` et `AUTH_EMAIL_FROM`.

La reprise de progression et la restauration après incident sont deux contrôles distincts. Avant toute publication, suivre et consigner la procédure décrite dans [`docs/data-recovery.md`](docs/data-recovery.md).

## Contrôles avant publication

```bash
pnpm check
pnpm audit --prod
pnpm test:e2e
```

`pnpm check` vérifie TypeScript, exécute les tests unitaires et produit le build Webpack de production. Les tests E2E nécessitent les navigateurs Playwright (`pnpm exec playwright install`).

## Version Web

Déployer l’application Next.js sur un hébergeur compatible avec les routes serveur. La base, les secrets JWT/VAPID et `CRON_SECRET` doivent être configurés dans l’environnement de production. Les vidéos devraient être déplacées vers un stockage objet/CDN avant une sortie à grande échelle.

## Versions iOS et Android

Les projets natifs sont présents dans `ios/` et `android/`. Ils chargent le site de production HTTPS et utilisent une page locale de secours lorsque le service est indisponible.

```bash
CAPACITOR_SERVER_URL=https://votre-domaine.example pnpm mobile:sync
pnpm mobile:ios
pnpm mobile:android
```

Avant soumission, remplacer le domaine, les icônes natives et l’identifiant `com.alkareem.app` si nécessaire, puis signer les builds avec les comptes Apple Developer et Google Play Console. Xcode est requis pour iOS; Android Studio avec un JDK est requis pour Android.

## Publication responsable

Ne pas publier tant que les licences des voix, fonds sonores et médias ne sont pas archivées, et tant que la politique de confidentialité, les conditions et la suppression de compte ne sont pas disponibles. Les récits religieux et récitations doivent recevoir une validation éditoriale qualifiée indépendante.
