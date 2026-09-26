import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Politique de confidentialité — Al-Kareem' }

export default function PrivacyPage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="26 septembre 2026">
      <section><h2>Responsable du service</h2><p>Al-Kareem exploite l’application et le site al-kareem.app. Pour toute question relative à vos données : <a href="mailto:alkareem.app@gmail.com">alkareem.app@gmail.com</a>.</p></section>
      <section><h2>Données traitées</h2><ul><li>Adresse e-mail, nom d’affichage et mot de passe chiffré de manière irréversible lors de la création d’un compte.</li><li>Progression pédagogique, langue choisie, activité et préférences.</li><li>Abonnement technique aux notifications, uniquement après votre autorisation.</li><li>Données techniques minimales nécessaires à la sécurité, au fonctionnement et à la prévention des abus.</li></ul></section>
      <section><h2>Finalités</h2><p>Ces données servent à créer et sécuriser votre compte, synchroniser votre progression, personnaliser l’apprentissage, envoyer les rappels demandés et maintenir le service.</p></section>
      <section><h2>Prestataires</h2><p>L’hébergement de l’application est assuré par Vercel. La base de données est hébergée avec Supabase. Les e-mails de vérification et de récupération peuvent être envoyés avec Resend. Les services reçoivent uniquement les données nécessaires à leur mission.</p></section>
      <section><h2>Conservation et sécurité</h2><p>Les données du compte sont conservées tant que celui-ci reste actif. Les jetons de vérification et de récupération expirent automatiquement. Les communications utilisent HTTPS et les mots de passe ne sont jamais stockés en clair.</p></section>
      <section><h2>Vos droits</h2><p>Vous pouvez consulter ou modifier certaines informations depuis votre profil et supprimer définitivement votre compte dans l’application. Vous pouvez aussi utiliser la <a href="/account-deletion">page de suppression de compte</a> ou écrire à l’adresse d’assistance.</p></section>
      <section><h2>Enfants</h2><p>Un mineur doit utiliser le service avec l’autorisation et la supervision de son représentant légal. Al-Kareem ne vend pas de données personnelles et ne diffuse pas de publicité comportementale.</p></section>
      <section><h2>Modifications</h2><p>Cette politique peut évoluer pour refléter le fonctionnement du service ou les obligations applicables. La date affichée en haut de cette page sera alors actualisée.</p></section>
    </LegalPage>
  )
}
