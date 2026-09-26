import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal-page'

export const metadata: Metadata = { title: 'Conditions d’utilisation — Al-Kareem' }

export default function TermsPage() {
  return (
    <LegalPage title="Conditions d’utilisation" updated="26 septembre 2026">
      <section><h2>Objet</h2><p>Al-Kareem propose des contenus et exercices d’apprentissage de la langue arabe. Le service constitue un outil pédagogique et ne garantit pas à lui seul un niveau ou un résultat particulier.</p></section>
      <section><h2>Compte</h2><p>Vous êtes responsable de la confidentialité de votre mot de passe et de l’exactitude des informations fournies. Toute utilisation abusive, tentative d’intrusion ou atteinte au service est interdite.</p></section>
      <section><h2>Contenus et droits</h2><p>Les textes, interfaces, illustrations et enregistrements intégrés sont protégés. Ils ne peuvent pas être copiés, redistribués ou exploités commercialement sans autorisation.</p></section>
      <section><h2>Disponibilité</h2><p>Le service peut évoluer et connaître des interruptions de maintenance. Al-Kareem met en œuvre des mesures raisonnables pour préserver la disponibilité, la sécurité et la progression enregistrée.</p></section>
      <section><h2>Contact</h2><p>Pour toute question : <a href="mailto:alkareem.app@gmail.com">alkareem.app@gmail.com</a>.</p></section>
    </LegalPage>
  )
}
