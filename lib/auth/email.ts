export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const origin = process.env.PUBLIC_APP_URL
  const from = process.env.AUTH_EMAIL_FROM
  if (!apiKey || !origin || !from) return false
  const url = new URL('/', origin)
  url.searchParams.set('resetToken', token)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Réinitialisation de votre mot de passe Al-Kareem',
      html: `<p>Vous avez demandé un nouveau mot de passe.</p><p><a href="${url.toString()}">Choisir un nouveau mot de passe</a></p><p>Ce lien expire dans 30 minutes. Ignorez ce message si vous n’êtes pas à l’origine de la demande.</p>`,
    }),
  })
  return response.ok
}

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const origin = process.env.PUBLIC_APP_URL
  const from = process.env.AUTH_EMAIL_FROM
  if (!apiKey || !origin || !from) return false
  const url = new URL('/api/auth/verify-email', origin)
  url.searchParams.set('token', token)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject: 'Confirmez votre compte Al-Kareem', html: `<p>Bienvenue sur Al-Kareem.</p><p><a href="${url.toString()}">Confirmer mon adresse e-mail</a></p><p>Ce lien expire dans 24 heures.</p>` }),
  })
  return response.ok
}
