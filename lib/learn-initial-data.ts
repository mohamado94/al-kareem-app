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
]

export type Level = {
  id: string
  title: { fr: string; ar: string; en: string }
  levelKey: 'beginner' | 'intermediate' | 'advanced'
  lessons: number
  done: number
  locked: boolean
}

export const LEVELS: Level[] = [
  {
    id: 'l1',
    title: { fr: 'Les fondations', ar: 'الأساسيات', en: 'The Foundations' },
    levelKey: 'beginner',
    lessons: 12,
    done: 0,
    locked: false,
  },
  {
    id: 'l2',
    title: { fr: 'Voyelles & sons', ar: 'الحركات والأصوات', en: 'Vowels & Sounds' },
    levelKey: 'beginner',
    lessons: 10,
    done: 0,
    locked: true,
  },
  {
    id: 'l3',
    title: { fr: 'Premiers mots', ar: 'أولى الكلمات', en: 'First Words' },
    levelKey: 'intermediate',
    lessons: 14,
    done: 0,
    locked: true,
  },
  {
    id: 'l4',
    title: { fr: 'Lecture fluide', ar: 'القراءة الطليقة', en: 'Fluent Reading' },
    levelKey: 'advanced',
    lessons: 16,
    done: 0,
    locked: true,
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
  { id: 'reading', icon: 'BookOpen', titleKey: 'learn.reading', subKey: 'learn.readingSub', progress: 0, accent: 'amber' },
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
  { id: 'a3', icon: 'Award', label: { fr: '500 XP', ar: '٥٠٠ نقطة', en: '500 XP' }, unlocked: false },
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
  grade: { fr: string; ar: string; en: string }
}

// Authentic (sahih) hadiths on learning and reciting the Qur'an, with sources.
export const HADITHS: Hadith[] = [
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
    source: 'Sahih Muslim 804',
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
  {
    id: 'h3',
    arabic:
      'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ، وَالَّذِي يَقْرَأُ الْقُرْآنَ وَيَتَتَعْتَعُ فِيهِ وَهُوَ عَلَيْهِ شَاقٌّ لَهُ أَجْرَانِ',
    translation: {
      fr: "Celui qui maîtrise le Coran sera avec les nobles scribes vertueux ; et celui qui le récite en hésitant, avec difficulté, aura une double récompense.",
      ar: 'الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ، وَالَّذِي يَقْرَأُ الْقُرْآنَ وَيَتَتَعْتَعُ فِيهِ وَهُ��َ عَلَيْهِ شَاقٌّ لَهُ أَجْرَانِ.',
      en: 'The one proficient in the Qur’an is with the noble, righteous scribes; and the one who recites it haltingly, finding it difficult, has a double reward.',
    },
    narrator: { fr: '‘A’isha', ar: 'عائشة رضي الله عنها', en: '‘A���isha' },
    source: 'Sahih al-Bukhari 4937 · Muslim 798',
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
    grade: { fr: 'Bon-authentique (Hasan Sahih)', ar: 'حسن صحيح', en: 'Hasan Sahih' },
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
    grade: { fr: 'Authentique (Sahih)', ar: 'صحيح', en: 'Authentic (Sahih)' },
  },
]

export type Prophet = {
  id: string
  title: { fr: string; ar: string; en: string }
  arabicName: string
  order: number
  episodes: number
  duration: string
  locked: boolean
}

// Stories of the prophets in chronological order. Only the first (Adam) is unlocked.
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
    episodes: 4,
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
    episodes: 3,
    duration: '15:00',
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
    episodes: 4,
    duration: '15:00',
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
    episodes: 4,
    duration: '15:00',
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
    episodes: 3,
    duration: '15:00',
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
    episodes: 5,
    duration: '15:00',
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
  },
  {
    id: 'yaqub',
    title: {
      fr: "L'histoire de Ya'qûb (paix sur lui)",
      ar: 'قصة يعقوب (عليه السلام)',
      en: "The story of Ya'qub (peace be upon him)",
    },
    arabicName: 'يعقوب',
    order: 10,
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 4,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 4,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 4,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
    episodes: 2,
    duration: '15:00',
    locked: true,
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
    episodes: 2,
    duration: '15:00',
    locked: true,
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
    episodes: 2,
    duration: '15:00',
    locked: true,
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
    episodes: 2,
    duration: '15:00',
    locked: true,
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
    episodes: 3,
    duration: '15:00',
    locked: true,
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
]

// "Vocabulaire du quotidien" — grouped everyday vocabulary.
export type VocabGroup = { id: string; label: { fr: string; ar: string; en: string }; words: Word[] }

export const VOCABULARY: VocabGroup[] = [
  {
    id: 'family',
    label: { fr: 'La famille', ar: 'العائلة', en: 'Family' },
    words: [
      { word: 'أَب', translit: 'ab', meaning: { fr: 'père', ar: 'أب', en: 'father' } },
      { word: 'أُم', translit: 'umm', meaning: { fr: 'mère', ar: 'أم', en: 'mother' } },
      { word: 'أَخ', translit: 'akh', meaning: { fr: 'frère', ar: 'أخ', en: 'brother' } },
      { word: 'أُخْت', translit: 'ukht', meaning: { fr: 'sœur', ar: 'أخت', en: 'sister' } },
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
    ],
  },
]

// "Phrases simples" — short everyday sentences.
export const PHRASES: Word[] = [
  { word: 'السَّلَامُ عَلَيْكُم', translit: 'as-salāmu ʿalaykum', meaning: { fr: 'Que la paix soit sur vous', ar: 'تحية', en: 'Peace be upon you' } },
  { word: 'كَيْفَ حَالُك؟', translit: 'kayfa ḥāluk', meaning: { fr: 'Comment vas-tu ?', ar: 'سؤال', en: 'How are you?' } },
  { word: 'أَنَا بِخَيْر', translit: 'anā bi-khayr', meaning: { fr: 'Je vais bien', ar: 'جواب', en: 'I am well' } },
  { word: 'مَا اسْمُك؟', translit: 'mā ismuk', meaning: { fr: 'Quel est ton nom ?', ar: 'سؤال', en: 'What is your name?' } },
  { word: 'شُكْرًا جَزِيلًا', translit: 'šukran ǧazīlan', meaning: { fr: 'Merci beaucoup', ar: 'شكر', en: 'Thank you very much' } },
  { word: 'مَعَ السَّلَامَة', translit: 'maʿa s-salāma', meaning: { fr: 'Au revoir', ar: 'وداع', en: 'Goodbye' } },
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
