const url = new URL(process.env.CAPACITOR_SERVER_URL ?? 'https://al-kareem.app')
if (url.protocol !== 'https:' || ['localhost', '127.0.0.1'].includes(url.hostname) || url.hostname.endsWith('.example')) {
  console.error('Build mobile interrompu : CAPACITOR_SERVER_URL doit être une adresse HTTPS publique.')
  process.exit(1)
}
console.log(`Configuration mobile validée pour ${url.origin}`)
