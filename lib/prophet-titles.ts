export type Lang = 'fr' | 'ar' | 'en' | 'id' | 'ms'

export const SALAW = '(صلى الله عليه وسلم)'
export const ALAYHI_SALAM = '(عليه السلام)'

/** Display names per prophet — transliterated for Latin scripts, Arabic for ar */
const PROPHET_NAMES: Record<string, Record<Lang, string>> = {
  adam: { fr: 'Adam', en: 'Adam', ar: 'آدم', id: 'Adam', ms: 'Adam' },
  idris: { fr: 'Idrîs', en: 'Idris', ar: 'إدريس', id: 'Idris', ms: 'Idris' },
  nuh: { fr: 'Nûh', en: 'Nuh', ar: 'نوح', id: 'Nuh', ms: 'Nuh' },
  hud: { fr: 'Hûd', en: 'Hud', ar: 'هود', id: 'Hud', ms: 'Hud' },
  salih: { fr: 'Sâlih', en: 'Salih', ar: 'صالح', id: 'Salih', ms: 'Salih' },
  ibrahim: { fr: 'Ibrâhîm', en: 'Ibrahim', ar: 'إبراهيم', id: 'Ibrahim', ms: 'Ibrahim' },
  lut: { fr: 'Lût', en: 'Lut', ar: 'لوط', id: 'Lut', ms: 'Lut' },
  ismail: { fr: "Ismâ'îl", en: "Isma'il", ar: 'إسماعيل', id: "Isma'il", ms: "Isma'il" },
  ishaq: { fr: 'Ishâq', en: 'Ishaq', ar: 'إسحاق', id: 'Ishaq', ms: 'Ishaq' },
  yaqub: { fr: "Ya'qûb", en: "Ya'qub", ar: 'يعقوب', id: "Ya'qub", ms: "Ya'qub" },
  yusuf: { fr: 'Yûsuf', en: 'Yusuf', ar: 'يوسف', id: 'Yusuf', ms: 'Yusuf' },
  ayyub: { fr: 'Ayyûb', en: 'Ayyub', ar: 'أيوب', id: 'Ayyub', ms: 'Ayyub' },
  shuayb: { fr: "Shu'ayb", en: "Shu'ayb", ar: 'شعيب', id: "Shu'ayb", ms: "Shu'ayb" },
  musa: { fr: 'Mûsâ', en: 'Musa', ar: 'موسى', id: 'Musa', ms: 'Musa' },
  harun: { fr: 'Hârûn', en: 'Harun', ar: 'هارون', id: 'Harun', ms: 'Harun' },
  dhulkifl: { fr: 'Dhul-Kifl', en: 'Dhul-Kifl', ar: 'ذو الكفل', id: 'Dhul-Kifl', ms: 'Dhul-Kifl' },
  dawud: { fr: 'Dâwûd', en: 'Dawud', ar: 'داود', id: 'Dawud', ms: 'Dawud' },
  sulayman: { fr: 'Sulaymân', en: 'Sulayman', ar: 'سليمان', id: 'Sulayman', ms: 'Sulayman' },
  ilyas: { fr: 'Ilyâs', en: 'Ilyas', ar: 'إلياس', id: 'Ilyas', ms: 'Ilyas' },
  alyasa: { fr: "Al-Yasa'", en: "Al-Yasa'", ar: 'اليسع', id: "Al-Yasa'", ms: "Al-Yasa'" },
  yunus: { fr: 'Yûnus', en: 'Yunus', ar: 'يونس', id: 'Yunus', ms: 'Yunus' },
  zakariyya: { fr: 'Zakariyyâ', en: 'Zakariyya', ar: 'زكريا', id: 'Zakariyya', ms: 'Zakariyya' },
  yahya: { fr: 'Yahyâ', en: 'Yahya', ar: 'يحيى', id: 'Yahya', ms: 'Yahya' },
  isa: { fr: "'Îsâ", en: "'Isa", ar: 'عيسى', id: "'Isa", ms: "'Isa" },
  muhammad: { fr: 'Muhammad', en: 'Muhammad', ar: 'محمد', id: 'Muhammad', ms: 'Muhammad' },
}

/** Familiar French names shown as a reading aid after the Arabic honorific. */
const FRENCH_NAMES: Record<string, string> = {
  adam: 'Adam',
  idris: 'Idrîs',
  nuh: 'Noé',
  hud: 'Houd',
  salih: 'Sâlih',
  ibrahim: 'Abraham',
  lut: 'Loth',
  ismail: 'Ismaël',
  ishaq: 'Isaac',
  yaqub: 'Jacob',
  yusuf: 'Joseph',
  ayyub: 'Job',
  shuayb: "Shu'ayb",
  musa: 'Moïse',
  harun: 'Aaron',
  dhulkifl: 'Dhul-Kifl',
  dawud: 'David',
  sulayman: 'Salomon',
  ilyas: 'Élie',
  alyasa: 'Élisée',
  yunus: 'Jonas',
  zakariyya: 'Zacharie',
  yahya: 'Jean',
  isa: 'Jésus',
  muhammad: 'Mohammed',
}

const STORY_PREFIX: Record<Lang, string> = {
  fr: "L'histoire de",
  en: 'The story of',
  ar: 'قصة',
  id: 'Kisah',
  ms: 'Kisah',
}

const LIFE_PREFIX: Record<Lang, string> = {
  fr: 'La vie du Prophète',
  en: 'The life of Prophet',
  ar: 'حياة النبي',
  id: 'Kehidupan Nabi',
  ms: 'Kehidupan Nabi',
}

export function buildProphetTitle(prophetId: string, arabicName: string, lang: Lang): string {
  if (prophetId === 'muhammad') {
    if (lang === 'fr') return `${LIFE_PREFIX.fr} Muhammad ${SALAW.replace(/[()]/g, '')} (${FRENCH_NAMES.muhammad})`
    return `${LIFE_PREFIX[lang]} ${arabicName} ${SALAW}`
  }

  const name = PROPHET_NAMES[prophetId]?.[lang] ?? arabicName

  if (lang === 'ar') {
    return `${STORY_PREFIX.ar} ${arabicName} ${ALAYHI_SALAM}`
  }

  if (lang === 'fr') {
    return `${STORY_PREFIX.fr} ${name} ${ALAYHI_SALAM.replace(/[()]/g, '')} (${FRENCH_NAMES[prophetId] ?? name})`
  }

  return `${STORY_PREFIX[lang]} ${name} ${ALAYHI_SALAM}`
}
