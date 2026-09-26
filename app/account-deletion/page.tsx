import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Supprimer mon compte — Al-Kareem' }

export default function AccountDeletionPage() {
  const subject = encodeURIComponent('Demande de suppression de compte Al-Kareem')
  const body = encodeURIComponent("Bonjour,\n\nJe souhaite supprimer définitivement mon compte Al-Kareem associé à l’adresse e-mail suivante :\n\n[MON ADRESSE E-MAIL]\n\nMerci.")
  return (
    <LegalPage title="Suppression du compte et des données" updated="26 septembre 2026">
      <section><h2>Depuis l’application</h2><p>Connectez-vous, ouvrez <strong>Profil</strong>, choisissez <strong>Supprimer mon compte</strong>, puis confirmez avec votre mot de passe. Le compte, la progression et les abonnements aux notifications associés sont supprimés définitivement.</p></section>
      <section><h2>Demande depuis le web</h2><p>Si vous ne pouvez plus accéder à l’application, envoyez une demande depuis l’adresse e-mail liée au compte. Une vérification d’identité peut être demandée afin d’empêcher la suppression frauduleuse du compte.</p><p className="mt-4"><a className="inline-flex rounded-2xl bg-primary px-5 py-3 text-primary-foreground" href={`mailto:alkareem.app@gmail.com?subject=${subject}&body=${body}`}>Demander la suppression</a></p></section>
      <section><h2>Données concernées</h2><p>La suppression couvre les données d’identification du compte, la progression pédagogique, les préférences, les jetons de sécurité et les abonnements aux notifications. Certaines traces strictement nécessaires à la sécurité ou au respect d’une obligation légale peuvent être conservées pendant la durée imposée.</p></section>
      <section><h2>Assistance</h2><p><a href="mailto:alkareem.app@gmail.com">alkareem.app@gmail.com</a></p></section>
    </LegalPage>
  )
}
