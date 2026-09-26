export type Letter = {
  id: string
  glyph: string
  name: string
  translit: string
  sound: string
  initial: string
  medial: string
  final: string
}

// The 28 Arabic letters with their positional forms.
export const LETTERS: Letter[] = [
  { id: 'alif', glyph: 'ا', name: 'Alif', translit: 'ʾalif', sound: 'a', initial: 'ﺍ', medial: 'ﺎ', final: 'ﺎ' },
  { id: 'ba', glyph: 'ب', name: 'Ba', translit: 'bāʾ', sound: 'b', initial: 'ﺑ', medial: 'ﺒ', final: 'ﺐ' },
  { id: 'ta', glyph: 'ت', name: 'Ta', translit: 'tāʾ', sound: 't', initial: 'ﺗ', medial: 'ﺘ', final: 'ﺖ' },
  { id: 'tha', glyph: 'ث', name: 'Tha', translit: 'ṯāʾ', sound: 'th', initial: 'ﺛ', medial: 'ﺜ', final: 'ﺚ' },
  { id: 'jim', glyph: 'ج', name: 'Jim', translit: 'ǧīm', sound: 'j', initial: 'ﺟ', medial: 'ﺠ', final: 'ﺞ' },
  { id: 'ha', glyph: 'ح', name: 'Ha', translit: 'ḥāʾ', sound: 'ḥ', initial: 'ﺣ', medial: 'ﺤ', final: 'ﺢ' },
  { id: 'kha', glyph: 'خ', name: 'Kha', translit: 'ḫāʾ', sound: 'kh', initial: 'ﺧ', medial: 'ﺨ', final: 'ﺦ' },
  { id: 'dal', glyph: 'د', name: 'Dal', translit: 'dāl', sound: 'd', initial: 'ﺩ', medial: 'ﺪ', final: 'ﺪ' },
  { id: 'dhal', glyph: 'ذ', name: 'Dhal', translit: 'ḏāl', sound: 'dh', initial: 'ﺫ', medial: 'ﺬ', final: 'ﺬ' },
  { id: 'ra', glyph: 'ر', name: 'Ra', translit: 'rāʾ', sound: 'r', initial: 'ﺭ', medial: 'ﺮ', final: 'ﺮ' },
  { id: 'zay', glyph: 'ز', name: 'Zay', translit: 'zāy', sound: 'z', initial: 'ﺯ', medial: 'ﺰ', final: 'ﺰ' },
  { id: 'sin', glyph: 'س', name: 'Sin', translit: 'sīn', sound: 's', initial: 'ﺳ', medial: 'ﺴ', final: 'ﺲ' },
  { id: 'shin', glyph: 'ش', name: 'Shin', translit: 'šīn', sound: 'sh', initial: 'ﺷ', medial: 'ﺸ', final: 'ﺶ' },
  { id: 'sad', glyph: 'ص', name: 'Sad', translit: 'ṣād', sound: 'ṣ', initial: 'ﺻ', medial: 'ﺼ', final: 'ﺺ' },
  { id: 'dad', glyph: 'ض', name: 'Dad', translit: 'ḍād', sound: 'ḍ', initial: 'ﺿ', medial: 'ﻀ', final: 'ﺾ' },
  { id: 'taa', glyph: 'ط', name: 'Ta', translit: 'ṭāʾ', sound: 'ṭ', initial: 'ﻃ', medial: 'ﻄ', final: 'ﻂ' },
  { id: 'zaa', glyph: 'ظ', name: 'Za', translit: 'ẓāʾ', sound: 'ẓ', initial: 'ﻇ', medial: 'ﻈ', final: 'ﻆ' },
  { id: 'ayn', glyph: 'ع', name: 'Ayn', translit: 'ʿayn', sound: 'ʿ', initial: 'ﻋ', medial: 'ﻌ', final: 'ﻊ' },
  { id: 'ghayn', glyph: 'غ', name: 'Ghayn', translit: 'ġayn', sound: 'gh', initial: 'ﻏ', medial: 'ﻐ', final: 'ﻎ' },
  { id: 'fa', glyph: 'ف', name: 'Fa', translit: 'fāʾ', sound: 'f', initial: 'ﻓ', medial: 'ﻔ', final: 'ﻒ' },
  { id: 'qaf', glyph: 'ق', name: 'Qaf', translit: 'qāf', sound: 'q', initial: 'ﻗ', medial: 'ﻘ', final: 'ﻖ' },
  { id: 'kaf', glyph: 'ك', name: 'Kaf', translit: 'kāf', sound: 'k', initial: 'ﻛ', medial: 'ﻜ', final: 'ﻚ' },
  { id: 'lam', glyph: 'ل', name: 'Lam', translit: 'lām', sound: 'l', initial: 'ﻟ', medial: 'ﻠ', final: 'ﻞ' },
  { id: 'mim', glyph: 'م', name: 'Mim', translit: 'mīm', sound: 'm', initial: 'ﻣ', medial: 'ﻤ', final: 'ﻢ' },
  { id: 'nun', glyph: 'ن', name: 'Nun', translit: 'nūn', sound: 'n', initial: 'ﻧ', medial: 'ﻨ', final: 'ﻦ' },
  { id: 'ha2', glyph: 'ه', name: 'Ha', translit: 'hāʾ', sound: 'h', initial: 'ﻫ', medial: 'ﻬ', final: 'ﻪ' },
  { id: 'waw', glyph: 'و', name: 'Waw', translit: 'wāw', sound: 'w', initial: 'ﻭ', medial: 'ﻮ', final: 'ﻮ' },
  { id: 'ya', glyph: 'ي', name: 'Ya', translit: 'yāʾ', sound: 'y', initial: 'ﻳ', medial: 'ﻴ', final: 'ﻲ' },
]

export type VowelRule = {
  id: string
  title: { fr: string; ar: string; en: string }
  sign: string
  example: string
  exampleTranslit: string
  explanation: { fr: string; ar: string; en: string }
}

export const SHORT_VOWELS: VowelRule[] = [
  {
    id: 'fatha',
    title: { fr: 'La Fatha', ar: 'الفَتْحَة', en: 'The Fatha' },
    sign: 'بَ',
    example: 'بَ',
    exampleTranslit: 'ba',
    explanation: {
      fr: "Un petit trait au-dessus de la lettre. Il donne le son « a » court.",
      ar: 'شَرطة صغيرة فوق الحرف تُعطي صوت الفتح القصير « a ».',
      en: 'A small stroke above the letter. It gives a short "a" sound.',
    },
  },
  {
    id: 'kasra',
    title: { fr: 'La Kasra', ar: 'الكَسْرَة', en: 'The Kasra' },
    sign: 'بِ',
    example: 'بِ',
    exampleTranslit: 'bi',
    explanation: {
      fr: 'Un petit trait sous la lettre. Il donne le son « i » court.',
      ar: 'شَرطة صغيرة تحت الحرف تُعطي صوت الكسر القصير « i ».',
      en: 'A small stroke below the letter. It gives a short "i" sound.',
    },
  },
  {
    id: 'damma',
    title: { fr: 'La Damma', ar: 'الضَّمَّة', en: 'The Damma' },
    sign: 'بُ',
    example: 'بُ',
    exampleTranslit: 'bu',
    explanation: {
      fr: 'Une petite boucle au-dessus de la lettre. Elle donne le son « ou » court.',
      ar: 'واو صغيرة فوق الحرف تُعطي صوت الضم القصير « u ».',
      en: 'A small loop above the letter. It gives a short "u" sound.',
    },
  },
  {
    id: 'sukun',
    title: { fr: 'Le Soukoun', ar: 'السُّكُون', en: 'The Sukun' },
    sign: 'بْ',
    example: 'بْ',
    exampleTranslit: 'b',
    explanation: {
      fr: "Un petit cercle au-dessus de la lettre. Il indique qu'aucune voyelle ne suit la consonne.",
      ar: 'دائرة صغيرة فوق الحرف تدل على عدم وجود حركة بعد الحرف.',
      en: 'A small circle above the letter. It shows that no vowel follows the consonant.',
    },
  },
]

export const LONG_VOWELS: VowelRule[] = [
  {
    id: 'alif-madd',
    title: { fr: 'Madd avec Alif', ar: 'المدّ بالألف', en: 'Madd with Alif' },
    sign: 'بَا',
    example: 'بَا',
    exampleTranslit: 'bā',
    explanation: {
      fr: "Une Fatha suivie d'un Alif allonge le son « a » (aa).",
      ar: 'فتحة يتبعها ألف تُطيل صوت « aa ».',
      en: 'A Fatha followed by Alif lengthens the "a" sound (aa).',
    },
  },
  {
    id: 'ya-madd',
    title: { fr: 'Madd avec Ya', ar: 'المدّ بالياء', en: 'Madd with Ya' },
    sign: 'بِي',
    example: 'بِي',
    exampleTranslit: 'bī',
    explanation: {
      fr: "Une Kasra suivie d'un Ya allonge le son « i » (ii).",
      ar: 'كسرة يتبعها ياء تُطيل صوت « ii ».',
      en: 'A Kasra followed by Ya lengthens the "i" sound (ii).',
    },
  },
  {
    id: 'waw-madd',
    title: { fr: 'Madd avec Waw', ar: 'المدّ بالواو', en: 'Madd with Waw' },
    sign: 'بُو',
    example: 'بُو',
    exampleTranslit: 'bū',
    explanation: {
      fr: "Une Damma suivie d'un Waw allonge le son « ou » (ou).",
      ar: 'ضمة يتبعها واو تُطيل صوت « uu ».',
      en: 'A Damma followed by Waw lengthens the "u" sound (uu).',
    },
  },
]

export const TANWIN: VowelRule[] = [
  {
    id: 'tanwin-fath',
    title: { fr: 'Tanwin Fath', ar: 'تنوين الفتح', en: 'Tanwin Fath' },
    sign: 'بًا',
    example: 'بًا',
    exampleTranslit: 'ban',
    explanation: {
      fr: 'Double Fatha : ajoute le son « an » à la fin du mot.',
      ar: 'فتحتان تُضيفان صوت « an » في آخر الكلمة.',
      en: 'Double Fatha: adds an "an" sound at the end of the word.',
    },
  },
  {
    id: 'tanwin-kasr',
    title: { fr: 'Tanwin Kasr', ar: 'تنوين الكسر', en: 'Tanwin Kasr' },
    sign: 'بٍ',
    example: 'بٍ',
    exampleTranslit: 'bin',
    explanation: {
      fr: 'Double Kasra : ajoute le son « ine » à la fin du mot.',
      ar: 'كسرتان تُضيفان صوت « in » في آخر الكلمة.',
      en: 'Double Kasra: adds an "in" sound at the end of the word.',
    },
  },
  {
    id: 'tanwin-damm',
    title: { fr: 'Tanwin Damm', ar: 'تنوين الضم', en: 'Tanwin Damm' },
    sign: 'بٌ',
    example: 'بٌ',
    exampleTranslit: 'bun',
    explanation: {
      fr: 'Double Damma : ajoute le son « oun » à la fin du mot.',
      ar: 'ضمتان تُضيفان صوت « un » في آخر الكلمة.',
      en: 'Double Damma: adds an "un" sound at the end of the word.',
    },
  },
]

export type Level = {
  id: string
  title: { fr: string; ar: string; en: string }
  blockId: 'reading' | 'phrases' | 'literary' | 'quran'
  unitCount: number
  unitLabel: { fr: string; ar: string; en: string }
}

export const LEVELS: Level[] = [
  {
    id: 'l1',
    title: { fr: 'Alphabet et lecture', ar: 'الأبجدية والقراءة', en: 'Alphabet and reading' },
    blockId: 'reading',
    unitCount: 7,
    unitLabel: { fr: 'étapes · 6 avec validation', ar: 'مراحل · ٦ مع التحقق', en: 'steps · 6 with validation' },
  },
  {
    id: 'l2',
    title: { fr: 'Premiers mots et premières phrases', ar: 'الكلمات والجمل الأولى', en: 'First words and phrases' },
    blockId: 'phrases',
    unitCount: 2,
    unitLabel: { fr: 'thèmes · 5 leçons guidées', ar: 'موضوعان · ٥ دروس موجهة', en: 'themes · 5 guided lessons' },
  },
  {
    id: 'l3',
    title: { fr: 'Communiquer en arabe littéraire', ar: 'التواصل بالعربية الفصحى', en: 'Communicate in literary Arabic' },
    blockId: 'literary',
    unitCount: 8,
    unitLabel: { fr: 'chapitres disponibles', ar: 'فصول متاحة', en: 'available chapters' },
  },
  {
    id: 'l4',
    title: { fr: 'Comprendre le Coran', ar: 'فهم القرآن', en: 'Understand the Quran' },
    blockId: 'quran',
    unitCount: 0,
    unitLabel: { fr: 'contenu en préparation', ar: 'المحتوى قيد الإعداد', en: 'content in preparation' },
  },
]

export type LearnTopic = {
  id: string
  icon: string
  titleKey: string
  subKey: string
  progress: number
  accent: string
}

export const LEARN_TOPICS: LearnTopic[] = [
  { id: 'alphabet', icon: 'Type', titleKey: 'learn.alphabet', subKey: 'learn.alphabetSub', progress: 0, accent: 'gold' },
  { id: 'positions', icon: 'MoveHorizontal', titleKey: 'learn.positions', subKey: 'learn.positionsSub', progress: 0, accent: 'sky' },
  { id: 'short-vowels', icon: 'Sparkles', titleKey: 'learn.shortVowels', subKey: 'learn.shortVowelsSub', progress: 0, accent: 'teal' },
  { id: 'long-vowels', icon: 'Waves', titleKey: 'learn.longVowels', subKey: 'learn.longVowelsSub', progress: 0, accent: 'violet' },
  { id: 'tanwin', icon: 'Layers', titleKey: 'learn.tanwin', subKey: 'learn.tanwinSub', progress: 0, accent: 'rose' },
  { id: 'shadda', icon: 'Sparkles', titleKey: 'learn.shadda', subKey: 'learn.shaddaSub', progress: 0, accent: 'gold' },
  { id: 'vocabulary', icon: 'MessagesSquare', titleKey: 'learn.vocabulary', subKey: 'learn.vocabularySub', progress: 0, accent: 'teal' },
  { id: 'grammar', icon: 'SpellCheck', titleKey: 'learn.grammar', subKey: 'learn.grammarSub', progress: 0, accent: 'violet' },
]

