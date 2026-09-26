import type { CapacitorConfig } from '@capacitor/cli'

const productionUrl = process.env.CAPACITOR_SERVER_URL ?? 'https://al-kareem.app'

if (productionUrl) {
  const parsed = new URL(productionUrl)
  if (parsed.protocol !== 'https:' || parsed.hostname.endsWith('.example')) {
    throw new Error('CAPACITOR_SERVER_URL must be a real HTTPS production URL')
  }
}

const config: CapacitorConfig = {
  appId: 'com.alkareem.app',
  appName: 'Al-Kareem',
  webDir: 'mobile-shell',
  server: productionUrl
    ? {
        url: productionUrl,
        cleartext: false,
        allowNavigation: [new URL(productionUrl).hostname],
      }
    : undefined,
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: false,
  },
}

export default config
