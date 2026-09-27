import type { Lang } from '@/lib/i18n'

type SpeechError = 'permission' | 'unsupported' | 'microphone' | 'network' | 'start'

type Copy = {
  speech: Record<SpeechError, string>
}

const UI_COPY: Record<Lang, Copy> = {
  fr: { speech: {
    permission: 'Autorisation du microphone ou de la reconnaissance refusée',
    unsupported: 'Reconnaissance vocale non prise en charge par ce navigateur',
    microphone: 'Microphone inaccessible ou déjà utilisé',
    network: 'Connexion au service de reconnaissance vocale impossible',
    start: 'Impossible de démarrer la reconnaissance vocale',
  } },
  en: { speech: {
    permission: 'Microphone or speech recognition permission denied',
    unsupported: 'Speech recognition is not supported by this browser',
    microphone: 'Microphone unavailable or already in use',
    network: 'Unable to connect to the speech recognition service',
    start: 'Unable to start speech recognition',
  } },
  ar: { speech: {
    permission: 'تم رفض إذن الميكروفون أو التعرّف على الكلام',
    unsupported: 'هذا المتصفح لا يدعم التعرّف على الكلام',
    microphone: 'الميكروفون غير متاح أو قيد الاستخدام',
    network: 'تعذّر الاتصال بخدمة التعرّف على الكلام',
    start: 'تعذّر بدء التعرّف على الكلام',
  } },
  id: { speech: {
    permission: 'Izin mikrofon atau pengenalan suara ditolak',
    unsupported: 'Pengenalan suara tidak didukung oleh browser ini',
    microphone: 'Mikrofon tidak tersedia atau sedang digunakan',
    network: 'Tidak dapat terhubung ke layanan pengenalan suara',
    start: 'Tidak dapat memulai pengenalan suara',
  } },
  ms: { speech: {
    permission: 'Kebenaran mikrofon atau pengecaman suara ditolak',
    unsupported: 'Pengecaman suara tidak disokong oleh pelayar ini',
    microphone: 'Mikrofon tidak tersedia atau sedang digunakan',
    network: 'Tidak dapat menyambung kepada perkhidmatan pengecaman suara',
    start: 'Tidak dapat memulakan pengecaman suara',
  } },
}

export function speechErrorText(lang: Lang, error: SpeechError) {
  return UI_COPY[lang].speech[error]
}