// Arabic diacritics (harakat) for composing vowelled forms on any letter.
export const HARAKAT = {
  fatha: '\u064E', // َ  → a
  damma: '\u064F', // ُ  → u
  kasra: '\u0650', // ِ  → i
  sukun: '\u0652', // ْ  → no vowel
  tanwinFath: '\u064B', // ً → an
  tanwinDamm: '\u064C', // ٌ → un
  tanwinKasr: '\u064D', // ٍ → in
  alif: '\u0627', // ا
  waw: '\u0648', // و
  ya: '\u064A', // ي
} as const

export const WEEK_ACTIVITY = [
  { day: 'L', value: 0 },
  { day: 'M', value: 0 },
  { day: 'M', value: 0 },
  { day: 'J', value: 0 },
  { day: 'V', value: 0 },
  { day: 'S', value: 0 },
  { day: 'D', value: 0 },
]

export const ACHIEVEMENTS = [
  { id: 'a1', icon: 'Flame', label: { fr: 'Série de 7 jours', ar: 'سلسلة ٧ أيام', en: '7-day streak' }, unlocked: false },
  { id: 'a2', icon: 'Star', label: { fr: 'Alphabet maîtrisé', ar: 'إتقان الحروف', en: 'Alphabet mastered' }, unlocked: false },
  { id: 'a3', icon: 'Award', label: { fr: '10 leçons terminées', ar: 'إتمام ١٠ دروس', en: '10 lessons completed' }, unlocked: false },
  { id: 'a4', icon: 'Trophy', label: { fr: 'Lecteur', ar: 'قارئ', en: 'Reader' }, unlocked: false },
]

export const SKILLS = [
  { id: 's1', label: { fr: 'Lecture', ar: 'القراءة', en: 'Reading' }, value: 0 },
  { id: 's2', label: { fr: 'Écoute', ar: 'الاستماع', en: 'Listening' }, value: 0 },
  { id: 's3', label: { fr: 'Prononciation', ar: 'النطق', en: 'Pronunciation' }, value: 0 },
  { id: 's4', label: { fr: 'Écriture', ar: 'الكتابة', en: 'Writing' }, value: 0 },
]

// Multiple-choice quiz: identify the letter from its sound / name.
export type QuizQuestion = {
  id: string
  promptGlyph: string
  promptTranslit: string
  options: { glyph: string; translit: string }[]
  answerIndex: number
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    promptGlyph: 'ب',
    promptTranslit: 'bāʾ',
    options: [
      { glyph: 'ت', translit: 'tāʾ' },
      { glyph: 'ب', translit: 'bāʾ' },
      { glyph: 'ن', translit: 'nūn' },
      { glyph: 'ث', translit: 'ṯāʾ' },
    ],
    answerIndex: 1,
  },
  {
    id: 'q2',
    promptGlyph: 'م',
    promptTranslit: 'mīm',
    options: [
      { glyph: 'م', translit: 'mīm' },
      { glyph: 'ه', translit: 'hāʾ' },
      { glyph: 'ع', translit: 'ʿayn' },
      { glyph: 'ح', translit: 'ḥāʾ' },
    ],
    answerIndex: 0,
  },
  {
    id: 'q3',
    promptGlyph: 'س',
    promptTranslit: 'sīn',
    options: [
      { glyph: 'ش', translit: 'šīn' },
      { glyph: 'ص', translit: 'ṣād' },
      { glyph: 'س', translit: 'sīn' },
      { glyph: 'ز', translit: 'zāy' },
    ],
    answerIndex: 2,
  },
  {
    id: 'q4',
    promptGlyph: 'ك',
    promptTranslit: 'kāf',
    options: [
      { glyph: 'ل', translit: 'lām' },
      { glyph: 'ق', translit: 'qāf' },
      { glyph: 'ف', translit: 'fāʾ' },
      { glyph: 'ك', translit: 'kāf' },
    ],
    answerIndex: 3,
  },
]

export type Hadith = {
  id: string
  arabic: string
  translation: { fr: string; ar: string; en: string }
  narrator: { fr: string; ar: string; en: string }
  source: string
  sourceUrl: string
  referenceDetails?: string
  grade: { fr: string; ar: string; en: string }
  details?: string
}

// Original short catalogue of hadiths on learning and reciting the Qur'an.
const ORIGINAL_HADITHS: Hadith[] = [
  {
    id: 'h1',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: {
      fr: "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne.",
      ar: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.',
      en: 'The best of you are those who learn the Qur’an and teach it.',
    },
    narrator: { fr: '‘Uthman ibn ‘Affan', ar: 'عثمان بن عفّان', en: '‘Uthman ibn ‘Affan' },
    source: 'Sahih al-Bukhari 5027',
    sourceUrl: 'https://sunnah.com/bukhari:5027',
    referenceDetails: 'Sunnah.com · Livre 66 · Hadith interne 49',
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
  {
    id: 'h2',
    arabic:
      'اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ',
    translation: {
      fr: 'Récitez le Coran, car il viendra le Jour de la Résurrection intercéder en faveur de ses compagnons.',
      ar: 'اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ.',
      en: 'Recite the Qur’an, for it will come on the Day of Resurrection as an intercessor for its companions.',
    },
    narrator: { fr: 'Abu Umama al-Bahili', ar: 'أبو أُمامة الباهلي', en: 'Abu Umama al-Bahili' },
    source: 'Sahih Muslim 804a',
    sourceUrl: 'https://sunnah.com/muslim:804a',
    referenceDetails: 'Sunnah.com · Livre 6 · Hadith interne 302',
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
  {
    id: 'h3',
    arabic:
      'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ، وَالَّذِي يَقْرَأُ الْقُرْآنَ وَيَتَتَعْتَعُ فِيهِ وَهُوَ عَلَيْهِ شَاقٌّ لَهُ أَجْرَانِ',
    translation: {
      fr: "Celui qui maîtrise le Coran sera avec les nobles scribes vertueux ; et celui qui le récite en hésitant, avec difficulté, aura une double récompense.",
      ar: 'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ، وَالَّذِي يَقْرَأُ الْقُرْآنَ وَيَتَتَعْتَعُ فِيهِ وَهُوَ عَلَيْهِ شَاقٌّ لَهُ أَجْرَانِ.',
      en: 'The one proficient in the Qur’an is with the noble, righteous scribes; and the one who recites it haltingly, finding it difficult, has a double reward.',
    },
    narrator: { fr: '‘A’isha', ar: 'عائشة رضي الله عنها', en: '‘A’isha' },
    source: 'Sahih al-Bukhari 4937 · Muslim 798',
    sourceUrl: 'https://sunnah.com/muslim:798a',
    referenceDetails: 'Sunnah.com · Muslim 798a · Livre 6 · Hadith interne 290',
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
  {
    id: 'h4',
    arabic:
      'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
    translation: {
      fr: "Quiconque lit une seule lettre du Livre d'Allah obtient une bonne action, et chaque bonne action vaut dix fois sa valeur.",
      ar: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا.',
      en: 'Whoever reads a single letter from the Book of Allah earns a good deed, and each good deed is multiplied tenfold.',
    },
    narrator: { fr: '‘Abd Allah ibn Mas‘ud', ar: 'عبد الله بن مسعود', en: '‘Abd Allah ibn Mas‘ud' },
    source: 'Jami‘ at-Tirmidhi 2910',
    sourceUrl: 'https://sunnah.com/tirmidhi:2910',
    referenceDetails: 'Sunnah.com · Livre 45 · Hadith interne 36',
    grade: { fr: 'Hasan selon Darussalam', ar: 'حسن', en: 'Hasan (Darussalam)' },
  },
  {
    id: 'h5',
    arabic:
      'مَثَلُ الْمُؤْمِنِ الَّذِي يَقْرَأُ الْقُرْآنَ كَمَثَلِ الْأُتْرُجَّةِ، رِيحُهَا طَيِّبٌ وَطَعْمُهَا طَيِّبٌ',
    translation: {
      fr: "L'exemple du croyant qui récite le Coran est celui du cédrat : son odeur est agréable et son goût est agréable.",
      ar: 'مَثَلُ الْمُؤْمِنِ الَّذِي يَقْرَأُ الْقُرْآنَ كَمَثَلِ الْأُتْرُجَّةِ، رِيحُهَا طَيِّبٌ وَطَعْمُهَا طَيِّبٌ.',
      en: 'The likeness of a believer who recites the Qur’an is that of a citron: its fragrance is sweet and its taste is sweet.',
    },
    narrator: { fr: 'Abu Musa al-Ash‘ari', ar: 'أبو موسى الأشعري', en: 'Abu Musa al-Ash‘ari' },
    source: 'Sahih al-Bukhari 5020 · Muslim 797',
    sourceUrl: 'https://sunnah.com/muslim:797a',
    referenceDetails: 'Sunnah.com · Muslim 797a · Livre 6 · Hadith interne 288',
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
  {
    id: 'h6',
    arabic: 'إِنَّمَا مَثَلُ صَاحِبِ الْقُرْآنِ كَمَثَلِ صَاحِبِ الْإِبِلِ الْمُعَقَّلَةِ، إِنْ عَاهَدَ عَلَيْهَا أَمْسَكَهَا، وَإِنْ أَطْلَقَهَا ذَهَبَتْ',
    translation: {
      fr: "Celui qui connaît le Coran est comparable au propriétaire de chameaux attachés : s’il les surveille, il les garde ; s’il les relâche, ils s’en vont.",
      ar: 'إِنَّمَا مَثَلُ صَاحِبِ الْقُرْآنِ كَمَثَلِ صَاحِبِ الْإِبِلِ الْمُعَقَّلَةِ، إِنْ عَاهَدَ عَلَيْهَا أَمْسَكَهَا، وَإِنْ أَطْلَقَهَا ذَهَبَتْ.',
      en: 'The example of the person who knows the Qur’an is like the owner of tied camels: if he keeps them tied, he retains control over them; if he lets them loose, they escape.',
    },
    narrator: { fr: '‘Abd Allah ibn ‘Umar', ar: 'عبد الله بن عمر', en: '‘Abd Allah ibn ‘Umar' },
    source: 'Sahih al-Bukhari 5031',
    sourceUrl: 'https://sunnah.com/bukhari:5031',
    referenceDetails: 'Sunnah.com · Livre 66 · Hadith interne 53',
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
  {
    id: 'h7',
    arabic: 'وَمَا اجْتَمَعَ قَوْمٌ فِي بَيْتٍ مِنْ بُيُوتِ اللَّهِ يَتْلُونَ كِتَابَ اللَّهِ وَيَتَدَارَسُونَهُ بَيْنَهُمْ، إِلَّا نَزَلَتْ عَلَيْهِمُ السَّكِينَةُ، وَغَشِيَتْهُمُ الرَّحْمَةُ، وَحَفَّتْهُمُ الْمَلَائِكَةُ، وَذَكَرَهُمُ اللَّهُ فِيمَنْ عِنْدَهُ',
    translation: {
      fr: "Lorsque des gens se réunissent dans une maison d’Allah, récitent Son Livre et l’étudient ensemble, la sérénité descend sur eux, la miséricorde les couvre, les anges les entourent et Allah les mentionne auprès de ceux qui sont auprès de Lui.",
      ar: 'وَمَا اجْتَمَعَ قَوْمٌ فِي بَيْتٍ مِنْ بُيُوتِ اللَّهِ يَتْلُونَ كِتَابَ اللَّهِ وَيَتَدَارَسُونَهُ بَيْنَهُمْ، إِلَّا نَزَلَتْ عَلَيْهِمُ السَّكِينَةُ، وَغَشِيَتْهُمُ الرَّحْمَةُ، وَحَفَّتْهُمُ الْمَلَائِكَةُ، وَذَكَرَهُمُ اللَّهُ فِيمَنْ عِنْدَهُ.',
      en: 'When people gather in one of the houses of Allah, reciting and studying the Book of Allah together, tranquility descends upon them, mercy covers them, the angels surround them, and Allah mentions them to those who are with Him.',
    },
    narrator: { fr: 'Abu Hurayra', ar: 'أبو هريرة', en: 'Abu Hurayra' },
    source: 'Sahih Muslim 2699a',
    sourceUrl: 'https://sunnah.com/muslim:2699a',
    referenceDetails: 'Sunnah.com · Livre 48 · Hadith interne 48',
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
  {
    id: 'h8',
    arabic: 'اقْرَأْ فُلَانُ، فَإِنَّهَا السَّكِينَةُ تَنَزَّلَتْ عِنْدَ الْقُرْآنِ، أَوْ تَنَزَّلَتْ لِلْقُرْآنِ',
    translation: {
      fr: 'Continue à réciter, car c’était la sérénité qui descendait lors de la récitation du Coran — ou à cause du Coran.',
      ar: 'اقْرَأْ فُلَانُ، فَإِنَّهَا السَّكِينَةُ تَنَزَّلَتْ عِنْدَ الْقُرْآنِ، أَوْ تَنَزَّلَتْ لِلْقُرْآنِ.',
      en: 'Continue reciting, for it was tranquility that descended at the recitation of the Qur’an, or because of the Qur’an.',
    },
    narrator: { fr: 'Al-Bara ibn ‘Azib', ar: 'البراء بن عازب', en: 'Al-Bara ibn ‘Azib' },
    source: 'Sahih Muslim 795b',
    sourceUrl: 'https://sunnah.com/muslim:795b',
    referenceDetails: 'Sunnah.com · Livre 6 · Hadith interne 285',
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
]

// Nothing is published until the source, exact wording and grading have been
// reviewed and explicitly approved.
const verifiedHadith = (
  id: string,
  arabic: string,
  french: string,
  narrator: string,
  source: string,
  details: string,
): Hadith => ({
  id,
  arabic,
  translation: { fr: french, ar: arabic, en: french },
  narrator: { fr: narrator, ar: narrator, en: narrator },
  source,
  sourceUrl: `https://sunnah.com/${source.startsWith('Sahih al-Bukhari') ? 'bukhari' : 'muslim'}:${source.split(' ').at(-1)}`,
  grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  details,
})

const RETIRED_EXTENDED_HADITHS: Hadith[] = [
  verifiedHadith('b5009', 'مَنْ قَرَأَ بِالآيَتَيْنِ مِنْ آخِرِ سُورَةِ الْبَقَرَةِ فِي لَيْلَةٍ كَفَتَاهُ', 'Celui qui récite, pendant la nuit, les deux derniers versets de la sourate Al-Baqara, ceux-ci lui suffiront.', 'Abu Mas‘ud رضي الله عنه', 'Sahih al-Bukhari 5009', 'Ce hadith établit le mérite particulier des deux derniers versets de la sourate Al-Baqara lorsqu’ils sont récités la nuit.'),
  verifiedHadith('b5010', 'وَكَّلَنِي رَسُولُ اللَّهِ صلى الله عليه وسلم بِحِفْظِ زَكَاةِ رَمَضَانَ فَأَتَانِي آتٍ فَجَعَلَ يَحْثُو مِنَ الطَّعَامِ فَأَخَذْتُهُ فَقُلْتُ لَأَرْفَعَنَّكَ إِلَى رَسُولِ اللَّهِ صلى الله عليه وسلم فَقَصَّ الْحَدِيثَ فَقَالَ إِذَا أَوَيْتَ إِلَى فِرَاشِكَ فَاقْرَأْ آيَةَ الْكُرْسِيِّ لَنْ يَزَالَ مَعَكَ مِنَ اللَّهِ حَافِظٌ وَلَا يَقْرَبُكَ شَيْطَانٌ حَتَّى تُصْبِحَ وَقَالَ النَّبِيُّ صلى الله عليه وسلم صَدَقَكَ وَهُوَ كَذُوبٌ ذَاكَ شَيْطَانٌ', 'Le Messager d’Allah me chargea de garder les biens de la zakat de Ramadan. Quelqu’un vint prendre de la nourriture. Je le saisis et lui dis que je le conduirais devant le Messager d’Allah. Dans la suite du récit, il me dit : « Lorsque tu te couches, récite le verset du Trône. Un gardien venant d’Allah demeurera auprès de toi et aucun démon ne t’approchera jusqu’au matin. » Le Prophète dit ensuite : « Il t’a dit vrai bien qu’il soit un grand menteur : c’était un démon. »', 'Abu Hurayra رضي الله عنه', 'Sahih al-Bukhari 5010', 'Contexte rapporté par le hadith : Abu Hurayra gardait la zakat alimentaire de Ramadan lorsqu’un individu vint y puiser. L’extrait de Bukhari résume une partie de leurs échanges, puis rapporte le conseil relatif au verset du Trône et l’explication donnée par le Prophète.'),
  verifiedHadith('b5015', 'اللَّهُ الْوَاحِدُ الصَّمَدُ ثُلُثُ الْقُرْآنِ', 'La sourate qui proclame Allah, l’Unique, Celui dont tous dépendent, équivaut au tiers du Coran.', 'Abu Sa‘id al-Khudri رضي الله عنه', 'Sahih al-Bukhari 5015', 'Le hadith expose le mérite immense de la sourate Al-Ikhlas. Il ne signifie pas qu’elle remplace toutes les obligations de lecture ou l’ensemble des enseignements du Coran.'),
  verifiedHadith('b5017', 'كَانَ إِذَا أَوَى إِلَى فِرَاشِهِ كُلَّ لَيْلَةٍ جَمَعَ كَفَّيْهِ ثُمَّ نَفَثَ فِيهِمَا فَقَرَأَ فِيهِمَا قُلْ هُوَ اللَّهُ أَحَدٌ وَقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ وَقُلْ أَعُوذُ بِرَبِّ النَّاسِ ثُمَّ يَمْسَحُ بِهِمَا مَا اسْتَطَاعَ مِنْ جَسَدِهِ يَفْعَلُ ذَلِكَ ثَلاَثَ مَرَّاتٍ', 'Chaque nuit, lorsqu’il se couchait, le Prophète réunissait ses mains, soufflait légèrement dedans, récitait Al-Ikhlas, Al-Falaq et An-Nas, puis passait ses mains sur son corps. Il le faisait trois fois.', '‘A’isha رضي الله عنها', 'Sahih al-Bukhari 5017', 'Ce hadith décrit précisément une pratique prophétique du coucher : réciter les trois sourates protectrices puis passer les mains sur le corps, trois fois.'),
  verifiedHadith('b5020', 'مَثَلُ الَّذِي يَقْرَأُ الْقُرْآنَ كَالْأُتْرُجَّةِ طَعْمُهَا طَيِّبٌ وَرِيحُهَا طَيِّبٌ وَالَّذِي لَا يَقْرَأُ الْقُرْآنَ كَالتَّمْرَةِ طَعْمُهَا طَيِّبٌ وَلَا رِيحَ لَهَا وَمَثَلُ الْفَاجِرِ الَّذِي يَقْرَأُ الْقُرْآنَ كَمَثَلِ الرَّيْحَانَةِ رِيحُهَا طَيِّبٌ وَطَعْمُهَا مُرٌّ وَمَثَلُ الْفَاجِرِ الَّذِي لَا يَقْرَأُ الْقُرْآنَ كَمَثَلِ الْحَنْظَلَةِ طَعْمُهَا مُرٌّ وَلَا رِيحَ لَهَا', 'Celui qui récite le Coran ressemble au cédrat : son goût et son parfum sont agréables. Celui qui ne récite pas le Coran ressemble à la datte : son goût est agréable, mais elle n’a pas de parfum. Le pervers qui récite le Coran ressemble au basilic : son parfum est agréable, mais son goût est amer. Le pervers qui ne récite pas le Coran ressemble à la coloquinte : son goût est amer et elle n’a pas de parfum.', 'Abu Musa al-Ash‘ari رضي الله عنه', 'Sahih al-Bukhari 5020', 'Le Prophète expose quatre situations au moyen de fruits et de plantes connus de ses auditeurs. Le goût illustre la réalité intérieure et le parfum l’effet perceptible de la récitation. Le texte transmis ici ne rapporte pas une circonstance particulière antérieure à cette parole.'),
  verifiedHadith('b5027', 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', 'Le meilleur d’entre vous est celui qui apprend le Coran et l’enseigne.', '‘Uthman ibn ‘Affan رضي الله عنه', 'Sahih al-Bukhari 5027', 'Ce texte associe le mérite de recevoir correctement l’enseignement du Coran à celui de le transmettre.'),
  verifiedHadith('b5031', 'إِنَّمَا مَثَلُ صَاحِبِ الْقُرْآنِ كَمَثَلِ صَاحِبِ الْإِبِلِ الْمُعَقَّلَةِ إِنْ عَاهَدَ عَلَيْهَا أَمْسَكَهَا وَإِنْ أَطْلَقَهَا ذَهَبَتْ', 'Celui qui connaît le Coran est comparable au propriétaire de chameaux attachés : s’il veille sur eux, il les conserve ; s’il les relâche, ils s’en vont.', '‘Abd Allah ibn ‘Umar رضي الله عنهما', 'Sahih al-Bukhari 5031', 'Cette comparaison enseigne que la mémorisation du Coran doit être entretenue par une révision régulière.'),
  verifiedHadith('b5033', 'تَعَاهَدُوا الْقُرْآنَ فَوَالَّذِي نَفْسِي بِيَدِهِ لَهُوَ أَشَدُّ تَفَصِّيًا مِنَ الْإِبِلِ فِي عُقُلِهَا', 'Révisez régulièrement le Coran. Par Celui qui détient mon âme, il s’échappe plus rapidement que les chameaux de leurs liens.', 'Abu Musa al-Ash‘ari رضي الله عنه', 'Sahih al-Bukhari 5033', 'Le Prophète insiste ici directement sur la révision continue afin de préserver ce qui a été mémorisé.'),
  verifiedHadith('b5049', 'اقْرَأْ عَلَيَّ الْقُرْآنَ قُلْتُ آقْرَأُ عَلَيْكَ وَعَلَيْكَ أُنْزِلَ قَالَ إِنِّي أُحِبُّ أَنْ أَسْمَعَهُ مِنْ غَيْرِي', 'Le Prophète me dit : « Récite-moi le Coran. » Je demandai : « Te le réciter alors qu’il t’a été révélé ? » Il répondit : « J’aime l’entendre récité par quelqu’un d’autre. »', '‘Abd Allah ibn Mas‘ud رضي الله عنه', 'Sahih al-Bukhari 5049', 'Le hadith montre qu’il est recommandé d’écouter attentivement la récitation d’autrui, même pour celui qui connaît déjà le texte.'),
  verifiedHadith('b5054', 'اقْرَإِ الْقُرْآنَ فِي شَهْرٍ قُلْتُ إِنِّي أَجِدُ قُوَّةً حَتَّى قَالَ فَاقْرَأْهُ فِي سَبْعٍ وَلَا تَزِدْ عَلَى ذَلِكَ', 'Récite le Coran en un mois. Comme je déclarai pouvoir davantage, il dit finalement : récite-le en sept jours et ne va pas au-delà de cette limite.', '‘Abd Allah ibn ‘Amr رضي الله عنهما', 'Sahih al-Bukhari 5054', 'Ce conseil appelle à une récitation régulière et réfléchie, sans précipitation excessive pour achever l’ensemble du Coran.'),

  verifiedHadith('m795b', 'قَرَأَ رَجُلٌ الْكَهْفَ وَفِي الدَّارِ دَابَّةٌ فَجَعَلَتْ تَنْفِرُ فَنَظَرَ فَإِذَا ضَبَابَةٌ أَوْ سَحَابَةٌ قَدْ غَشِيَتْهُ قَالَ فَذَكَرَ ذَلِكَ لِلنَّبِيِّ صلى الله عليه وسلم فَقَالَ اقْرَأْ فُلَانُ فَإِنَّهَا السَّكِينَةُ تَنَزَّلَتْ عِنْدَ الْقُرْآنِ أَوْ تَنَزَّلَتْ لِلْقُرْآنِ', 'Un homme récitait la sourate Al-Kahf alors qu’une bête se trouvait dans la maison et commença à s’agiter. Il regarda et vit une brume ou un nuage qui l’avait recouvert. Il le raconta au Prophète, qui lui dit : « Continue à réciter, car c’était la sérénité qui descendait lors de la récitation du Coran, ou en raison du Coran. »', 'Al-Bara’ ibn ‘Azib رضي الله عنه', 'Sahih Muslim 795b', 'Le contexte fait partie du hadith lui-même : la récitation d’Al-Kahf, l’agitation de l’animal et l’apparition d’une nuée précèdent l’explication prophétique concernant la sakina.'),
  verifiedHadith('m797a', 'مَثَلُ الْمُؤْمِنِ الَّذِي يَقْرَأُ الْقُرْآنَ مَثَلُ الْأُتْرُجَّةِ رِيحُهَا طَيِّبٌ وَطَعْمُهَا طَيِّبٌ وَمَثَلُ الْمُؤْمِنِ الَّذِي لَا يَقْرَأُ الْقُرْآنَ مَثَلُ التَّمْرَةِ لَا رِيحَ لَهَا وَطَعْمُهَا حُلْوٌ وَمَثَلُ الْمُنَافِقِ الَّذِي يَقْرَأُ الْقُرْآنَ مَثَلُ الرَّيْحَانَةِ رِيحُهَا طَيِّبٌ وَطَعْمُهَا مُرٌّ وَمَثَلُ الْمُنَافِقِ الَّذِي لَا يَقْرَأُ الْقُرْآنَ كَمَثَلِ الْحَنْظَلَةِ لَيْسَ لَهَا رِيحٌ وَطَعْمُهَا مُرٌّ', 'Le croyant qui récite le Coran ressemble au cédrat : son parfum et son goût sont agréables. Le croyant qui ne le récite pas ressemble à la datte : elle n’a pas de parfum, mais son goût est doux. L’hypocrite qui récite le Coran ressemble au basilic : son parfum est agréable, mais son goût est amer. L’hypocrite qui ne le récite pas ressemble à la coloquinte : elle n’a pas de parfum et son goût est amer.', 'Abu Musa al-Ash‘ari رضي الله عنه', 'Sahih Muslim 797a', 'Cette version complète de Muslim comporte quatre comparaisons. Elle expose la différence entre la foi intérieure, la récitation extérieure et l’effet produit. Aucun événement déclencheur particulier n’est indiqué dans cette transmission.'),
  verifiedHadith('m798a', 'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ وَالَّذِي يَقْرَأُ الْقُرْآنَ وَيَتَتَعْتَعُ فِيهِ وَهُوَ عَلَيْهِ شَاقٌّ لَهُ أَجْرَانِ', 'Celui qui maîtrise le Coran sera avec les nobles et vertueux messagers-scribes ; celui qui le récite avec hésitation et difficulté recevra deux récompenses.', '‘A’isha رضي الله عنها', 'Sahih Muslim 798a', 'Le débutant n’est pas découragé : sa récitation et l’effort qu’il fournit face à la difficulté lui valent deux récompenses.'),
  verifiedHadith('m803', 'خَرَجَ رَسُولُ اللَّهِ صلى الله عليه وسلم وَنَحْنُ فِي الصُّفَّةِ فَقَالَ أَيُّكُمْ يُحِبُّ أَنْ يَغْدُوَ كُلَّ يَوْمٍ إِلَى بُطْحَانَ أَوْ إِلَى الْعَقِيقِ فَيَأْتِيَ مِنْهُ بِنَاقَتَيْنِ كَوْمَاوَيْنِ فِي غَيْرِ إِثْمٍ وَلَا قَطْعِ رَحِمٍ فَقُلْنَا يَا رَسُولَ اللَّهِ نُحِبُّ ذَلِكَ قَالَ أَفَلَا يَغْدُو أَحَدُكُمْ إِلَى الْمَسْجِدِ فَيَعْلَمَ أَوْ يَقْرَأَ آيَتَيْنِ مِنْ كِتَابِ اللَّهِ عَزَّ وَجَلَّ خَيْرٌ لَهُ مِنْ نَاقَتَيْنِ وَثَلَاثٌ خَيْرٌ لَهُ مِنْ ثَلَاثٍ وَأَرْبَعٌ خَيْرٌ لَهُ مِنْ أَرْبَعٍ وَمِنْ أَعْدَادِهِنَّ مِنَ الْإِبِلِ', 'Le Messager d’Allah vint nous voir alors que nous étions auprès d’As-Suffa et demanda : « Lequel d’entre vous aimerait se rendre chaque matin à Buthan ou Al-‘Aqiq et en rapporter deux grandes chamelles sans commettre de péché ni rompre les liens de parenté ? » Nous répondîmes que nous le souhaiterions. Il dit : « Que l’un de vous se rende le matin à la mosquée pour apprendre ou réciter deux versets du Livre d’Allah est meilleur que deux chamelles ; trois versets sont meilleurs que trois, quatre meilleurs que quatre, et ainsi de suite selon leur nombre. »', '‘Uqba ibn ‘Amir رضي الله عنه', 'Sahih Muslim 803', 'Le hadith situe la parole auprès des gens d’As-Suffa. Le Prophète part d’un bien matériel très précieux pour ses auditeurs afin de leur faire comprendre la valeur supérieure de l’apprentissage et de la récitation.'),
  verifiedHadith('m804a', 'اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ', 'Récitez le Coran, car il viendra au Jour de la Résurrection intercéder en faveur de ceux qui l’accompagnent.', 'Abu Umama al-Bahili رضي الله عنه', 'Sahih Muslim 804a', 'Il s’agit du début d’un hadith plus long qui mentionne ensuite particulièrement les sourates Al-Baqara et Al ‘Imran.'),
  verifiedHadith('m805', 'يُؤْتَى بِالْقُرْآنِ يَوْمَ الْقِيَامَةِ وَأَهْلِهِ الَّذِينَ كَانُوا يَعْمَلُونَ بِهِ تَقْدُمُهُ سُورَةُ الْبَقَرَةِ وَآلُ عِمْرَانَ', 'Au Jour de la Résurrection, on fera venir le Coran et ceux qui le mettaient en pratique, précédés par les sourates Al-Baqara et Al ‘Imran.', 'An-Nawwas ibn Sam‘an رضي الله عنه', 'Sahih Muslim 805', 'Le mérite mentionné est associé aux gens qui récitaient le Coran et agissaient conformément à ses enseignements.'),
  verifiedHadith('m806', 'أَبْشِرْ بِنُورَيْنِ أُوتِيتَهُمَا لَمْ يُؤْتَهُمَا نَبِيٌّ قَبْلَكَ فَاتِحَةُ الْكِتَابِ وَخَوَاتِيمُ سُورَةِ الْبَقَرَةِ', 'Réjouis-toi de deux lumières qui t’ont été accordées et qui ne furent accordées à aucun prophète avant toi : l’ouverture du Livre et les derniers versets d’Al-Baqara.', '‘Abd Allah ibn ‘Abbas رضي الله عنهما', 'Sahih Muslim 806', 'Le hadith rapporte l’annonce faite par un ange au sujet d’Al-Fatiha et des derniers versets de la sourate Al-Baqara.'),
  verifiedHadith('m807a', 'الْآيَتَانِ مِنْ آخِرِ سُورَةِ الْبَقَرَةِ مَنْ قَرَأَهُمَا فِي لَيْلَةٍ كَفَتَاهُ', 'Celui qui récite les deux derniers versets de la sourate Al-Baqara pendant une nuit, ceux-ci lui suffiront.', 'Abu Mas‘ud al-Ansari رضي الله عنه', 'Sahih Muslim 807a', 'Cette version de Muslim confirme le mérite nocturne des deux derniers versets de la sourate Al-Baqara.'),
  verifiedHadith('m809a', 'مَنْ حَفِظَ عَشْرَ آيَاتٍ مِنْ أَوَّلِ سُورَةِ الْكَهْفِ عُصِمَ مِنَ الدَّجَّالِ', 'Celui qui mémorise les dix premiers versets de la sourate Al-Kahf sera protégé contre le Dajjal.', 'Abu ad-Darda’ رضي الله عنه', 'Sahih Muslim 809a', 'Le texte authentique de cette version précise les dix premiers versets de la sourate Al-Kahf.'),
  verifiedHadith('m810', 'يَا أَبَا الْمُنْذِرِ أَتَدْرِي أَيُّ آيَةٍ مِنْ كِتَابِ اللَّهِ مَعَكَ أَعْظَمُ قَالَ قُلْتُ اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', 'Ô Abu al-Mundhir, sais-tu quel verset du Livre d’Allah est le plus grand ? Il répondit : « Allah, nul n’est digne d’adoration en dehors de Lui, le Vivant, Celui qui subsiste par Lui-même. »', 'Ubayy ibn Ka‘b رضي الله عنه', 'Sahih Muslim 810', 'Le compagnon identifia le verset du Trône, au début du verset 255 de la sourate Al-Baqara, et le Prophète approuva sa réponse.'),
]

// Original short catalogue restored at the user's request.
export const HADITHS: Hadith[] = ORIGINAL_HADITHS

void RETIRED_EXTENDED_HADITHS

export type Prophet = {
  id: string
  title: { fr: string; ar: string; en: string }
  arabicName: string
  order: number
  episodes: number
  duration: string
  locked: boolean
}

// Stories of the prophets in chronological order. Cards stay accessible while
// documentary episodes are progressively added.
export const PROPHETS: Prophet[] = [
  {
    id: 'adam',
    title: {
      fr: "L'histoire d'Adam (paix sur lui)",
      ar: 'قصة آدم (عليه السلام)',
      en: 'The story of Adam (peace be upon him)',
    },
    arabicName: 'آدم',
    order: 1,
    episodes: 2,
    duration: '15:00',
    locked: false,
  },
  {
    id: 'idris',
    title: {
      fr: "L'histoire d'Idrîs (paix sur lui)",
      ar: 'قصة إدريس (عليه السلام)',
      en: 'The story of Idris (peace be upon him)',
    },
    arabicName: 'إدريس',
    order: 2,
    episodes: 1,
    duration: '01:46',
    locked: true,
  },
  {
    id: 'nuh',
    title: {
      fr: "L'histoire de Nûh (paix sur lui)",
      ar: 'قصة نوح (عليه السلام)',
      en: 'The story of Nuh (peace be upon him)',
    },
    arabicName: 'نوح',
    order: 3,
    episodes: 2,
    duration: '08:49',
    locked: true,
  },
  {
    id: 'hud',
    title: {
      fr: "L'histoire de Hûd (paix sur lui)",
      ar: 'قصة هود (عليه السلام)',
      en: 'The story of Hud (peace be upon him)',
    },
    arabicName: 'هود',
    order: 4,
    episodes: 1,
    duration: '07:26',
    locked: true,
  },
  {
    id: 'salih',
    title: {
      fr: "L'histoire de Sâlih (paix sur lui)",
      ar: 'قصة صالح (عليه السلام)',
      en: 'The story of Salih (peace be upon him)',
    },
    arabicName: 'صالح',
    order: 5,
    episodes: 1,
    duration: '04:16',
    locked: true,
  },
  {
    id: 'ibrahim',
    title: {
      fr: "L'histoire d'Ibrâhîm (paix sur lui)",
      ar: 'قصة إبراهيم (عليه السلام)',
      en: 'The story of Ibrahim (peace be upon him)',
    },
    arabicName: 'إبراهيم',
    order: 6,
    episodes: 3,
    duration: '18:46',
    locked: true,
  },
  {
    id: 'lut',
    title: {
      fr: "L'histoire de Lût (paix sur lui)",
      ar: 'قصة لوط (عليه السلام)',
      en: 'The story of Lut (peace be upon him)',
    },
    arabicName: 'لوط',
    order: 7,
    episodes: 1,
    duration: '05:16',
    locked: false,
  },
  {
    id: 'ismail',
    title: {
      fr: "L'histoire d'Ismâ'îl (paix sur lui)",
      ar: 'قصة إسماعيل (عليه السلام)',
      en: "The story of Isma'il (peace be upon him)",
    },
    arabicName: 'إسماعيل',
    order: 8,
    episodes: 1,
    duration: '04:58',
    locked: false,
  },
  {
    id: 'ishaq',
    title: {
      fr: "L'histoire d'Ishâq (paix sur lui)",
      ar: 'قصة إسحاق (عليه السلام)',
      en: 'The story of Ishaq (peace be upon him)',
    },
    arabicName: 'إسحاق',
    order: 9,
    episodes: 1,
    duration: '03:18',
    locked: false,
  },
  {
    id: 'yaqub',
    title: {
      fr: "L'histoire de Ya'qûb — Jacob (paix sur lui)",
      ar: 'قصة يعقوب (عليه السلام)',
      en: "The story of Ya'qub — Jacob (peace be upon him)",
    },
    arabicName: 'يعقوب',
    order: 10,
    episodes: 1,
    duration: '03:26',
    locked: false,
  },
  {
    id: 'yusuf',
    title: {
      fr: "L'histoire de Yûsuf (paix sur lui)",
      ar: 'قصة يوسف (عليه السلام)',
      en: 'The story of Yusuf (peace be upon him)',
    },
    arabicName: 'يوسف',
    order: 11,
    episodes: 3,
    duration: '10:56',
    locked: false,
  },
  {
    id: 'ayyub',
    title: {
      fr: "L'histoire d'Ayyûb (paix sur lui)",
      ar: 'قصة أيوب (عليه السلام)',
      en: 'The story of Ayyub (peace be upon him)',
    },
    arabicName: 'أيوب',
    order: 12,
    episodes: 1,
    duration: '05:04',
    locked: false,
  },
  {
    id: 'shuayb',
    title: {
      fr: "L'histoire de Chu'ayb (paix sur lui)",
      ar: 'قصة شعيب (عليه السلام)',
      en: "The story of Shu'ayb (peace be upon him)",
    },
    arabicName: 'شعيب',
    order: 13,
    episodes: 1,
    duration: '08:26',
    locked: false,
  },
  {
    id: 'musa',
    title: {
      fr: "L'histoire de Mûsâ (paix sur lui)",
      ar: 'قصة موسى (عليه السلام)',
      en: 'The story of Musa (peace be upon him)',
    },
    arabicName: 'موسى',
    order: 14,
    episodes: 5,
    duration: '44:10',
    locked: false,
  },
  {
    id: 'harun',
    title: {
      fr: "L'histoire de Hârûn (paix sur lui)",
      ar: 'قصة هارون (عليه السلام)',
      en: 'The story of Harun (peace be upon him)',
    },
    arabicName: 'هارون',
    order: 15,
    episodes: 1,
    duration: '10:17',
    locked: false,
  },
  {
    id: 'dhulkifl',
    title: {
      fr: "L'histoire de Dhû-l-Kifl (paix sur lui)",
      ar: 'قصة ذو الكفل (عليه السلام)',
      en: 'The story of Dhul-Kifl (peace be upon him)',
    },
    arabicName: 'ذو الكفل',
    order: 16,
    episodes: 1,
    duration: '01:59',
    locked: false,
  },
  {
    id: 'dawud',
    title: {
      fr: "L'histoire de Dâwûd (paix sur lui)",
      ar: 'قصة داود (عليه السلام)',
      en: 'The story of Dawud (peace be upon him)',
    },
    arabicName: 'داود',
    order: 17,
    episodes: 2,
    duration: '15:45',
    locked: false,
  },
  {
    id: 'sulayman',
    title: {
      fr: "L'histoire de Sulaymân (paix sur lui)",
      ar: 'قصة سليمان (عليه السلام)',
      en: 'The story of Sulayman (peace be upon him)',
    },
    arabicName: 'سليمان',
    order: 18,
    episodes: 3,
    duration: '23:36',
    locked: false,
  },
  {
    id: 'ilyas',
    title: {
      fr: "L'histoire d'Ilyâs (paix sur lui)",
      ar: 'قصة إلياس (عليه السلام)',
      en: 'The story of Ilyas (peace be upon him)',
    },
    arabicName: 'إلياس',
    order: 19,
    episodes: 1,
    duration: '02:49',
    locked: false,
  },
  {
    id: 'alyasa',
    title: {
      fr: "L'histoire d'Al-Yasa' (paix sur lui)",
      ar: 'قصة اليسع (عليه السلام)',
      en: "The story of Al-Yasa' (peace be upon him)",
    },
    arabicName: 'اليسع',
    order: 20,
    episodes: 1,
    duration: '01:43',
    locked: false,
  },
  {
    id: 'yunus',
    title: {
      fr: "L'histoire de Yûnus (paix sur lui)",
      ar: 'قصة يونس (عليه السلام)',
      en: 'The story of Yunus (peace be upon him)',
    },
    arabicName: 'يونس',
    order: 21,
    episodes: 1,
    duration: '05:02',
    locked: false,
  },
  {
    id: 'zakariyya',
    title: {
      fr: "L'histoire de Zakariyyâ (paix sur lui)",
      ar: 'قصة زكريا (عليه السلام)',
      en: 'The story of Zakariyya (peace be upon him)',
    },
    arabicName: 'زكريا',
    order: 22,
    episodes: 1,
    duration: '07:44',
    locked: false,
  },
  {
    id: 'yahya',
    title: {
      fr: "L'histoire de Yahyâ (paix sur lui)",
      ar: 'قصة يحيى (عليه السلام)',
      en: 'The story of Yahya (peace be upon him)',
    },
    arabicName: 'يحيى',
    order: 23,
    episodes: 1,
    duration: '04:40',
    locked: false,
  },
  {
    id: 'isa',
    title: {
      fr: "L'histoire de 'Îsâ (paix sur lui)",
      ar: 'قصة عيسى (عليه السلام)',
      en: "The story of 'Isa (peace be upon him)",
    },
    arabicName: 'عيسى',
    order: 24,
    episodes: 3,
    duration: '25:02',
    locked: false,
  },
  {
    id: 'muhammad',
    title: {
      fr: "La vie du Prophète Muhammad, salla Allahu 'alayhi wa sallam",
      ar: 'حياة النبي محمد صلى الله عليه وسلم',
      en: "The life of Prophet Muhammad, sallā Allāhu 'alayhi wa sallam",
    },
    arabicName: 'محمد',
    order: 25,
    episodes: 6,
    duration: '22:18',
    locked: false,
  },
]

import { buildProphetTitle, type Lang } from '@/lib/prophet-titles'

export function prophetTitle(p: Prophet, lang: Lang): string {
  return buildProphetTitle(p.id, p.arabicName, lang)
}

export type Word = { word: string; translit: string; meaning: { fr: string; ar: string; en: string } }

// "Lecture" — everyday words to practice reading.
export const READING_WORDS: Word[] = [
  { word: 'بَاب', translit: 'bāb', meaning: { fr: 'porte', ar: 'باب', en: 'door' } },
  { word: 'قَمَر', translit: 'qamar', meaning: { fr: 'lune', ar: 'قمر', en: 'moon' } },
  { word: 'كِتَاب', translit: 'kitāb', meaning: { fr: 'livre', ar: 'كتاب', en: 'book' } },
  { word: 'شَمْس', translit: 'šams', meaning: { fr: 'soleil', ar: 'شمس', en: 'sun' } },
  { word: 'بَيْت', translit: 'bayt', meaning: { fr: 'maison', ar: 'بيت', en: 'house' } },
  { word: 'مَاء', translit: 'māʾ', meaning: { fr: 'eau', ar: 'ماء', en: 'water' } },
  { word: 'خُبْز', translit: 'khubz', meaning: { fr: 'pain', ar: 'خبز', en: 'bread' } },
  { word: 'وَلَد', translit: 'walad', meaning: { fr: 'garçon', ar: 'ولد', en: 'boy' } },
  { word: 'طَاوِلَة', translit: 'ṭāwila', meaning: { fr: 'table', ar: 'طاولة', en: 'table' } },
  { word: 'كُرْسِيّ', translit: 'kursiyy', meaning: { fr: 'chaise', ar: 'كرسي', en: 'chair' } },
  { word: 'مِفْتَاح', translit: 'miftāḥ', meaning: { fr: 'clé', ar: 'مفتاح', en: 'key' } },
  { word: 'هَاتِف', translit: 'hātif', meaning: { fr: 'téléphone', ar: 'هاتف', en: 'phone' } },
  { word: 'حَقِيبَة', translit: 'ḥaqība', meaning: { fr: 'sac', ar: 'حقيبة', en: 'bag' } },
  { word: 'قَلَم', translit: 'qalam', meaning: { fr: 'stylo', ar: 'قلم', en: 'pen' } },
  { word: 'مِصْبَاح', translit: 'miṣbāḥ', meaning: { fr: 'lampe', ar: 'مصباح', en: 'lamp' } },
  { word: 'سَرِير', translit: 'sarīr', meaning: { fr: 'lit', ar: 'سرير', en: 'bed' } },
  { word: 'نَافِذَة', translit: 'nāfiḏa', meaning: { fr: 'fenêtre', ar: 'نافذة', en: 'window' } },
  { word: 'كَأْس', translit: 'kaʾs', meaning: { fr: 'verre', ar: 'كأس', en: 'glass' } },
  { word: 'صَحْن', translit: 'ṣaḥn', meaning: { fr: 'assiette', ar: 'صحن', en: 'plate' } },
  { word: 'مِلْعَقَة', translit: 'milʿaqa', meaning: { fr: 'cuillère', ar: 'ملعقة', en: 'spoon' } },
  { word: 'مَلَابِس', translit: 'malābis', meaning: { fr: 'vêtements', ar: 'ملابس', en: 'clothes' } },
  { word: 'حِذَاء', translit: 'ḥiḏāʾ', meaning: { fr: 'chaussure', ar: 'حذاء', en: 'shoe' } },
  { word: 'سَاعَة', translit: 'sāʿa', meaning: { fr: 'montre / horloge', ar: 'ساعة', en: 'watch / clock' } },
  { word: 'مِرْآة', translit: 'mirʾāh', meaning: { fr: 'miroir', ar: 'مرآة', en: 'mirror' } },
]

// "Vocabulaire du quotidien" — grouped everyday vocabulary.
export type VocabGroup = { id: string; label: { fr: string; ar: string; en: string }; words: Word[] }

export const VOCABULARY: VocabGroup[] = [
  {
    id: 'daily',
    label: { fr: 'Objets du quotidien', ar: 'أشياء يومية', en: 'Everyday objects' },
    words: READING_WORDS,
  },
  {
    id: 'family',
    label: { fr: 'La famille', ar: 'العائلة', en: 'Family' },
    words: [
      { word: 'أَب', translit: 'ab', meaning: { fr: 'père', ar: 'أب', en: 'father' } },
      { word: 'أُم', translit: 'umm', meaning: { fr: 'mère', ar: 'أم', en: 'mother' } },
      { word: 'أَخ', translit: 'akh', meaning: { fr: 'frère', ar: 'أخ', en: 'brother' } },
      { word: 'أُخْت', translit: 'ukht', meaning: { fr: 'sœur', ar: 'أخت', en: 'sister' } },
      { word: 'جَدّ', translit: 'jadd', meaning: { fr: 'grand-père', ar: 'جد', en: 'grandfather' } },
      { word: 'جَدَّة', translit: 'jadda', meaning: { fr: 'grand-mère', ar: 'جدة', en: 'grandmother' } },
      { word: 'اِبْن', translit: 'ibn', meaning: { fr: 'fils', ar: 'ابن', en: 'son' } },
      { word: 'اِبْنَة', translit: 'ibna', meaning: { fr: 'fille', ar: 'ابنة', en: 'daughter' } },
      { word: 'عَمّ', translit: 'ʿamm', meaning: { fr: 'oncle paternel', ar: 'عم', en: 'paternal uncle' } },
      { word: 'عَمَّة', translit: 'ʿamma', meaning: { fr: 'tante paternelle', ar: 'عمة', en: 'paternal aunt' } },
      { word: 'خَال', translit: 'khāl', meaning: { fr: 'oncle maternel', ar: 'خال', en: 'maternal uncle' } },
      { word: 'خَالَة', translit: 'khāla', meaning: { fr: 'tante maternelle', ar: 'خالة', en: 'maternal aunt' } },
      { word: 'حَفِيد', translit: 'ḥafīd', meaning: { fr: 'petit-fils', ar: 'حفيد', en: 'grandson' } },
      { word: 'حَفِيدَة', translit: 'ḥafīda', meaning: { fr: 'petite-fille', ar: 'حفيدة', en: 'granddaughter' } },
      { word: 'زَوْج', translit: 'zawj', meaning: { fr: 'mari / époux', ar: 'زوج', en: 'husband' } },
      { word: 'زَوْجَة', translit: 'zawja', meaning: { fr: 'femme / épouse', ar: 'زوجة', en: 'wife' } },
    ],
  },
  {
    id: 'food',
    label: { fr: 'La nourriture', ar: 'الطعام', en: 'Food' },
    words: [
      { word: 'تَمْر', translit: 'tamr', meaning: { fr: 'dattes', ar: 'تمر', en: 'dates' } },
      { word: 'لَبَن', translit: 'laban', meaning: { fr: 'lait', ar: 'لبن', en: 'milk' } },
      { word: 'لَحْم', translit: 'laḥm', meaning: { fr: 'viande', ar: 'لحم', en: 'meat' } },
      { word: 'تُفَّاح', translit: 'tuffāḥ', meaning: { fr: 'pomme', ar: 'تفاح', en: 'apple' } },
      { word: 'مَوْز', translit: 'mawz', meaning: { fr: 'banane', ar: 'موز', en: 'banana' } },
      { word: 'أَرُزّ', translit: 'aruzz', meaning: { fr: 'riz', ar: 'أرز', en: 'rice' } },
      { word: 'دَجَاج', translit: 'dajāj', meaning: { fr: 'poulet', ar: 'دجاج', en: 'chicken' } },
      { word: 'سَمَك', translit: 'samak', meaning: { fr: 'poisson', ar: 'سمك', en: 'fish' } },
      { word: 'بَيْض', translit: 'bayḍ', meaning: { fr: 'œufs', ar: 'بيض', en: 'eggs' } },
      { word: 'خُضْرَوَات', translit: 'khuḍrawāt', meaning: { fr: 'légumes', ar: 'خضروات', en: 'vegetables' } },
    ],
  },
  {
    id: 'numbers',
    label: { fr: 'Les nombres', ar: 'الأرقام', en: 'Numbers' },
    words: [
      { word: 'وَاحِد', translit: 'wāḥid', meaning: { fr: 'un', ar: '١', en: 'one' } },
      { word: 'اِثْنَان', translit: 'iṯnān', meaning: { fr: 'deux', ar: '٢', en: 'two' } },
      { word: 'ثَلَاثَة', translit: 'ṯalāṯa', meaning: { fr: 'trois', ar: '٣', en: 'three' } },
      { word: 'أَرْبَعَة', translit: 'arbaʿa', meaning: { fr: 'quatre', ar: '٤', en: 'four' } },
      { word: 'خَمْسَة', translit: 'khamsa', meaning: { fr: 'cinq', ar: '٥', en: 'five' } },
      { word: 'سِتَّة', translit: 'sitta', meaning: { fr: 'six', ar: '٦', en: 'six' } },
      { word: 'سَبْعَة', translit: 'sabʿa', meaning: { fr: 'sept', ar: '٧', en: 'seven' } },
      { word: 'ثَمَانِيَة', translit: 'ṯamāniya', meaning: { fr: 'huit', ar: '٨', en: 'eight' } },
      { word: 'تِسْعَة', translit: 'tisʿa', meaning: { fr: 'neuf', ar: '٩', en: 'nine' } },
      { word: 'عَشَرَة', translit: 'ʿašara', meaning: { fr: 'dix', ar: '١٠', en: 'ten' } },
    ],
  },
  {
    id: 'colors',
    label: { fr: 'Les couleurs', ar: 'الألوان', en: 'Colors' },
    words: [
      { word: 'أَبْيَض', translit: 'abyaḍ', meaning: { fr: 'blanc', ar: 'أبيض', en: 'white' } },
      { word: 'أَسْوَد', translit: 'aswad', meaning: { fr: 'noir', ar: 'أسود', en: 'black' } },
      { word: 'أَحْمَر', translit: 'aḥmar', meaning: { fr: 'rouge', ar: 'أحمر', en: 'red' } },
      { word: 'أَزْرَق', translit: 'azraq', meaning: { fr: 'bleu', ar: 'أزرق', en: 'blue' } },
      { word: 'أَخْضَر', translit: 'akhḍar', meaning: { fr: 'vert', ar: 'أخضر', en: 'green' } },
      { word: 'أَصْفَر', translit: 'aṣfar', meaning: { fr: 'jaune', ar: 'أصفر', en: 'yellow' } },
      { word: 'بُرْتُقَالِيّ', translit: 'burtuqāliyy', meaning: { fr: 'orange', ar: 'برتقالي', en: 'orange' } },
      { word: 'بَنَفْسَجِيّ', translit: 'banafsajiyy', meaning: { fr: 'violet', ar: 'بنفسجي', en: 'purple' } },
      { word: 'وَرْدِيّ', translit: 'wardiyy', meaning: { fr: 'rose', ar: 'وردي', en: 'pink' } },
      { word: 'بُنِّيّ', translit: 'bunniyy', meaning: { fr: 'marron', ar: 'بني', en: 'brown' } },
      { word: 'رَمَادِيّ', translit: 'ramādiyy', meaning: { fr: 'gris', ar: 'رمادي', en: 'grey' } },
      { word: 'بَيْضَاء', translit: 'bayḍāʾ', meaning: { fr: 'blanche (féminin)', ar: 'بيضاء', en: 'white (feminine)' } },
      { word: 'سَوْدَاء', translit: 'sawdāʾ', meaning: { fr: 'noire (féminin)', ar: 'سوداء', en: 'black (feminine)' } },
      { word: 'حَمْرَاء', translit: 'ḥamrāʾ', meaning: { fr: 'rouge (féminin)', ar: 'حمراء', en: 'red (feminine)' } },
      { word: 'زَرْقَاء', translit: 'zarqāʾ', meaning: { fr: 'bleue (féminin)', ar: 'زرقاء', en: 'blue (feminine)' } },
      { word: 'خَضْرَاء', translit: 'khaḍrāʾ', meaning: { fr: 'verte (féminin)', ar: 'خضراء', en: 'green (feminine)' } },
      { word: 'صَفْرَاء', translit: 'ṣafrāʾ', meaning: { fr: 'jaune (féminin)', ar: 'صفراء', en: 'yellow (feminine)' } },
      { word: 'بُرْتُقَالِيَّة', translit: 'burtuqāliyya', meaning: { fr: 'orange (féminin)', ar: 'برتقالية', en: 'orange (feminine)' } },
      { word: 'بَنَفْسَجِيَّة', translit: 'banafsajiyya', meaning: { fr: 'violette (féminin)', ar: 'بنفسجية', en: 'purple (feminine)' } },
      { word: 'وَرْدِيَّة', translit: 'wardiyya', meaning: { fr: 'rose (féminin)', ar: 'وردية', en: 'pink (feminine)' } },
      { word: 'بُنِّيَّة', translit: 'bunniyya', meaning: { fr: 'marron (féminin)', ar: 'بنية', en: 'brown (feminine)' } },
      { word: 'رَمَادِيَّة', translit: 'ramādiyya', meaning: { fr: 'grise (féminin)', ar: 'رمادية', en: 'grey (feminine)' } },
      { word: 'بَاب أَحْمَر', translit: 'bāb aḥmar', meaning: { fr: 'une porte rouge', ar: 'باب أحمر', en: 'a red door' } },
      { word: 'حَقِيبَة خَضْرَاء', translit: 'ḥaqība khaḍrāʾ', meaning: { fr: 'un sac vert', ar: 'حقيبة خضراء', en: 'a green bag' } },
    ],
  },
  {
    id: 'work',
    label: { fr: 'Le travail', ar: 'العمل', en: 'Work' },
    words: [
      { word: 'عَمَل', translit: 'ʿamal', meaning: { fr: 'travail', ar: 'عمل', en: 'work' } },
      { word: 'مَكْتَب', translit: 'maktab', meaning: { fr: 'bureau', ar: 'مكتب', en: 'office' } },
      { word: 'مُدِير', translit: 'mudīr', meaning: { fr: 'directeur', ar: 'مدير', en: 'manager' } },
      { word: 'مُوَظَّف', translit: 'muwaẓẓaf', meaning: { fr: 'employé', ar: 'موظف', en: 'employee' } },
      { word: 'طَبِيب', translit: 'ṭabīb', meaning: { fr: 'médecin', ar: 'طبيب', en: 'doctor' } },
      { word: 'مُعَلِّم', translit: 'muʿallim', meaning: { fr: 'enseignant', ar: 'معلم', en: 'teacher' } },
      { word: 'حَاسُوب', translit: 'ḥāsūb', meaning: { fr: 'ordinateur', ar: 'حاسوب', en: 'computer' } },
    ],
  },
  {
    id: 'introductions',
    label: { fr: 'Se présenter', ar: 'التعريف بالنفس', en: 'Introducing yourself' },
    words: [
      { word: 'مَا اسْمُكَ؟', translit: 'mā ismuka?', meaning: { fr: 'Comment t’appelles-tu ? (à un homme)', ar: 'ما اسمك؟', en: 'What is your name? (to a man)' } },
      { word: 'مَا اسْمُكِ؟', translit: 'mā ismuki?', meaning: { fr: 'Comment t’appelles-tu ? (à une femme)', ar: 'ما اسمك؟', en: 'What is your name? (to a woman)' } },
      { word: 'اِسْمِي أَحْمَد', translit: 'ismī Aḥmad', meaning: { fr: 'Je m’appelle Ahmed', ar: 'اسمي أحمد', en: 'My name is Ahmed' } },
      { word: 'مِنْ أَيْنَ أَنْتَ؟', translit: 'min ayna anta?', meaning: { fr: 'D’où viens-tu ? (à un homme)', ar: 'من أين أنت؟', en: 'Where are you from? (to a man)' } },
      { word: 'مِنْ أَيْنَ أَنْتِ؟', translit: 'min ayna anti?', meaning: { fr: 'D’où viens-tu ? (à une femme)', ar: 'من أين أنت؟', en: 'Where are you from? (to a woman)' } },
      { word: 'أَنَا مِنْ فَرَنْسَا', translit: 'anā min Faransā', meaning: { fr: 'Je viens de France', ar: 'أنا من فرنسا', en: 'I am from France' } },
      { word: 'أَيْنَ تَسْكُنُ؟', translit: 'ayna taskunu?', meaning: { fr: 'Où habites-tu ? (à un homme)', ar: 'أين تسكن؟', en: 'Where do you live? (to a man)' } },
      { word: 'أَسْكُنُ فِي بَارِيس', translit: 'askunu fī Bārīs', meaning: { fr: 'J’habite à Paris', ar: 'أسكن في باريس', en: 'I live in Paris' } },
      { word: 'كَمْ عُمْرُكَ؟', translit: 'kam ʿumruka?', meaning: { fr: 'Quel âge as-tu ? (à un homme)', ar: 'كم عمرك؟', en: 'How old are you? (to a man)' } },
      { word: 'عُمْرِي عِشْرُونَ سَنَةً', translit: 'ʿumrī ʿišrūna sana', meaning: { fr: 'J’ai vingt ans', ar: 'عمري عشرون سنة', en: 'I am twenty years old' } },
      { word: 'تَشَرَّفْتُ بِمَعْرِفَتِكَ', translit: 'tašarraftu bi-maʿrifatika', meaning: { fr: 'Enchanté de faire ta connaissance', ar: 'تشرفت بمعرفتك', en: 'Nice to meet you' } },
    ],
  },
  {
    id: 'conversation',
    label: { fr: 'Parler avec les gens', ar: 'التحدث مع الناس', en: 'Talking with people' },
    words: [
      { word: 'مَاذَا تَفْعَلُ؟', translit: 'māḏā tafʿalu?', meaning: { fr: 'Que fais-tu ? (à un homme)', ar: 'ماذا تفعل؟', en: 'What are you doing? (to a man)' } },
      { word: 'مَاذَا تَفْعَلِينَ؟', translit: 'māḏā tafʿalīna?', meaning: { fr: 'Que fais-tu ? (à une femme)', ar: 'ماذا تفعلين؟', en: 'What are you doing? (to a woman)' } },
      { word: 'مَاذَا هُنَاكَ مِنْ جَدِيد؟', translit: 'māḏā hunāka min jadīd?', meaning: { fr: 'Quoi de neuf ?', ar: 'ماذا هناك من جديد؟', en: 'What is new?' } },
      { word: 'لَا شَيْءَ جَدِيد', translit: 'lā šayʾa jadīd', meaning: { fr: 'Rien de nouveau', ar: 'لا شيء جديد', en: 'Nothing new' } },
      { word: 'أَيْنَ أَنْتَ الآنَ؟', translit: 'ayna anta al-āna?', meaning: { fr: 'Où es-tu maintenant ? (à un homme)', ar: 'أين أنت الآن؟', en: 'Where are you now? (to a man)' } },
      { word: 'أَنَا فِي الْبَيْت', translit: 'anā fī al-bayt', meaning: { fr: 'Je suis à la maison', ar: 'أنا في البيت', en: 'I am at home' } },
      { word: 'هَلْ أَنْتَ مُتَاح؟', translit: 'hal anta mutāḥ?', meaning: { fr: 'Es-tu disponible ? (à un homme)', ar: 'هل أنت متاح؟', en: 'Are you available? (to a man)' } },
      { word: 'نَعَمْ، أَنَا مُتَاح', translit: 'naʿam, anā mutāḥ', meaning: { fr: 'Oui, je suis disponible', ar: 'نعم، أنا متاح', en: 'Yes, I am available' } },
      { word: 'لَا أَفْهَم', translit: 'lā afham', meaning: { fr: 'Je ne comprends pas', ar: 'لا أفهم', en: 'I do not understand' } },
      { word: 'هَلْ يُمْكِنُكَ أَنْ تُعِيدَ؟', translit: 'hal yumkinuka an tuʿīda?', meaning: { fr: 'Peux-tu répéter ? (à un homme)', ar: 'هل يمكنك أن تعيد؟', en: 'Can you repeat? (to a man)' } },
      { word: 'تَكَلَّمْ بِبُطْءٍ مِنْ فَضْلِكَ', translit: 'takallam bi-buṭʾin min faḍlika', meaning: { fr: 'Parle lentement, s’il te plaît', ar: 'تكلم ببطء من فضلك', en: 'Speak slowly, please' } },
      { word: 'مَاذَا تَعْنِي؟', translit: 'māḏā taʿnī?', meaning: { fr: 'Que veux-tu dire ?', ar: 'ماذا تعني؟', en: 'What do you mean?' } },
      { word: 'أُرِيدُ أَنْ أَقُولَ...', translit: 'urīdu an aqūla...', meaning: { fr: 'Je veux dire…', ar: 'أريد أن أقول...', en: 'I want to say…' } },
      { word: 'هَلْ تُوَافِقُ؟', translit: 'hal tuwāfiqu?', meaning: { fr: 'Es-tu d’accord ? (à un homme)', ar: 'هل توافق؟', en: 'Do you agree? (to a man)' } },
      { word: 'أَنَا مُوَافِق', translit: 'anā muwāfiq', meaning: { fr: 'Je suis d’accord', ar: 'أنا موافق', en: 'I agree' } },
      { word: 'لَا بَأْس', translit: 'lā baʾs', meaning: { fr: 'Ce n’est pas grave / pas de problème', ar: 'لا بأس', en: 'No problem' } },
    ],
  },
  {
    id: 'communication-help',
    label: { fr: 'Se faire comprendre', ar: 'طَلَبُ التَّوْضِيح', en: 'Making yourself understood' },
    words: [
      { word: 'لَا أَفْهَمُ', translit: 'lā afhamu', meaning: { fr: 'Je ne comprends pas', ar: 'لَا أَفْهَمُ', en: 'I do not understand' } },
      { word: 'هَلْ يُمْكِنُكَ أَنْ تُعِيدَ، مِنْ فَضْلِكَ؟', translit: 'hal yumkinuka an tuʿīda, min faḍlika?', meaning: { fr: 'Peux-tu répéter, s’il te plaît ? (à un homme)', ar: 'هَلْ يُمْكِنُكَ أَنْ تُعِيدَ، مِنْ فَضْلِكَ؟', en: 'Can you repeat, please? (to a man)' } },
      { word: 'هَلْ يُمْكِنُكِ أَنْ تُعِيدِي، مِنْ فَضْلِكِ؟', translit: 'hal yumkinuki an tuʿīdī, min faḍliki?', meaning: { fr: 'Peux-tu répéter, s’il te plaît ? (à une femme)', ar: 'هَلْ يُمْكِنُكِ أَنْ تُعِيدِي، مِنْ فَضْلِكِ؟', en: 'Can you repeat, please? (to a woman)' } },
      { word: 'نَعَمْ، سَأُعِيدُ.', translit: 'naʿam, saʾuʿīdu', meaning: { fr: 'Oui, je vais répéter', ar: 'نَعَمْ، سَأُعِيدُ.', en: 'Yes, I will repeat' } },
      { word: 'تَكَلَّمْ بِبُطْءٍ، مِنْ فَضْلِكَ.', translit: 'takallam bi-buṭʾin, min faḍlika', meaning: { fr: 'Parle lentement, s’il te plaît (à un homme)', ar: 'تَكَلَّمْ بِبُطْءٍ، مِنْ فَضْلِكَ.', en: 'Speak slowly, please (to a man)' } },
      { word: 'تَكَلَّمِي بِبُطْءٍ، مِنْ فَضْلِكِ.', translit: 'takallamī bi-buṭʾin, min faḍliki', meaning: { fr: 'Parle lentement, s’il te plaît (à une femme)', ar: 'تَكَلَّمِي بِبُطْءٍ، مِنْ فَضْلِكِ.', en: 'Speak slowly, please (to a woman)' } },
      { word: 'حَسَنًا، سَأَتَكَلَّمُ بِبُطْءٍ.', translit: 'ḥasanan, saʾatakallamu bi-buṭʾin', meaning: { fr: 'D’accord, je vais parler lentement', ar: 'حَسَنًا، سَأَتَكَلَّمُ بِبُطْءٍ.', en: 'All right, I will speak slowly' } },
      { word: 'مَا مَعْنَى هَذِهِ الْكَلِمَةِ؟', translit: 'mā maʿnā hāḏihi l-kalimati?', meaning: { fr: 'Que signifie ce mot ?', ar: 'مَا مَعْنَى هَذِهِ الْكَلِمَةِ؟', en: 'What does this word mean?' } },
      { word: 'سَأَشْرَحُهَا لَكَ.', translit: 'saʾašraḥuhā laka', meaning: { fr: 'Je vais te l’expliquer (à un homme)', ar: 'سَأَشْرَحُهَا لَكَ.', en: 'I will explain it to you (to a man)' } },
      { word: 'سَأَشْرَحُهَا لَكِ.', translit: 'saʾašraḥuhā laki', meaning: { fr: 'Je vais te l’expliquer (à une femme)', ar: 'سَأَشْرَحُهَا لَكِ.', en: 'I will explain it to you (to a woman)' } },
      { word: 'شُكْرًا لَكَ.', translit: 'šukran laka', meaning: { fr: 'Merci (à un homme)', ar: 'شُكْرًا لَكَ.', en: 'Thank you (to a man)' } },
      { word: 'شُكْرًا لَكِ.', translit: 'šukran laki', meaning: { fr: 'Merci (à une femme)', ar: 'شُكْرًا لَكِ.', en: 'Thank you (to a woman)' } },
      { word: 'عَفْوًا.', translit: 'ʿafwan', meaning: { fr: 'De rien', ar: 'عَفْوًا.', en: 'You are welcome' } },
    ],
  },
  {
    id: 'communication-self',
    label: { fr: 'Parler de soi', ar: 'الحديث عن النفس', en: 'Talking about yourself' },
    words: [
      { word: 'أَيْنَ تَسْكُنُ؟', translit: 'ayna taskunu?', meaning: { fr: 'Où habites-tu ? (à un homme)', ar: 'أَيْنَ تَسْكُنُ؟', en: 'Where do you live? (to a man)' } },
      { word: 'أَيْنَ تَسْكُنِينَ؟', translit: 'ayna taskunīna?', meaning: { fr: 'Où habites-tu ? (à une femme)', ar: 'أَيْنَ تَسْكُنِينَ؟', en: 'Where do you live? (to a woman)' } },
      { word: 'أَسْكُنُ فِي بَارِيسَ.', translit: 'askunu fī Bārīsa', meaning: { fr: 'J’habite à Paris', ar: 'أَسْكُنُ فِي بَارِيسَ.', en: 'I live in Paris' } },
      { word: 'مَاذَا تَدْرُسُ؟', translit: 'māḏā tadrusu?', meaning: { fr: 'Qu’étudies-tu ? (à un homme)', ar: 'مَاذَا تَدْرُسُ؟', en: 'What do you study? (to a man)' } },
      { word: 'مَاذَا تَدْرُسِينَ؟', translit: 'māḏā tadrusīna?', meaning: { fr: 'Qu’étudies-tu ? (à une femme)', ar: 'مَاذَا تَدْرُسِينَ؟', en: 'What do you study? (to a woman)' } },
      { word: 'أَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ.', translit: 'adrusu l-luġata l-ʿarabiyyata', meaning: { fr: 'J’étudie la langue arabe', ar: 'أَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ.', en: 'I study Arabic' } },
      { word: 'مَا عَمَلُكَ؟', translit: 'mā ʿamaluka?', meaning: { fr: 'Quel est ton métier ? (à un homme)', ar: 'مَا عَمَلُكَ؟', en: 'What is your job? (to a man)' } },
      { word: 'أَعْمَلُ مُعَلِّمًا.', translit: 'aʿmalu muʿalliman', meaning: { fr: 'Je travaille comme enseignant', ar: 'أَعْمَلُ مُعَلِّمًا.', en: 'I work as a teacher' } },
    ],
  },
  {
    id: 'communication-family',
    label: { fr: 'Présenter sa famille', ar: 'تقديم العائلة', en: 'Introducing your family' },
    words: [
      { word: 'هَذَا أَبِي.', translit: 'hāḏā abī', meaning: { fr: 'Voici mon père', ar: 'هَذَا أَبِي.', en: 'This is my father' } },
      { word: 'هَذِهِ أُمِّي.', translit: 'hāḏihi ummī', meaning: { fr: 'Voici ma mère', ar: 'هَذِهِ أُمِّي.', en: 'This is my mother' } },
      { word: 'هَذَا أَخِي.', translit: 'hāḏā aḫī', meaning: { fr: 'Voici mon frère', ar: 'هَذَا أَخِي.', en: 'This is my brother' } },
      { word: 'هَذِهِ أُخْتِي.', translit: 'hāḏihi uḫtī', meaning: { fr: 'Voici ma sœur', ar: 'هَذِهِ أُخْتِي.', en: 'This is my sister' } },
      { word: 'هَلْ لَدَيْكَ إِخْوَةٌ؟', translit: 'hal ladayka iḫwatun?', meaning: { fr: 'As-tu des frères et sœurs ? (à un homme)', ar: 'هَلْ لَدَيْكَ إِخْوَةٌ؟', en: 'Do you have siblings? (to a man)' } },
      { word: 'هَلْ لَدَيْكِ إِخْوَةٌ؟', translit: 'hal ladayki iḫwatun?', meaning: { fr: 'As-tu des frères et sœurs ? (à une femme)', ar: 'هَلْ لَدَيْكِ إِخْوَةٌ؟', en: 'Do you have siblings? (to a woman)' } },
      { word: 'نَعَمْ، لَدَيَّ أَخٌ وَأُخْتٌ.', translit: 'naʿam, ladayya aḫun wa-uḫtun', meaning: { fr: 'Oui, j’ai un frère et une sœur', ar: 'نَعَمْ، لَدَيَّ أَخٌ وَأُخْتٌ.', en: 'Yes, I have a brother and a sister' } },
    ],
  },
  {
    id: 'communication-needs',
    label: { fr: 'Exprimer ses goûts et ses besoins', ar: 'التعبير عن الأذواق والاحتياجات', en: 'Expressing likes and needs' },
    words: [
      { word: 'مَاذَا تُحِبُّ؟', translit: 'māḏā tuḥibbu?', meaning: { fr: 'Qu’aimes-tu ? (à un homme)', ar: 'مَاذَا تُحِبُّ؟', en: 'What do you like? (to a man)' } },
      { word: 'مَاذَا تُحِبِّينَ؟', translit: 'māḏā tuḥibbīna?', meaning: { fr: 'Qu’aimes-tu ? (à une femme)', ar: 'مَاذَا تُحِبِّينَ؟', en: 'What do you like? (to a woman)' } },
      { word: 'أُحِبُّ الْقِرَاءَةَ.', translit: 'uḥibbu l-qirāʾata', meaning: { fr: 'J’aime la lecture', ar: 'أُحِبُّ الْقِرَاءَةَ.', en: 'I like reading' } },
      { word: 'أُفَضِّلُ الشَّايَ.', translit: 'ufaḍḍilu š-šāya', meaning: { fr: 'Je préfère le thé', ar: 'أُفَضِّلُ الشَّايَ.', en: 'I prefer tea' } },
      { word: 'مَاذَا تُرِيدُ؟', translit: 'māḏā turīdu?', meaning: { fr: 'Que veux-tu ? (à un homme)', ar: 'مَاذَا تُرِيدُ؟', en: 'What do you want? (to a man)' } },
      { word: 'مَاذَا تُرِيدِينَ؟', translit: 'māḏā turīdīna?', meaning: { fr: 'Que veux-tu ? (à une femme)', ar: 'مَاذَا تُرِيدِينَ؟', en: 'What do you want? (to a woman)' } },
      { word: 'أُرِيدُ مَاءً، مِنْ فَضْلِكَ.', translit: 'urīdu māʾan, min faḍlika', meaning: { fr: 'Je voudrais de l’eau, s’il te plaît', ar: 'أُرِيدُ مَاءً، مِنْ فَضْلِكَ.', en: 'I would like water, please' } },
      { word: 'أَحْتَاجُ إِلَى الْمُسَاعَدَةِ.', translit: 'aḥtāju ilā l-musāʿadati', meaning: { fr: 'J’ai besoin d’aide', ar: 'أَحْتَاجُ إِلَى الْمُسَاعَدَةِ.', en: 'I need help' } },
    ],
  },
  {
    id: 'communication-shopping',
    label: { fr: 'Acheter et commander', ar: 'الشراء والطلب', en: 'Shopping and ordering' },
    words: [
      { word: 'كَمْ سِعْرُ هَذَا؟', translit: 'kam siʿru hāḏā?', meaning: { fr: 'Combien coûte ceci ?', ar: 'كَمْ سِعْرُ هَذَا؟', en: 'How much is this?' } },
      { word: 'سِعْرُهُ عَشَرَةُ يُورُوهَاتٍ.', translit: 'siʿruhu ʿašaratu yūrūhātin', meaning: { fr: 'Cela coûte dix euros', ar: 'سِعْرُهُ عَشَرَةُ يُورُوهَاتٍ.', en: 'It costs ten euros' } },
      { word: 'أُرِيدُ هَذَا، مِنْ فَضْلِكَ.', translit: 'urīdu hāḏā, min faḍlika', meaning: { fr: 'Je voudrais ceci, s’il te plaît', ar: 'أُرِيدُ هَذَا، مِنْ فَضْلِكَ.', en: 'I would like this, please' } },
      { word: 'أُرِيدُ قِطْعَتَيْنِ.', translit: 'urīdu qiṭʿatayni', meaning: { fr: 'Je voudrais deux pièces', ar: 'أُرِيدُ قِطْعَتَيْنِ.', en: 'I would like two pieces' } },
      { word: 'هَلْ عِنْدَكُمْ شَايٌ؟', translit: 'hal ʿindakum šāyun?', meaning: { fr: 'Avez-vous du thé ?', ar: 'هَلْ عِنْدَكُمْ شَايٌ؟', en: 'Do you have tea?' } },
      { word: 'نَعَمْ، عِنْدَنَا شَايٌ.', translit: 'naʿam, ʿindanā šāyun', meaning: { fr: 'Oui, nous avons du thé', ar: 'نَعَمْ، عِنْدَنَا شَايٌ.', en: 'Yes, we have tea' } },
    ],
  },
  {
    id: 'communication-directions',
    label: { fr: 'Demander son chemin', ar: 'السؤال عن الطريق', en: 'Asking for directions' },
    words: [
      { word: 'أَيْنَ الْمَحَطَّةُ؟', translit: 'ayna l-maḥaṭṭatu?', meaning: { fr: 'Où est la gare ?', ar: 'أَيْنَ الْمَحَطَّةُ؟', en: 'Where is the station?' } },
      { word: 'الْمَحَطَّةُ أَمَامَكَ.', translit: 'al-maḥaṭṭatu amāmaka', meaning: { fr: 'La gare est devant toi (à un homme)', ar: 'الْمَحَطَّةُ أَمَامَكَ.', en: 'The station is in front of you (to a man)' } },
      { word: 'كَيْفَ أَذْهَبُ إِلَى السُّوقِ؟', translit: 'kayfa aḏhabu ilā s-sūqi?', meaning: { fr: 'Comment aller au marché ?', ar: 'كَيْفَ أَذْهَبُ إِلَى السُّوقِ؟', en: 'How do I get to the market?' } },
      { word: 'اِذْهَبْ مُسْتَقِيمًا.', translit: 'iḏhab mustaqīman', meaning: { fr: 'Va tout droit (à un homme)', ar: 'اِذْهَبْ مُسْتَقِيمًا.', en: 'Go straight (to a man)' } },
      { word: 'ثُمَّ اِنْعَطِفْ يَمِينًا.', translit: 'ṯumma inʿaṭif yamīnan', meaning: { fr: 'Puis tourne à droite (à un homme)', ar: 'ثُمَّ اِنْعَطِفْ يَمِينًا.', en: 'Then turn right (to a man)' } },
      { word: 'الْمَكْتَبَةُ عَلَى الْيَسَارِ.', translit: 'al-maktabatu ʿalā l-yasāri', meaning: { fr: 'La bibliothèque est à gauche', ar: 'الْمَكْتَبَةُ عَلَى الْيَسَارِ.', en: 'The library is on the left' } },
    ],
  },
  {
    id: 'communication-day',
    label: { fr: 'Parler de sa journée', ar: 'الحديث عن اليوم', en: 'Talking about your day' },
    words: [
      { word: 'مَتَى تَسْتَيْقِظُ؟', translit: 'matā tastayqiẓu?', meaning: { fr: 'Quand te réveilles-tu ? (à un homme)', ar: 'مَتَى تَسْتَيْقِظُ؟', en: 'When do you wake up? (to a man)' } },
      { word: 'مَتَى تَسْتَيْقِظِينَ؟', translit: 'matā tastayqiẓīna?', meaning: { fr: 'Quand te réveilles-tu ? (à une femme)', ar: 'مَتَى تَسْتَيْقِظِينَ؟', en: 'When do you wake up? (to a woman)' } },
      { word: 'أَسْتَيْقِظُ فِي السَّاعَةِ السَّابِعَةِ.', translit: 'astayqiẓu fī s-sāʿati s-sābiʿati', meaning: { fr: 'Je me réveille à sept heures', ar: 'أَسْتَيْقِظُ فِي السَّاعَةِ السَّابِعَةِ.', en: 'I wake up at seven o’clock' } },
      { word: 'أَذْهَبُ إِلَى الْعَمَلِ صَبَاحًا.', translit: 'aḏhabu ilā l-ʿamali ṣabāḥan', meaning: { fr: 'Je vais au travail le matin', ar: 'أَذْهَبُ إِلَى الْعَمَلِ صَبَاحًا.', en: 'I go to work in the morning' } },
      { word: 'أَتَنَاوَلُ الْغَدَاءَ عِنْدَ الظُّهْرِ.', translit: 'atanāwalu l-ġadāʾa ʿinda ẓ-ẓuhri', meaning: { fr: 'Je déjeune à midi', ar: 'أَتَنَاوَلُ الْغَدَاءَ عِنْدَ الظُّهْرِ.', en: 'I have lunch at noon' } },
      { word: 'لَدَيَّ مَوْعِدٌ فِي السَّاعَةِ الثَّالِثَةِ.', translit: 'ladayya mawʿidun fī s-sāʿati ṯ-ṯāliṯati', meaning: { fr: 'J’ai rendez-vous à trois heures', ar: 'لَدَيَّ مَوْعِدٌ فِي السَّاعَةِ الثَّالِثَةِ.', en: 'I have an appointment at three o’clock' } },
      { word: 'أَعُودُ إِلَى الْبَيْتِ مَسَاءً.', translit: 'aʿūdu ilā l-bayti masāʾan', meaning: { fr: 'Je rentre à la maison le soir', ar: 'أَعُودُ إِلَى الْبَيْتِ مَسَاءً.', en: 'I return home in the evening' } },
    ],
  },
  {
    id: 'sentence-building',
    label: { fr: 'Construire des phrases', ar: 'بناء الجمل', en: 'Building sentences' },
    words: [
      { word: 'أَنَا أُرِيدُ...', translit: 'anā urīdu...', meaning: { fr: 'Je veux…', ar: 'أنا أريد...', en: 'I want…' } },
      { word: 'أَنَا لَا أُرِيدُ...', translit: 'anā lā urīdu...', meaning: { fr: 'Je ne veux pas…', ar: 'أنا لا أريد...', en: 'I do not want…' } },
      { word: 'أَنَا أُحِبُّ...', translit: 'anā uḥibbu...', meaning: { fr: 'J’aime…', ar: 'أنا أحب...', en: 'I like…' } },
      { word: 'أَنَا لَا أُحِبُّ...', translit: 'anā lā uḥibbu...', meaning: { fr: 'Je n’aime pas…', ar: 'أنا لا أحب...', en: 'I do not like…' } },
      { word: 'أَنَا ذَاهِبٌ إِلَى...', translit: 'anā ḏāhibun ilā...', meaning: { fr: 'Je vais à… (homme)', ar: 'أنا ذاهب إلى...', en: 'I am going to… (man)' } },
      { word: 'أَنَا ذَاهِبَةٌ إِلَى...', translit: 'anā ḏāhibatun ilā...', meaning: { fr: 'Je vais à… (femme)', ar: 'أنا ذاهبة إلى...', en: 'I am going to… (woman)' } },
      { word: 'سَوْفَ أَذْهَبُ إِلَى...', translit: 'sawfa aḏhabu ilā...', meaning: { fr: 'J’irai à…', ar: 'سوف أذهب إلى...', en: 'I will go to…' } },
      { word: 'أَسْتَطِيعُ أَنْ...', translit: 'astaṭīʿu an...', meaning: { fr: 'Je peux…', ar: 'أستطيع أن...', en: 'I can…' } },
      { word: 'لَا أَسْتَطِيعُ أَنْ...', translit: 'lā astaṭīʿu an...', meaning: { fr: 'Je ne peux pas…', ar: 'لا أستطيع أن...', en: 'I cannot…' } },
      { word: 'يَجِبُ أَنْ...', translit: 'yajibu an...', meaning: { fr: 'Il faut…', ar: 'يجب أن...', en: 'It is necessary to…' } },
      { word: 'عِنْدِي...', translit: 'ʿindī...', meaning: { fr: 'J’ai…', ar: 'عندي...', en: 'I have…' } },
      { word: 'لَيْسَ عِنْدِي...', translit: 'laysa ʿindī...', meaning: { fr: 'Je n’ai pas…', ar: 'ليس عندي...', en: 'I do not have…' } },
      { word: 'هَلْ عِنْدَكَ...؟', translit: 'hal ʿindaka...?', meaning: { fr: 'Est-ce que tu as… ? (à un homme)', ar: 'هل عندك...؟', en: 'Do you have…? (to a man)' } },
      { word: 'لِأَنَّ...', translit: 'liʾanna...', meaning: { fr: 'Parce que…', ar: 'لأن...', en: 'Because…' } },
      { word: 'وَلَكِنْ...', translit: 'walākin...', meaning: { fr: 'Mais…', ar: 'ولكن...', en: 'But…' } },
      { word: 'ثُمَّ...', translit: 'ṯumma...', meaning: { fr: 'Puis / ensuite…', ar: 'ثم...', en: 'Then…' } },
    ],
  },
  {
    id: 'verbs',
    label: { fr: 'Les verbes essentiels', ar: 'الأفعال الأساسية', en: 'Essential verbs' },
    words: [
      { word: 'ذَهَبَ', translit: 'ḏahaba', meaning: { fr: 'aller', ar: 'ذهب', en: 'to go' } },
      { word: 'جَاءَ', translit: 'jāʾa', meaning: { fr: 'venir', ar: 'جاء', en: 'to come' } },
      { word: 'فَعَلَ', translit: 'faʿala', meaning: { fr: 'faire', ar: 'فعل', en: 'to do' } },
      { word: 'قَالَ', translit: 'qāla', meaning: { fr: 'dire', ar: 'قال', en: 'to say' } },
      { word: 'تَكَلَّمَ', translit: 'takallama', meaning: { fr: 'parler', ar: 'تكلم', en: 'to speak' } },
      { word: 'سَمِعَ', translit: 'samiʿa', meaning: { fr: 'entendre', ar: 'سمع', en: 'to hear' } },
      { word: 'رَأَى', translit: 'raʾā', meaning: { fr: 'voir', ar: 'رأى', en: 'to see' } },
      { word: 'عَرَفَ', translit: 'ʿarafa', meaning: { fr: 'savoir / connaître', ar: 'عرف', en: 'to know' } },
      { word: 'فَهِمَ', translit: 'fahima', meaning: { fr: 'comprendre', ar: 'فهم', en: 'to understand' } },
      { word: 'أَرَادَ', translit: 'arāda', meaning: { fr: 'vouloir', ar: 'أراد', en: 'to want' } },
      { word: 'اِسْتَطَاعَ', translit: 'istaṭāʿa', meaning: { fr: 'pouvoir', ar: 'استطاع', en: 'to be able to' } },
      { word: 'أَحَبَّ', translit: 'aḥabba', meaning: { fr: 'aimer', ar: 'أحب', en: 'to like / love' } },
      { word: 'أَكَلَ', translit: 'akala', meaning: { fr: 'manger', ar: 'أكل', en: 'to eat' } },
      { word: 'شَرِبَ', translit: 'šariba', meaning: { fr: 'boire', ar: 'شرب', en: 'to drink' } },
      { word: 'نَامَ', translit: 'nāma', meaning: { fr: 'dormir', ar: 'نام', en: 'to sleep' } },
      { word: 'عَمِلَ', translit: 'ʿamila', meaning: { fr: 'travailler', ar: 'عمل', en: 'to work' } },
      { word: 'دَرَسَ', translit: 'darasa', meaning: { fr: 'étudier', ar: 'درس', en: 'to study' } },
      { word: 'قَرَأَ', translit: 'qaraʾa', meaning: { fr: 'lire', ar: 'قرأ', en: 'to read' } },
      { word: 'كَتَبَ', translit: 'kataba', meaning: { fr: 'écrire', ar: 'كتب', en: 'to write' } },
      { word: 'فَتَحَ', translit: 'fataḥa', meaning: { fr: 'ouvrir', ar: 'فتح', en: 'to open' } },
      { word: 'أَغْلَقَ', translit: 'aġlaqa', meaning: { fr: 'fermer', ar: 'أغلق', en: 'to close' } },
      { word: 'أَخَذَ', translit: 'aḫaḏa', meaning: { fr: 'prendre', ar: 'أخذ', en: 'to take' } },
      { word: 'أَعْطَى', translit: 'aʿṭā', meaning: { fr: 'donner', ar: 'أعطى', en: 'to give' } },
      { word: 'اِنْتَظَرَ', translit: 'intaẓara', meaning: { fr: 'attendre', ar: 'انتظر', en: 'to wait' } },
    ],
  },
]

// "Phrases simples" — short everyday sentences.
export const PHRASES: Word[] = [
  { word: 'السَّلَامُ عَلَيْكُم', translit: 'as-salāmu ʿalaykum', meaning: { fr: 'Que la paix soit sur vous', ar: 'تحية', en: 'Peace be upon you' } },
  { word: 'وَعَلَيْكُمُ السَّلَام', translit: 'wa-ʿalaykumu s-salām', meaning: { fr: 'Et que la paix soit sur vous aussi', ar: 'رد التحية', en: 'And peace be upon you too' } },
  { word: 'كَيْفَ حَالُك؟', translit: 'kayfa ḥāluk', meaning: { fr: 'Comment vas-tu ?', ar: 'سؤال', en: 'How are you?' } },
  { word: 'أَنَا بِخَيْر', translit: 'anā bi-khayr', meaning: { fr: 'Je vais bien', ar: 'جواب', en: 'I am well' } },
  { word: 'وَأَنْتَ؟', translit: 'wa-anta?', meaning: { fr: 'Et toi ? (à un homme)', ar: 'وأنت؟', en: 'And you? (to a man)' } },
  { word: 'وَأَنْتِ؟', translit: 'wa-anti?', meaning: { fr: 'Et toi ? (à une femme)', ar: 'وأنت؟', en: 'And you? (to a woman)' } },
  { word: 'مَا اسْمُك؟', translit: 'mā ismuk', meaning: { fr: 'Quel est ton nom ?', ar: 'سؤال', en: 'What is your name?' } },
  { word: 'شُكْرًا جَزِيلًا', translit: 'šukran ǧazīlan', meaning: { fr: 'Merci beaucoup', ar: 'شكر', en: 'Thank you very much' } },
  { word: 'عَفْوًا', translit: 'ʿafwan', meaning: { fr: 'De rien / pardon', ar: 'عفواً', en: 'You are welcome / excuse me' } },
  { word: 'مَعَ السَّلَامَة', translit: 'maʿa s-salāma', meaning: { fr: 'Au revoir', ar: 'وداع', en: 'Goodbye' } },
  { word: 'إِلَى اللِّقَاء', translit: 'ilā l-liqāʾ', meaning: { fr: 'À bientôt', ar: 'إلى اللقاء', en: 'See you soon' } },
  { word: 'صَبَاحُ الْخَيْر', translit: 'ṣabāḥu l-khayr', meaning: { fr: 'Bonjour (le matin)', ar: 'صباح الخير', en: 'Good morning' } },
  { word: 'صَبَاحُ النُّور', translit: 'ṣabāḥu n-nūr', meaning: { fr: 'Bonjour (réponse du matin)', ar: 'صباح النور', en: 'Good morning (reply)' } },
  { word: 'مَسَاءُ الْخَيْر', translit: 'masāʾu l-khayr', meaning: { fr: 'Bonsoir', ar: 'مساء الخير', en: 'Good evening' } },
  { word: 'مَسَاءُ النُّور', translit: 'masāʾu n-nūr', meaning: { fr: 'Bonsoir (réponse)', ar: 'مساء النور', en: 'Good evening (reply)' } },
  { word: 'أَهْلًا وَسَهْلًا', translit: 'ahlan wa-sahlan', meaning: { fr: 'Bienvenue / bonjour', ar: 'أهلاً وسهلاً', en: 'Welcome / hello' } },
  { word: 'كَيْفَ حَالُكِ؟', translit: 'kayfa ḥāluki?', meaning: { fr: 'Comment vas-tu ? (à une femme)', ar: 'كيف حالك؟', en: 'How are you? (to a woman)' } },
  { word: 'الْحَمْدُ لِلَّه', translit: 'al-ḥamdu lillāh', meaning: { fr: 'Grâce à Dieu / louange à Dieu', ar: 'الحمد لله', en: 'Praise be to God' } },
  { word: 'مِنْ فَضْلِكَ', translit: 'min faḍlika', meaning: { fr: 'S’il te plaît (à un homme)', ar: 'من فضلك', en: 'Please (to a man)' } },
  { word: 'مِنْ فَضْلِكِ', translit: 'min faḍliki', meaning: { fr: 'S’il te plaît (à une femme)', ar: 'من فضلك', en: 'Please (to a woman)' } },
]

// "Grammaire" — foundational grammar points.
export type GrammarPoint = {
  id: string
  title: { fr: string; ar: string; en: string }
  example: string
  exampleTranslit: string
  explanation: { fr: string; ar: string; en: string }
}

export const GRAMMAR: GrammarPoint[] = [
  {
    id: 'article',
    title: { fr: "L'article défini (Al-)", ar: 'أل التعريف', en: 'The definite article (Al-)' },
    example: 'الْكِتَاب',
    exampleTranslit: 'al-kitāb',
    explanation: {
      fr: '« ال » (al-) se place devant un nom pour dire « le / la ». بَاب (une porte) devient الْبَاب (la porte).',
      ar: 'تُوضَع « ال » قبل الاسم لتعريفه: باب ← الباب.',
      en: '"ال" (al-) is placed before a noun to mean "the". بَاب (a door) becomes الْبَاب (the door).',
    },
  },
  {
    id: 'sun-moon',
    title: { fr: 'Lettres solaires et lunaires', ar: 'الحروف الشمسية والقمرية', en: 'Sun and moon letters' },
    example: 'الشَّمْس',
    exampleTranslit: 'aš-šams',
    explanation: {
      fr: 'Avec les lettres solaires, le « l » de « al- » se fond dans la lettre : الشَّمْس se lit « ash-shams », pas « al-shams ».',
      ar: 'مع الحروف الشمسية تُدغَم لام التعريف: الشمس تُنطق « اشّْمس ».',
      en: 'With sun letters, the "l" of "al-" assimilates: الشَّمْس reads "ash-shams", not "al-shams".',
    },
  },
  {
    id: 'gender',
    title: { fr: 'Masculin et féminin', ar: 'المذكر والمؤنث', en: 'Masculine and feminine' },
    example: 'مُعَلِّمَة',
    exampleTranslit: 'muʿallima',
    explanation: {
      fr: 'Le féminin se forme souvent en ajoutant la Ta marbuta « ة » : مُعَلِّم (enseignant) → مُعَلِّمَة (enseignante).',
      ar: 'يُصاغ المؤنث غالبًا بإضافة التاء المربوطة « ة »: معلِّم ← معلِّمة.',
      en: 'The feminine is often formed by adding the Ta marbuta "ة": مُعَلِّم (teacher, m.) → مُعَلِّمَة (teacher, f.).',
    },
  },
  {
    id: 'word-types',
    title: { fr: 'Nom, verbe et particule', ar: 'الاسم والفعل والحرف', en: 'Noun, verb and particle' },
    example: 'اِسْم · فِعْل · حَرْف',
    exampleTranslit: 'ism · fiʿl · ḥarf',
    explanation: {
      fr: "En arabe, tout mot est soit un nom (اسم), soit un verbe (فعل), soit une particule (حرف). C'est la base de la grammaire.",
      ar: 'كل كلمة في العربية إما اسم أو فعل أو حرف، وهذا أساس النحو.',
      en: 'In Arabic every word is either a noun (اسم), a verb (فعل), or a particle (حرف). This is the basis of grammar.',
    },
  },
]
