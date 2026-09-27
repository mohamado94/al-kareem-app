'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Type,
  Sparkles,
  Waves,
  Layers,
  MoveHorizontal,
  BookOpen,
  MessagesSquare,
  SpellCheck,
  CheckCircle2,
  Mic,
  PenLine,
  Brain,
  RefreshCw,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useI18n, type Lang } from '@/lib/i18n'
import { localized } from '@/lib/i18n-content'
import { learningText } from '@/lib/learning-content-i18n'
import { useProgress } from '@/lib/progress/context'
import { ScreenHeader, ProgressBar, ProgressRing, accentClass } from '@/components/ui-bits'
import { ListenButton, ListenCircle, PronounceButton } from '@/components/audio-button'
import { speakArabic, speakPhrase, playRecordedAudio, playRecordedAudioSequence, type RecordedAudioSegment } from '@/lib/speech'
import { isNativeSpeechPlatform, listenArabicNative } from '@/lib/native-speech'
import { letterPositionPhrase, type LetterPosition } from '@/lib/letter-position-speech'
import { letterSpokenName, letterDisplayName } from '@/lib/letter-spoken-names'
import { letterRecordedAudio } from '@/lib/letter-recorded-audio'
import { letterPositionRecordedSequence } from '@/lib/letter-position-recorded-audio'
import { pedagogicalPositionGlyph } from '@/lib/letter-position-glyphs'
import { LETTER_PHONETICS, letterFormSpeech } from '@/lib/letter-phonetics'
import { playAnswerSound } from '@/lib/feedback-sounds'
import {
  LETTERS,
  SHORT_VOWELS,
  LONG_VOWELS,
  TANWIN,
  READING_WORDS,
  LEARN_TOPICS,
  HARAKAT,
  VOCABULARY,
  PHRASES,
  GRAMMAR,
  type Letter,
  type VowelRule,
  type Word,
  type GrammarPoint,
} from '@/lib/learn-pre-guided-data'

const ICONS: Record<string, LucideIcon> = {
  Type,
  Sparkles,
  Waves,
  Layers,
  MoveHorizontal,
  BookOpen,
  MessagesSquare,
  SpellCheck,
}

type FormDef = {
  key: string
  label: string
  compose: (l: Letter) => string
  translit: (l: Letter) => string
  speechKey: import('@/lib/letter-phonetics').VowelFormKey
}

type View =
  | { kind: 'menu' }
  | { kind: 'lesson-one' }
  | { kind: 'lesson-two-words' }
  | { kind: 'lesson-two-sentences' }
  | { kind: 'lesson-two-texts' }
  | { kind: 'lesson-three-courtesy' }
  | { kind: 'lesson-three-courtesy-basics' }
  | { kind: 'lesson-three-courtesy-requests' }
  | { kind: 'lesson-three-description-people' }
  | { kind: 'lesson-three-personal-pronouns' }
  | { kind: 'lesson-three-family' }
  | { kind: 'lesson-three-demonstratives-places' }
  | { kind: 'lesson-three-interrogatives' }
  | { kind: 'lesson-three-time-chronology' }
  | { kind: 'lesson-three-numbers' }
  | { kind: 'lesson-three-time-markers' }
  | { kind: 'lesson-three-day-moments' }
  | { kind: 'lesson-three-days-periods' }
  | { kind: 'lesson-three-daily-environment' }
  | { kind: 'lesson-three-house' }
  | { kind: 'lesson-three-everyday-objects' }
  | { kind: 'lesson-three-nearby-places' }
  | { kind: 'lesson-three-colors' }
  | { kind: 'lesson-four-essential-verbs' }
  | { kind: 'empty-lesson'; number: 2 | 3 | 4 }
  | { kind: 'alphabet' }
  | { kind: 'letter'; index: number }
  | { kind: 'rules'; topic: 'short-vowels' | 'long-vowels' | 'tanwin' }
  | { kind: 'positions' }
  | { kind: 'shadda' }
  | { kind: 'reading' }
  | { kind: 'vocabulary' }
  | { kind: 'grammar' }

export type LearnBlockId = 'reading' | 'phrases' | 'literary' | 'quran'

export type LearnStart = {
  block: LearnBlockId
  topicId?: string
  categoryId?: string
  lessonIndex?: number
}

// Preserve the pure validation helpers used by the existing automated checks.
// The restored interface itself remains the pre-guided version below.
export {
  resolveVocabularyStimulus,
  variedWordOptions,
  wordPronunciationMatches,
} from '@/components/screens/learn-exercise-compat'
import { variedWordOptions } from '@/components/screens/learn-exercise-compat'

export function LearnScreen({ initialStart: _initialStart }: { initialStart?: LearnStart }) {
  const [view, setView] = useState<View>({ kind: 'menu' })

  const changeView = (next: View) => {
    setView(next)
  }

  if (view.kind === 'menu') return <LearnMenu onOpen={changeView} />

  if (view.kind === 'lesson-one') {
    return <LessonOneView onOpen={changeView} onBack={() => changeView({ kind: 'menu' })} />
  }

  if (view.kind === 'lesson-two-words') {
    return <ReadingWordsChapter onBack={() => changeView({ kind: 'empty-lesson', number: 2 })} />
  }

  if (view.kind === 'lesson-two-sentences') {
    return <ReadingSentencesChapter onBack={() => changeView({ kind: 'empty-lesson', number: 2 })} />
  }

  if (view.kind === 'lesson-two-texts') {
    return <ReadingShortTextsChapter onBack={() => changeView({ kind: 'empty-lesson', number: 2 })} />
  }

  if (view.kind === 'lesson-three-courtesy') {
    return <CourtesyVocabularyMenu onOpen={changeView} onBack={() => changeView({ kind: 'empty-lesson', number: 3 })} />
  }

  if (view.kind === 'lesson-three-courtesy-basics') {
    return <CourtesyVocabularyModule onBack={() => changeView({ kind: 'lesson-three-courtesy' })} />
  }

  if (view.kind === 'lesson-three-courtesy-requests') {
    return <RequestsThanksApologiesModule onBack={() => changeView({ kind: 'lesson-three-courtesy' })} />
  }

  if (view.kind === 'lesson-three-description-people') {
    return <DesignationPeopleMenu onOpen={changeView} onBack={() => changeView({ kind: 'empty-lesson', number: 3 })} />
  }

  if (view.kind === 'lesson-three-personal-pronouns') {
    return <PersonalPronounsModule onBack={() => changeView({ kind: 'lesson-three-description-people' })} />
  }

  if (view.kind === 'lesson-three-family') {
    return <FamilyModule onBack={() => changeView({ kind: 'lesson-three-description-people' })} />
  }

  if (view.kind === 'lesson-three-demonstratives-places') {
    return <DemonstrativesPlacesModule onBack={() => changeView({ kind: 'lesson-three-description-people' })} />
  }

  if (view.kind === 'lesson-three-interrogatives') {
    return <InterrogativeWordsModule onBack={() => changeView({ kind: 'lesson-three-description-people' })} />
  }

  if (view.kind === 'lesson-three-time-chronology') {
    return <TimeChronologyMenu onOpen={changeView} onBack={() => changeView({ kind: 'empty-lesson', number: 3 })} />
  }

  if (view.kind === 'lesson-three-numbers') {
    return <NumbersModule onBack={() => changeView({ kind: 'lesson-three-time-chronology' })} />
  }

  if (view.kind === 'lesson-three-time-markers') {
    return <TimeMarkersModule onBack={() => changeView({ kind: 'lesson-three-time-chronology' })} />
  }

  if (view.kind === 'lesson-three-day-moments') {
    return <DayMomentsModule onBack={() => changeView({ kind: 'lesson-three-time-chronology' })} />
  }

  if (view.kind === 'lesson-three-days-periods') {
    return <DaysPeriodsModule onBack={() => changeView({ kind: 'lesson-three-time-chronology' })} />
  }

  if (view.kind === 'lesson-four-essential-verbs') {
    return <EssentialVerbsModule onBack={() => changeView({ kind: 'empty-lesson', number: 4 })} />
  }

  if (view.kind === 'lesson-three-daily-environment') {
    return <DailyEnvironmentMenu onOpen={changeView} onBack={() => changeView({ kind: 'empty-lesson', number: 3 })} />
  }

  if (view.kind === 'lesson-three-house') {
    return <HouseModule onBack={() => changeView({ kind: 'lesson-three-daily-environment' })} />
  }

  if (view.kind === 'lesson-three-everyday-objects') {
    return <EverydayObjectsModule onBack={() => changeView({ kind: 'lesson-three-daily-environment' })} />
  }

  if (view.kind === 'lesson-three-nearby-places') {
    return <NearbyPlacesModule onBack={() => changeView({ kind: 'lesson-three-daily-environment' })} />
  }

  if (view.kind === 'lesson-three-colors') {
    return <ColorsModule onBack={() => changeView({ kind: 'lesson-three-daily-environment' })} />
  }

  if (view.kind === 'empty-lesson') {
    return <EmptyLessonView number={view.number} onOpen={changeView} onBack={() => changeView({ kind: 'menu' })} />
  }

  if (view.kind === 'alphabet') {
    return (
      <AlphabetGrid
        onBack={() => changeView({ kind: 'menu' })}
        onLetter={(index) => changeView({ kind: 'letter', index })}
      />
    )
  } else if (view.kind === 'letter') {
    return (
      <LetterDetail
        index={view.index}
        onBack={() => changeView({ kind: 'alphabet' })}
        onGo={(index) => changeView({ kind: 'letter', index })}
        onComplete={() => changeView({ kind: 'menu' })}
      />
    )
  } else if (view.kind === 'rules') {
    return <RulesView topic={view.topic} onBack={() => changeView({ kind: 'menu' })} />
  } else if (view.kind === 'positions') {
    return <PositionsView onBack={() => changeView({ kind: 'menu' })} />
  } else if (view.kind === 'shadda') {
    return <ChaddaView onBack={() => changeView({ kind: 'menu' })} />
  } else if (view.kind === 'vocabulary') {
    return <VocabularyView onBack={() => changeView({ kind: 'menu' })} />
  } else if (view.kind === 'grammar') {
    return <GrammarView onBack={() => changeView({ kind: 'menu' })} />
  }
  return <ReadingView onBack={() => changeView({ kind: 'menu' })} />
}

function BackBar({ title, onBack }: { title: string; onBack: () => void }) {
  const { t } = useI18n()
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl">
      <button
        type="button"
        onClick={onBack}
        aria-label={t('common.back')}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card active:scale-90"
      >
        <ChevronLeft className="h-5 w-5 rtl:hidden" />
        <ChevronRight className="hidden h-5 w-5 rtl:block" />
      </button>
      <h1 className="gold-text text-lg font-bold">{title}</h1>
    </div>
  )
}

function EmptyLessonView({ number, onOpen, onBack }: { number: 2 | 3 | 4; onOpen: (v: View) => void; onBack: () => void }) {
  const { lang } = useI18n()
  const titles = {
    2: lang === 'ar' ? 'القراءة' : lang === 'en' ? 'Reading' : 'Lecture',
    3: lang === 'ar' ? 'المفردات الأساسية' : lang === 'en' ? 'Essential vocabulary' : 'Vocabulaire essentiel',
    4: lang === 'ar' ? 'القواعد وتصريف الأفعال' : lang === 'en' ? 'Grammar and conjugation' : 'Grammaire et conjugaison',
  }
  if (number === 2) {
    const chapters = lang === 'ar'
      ? ['قراءة الكلمات', 'قراءة الجمل', 'قراءة النصوص القصيرة']
      : lang === 'en'
        ? ['Reading words', 'Reading sentences', 'Reading short texts']
        : ['Lire des mots', 'Lire des phrases', 'Lire des textes courts']
    return <div>
      <BackBar title={`${lang === 'ar' ? 'الدرس' : lang === 'en' ? 'Lesson' : 'Leçon'} 2 · ${titles[2]}`} onBack={onBack} />
      <div className="space-y-3 px-5 pb-8 pt-5">
        {chapters.map((chapter, index) => <button type="button" key={chapter} onClick={() => index === 0 ? onOpen({ kind: 'lesson-two-words' }) : index === 1 ? onOpen({ kind: 'lesson-two-sentences' }) : onOpen({ kind: 'lesson-two-texts' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
          <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">{index + 1}</span>
          <span className="gold-text min-w-0 flex-1 text-base font-bold">{chapter}</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>)}
      </div>
    </div>
  }
  if (number === 3) {
    return <div>
      <BackBar title={`${lang === 'ar' ? 'الدرس' : lang === 'en' ? 'Lesson' : 'Leçon'} 3 · ${titles[3]}`} onBack={onBack} />
      <div className="space-y-3 px-5 pb-8 pt-5">
        <button type="button" onClick={() => onOpen({ kind: 'lesson-three-courtesy' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
          <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">1</span>
          <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Communication et politesse', lang)}</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
        <button type="button" onClick={() => onOpen({ kind: 'lesson-three-description-people' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
          <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">2</span>
          <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les désignations, les personnes et les interrogatifs', lang)}</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
        <button type="button" onClick={() => onOpen({ kind: 'lesson-three-time-chronology' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
          <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">3</span>
          <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Le temps et les repères chronologiques', lang)}</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
        <button type="button" onClick={() => onOpen({ kind: 'lesson-three-daily-environment' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
          <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">4</span>
          <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('L’environnement quotidien', lang)}</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
      </div>
    </div>
  }
  if (number === 4) {
    return <div>
      <BackBar title={`${lang === 'ar' ? 'الدرس' : lang === 'en' ? 'Lesson' : 'Leçon'} 4 · ${titles[4]}`} onBack={onBack} />
      <div className="space-y-3 px-5 pb-8 pt-5">
        <button type="button" onClick={() => onOpen({ kind: 'lesson-four-essential-verbs' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
          <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">1</span>
          <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les verbes essentiels', lang)}</span>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
      </div>
    </div>
  }
  return <div><BackBar title={`${lang === 'ar' ? 'الدرس' : lang === 'en' ? 'Lesson' : 'Leçon'} ${number} · ${titles[number]}`} onBack={onBack} /></div>
}

const ESSENTIAL_VERB_SECTIONS = [
  {
    title: '1 — Les actions du quotidien',
    rows: [
      ['Manger', 'يَأْكُلُ', 'Yaʾkulu'],
      ['Boire', 'يَشْرَبُ', 'Yashrabu'],
      ['Dormir', 'يَنَامُ', 'Yanāmu'],
      ['Se réveiller', 'يَسْتَيْقِظُ', 'Yastayqiẓu'],
    ],
  },
  {
    title: '2 — Les déplacements',
    rows: [
      ['Aller', 'يَذْهَبُ', 'Yadhhabu'],
      ['Venir', 'يَأْتِي', 'Yaʾtī'],
      ['Entrer', 'يَدْخُلُ', 'Yadkhulu'],
      ['Sortir', 'يَخْرُجُ', 'Yakhruju'],
    ],
  },
  {
    title: '3 — L’apprentissage',
    rows: [
      ['Lire', 'يَقْرَأُ', 'Yaqraʾu'],
      ['Écrire', 'يَكْتُبُ', 'Yaktubu'],
      ['Comprendre', 'يَفْهَمُ', 'Yafhamu'],
      ['Parler', 'يَتَكَلَّمُ', 'Yatakallamu'],
    ],
  },
] as const

function EssentialVerbsModule({ onBack }: { onBack: () => void }) {
  const { lang } = useI18n()
  return <div>
    <BackBar title={learningText('Les verbes essentiels', lang)} onBack={onBack} />
    <div className="space-y-6 px-4 pb-10 pt-5">
      <p className="rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
        {lang === 'ar' ? <>صيغ الأفعال العربية هنا في <strong className="text-foreground">المضارع مع «هو»</strong>. مثلًا، <span dir="rtl" className="font-arabic text-xl font-bold text-foreground">يَأْكُلُ</span> تعني <strong className="text-foreground">«هو يأكل»</strong>.</> : lang === 'en' ? <>The Arabic forms are in the <strong className="text-foreground">present tense with “he”</strong>. For example, <span dir="rtl" className="font-arabic text-xl font-bold text-foreground">يَأْكُلُ</span> means <strong className="text-foreground">“he eats”</strong>.</> : lang === 'id' ? <>Bentuk bahasa Arab menggunakan <strong className="text-foreground">waktu sekarang dengan “dia laki-laki”</strong>. Contohnya, <span dir="rtl" className="font-arabic text-xl font-bold text-foreground">يَأْكُلُ</span> berarti <strong className="text-foreground">“dia makan”</strong>.</> : lang === 'ms' ? <>Bentuk bahasa Arab menggunakan <strong className="text-foreground">masa kini dengan “dia lelaki”</strong>. Contohnya, <span dir="rtl" className="font-arabic text-xl font-bold text-foreground">يَأْكُلُ</span> bermaksud <strong className="text-foreground">“dia makan”</strong>.</> : <>Les formes arabes sont au <strong className="text-foreground">présent avec « il »</strong>. Par exemple, <span dir="rtl" className="font-arabic text-xl font-bold text-foreground">يَأْكُلُ</span> signifie <strong className="text-foreground">« il mange »</strong>.</>}
      </p>
      {ESSENTIAL_VERB_SECTIONS.map((section) => <section key={section.title} className="space-y-3">
        <h2 className="gold-text text-lg font-bold uppercase">{section.title.split(' — ')[0]} — {learningText(section.title.split(' — ')[1], lang)}</h2>
        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
          <table className="w-full table-fixed border-collapse text-start [overflow-wrap:anywhere]">
            <thead className="bg-secondary/70"><tr><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Français', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Arabe vocalisé', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Phonétique', lang)}</th></tr></thead>
            <tbody>{section.rows.map(([french, arabic, phonetic], index) => <tr key={arabic} className={index % 2 ? 'bg-secondary/20' : 'bg-card'}>
              <td className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground">{learningText(french, lang)}</td>
              <td dir="rtl" className="font-arabic border-t border-border px-4 py-4 text-right text-2xl font-bold leading-relaxed">{arabic}</td>
              <td className="border-t border-border px-4 py-4 text-sm font-medium text-muted-foreground">{phonetic}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>)}
    </div>
  </div>
}

function DailyEnvironmentMenu({ onOpen, onBack }: { onOpen: (v: View) => void; onBack: () => void }) {
  const { lang } = useI18n()
  return <div>
    <BackBar title={learningText('L’environnement quotidien', lang)} onBack={onBack} />
    <div className="space-y-3 px-5 pb-8 pt-5">
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-house' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">1</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('La maison', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-everyday-objects' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">2</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les objets du quotidien', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-nearby-places' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">3</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les lieux autour de nous', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-colors' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">4</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les couleurs', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
    </div>
  </div>
}

const HOUSE_VOCABULARY: readonly CourtesyDetail[] = [
  ['Maison', 'بَيْتٌ', 'Baytun', 'Le logement où l’on habite.'],
  ['Chambre / Pièce', 'غُرْفَةٌ', 'Ghurfatun', 'Une pièce de la maison.'],
  ['Cuisine', 'مَطْبَخٌ', 'Maṭbakhun', 'La pièce où l’on prépare les repas.'],
  ['Salle de bains', 'حَمَّامٌ', 'Ḥammāmun', 'La pièce où l’on se lave.'],
  ['Porte', 'بَابٌ', 'Bābun', 'Pour entrer dans une pièce ou en sortir.'],
  ['Fenêtre', 'نَافِذَةٌ', 'Nāfidhatun', 'Une ouverture qui laisse entrer la lumière et l’air.'],
  ['Jardin', 'حَدِيقَةٌ', 'Ḥadīqatun', 'Un espace extérieur avec des plantes ; peut aussi désigner un parc.'],
]

function HouseModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="La maison" rows={HOUSE_VOCABULARY} onBack={onBack} />
}

const EVERYDAY_OBJECTS: readonly CourtesyDetail[] = [
  ['Table', 'طَاوِلَةٌ', 'Ṭāwilatun', 'Un meuble pour manger, travailler ou poser des objets.'],
  ['Chaise', 'كُرْسِيٌّ', 'Kursiyyun', 'Un siège pour s’asseoir.'],
  ['Lit', 'سَرِيرٌ', 'Sarīrun', 'Un meuble pour dormir.'],
  ['Clé', 'مِفْتَاحٌ', 'Miftāḥun', 'Pour ouvrir ou fermer une serrure.'],
  ['Téléphone', 'هَاتِفٌ', 'Hātifun', 'Pour téléphoner ; terme général.'],
  ['Sac', 'حَقِيبَةٌ', 'Ḥaqībatun', 'Pour transporter ses affaires ; peut aussi désigner une valise.'],
  ['Livre', 'كِتَابٌ', 'Kitābun', 'Un ouvrage que l’on lit.'],
  ['Stylo', 'قَلَمٌ', 'Qalamun', 'Un instrument pour écrire ; peut aussi désigner un crayon selon le contexte.'],
]

function EverydayObjectsModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les objets du quotidien" rows={EVERYDAY_OBJECTS} onBack={onBack} />
}

const NEARBY_PLACES: readonly CourtesyDetail[] = [
  ['École', 'مَدْرَسَةٌ', 'Madrasatun', 'Un lieu où les élèves apprennent.'],
  ['Magasin', 'مَتْجَرٌ', 'Matjarun', 'Un lieu où l’on achète des produits.'],
  ['Marché', 'سُوقٌ', 'Sūqun', 'Un lieu qui rassemble des vendeurs et des commerces.'],
  ['Rue', 'شَارِعٌ', 'Shāriʿun', 'Une voie de circulation dans une ville ou un village.'],
  ['Mosquée', 'مَسْجِدٌ', 'Masjidun', 'Un lieu de prière musulman.'],
  ['Pharmacie', 'صَيْدَلِيَّةٌ', 'Ṣaydaliyyatun', 'Un commerce où l’on trouve des médicaments.'],
  ['Restaurant', 'مَطْعَمٌ', 'Maṭʿamun', 'Un établissement où l’on prend un repas.'],
]

function NearbyPlacesModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les lieux autour de nous" rows={NEARBY_PLACES} onBack={onBack} />
}

const COLORS: readonly CourtesyDetail[] = [
  ['Blanc', 'أَبْيَضُ', 'Abyaḍu', 'Masculin. Au féminin : بَيْضَاءُ — Bayḍāʾu.'],
  ['Noir', 'أَسْوَدُ', 'Aswadu', 'Masculin. Au féminin : سَوْدَاءُ — Sawdāʾu.'],
  ['Rouge', 'أَحْمَرُ', 'Aḥmaru', 'Masculin. Au féminin : حَمْرَاءُ — Ḥamrāʾu.'],
  ['Bleu', 'أَزْرَقُ', 'Azraqu', 'Masculin. Au féminin : زَرْقَاءُ — Zarqāʾu.'],
  ['Vert', 'أَخْضَرُ', 'Akhḍaru', 'Masculin. Au féminin : خَضْرَاءُ — Khaḍrāʾu.'],
  ['Jaune', 'أَصْفَرُ', 'Aṣfaru', 'Masculin. Au féminin : صَفْرَاءُ — Ṣafrāʾu.'],
  ['Orange', 'بُرْتُقَالِيٌّ', 'Burtuqāliyyun', 'Masculin. Au féminin : بُرْتُقَالِيَّةٌ — Burtuqāliyyatun.'],
  ['Rose', 'وَرْدِيٌّ', 'Wardiyyun', 'Masculin. Au féminin : وَرْدِيَّةٌ — Wardiyyatun.'],
  ['Marron', 'بُنِّيٌّ', 'Bunniyyun', 'Masculin. Au féminin : بُنِّيَّةٌ — Bunniyyatun.'],
  ['Gris', 'رَمَادِيٌّ', 'Ramādiyyun', 'Masculin. Au féminin : رَمَادِيَّةٌ — Ramādiyyatun.'],
]

function ColorsModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les couleurs" rows={COLORS} onBack={onBack} />
}

const COURTESY_VOCABULARY = [
  ['Marḥaban', 'مَرْحَبًا', 'Bonjour / Salut'],
  ['As-salāmu ʿalaykum', 'السَّلَامُ عَلَيْكُمْ', 'Que la paix soit sur vous — salutation'],
  ['Wa-ʿalaykumu s-salāmu', 'وَعَلَيْكُمُ السَّلَامُ', 'Et sur vous la paix — réponse à la salutation'],
  ['Ṣabāḥu l-khayri', 'صَبَاحُ الْخَيْرِ', 'Bonjour — le matin'],
  ['Ṣabāḥu n-nūri', 'صَبَاحُ النُّورِ', 'Bonjour — réponse à la salutation du matin'],
  ['Masāʾu l-khayri', 'مَسَاءُ الْخَيْرِ', 'Bonsoir'],
  ['Masāʾu n-nūri', 'مَسَاءُ النُّورِ', 'Bonsoir — réponse'],
  ['Ahlan wa-sahlan', 'أَهْلًا وَسَهْلًا', 'Bienvenue'],
  ['Kayfa ḥāluka ?', 'كَيْفَ حَالُكَ؟', 'Comment vas-tu ?'],
  ['Ana bi-khayrin, shukran', 'أَنَا بِخَيْرٍ، شُكْرًا', 'Je vais bien, merci'],
  ['Min faḍlika', 'مِنْ فَضْلِكَ', 'S’il te plaît'],
  ['Shukran', 'شُكْرًا', 'Merci'],
  ['Shukran jazīlan', 'شُكْرًا جَزِيلًا', 'Merci beaucoup'],
  ['ʿAfwan', 'عَفْوًا', 'De rien / Pardon'],
  ['Ana āsifun', 'أَنَا آسِفٌ', 'Je suis désolé'],
  ['Naʿam', 'نَعَمْ', 'Oui'],
  ['Lā', 'لَا', 'Non'],
  ['Lā afhamu', 'لَا أَفْهَمُ', 'Je ne comprends pas'],
  ['Maʿa s-salāmati', 'مَعَ السَّلَامَةِ', 'Au revoir'],
  ['Ila l-liqāʾi', 'إِلَى اللِّقَاءِ', 'À bientôt'],
] as const

function CourtesyVocabularyMenu({ onOpen, onBack }: { onOpen: (v: View) => void; onBack: () => void }) {
  const { lang } = useI18n()
  const chapters = [
    { title: 'Politesse et formules de base', view: { kind: 'lesson-three-courtesy-basics' } as View },
    { title: 'Demandes, remerciements et excuses', view: { kind: 'lesson-three-courtesy-requests' } as View },
  ]
  return <div>
    <BackBar title={learningText('Communication et politesse', lang)} onBack={onBack} />
    <div className="space-y-3 px-5 pb-8 pt-5">
      {chapters.map((chapter, index) => <button type="button" key={chapter.title} onClick={() => onOpen(chapter.view)} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">{index + 1}</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText(chapter.title, lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>)}
    </div>
  </div>
}

function DesignationPeopleMenu({ onOpen, onBack }: { onOpen: (v: View) => void; onBack: () => void }) {
  const { lang } = useI18n()
  return <div>
    <BackBar title={learningText('Les désignations, les personnes et les interrogatifs', lang)} onBack={onBack} />
    <div className="space-y-3 px-5 pb-8 pt-5">
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-personal-pronouns' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">1</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les pronoms personnels', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-family' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">2</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('La famille', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-demonstratives-places' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">3</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les démonstratifs et les lieux', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-interrogatives' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">4</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les mots interrogatifs', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
    </div>
  </div>
}

const PERSONAL_PRONOUNS: readonly CourtesyDetail[] = [
  ['Je / Moi', 'أَنَا', 'Anā', 'Pour parler de soi. Même forme pour un homme ou une femme.'],
  ['Tu / Toi', 'أَنْتَ', 'Anta', 'Pour s’adresser à un homme ou à un garçon.'],
  ['Tu / Toi', 'أَنْتِ', 'Anti', 'Pour s’adresser à une femme ou à une fille.'],
  ['Il / Lui', 'هُوَ', 'Huwa', 'Pour parler d’un homme, d’un garçon ou d’un nom grammaticalement masculin.'],
  ['Elle', 'هِيَ', 'Hiya', 'Pour parler d’une femme, d’une fille ou d’un nom grammaticalement féminin.'],
  ['Nous', 'نَحْنُ', 'Naḥnu', 'Pour parler de soi avec une ou plusieurs autres personnes.'],
  ['Vous deux', 'أَنْتُمَا', 'Antumā', 'Pour s’adresser à exactement deux personnes, quel que soit leur genre.'],
  ['Vous', 'أَنْتُمْ', 'Antum', 'Pour s’adresser à au moins trois personnes : groupe masculin ou mixte.'],
  ['Vous', 'أَنْتُنَّ', 'Antunna', 'Pour s’adresser à au moins trois femmes ou filles.'],
  ['Ils deux / Elles deux', 'هُمَا', 'Humā', 'Pour parler d’exactement deux personnes, quel que soit leur genre.'],
  ['Ils / Eux', 'هُمْ', 'Hum', 'Pour parler d’au moins trois personnes : groupe masculin ou mixte.'],
  ['Elles', 'هُنَّ', 'Hunna', 'Pour parler d’au moins trois femmes ou filles.'],
]

function PersonalPronounsModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les pronoms personnels" rows={PERSONAL_PRONOUNS} onBack={onBack} />
}

const FAMILY_VOCABULARY = [
  ['Famille', 'أُسْرَةٌ', 'Usratun'],
  ['Père', 'أَبٌ', 'Abun'],
  ['Mère', 'أُمٌّ', 'Ummun'],
  ['Frère', 'أَخٌ', 'Akhun'],
  ['Sœur', 'أُخْتٌ', 'Ukhtun'],
  ['Fils', 'اِبْنٌ', 'Ibnun'],
  ['Fille', 'بِنْتٌ', 'Bintun'],
  ['Ami', 'صَدِيقٌ', 'Ṣadīqun'],
  ['Amie', 'صَدِيقَةٌ', 'Ṣadīqatun'],
] as const

function FamilyModule({ onBack }: { onBack: () => void }) {
  const { lang } = useI18n()
  return <div>
    <BackBar title={learningText('La famille', lang)} onBack={onBack} />
    <div className="px-4 pb-10 pt-5">
      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
        <table className="w-full table-fixed border-collapse text-start [overflow-wrap:anywhere]">
          <thead className="bg-secondary/70"><tr><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Français', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Arabe vocalisé', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Phonétique', lang)}</th></tr></thead>
          <tbody>{FAMILY_VOCABULARY.map(([french, arabic, phonetic], index) => <tr key={arabic} className={index % 2 ? 'bg-secondary/20' : 'bg-card'}>
            <td className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground">{learningText(french, lang)}</td>
            <td dir="rtl" className="font-arabic border-t border-border px-4 py-4 text-right text-2xl font-bold leading-relaxed">{arabic}</td>
            <td className="border-t border-border px-4 py-4 text-sm font-medium text-muted-foreground">{phonetic}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>
}

const DEMONSTRATIVES_PLACES: readonly CourtesyDetail[] = [
  ['Celui-ci', 'هَٰذَا', 'Hādhā', 'Pour montrer une personne ou une chose au masculin.'],
  ['Celle-ci', 'هَٰذِهِ', 'Hādhihi', 'Pour montrer une personne ou une chose au féminin.'],
  ['Ici', 'هُنَا', 'Hunā', 'Pour indiquer l’endroit où l’on se trouve.'],
  ['Là-bas', 'هُنَاكَ', 'Hunāka', 'Pour montrer un autre endroit.'],
  ['Où ?', 'أَيْنَ؟', 'Ayna ?', 'Pour demander où se trouve quelqu’un ou quelque chose.'],
  ['Dans', 'فِي', 'Fī', 'Pour dire qu’une personne ou une chose est à l’intérieur.'],
  ['Sur', 'عَلَى', 'ʿAlā', 'Pour situer une chose sur une autre.'],
  ['Sous', 'تَحْتَ', 'Taḥta', 'Pour situer une chose en dessous d’une autre.'],
]

function DemonstrativesPlacesModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les démonstratifs et les lieux" rows={DEMONSTRATIVES_PLACES} onBack={onBack} />
}

const INTERROGATIVE_WORDS: readonly CourtesyDetail[] = [
  ['Qui ?', 'مَنْ؟', 'Man ?', 'Pour demander de quelle personne il s’agit.'],
  ['Quoi ? / Que ?', 'مَاذَا؟', 'Mādhā ?', 'Pour demander de quelle chose ou action il s’agit.'],
  ['Où ?', 'أَيْنَ؟', 'Ayna ?', 'Pour demander un lieu.'],
  ['Quand ?', 'مَتَى؟', 'Matā ?', 'Pour demander un moment ou une date.'],
  ['Comment ?', 'كَيْفَ؟', 'Kayfa ?', 'Pour demander une manière de faire ou comment quelqu’un va.'],
  ['Combien ?', 'كَمْ؟', 'Kam ?', 'Pour demander un nombre, une quantité ou un prix.'],
  ['Pourquoi ?', 'لِمَاذَا؟', 'Limādhā ?', 'Pour demander une raison.'],
  ['Est-ce que… ?', 'هَلْ؟', 'Hal ?', 'Se place au début d’une question à laquelle on peut répondre par oui ou non.'],
]

function InterrogativeWordsModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les mots interrogatifs" rows={INTERROGATIVE_WORDS} onBack={onBack} />
}

function TimeChronologyMenu({ onOpen, onBack }: { onOpen: (v: View) => void; onBack: () => void }) {
  const { lang } = useI18n()
  return <div>
    <BackBar title={learningText('Le temps et les repères chronologiques', lang)} onBack={onBack} />
    <div className="space-y-3 px-5 pb-8 pt-5">
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-numbers' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">1</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les chiffres', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-time-markers' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">2</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les repères dans le temps', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-day-moments' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">3</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les moments de la journée', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
      <button type="button" onClick={() => onOpen({ kind: 'lesson-three-days-periods' })} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
        <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">4</span>
        <span className="gold-text min-w-0 flex-1 text-base font-bold">{learningText('Les jours et les périodes', lang)}</span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
    </div>
  </div>
}

type NumberDetail = readonly [number: number, french: string, arabic: string, phonetic: string]

const NUMBER_SERIES: readonly { title: string; rows: readonly NumberDetail[] }[] = [
  {
    title: 'Série 1 — De 0 à 10',
    rows: [
      [0, 'Zéro', 'صِفْرٌ', 'Ṣifrun'],
      [1, 'Un', 'وَاحِدٌ', 'Wāḥidun'],
      [2, 'Deux', 'اِثْنَانِ', 'Ithnāni'],
      [3, 'Trois', 'ثَلَاثَةٌ', 'Thalāthatun'],
      [4, 'Quatre', 'أَرْبَعَةٌ', 'Arbaʿatun'],
      [5, 'Cinq', 'خَمْسَةٌ', 'Khamsatun'],
      [6, 'Six', 'سِتَّةٌ', 'Sittatun'],
      [7, 'Sept', 'سَبْعَةٌ', 'Sabʿatun'],
      [8, 'Huit', 'ثَمَانِيَةٌ', 'Thamāniyatun'],
      [9, 'Neuf', 'تِسْعَةٌ', 'Tisʿatun'],
      [10, 'Dix', 'عَشَرَةٌ', 'ʿAsharatun'],
    ],
  },
  {
    title: 'Série 2 — De 11 à 20',
    rows: [
      [11, 'Onze', 'أَحَدَ عَشَرَ', 'Aḥada ʿashara'],
      [12, 'Douze', 'اِثْنَا عَشَرَ', 'Ithnā ʿashara'],
      [13, 'Treize', 'ثَلَاثَةَ عَشَرَ', 'Thalāthata ʿashara'],
      [14, 'Quatorze', 'أَرْبَعَةَ عَشَرَ', 'Arbaʿata ʿashara'],
      [15, 'Quinze', 'خَمْسَةَ عَشَرَ', 'Khamsata ʿashara'],
      [16, 'Seize', 'سِتَّةَ عَشَرَ', 'Sittata ʿashara'],
      [17, 'Dix-sept', 'سَبْعَةَ عَشَرَ', 'Sabʿata ʿashara'],
      [18, 'Dix-huit', 'ثَمَانِيَةَ عَشَرَ', 'Thamāniyata ʿashara'],
      [19, 'Dix-neuf', 'تِسْعَةَ عَشَرَ', 'Tisʿata ʿashara'],
      [20, 'Vingt', 'عِشْرُونَ', 'ʿIshrūna'],
    ],
  },
  {
    title: 'Série 3 — Les dizaines jusqu’à 100',
    rows: [
      [20, 'Vingt', 'عِشْرُونَ', 'ʿIshrūna'],
      [30, 'Trente', 'ثَلَاثُونَ', 'Thalāthūna'],
      [40, 'Quarante', 'أَرْبَعُونَ', 'Arbaʿūna'],
      [50, 'Cinquante', 'خَمْسُونَ', 'Khamsūna'],
      [60, 'Soixante', 'سِتُّونَ', 'Sittūna'],
      [70, 'Soixante-dix', 'سَبْعُونَ', 'Sabʿūna'],
      [80, 'Quatre-vingts', 'ثَمَانُونَ', 'Thamānūna'],
      [90, 'Quatre-vingt-dix', 'تِسْعُونَ', 'Tisʿūna'],
      [100, 'Cent', 'مِائَةٌ', 'Miʾatun'],
    ],
  },
]

const NUMBER_23_STEPS = [
  ['1', 'L’unité : trois', 'ثَلَاثَةٌ', 'Thalāthatun'],
  ['2', 'Le lien : et', 'وَ', 'Wa'],
  ['3', 'La dizaine : vingt', 'عِشْرُونَ', 'ʿIshrūna'],
  ['Résultat : 23', 'Trois et vingt', 'ثَلَاثَةٌ وَعِشْرُونَ', 'Thalāthatun wa-ʿishrūna'],
] as const

const NUMBER_PRACTICE = [
  [21, 'Vingt et un', 'Un + et + vingt', 'وَاحِدٌ وَعِشْرُونَ', 'Wāḥidun wa-ʿishrūna'],
  [32, 'Trente-deux', 'Deux + et + trente', 'اِثْنَانِ وَثَلَاثُونَ', 'Ithnāni wa-thalāthūna'],
  [45, 'Quarante-cinq', 'Cinq + et + quarante', 'خَمْسَةٌ وَأَرْبَعُونَ', 'Khamsatun wa-arbaʿūna'],
  [56, 'Cinquante-six', 'Six + et + cinquante', 'سِتَّةٌ وَخَمْسُونَ', 'Sittatun wa-khamsūna'],
  [67, 'Soixante-sept', 'Sept + et + soixante', 'سَبْعَةٌ وَسِتُّونَ', 'Sabʿatun wa-sittūna'],
  [78, 'Soixante-dix-huit', 'Huit + et + soixante-dix', 'ثَمَانِيَةٌ وَسَبْعُونَ', 'Thamāniyatun wa-sabʿūna'],
  [99, 'Quatre-vingt-dix-neuf', 'Neuf + et + quatre-vingt-dix', 'تِسْعَةٌ وَتِسْعُونَ', 'Tisʿatun wa-tisʿūna'],
] as const

function NumbersModule({ onBack }: { onBack: () => void }) {
  const { lang } = useI18n()
  const [page, setPage] = useState(0)
  const series = NUMBER_SERIES[page]

  return <div>
    <BackBar title={learningText('Les chiffres', lang)} onBack={onBack} />
    <div className="px-4 pb-10 pt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="gold-text text-lg font-bold">{learningText(series.title, lang)}</h2>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">{learningText('Page', lang)} {page + 1}</span>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
        <table className="w-full table-fixed border-collapse text-start [overflow-wrap:anywhere]">
          <thead className="bg-secondary/70"><tr><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Nombre', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Français', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Arabe vocalisé', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Phonétique', lang)}</th></tr></thead>
          <tbody>{series.rows.map(([number, french, arabic, phonetic], index) => <tr key={number} className={index % 2 ? 'bg-secondary/20' : 'bg-card'}>
            <td className="border-t border-border px-4 py-4 text-sm font-bold text-foreground">{number}</td>
            <td className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground">{learningText(french, lang)}</td>
            <td dir="rtl" className="font-arabic border-t border-border px-4 py-4 text-right text-2xl font-bold leading-relaxed">{arabic}</td>
            <td className="border-t border-border px-4 py-4 text-sm font-medium text-muted-foreground">{phonetic}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {page === 2 && <div className="mt-6 space-y-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h3 className="gold-text text-lg font-bold">Comment former les nombres de 21 à 99 ?</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">En arabe, on prononce <strong>l’unité avant la dizaine</strong>, en les reliant avec <strong>وَ — wa</strong>, qui signifie <strong>« et »</strong>.</p>
          <p className="my-4 text-center text-base font-bold text-primary">UNITÉ + وَ + DIZAINE</p>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">Pour dire <strong>vingt-trois</strong>, on dit donc <strong>« trois et vingt »</strong> :</p>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full table-fixed border-collapse text-start [overflow-wrap:anywhere]">
              <thead className="bg-secondary/70"><tr><th className="px-4 py-3 text-start text-sm font-bold text-primary">Étape</th><th className="px-4 py-3 text-start text-sm font-bold text-primary">Élément</th><th className="px-4 py-3 text-start text-sm font-bold text-primary">Arabe</th><th className="px-4 py-3 text-start text-sm font-bold text-primary">Phonétique</th></tr></thead>
              <tbody>{NUMBER_23_STEPS.map(([step, element, arabic, phonetic], index) => <tr key={step} className={index % 2 ? 'bg-secondary/20' : 'bg-card'}><td className="border-t border-border px-4 py-3 text-sm font-bold">{step}</td><td className="border-t border-border px-4 py-3 text-sm">{element}</td><td dir="rtl" className="font-arabic border-t border-border px-4 py-3 text-right text-xl font-bold">{arabic}</td><td className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{phonetic}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h3 className="gold-text mb-4 text-lg font-bold">Sept exemples pour s’entraîner</h3>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full table-fixed border-collapse text-start [overflow-wrap:anywhere]">
              <thead className="bg-secondary/70"><tr><th className="px-4 py-3 text-start text-sm font-bold text-primary">Nombre</th><th className="px-4 py-3 text-start text-sm font-bold text-primary">Français</th><th className="px-4 py-3 text-start text-sm font-bold text-primary">Construction en arabe</th><th className="px-4 py-3 text-start text-sm font-bold text-primary">Arabe vocalisé</th><th className="px-4 py-3 text-start text-sm font-bold text-primary">Phonétique</th></tr></thead>
              <tbody>{NUMBER_PRACTICE.map(([number, french, construction, arabic, phonetic], index) => <tr key={number} className={index % 2 ? 'bg-secondary/20' : 'bg-card'}><td className="border-t border-border px-4 py-3 text-sm font-bold">{number}</td><td className="border-t border-border px-4 py-3 text-sm">{french}</td><td className="border-t border-border px-4 py-3 text-sm">{construction}</td><td dir="rtl" className="font-arabic border-t border-border px-4 py-3 text-right text-xl font-bold">{arabic}</td><td className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{phonetic}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h3 className="gold-text text-lg font-bold">À retenir</h3>
          <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-relaxed text-muted-foreground">
            <li>Pour une dizaine exacte, comme <strong>30 ou 50</strong>, on utilise uniquement le nom de la dizaine.</li>
            <li>Pour un nombre comme <strong>32 ou 56</strong>, on dit <strong>l’unité, puis « wa », puis la dizaine</strong>.</li>
            <li><strong>100</strong> possède son propre mot : <strong>مِائَةٌ — Miʾatun</strong>.</li>
            <li>Cette règle concerne la façon de <strong>dire</strong> le nombre : <strong>23 reste écrit 23</strong>, ou <strong>٢٣</strong> avec les chiffres arabes orientaux.</li>
          </ul>
        </section>
      </div>}
      <div className="mt-5 flex justify-between gap-3">
        <button type="button" disabled={page === 0} onClick={() => setPage(current => Math.max(current - 1, 0))} className="rounded-2xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground disabled:cursor-not-allowed disabled:opacity-40">{learningText('Précédent', lang)}</button>
        <button type="button" disabled={page === NUMBER_SERIES.length - 1} onClick={() => setPage(current => Math.min(current + 1, NUMBER_SERIES.length - 1))} className="gold-gradient rounded-2xl px-6 py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">{learningText('Suivant', lang)}</button>
      </div>
    </div>
  </div>
}

const TIME_MARKERS: readonly CourtesyDetail[] = [
  ['Aujourd’hui', 'الْيَوْمَ', 'Al-yawma', 'Le jour où l’on parle.'],
  ['Hier', 'أَمْسِ', 'Amsi', 'Le jour précédent.'],
  ['Demain', 'غَدًا', 'Ghadan', 'Le jour suivant.'],
  ['Maintenant', 'الْآنَ', 'Al-āna', 'Au moment où l’on parle.'],
  ['Avant', 'قَبْلَ', 'Qabla', 'Pour situer quelque chose avant un moment ou un événement.'],
  ['Après', 'بَعْدَ', 'Baʿda', 'Pour situer quelque chose après un moment ou un événement.'],
]

function TimeMarkersModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les repères dans le temps" rows={TIME_MARKERS} onBack={onBack} />
}

const DAY_MOMENTS: readonly CourtesyDetail[] = [
  ['Matin', 'صَبَاحٌ', 'Ṣabāḥun', 'Le début de la journée.'],
  ['Midi', 'ظُهْرٌ', 'Ẓuhrun', 'Le milieu de la journée, autour de midi.'],
  ['Après-midi', 'بَعْدَ الظُّهْرِ', 'Baʿda ẓ-ẓuhri', 'La période après midi.'],
  ['Soir', 'مَسَاءٌ', 'Masāʾun', 'La fin de la journée et le début de la soirée.'],
  ['Nuit', 'لَيْلٌ', 'Laylun', 'La période entre le coucher et le lever du soleil.'],
]

function DayMomentsModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les moments de la journée" rows={DAY_MOMENTS} onBack={onBack} />
}

const DAYS_PERIODS: readonly CourtesyDetail[] = [
  ['Lundi', 'يَوْمُ الِاثْنَيْنِ', 'Yawmu l-ithnayni', 'Le jour qui suit dimanche.'],
  ['Mardi', 'يَوْمُ الثُّلَاثَاءِ', 'Yawmu th-thulāthāʾi', 'Le jour qui suit lundi.'],
  ['Mercredi', 'يَوْمُ الْأَرْبِعَاءِ', 'Yawmu l-arbiʿāʾi', 'Le jour qui suit mardi.'],
  ['Jeudi', 'يَوْمُ الْخَمِيسِ', 'Yawmu l-khamīsi', 'Le jour qui suit mercredi.'],
  ['Vendredi', 'يَوْمُ الْجُمُعَةِ', 'Yawmu l-jumuʿati', 'Le jour qui suit jeudi.'],
  ['Samedi', 'يَوْمُ السَّبْتِ', 'Yawmu s-sabti', 'Le jour qui suit vendredi.'],
  ['Dimanche', 'يَوْمُ الْأَحَدِ', 'Yawmu l-aḥadi', 'Le jour qui suit samedi.'],
  ['Jour', 'يَوْمٌ', 'Yawmun', 'Une journée.'],
  ['Semaine', 'أُسْبُوعٌ', 'Usbūʿun', 'Une période de sept jours.'],
  ['Mois', 'شَهْرٌ', 'Shahrun', 'Un mois du calendrier.'],
  ['Année', 'سَنَةٌ', 'Sanatun', 'Une période de douze mois.'],
]

function DaysPeriodsModule({ onBack }: { onBack: () => void }) {
  return <LocalizedDetailModule title="Les jours et les périodes" rows={DAYS_PERIODS} onBack={onBack} />
}

function CourtesyVocabularyModule({ onBack }: { onBack: () => void }) {
  const { lang } = useI18n()
  return <div>
    <BackBar title={learningText('Politesse et formules de base', lang)} onBack={onBack} />
    <div className="px-4 pb-10 pt-5">
      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
        <table className="w-full table-fixed border-collapse text-start [overflow-wrap:anywhere]">
          <thead className="bg-secondary/70"><tr><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Français', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Arabe vocalisé', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Phonétique', lang)}</th></tr></thead>
          <tbody>{COURTESY_VOCABULARY.map(([phonetic, arabic, french], index) => <tr key={arabic} className={index % 2 ? 'bg-secondary/20' : 'bg-card'}>
            <td className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground">{learningText(french, lang)}</td>
            <td dir="rtl" className="font-arabic border-t border-border px-4 py-4 text-right text-2xl font-bold leading-relaxed">{arabic}</td>
            <td className="border-t border-border px-4 py-4 text-sm font-medium text-muted-foreground">{phonetic}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>
}

type CourtesyDetail = readonly [french: string, arabic: string, phonetic: string, nuance: string]

function LocalizedDetailModule({ title, rows, onBack }: { title: string; rows: readonly CourtesyDetail[]; onBack: () => void }) {
  const { lang } = useI18n()
  return <div>
    <BackBar title={learningText(title, lang)} onBack={onBack} />
    <div className="px-4 pb-10 pt-5">
      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
        <table className="w-full table-fixed border-collapse text-start [overflow-wrap:anywhere]">
          <thead className="bg-secondary/70"><tr><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Français', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Arabe vocalisé', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Phonétique', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Utilisation / Nuance', lang)}</th></tr></thead>
          <tbody>{rows.map(([french, arabic, phonetic, nuance], index) => <tr key={`${arabic}-${phonetic}`} className={index % 2 ? 'bg-secondary/20' : 'bg-card'}>
            <td className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground">{learningText(french, lang)}</td>
            <td dir="rtl" className="font-arabic border-t border-border px-4 py-4 text-right text-2xl font-bold leading-relaxed">{arabic}</td>
            <td className="border-t border-border px-4 py-4 text-sm font-medium text-muted-foreground">{phonetic}</td>
            <td className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground">{learningText(nuance, lang)}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>
}

const REQUESTS_THANKS_APOLOGIES: ReadonlyArray<{ title: string; rows: readonly CourtesyDetail[] }> = [
  { title: 'Demandes', rows: [
    ['S’il te plaît', 'مِنْ فَضْلِكَ', 'Min faḍlika', 'Pour demander poliment quelque chose à un homme.'],
    ['S’il te plaît', 'مِنْ فَضْلِكِ', 'Min faḍliki', 'Pour demander poliment quelque chose à une femme.'],
    ['Peux-tu m’aider ?', 'هَلْ يُمْكِنُكَ مُسَاعَدَتِي؟', 'Hal yumkinuka musāʿadatī ?', 'Pour demander de l’aide à un homme.'],
    ['Peux-tu m’aider ?', 'هَلْ يُمْكِنُكِ مُسَاعَدَتِي؟', 'Hal yumkinuki musāʿadatī ?', 'Pour demander de l’aide à une femme.'],
    ['Répète, s’il te plaît', 'أَعِدْ، مِنْ فَضْلِكَ', 'Aʿid, min faḍlika', 'À un homme, lorsqu’on n’a pas bien entendu ou compris.'],
    ['Répète, s’il te plaît', 'أَعِيدِي، مِنْ فَضْلِكِ', 'Aʿīdī, min faḍliki', 'À une femme, lorsqu’on n’a pas bien entendu ou compris.'],
    ['Parle lentement, s’il te plaît', 'تَكَلَّمْ بِبُطْءٍ، مِنْ فَضْلِكَ', 'Takallam bi-buṭʾin, min faḍlika', 'À un homme, pour suivre plus facilement ses paroles.'],
    ['Parle lentement, s’il te plaît', 'تَكَلَّمِي بِبُطْءٍ، مِنْ فَضْلِكِ', 'Takallamī bi-buṭʾin, min faḍliki', 'À une femme, pour suivre plus facilement ses paroles.'],
  ] },
  { title: 'Remerciements', rows: [
    ['Merci', 'شُكْرًا', 'Shukran', 'Remerciement courant, utilisable avec tout le monde.'],
    ['Merci beaucoup', 'شُكْرًا جَزِيلًا', 'Shukran jazīlan', 'Pour exprimer un remerciement plus appuyé.'],
    ['Merci pour ton aide', 'شُكْرًا عَلَى مُسَاعَدَتِكَ', 'Shukran ʿalā musāʿadatika', 'Pour remercier un homme de son aide.'],
    ['Merci pour ton aide', 'شُكْرًا عَلَى مُسَاعَدَتِكِ', 'Shukran ʿalā musāʿadatiki', 'Pour remercier une femme de son aide.'],
    ['De rien', 'عَفْوًا', 'ʿAfwan', 'Réponse à un remerciement, utilisable avec tout le monde.'],
  ] },
  { title: 'Excuses', rows: [
    ['Pardon / Excusez-moi', 'عَفْوًا', 'ʿAfwan', 'Pour une petite excuse ou pour attirer poliment l’attention.'],
    ['Je suis désolé', 'أَنَا آسِفٌ', 'Ana āsifun', 'Forme utilisée lorsque la personne qui s’excuse est un homme.'],
    ['Je suis désolée', 'أَنَا آسِفَةٌ', 'Ana āsifatun', 'Forme utilisée lorsque la personne qui s’excuse est une femme.'],
    ['Je m’excuse', 'أَعْتَذِرُ', 'Aʿtadhiru', 'Formule explicite d’excuse, identique pour un homme ou une femme.'],
    ['Pardonne-moi, s’il te plaît', 'سَامِحْنِي، مِنْ فَضْلِكَ', 'Sāmiḥnī, min faḍlika', 'Pour demander pardon à un homme.'],
    ['Pardonne-moi, s’il te plaît', 'سَامِحِينِي، مِنْ فَضْلِكِ', 'Sāmiḥīnī, min faḍliki', 'Pour demander pardon à une femme.'],
  ] },
]

function RequestsThanksApologiesModule({ onBack }: { onBack: () => void }) {
  const { lang } = useI18n()
  return <div>
    <BackBar title={learningText('Demandes, remerciements et excuses', lang)} onBack={onBack} />
    <div className="space-y-6 px-4 pb-10 pt-5">
      {REQUESTS_THANKS_APOLOGIES.map((section) => <section key={section.title}>
        <h2 className="gold-text mb-3 px-1 text-lg font-bold">{learningText(section.title, lang)}</h2>
        <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
          <table className="w-full table-fixed border-collapse text-start [overflow-wrap:anywhere]">
            <thead className="bg-secondary/70"><tr><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Français', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Arabe vocalisé', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Phonétique', lang)}</th><th className="px-4 py-4 text-start text-sm font-bold text-primary">{learningText('Utilisation / Nuance', lang)}</th></tr></thead>
            <tbody>{section.rows.map(([french, arabic, phonetic, nuance], index) => <tr key={`${arabic}-${phonetic}`} className={index % 2 ? 'bg-secondary/20' : 'bg-card'}>
              <td className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground">{learningText(french, lang)}</td>
              <td dir="rtl" className="font-arabic border-t border-border px-4 py-4 text-right text-2xl font-bold leading-relaxed">{arabic}</td>
              <td className="border-t border-border px-4 py-4 text-sm font-medium text-muted-foreground">{phonetic}</td>
              <td className="border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground">{learningText(nuance, lang)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>)}
    </div>
  </div>
}

type ReadingWord = { arabic: string; phonetic: string; meaning: string; image: string }
type ReadingWordSeries = { title: string; words: ReadingWord[] }

const READING_WORD_SERIES: ReadingWordSeries[] = [
  { title: 'Série 1 — Premiers mots courts', words: [
    { arabic: 'يَدْ', phonetic: 'yad', meaning: 'Main', image: '✋' }, { arabic: 'فَمْ', phonetic: 'fam', meaning: 'Bouche', image: '👄' },
    { arabic: 'قَلَمْ', phonetic: 'qalam', meaning: 'Stylo', image: '🖊️' }, { arabic: 'جَمَلْ', phonetic: 'jamal', meaning: 'Chameau', image: '🐪' },
    { arabic: 'قَمَرْ', phonetic: 'qamar', meaning: 'Lune', image: '🌙' }, { arabic: 'وَلَدْ', phonetic: 'walad', meaning: 'Garçon', image: '👦' },
  ] },
  { title: 'Série 2 — Mots avec des sons longs', words: [
    { arabic: 'بَابْ', phonetic: 'bāb', meaning: 'Porte', image: '🚪' }, { arabic: 'تَاجْ', phonetic: 'tāj', meaning: 'Couronne', image: '👑' },
    { arabic: 'فِيلْ', phonetic: 'fīl', meaning: 'Éléphant', image: '🐘' }, { arabic: 'حُوتْ', phonetic: 'ḥūt', meaning: 'Baleine', image: '🐋' },
    { arabic: 'كِتَابْ', phonetic: 'kitāb', meaning: 'Livre', image: '📖' }, { arabic: 'حَلِيبْ', phonetic: 'ḥalīb', meaning: 'Lait', image: '🥛' },
  ] },
  { title: 'Série 3 — Mots avec un soukoun', words: [
    { arabic: 'بِنْتْ', phonetic: 'bint', meaning: 'Fille', image: '👧' }, { arabic: 'كَلْبْ', phonetic: 'kalb', meaning: 'Chien', image: '🐕' },
    { arabic: 'شَمْسْ', phonetic: 'shams', meaning: 'Soleil', image: '☀️' }, { arabic: 'نَجْمْ', phonetic: 'najm', meaning: 'Étoile', image: '⭐' },
    { arabic: 'خُبْزْ', phonetic: 'khubz', meaning: 'Pain', image: '🥖' }, { arabic: 'مِلْحْ', phonetic: 'milḥ', meaning: 'Sel', image: '🧂' },
  ] },
  { title: 'Série 4 — Mots avec une consonne doublée', words: [
    { arabic: 'أُمّْ', phonetic: 'umm', meaning: 'Mère', image: '👩' }, { arabic: 'قِطّْ', phonetic: 'qiṭṭ', meaning: 'Chat', image: '🐈' },
    { arabic: 'دُبّْ', phonetic: 'dubb', meaning: 'Ours', image: '🐻' }, { arabic: 'سُكَّرْ', phonetic: 'sukkar', meaning: 'Sucre', image: '🧊' },
    { arabic: 'تُفَّاحْ', phonetic: 'tuffāḥ', meaning: 'Pommes', image: '🍎' }, { arabic: 'رُمَّانْ', phonetic: 'rummān', meaning: 'Grenades — les fruits', image: '🔴' },
  ] },
  { title: 'Série 5 — Mots plus longs', words: [
    { arabic: 'مَدْرَسَةْ', phonetic: 'madrasa', meaning: 'École', image: '🏫' }, { arabic: 'مَكْتَبَةْ', phonetic: 'maktaba', meaning: 'Bibliothèque', image: '📚' },
    { arabic: 'حَدِيقَةْ', phonetic: 'ḥadīqa', meaning: 'Jardin', image: '🌳' }, { arabic: 'حَقِيبَةْ', phonetic: 'ḥaqība', meaning: 'Sac', image: '🎒' },
    { arabic: 'سَيَّارَةْ', phonetic: 'sayyāra', meaning: 'Voiture', image: '🚗' }, { arabic: 'طَاوِلَةْ', phonetic: 'ṭāwila', meaning: 'Table', image: '🪑' },
  ] },
]

function ReadingWordCard({ word }: { word: ReadingWord }) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [listening, setListening] = useState(false)
  const listen = async () => {
    if (listening) return
    setListening(true)
    try { await speakArabic(word.arabic) } catch { /* The existing TTS fallback handles unavailable voices. */ } finally { setListening(false) }
  }
  return <article className="rounded-3xl border border-border bg-card p-5 text-center shadow-sm">
    <div role="img" aria-label={word.meaning} className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary text-6xl">{word.image}</div>
    <p dir="rtl" className="font-arabic mt-4 text-5xl font-bold leading-[1.5] text-foreground">{word.arabic}</p>
    <p className="mt-1 text-base font-semibold tracking-wide text-muted-foreground">{word.phonetic}</p>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <button type="button" onClick={listen} disabled={listening} className="rounded-2xl border border-border bg-secondary px-3 py-3 text-sm font-semibold text-foreground disabled:opacity-60">{listening ? 'Écoute…' : 'Écouter'}</button>
      <button type="button" onClick={() => setShowMeaning((shown) => !shown)} className="rounded-2xl border border-primary/30 bg-primary/10 px-3 py-3 text-sm font-semibold text-primary">Voir le sens</button>
    </div>
    {showMeaning && <p className="mt-3 rounded-2xl bg-secondary px-3 py-2 font-semibold">{word.meaning}</p>}
  </article>
}

function ReadingWordsChapter({ onBack }: { onBack: () => void }) {
  const words = READING_WORD_SERIES.flatMap((series) => series.words)
  const [wordIndex, setWordIndex] = useState(0)
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [seriesBreak, setSeriesBreak] = useState(false)

  if (reviewIndex !== null) {
    const word = words[reviewIndex]
    const optionIndexes = [reviewIndex, (reviewIndex + 7) % words.length, (reviewIndex + 13) % words.length, (reviewIndex + 21) % words.length]
    const shift = reviewIndex % optionIndexes.length
    const options = [...optionIndexes.slice(shift), ...optionIndexes.slice(0, shift)].map((index) => words[index])
    const choose = (answer: string) => {
      if (selectedAnswer) return
      setSelectedAnswer(answer)
      if (answer === word.arabic) setScore((current) => current + 1)
    }
    const nextQuestion = () => {
      if (reviewIndex === words.length - 1) {
        setFinished(true)
        return
      }
      setReviewIndex(reviewIndex + 1)
      setSelectedAnswer(null)
    }
    if (finished) return <div>
      <BackBar title="Révision finale" onBack={onBack} />
      <div className="px-5 pb-10 pt-8 text-center">
        <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <h2 className="gold-text mt-4 text-2xl font-bold">Révision terminée</h2>
          <p className="mt-2 text-muted-foreground">Vous avez révisé les 30 mots.</p>
          <p className="mt-5 text-4xl font-bold text-primary">{score} / {words.length}</p>
          <button type="button" onClick={() => { setReviewIndex(0); setSelectedAnswer(null); setScore(0); setFinished(false) }} className="gold-gradient mt-6 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">Recommencer la révision</button>
        </div>
      </div>
    </div>
    return <div>
      <BackBar title="Révision finale" onBack={onBack} />
      <div className="mx-auto max-w-xl px-5 pb-10 pt-5">
        <div className="mb-4 flex items-center gap-3"><ProgressBar value={((reviewIndex + 1) / words.length) * 100} className="h-2 flex-1" /><span className="text-xs font-bold text-primary">{reviewIndex + 1}/{words.length}</span></div>
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground">Quel mot correspond à cette image ?</p>
          <div role="img" aria-label={word.meaning} className="mx-auto mt-5 flex h-32 w-32 items-center justify-center rounded-3xl bg-secondary text-7xl">{word.image}</div>
          <div className="mt-6 grid grid-cols-2 gap-3">{options.map((option) => {
            const correct = option.arabic === word.arabic
            const chosen = selectedAnswer === option.arabic
            const stateClass = selectedAnswer ? (correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700' : chosen ? 'border-red-500 bg-red-500/10 text-red-700' : 'border-border bg-background') : 'border-border bg-background'
            return <button key={option.arabic} type="button" onClick={() => choose(option.arabic)} className={`font-arabic rounded-2xl border p-4 text-2xl font-bold ${stateClass}`}>{option.arabic}</button>
          })}</div>
          {selectedAnswer && <div className="mt-5"><p className="font-semibold">{selectedAnswer === word.arabic ? 'Bonne réponse' : `Réponse correcte : ${word.arabic}`}</p><p className="mt-1 text-sm text-muted-foreground">{word.meaning}</p><button type="button" onClick={nextQuestion} className="gold-gradient mt-4 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{reviewIndex === words.length - 1 ? 'Voir mon résultat' : 'Question suivante'}</button></div>}
        </div>
      </div>
    </div>
  }

  const word = words[wordIndex]
  const seriesIndex = Math.floor(wordIndex / 6)
  const positionInSeries = wordIndex % 6
  const endOfSeries = positionInSeries === 5
  if (seriesBreak) {
    const finalSeries = seriesIndex === READING_WORD_SERIES.length - 1
    return <div>
      <BackBar title="Lire des mots" onBack={onBack} />
      <div className="mx-auto max-w-xl px-5 pb-10 pt-8 text-center">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-primary">Série {seriesIndex + 1} sur {READING_WORD_SERIES.length}</p>
          <h2 className="gold-text mt-2 text-2xl font-bold">Série terminée</h2>
          <p className="mt-2 text-sm text-muted-foreground">Vous avez étudié les six mots de cette série.</p>
          <button type="button" onClick={() => {
            if (finalSeries) setReviewIndex(0)
            else setWordIndex((current) => current + 1)
            setSeriesBreak(false)
          }} className="gold-gradient mt-6 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{finalSeries ? 'Commencer la révision finale' : `Passer à la série ${seriesIndex + 2}`}</button>
          <button type="button" onClick={onBack} className="mt-3 w-full rounded-2xl border border-border bg-background py-3.5 font-semibold">Retour</button>
        </div>
      </div>
    </div>
  }
  return <div>
    <BackBar title="Lire des mots" onBack={onBack} />
    <div className="mx-auto max-w-xl px-5 pb-10 pt-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Série {seriesIndex + 1} sur {READING_WORD_SERIES.length}</p>
      <h2 className="gold-text mt-1 text-lg font-bold">{READING_WORD_SERIES[seriesIndex].title.replace(/^Série \d+ — /, '')}</h2>
      <div className="mt-4 flex items-center gap-3"><ProgressBar value={((positionInSeries + 1) / 6) * 100} className="h-2 flex-1" /><span className="text-xs font-bold text-primary">{positionInSeries + 1}/6</span></div>
      <div className="mt-5"><ReadingWordCard key={word.arabic} word={word} /></div>
      <button type="button" onClick={() => endOfSeries ? setSeriesBreak(true) : setWordIndex((current) => current + 1)} className="gold-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-primary-foreground">
        {endOfSeries ? 'Terminer la série' : 'Suivant'}
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  </div>
}

type ReadingSentence = { arabic: string; phonetic: string; translation: string; image: string }

const READING_SENTENCES: ReadingSentence[] = [
  { arabic: 'الْبَابُ مَفْتُوحٌ.', phonetic: 'Al-bābu maftūḥun.', translation: 'La porte est ouverte.', image: '🚪' },
  { arabic: 'الْقَلَمُ مَكْسُورٌ.', phonetic: 'Al-qalamu maksūrun.', translation: 'Le stylo est cassé.', image: '🖊️💔' },
  { arabic: 'الْمَاءُ بَارِدٌ.', phonetic: 'Al-māʾu bāridun.', translation: 'L’eau est froide.', image: '💧❄️' },
  { arabic: 'الْقَمَرُ جَمِيلٌ.', phonetic: 'Al-qamaru jamīlun.', translation: 'La lune est belle.', image: '🌙✨' },
  { arabic: 'الْقَمِيصُ نَظِيفٌ.', phonetic: 'Al-qamīṣu naẓīfun.', translation: 'La chemise est propre.', image: '👕✨' },
  { arabic: 'السُّكَّرُ حُلْوٌ.', phonetic: 'As-sukkaru ḥulwun.', translation: 'Le sucre est sucré.', image: '🧊😋' },
  { arabic: 'التُّفَّاحُ لَذِيذٌ.', phonetic: 'At-tuffāḥu ladhīdhun.', translation: 'Les pommes sont délicieuses.', image: '🍎😋' },
  { arabic: 'النَّجْمُ بَعِيدٌ.', phonetic: 'An-najmu baʿīdun.', translation: 'L’étoile est loin.', image: '⭐🔭' },
  { arabic: 'هُوَ فِي الْغُرْفَةِ.', phonetic: 'Huwa fi l-ghurfati.', translation: 'Il est dans la chambre.', image: '👨🛏️' },
  { arabic: 'هِيَ فِي الْمَطْبَخِ.', phonetic: 'Hiya fi l-maṭbakhi.', translation: 'Elle est dans la cuisine.', image: '👩🍳' },
  { arabic: 'الْقَلَمُ عَلَى الْمَكْتَبِ.', phonetic: 'Al-qalamu ʿala l-maktabi.', translation: 'Le stylo est sur le bureau.', image: '🖊️🗄️' },
  { arabic: 'الطَّالِبُ فِي الْجَامِعَةِ.', phonetic: 'Aṭ-ṭālibu fi l-jāmiʿati.', translation: 'L’étudiant est à l’université.', image: '🧑‍🎓🏛️' },
  { arabic: 'السَّيَّارَةُ أَمَامَ الْبَيْتِ.', phonetic: 'As-sayyāratu amāma l-bayti.', translation: 'La voiture est devant la maison.', image: '🚗🏠' },
  { arabic: 'مِعْطَفِي فِي السَّيَّارَةِ.', phonetic: 'Miʿṭafī fi s-sayyārati.', translation: 'Mon manteau est dans la voiture.', image: '🧥🚗' },
  { arabic: 'أَنَا أَعْمَلُ فِي شِرْكَةٍ.', phonetic: 'Ana aʿmalu fī shirkatin.', translation: 'Je travaille dans une entreprise.', image: '👤🏢' },
  { arabic: 'أَنَا قَادِمٌ مِنَ الْعَمَلِ.', phonetic: 'Ana qādimun mina l-ʿamali.', translation: 'Je reviens du travail.', image: '🚶🏢' },
  { arabic: 'ذَهَبَ حَامِدٌ إِلَى السُّوقِ.', phonetic: 'Dhahaba Ḥāmidun ila s-sūqi.', translation: 'Hamid est allé au marché.', image: '👨🛒' },
  { arabic: 'خَرَجَ مِنَ الْفَصْلِ وَذَهَبَ إِلَى الْمُدِيرِ.', phonetic: 'Kharaja mina l-faṣli wa-dhahaba ila l-mudīri.', translation: 'Il est sorti de la classe et est allé voir le directeur.', image: '🚪🏫👨‍💼' },
  { arabic: 'أَيْنَ الْكِتَابُ؟', phonetic: 'Ayna l-kitābu ?', translation: 'Où est le livre ?', image: '❓📖' },
  { arabic: 'مَنْ فِي الْغُرْفَةِ؟', phonetic: 'Man fi l-ghurfati ?', translation: 'Qui est dans la chambre ?', image: '❓🛏️' },
  { arabic: 'مَاذَا عَلَى الْمَكْتَبِ؟', phonetic: 'Mādhā ʿala l-maktabi ?', translation: 'Qu’y a-t-il sur le bureau ?', image: '❓🗄️' },
  { arabic: 'مِنْ أَيْنَ أَنْتَ؟', phonetic: 'Min ayna anta ?', translation: 'D’où viens-tu ?', image: '❓🗺️' },
  { arabic: 'أَيْنَ كِتَابُكَ؟', phonetic: 'Ayna kitābuka ?', translation: 'Où est ton livre ?', image: '❓📚' },
  { arabic: 'كَيْفَ حَالُكَ؟', phonetic: 'Kayfa ḥāluka ?', translation: 'Comment vas-tu ?', image: '👋🙂' },
]

function ReadingSentenceCard({ sentence }: { sentence: ReadingSentence }) {
  const [showMeaning, setShowMeaning] = useState(false)
  const [listening, setListening] = useState(false)
  const listen = async () => {
    if (listening) return
    setListening(true)
    try { await speakArabic(sentence.arabic) } catch { /* Existing TTS fallback handles unavailable voices. */ } finally { setListening(false) }
  }
  return <article className="rounded-3xl border border-border bg-card p-5 text-center shadow-sm">
    <div role="img" aria-label={sentence.translation} className="mx-auto flex h-28 w-40 items-center justify-center rounded-3xl bg-secondary text-5xl">{sentence.image}</div>
    <p dir="rtl" className="font-arabic mt-5 text-4xl font-bold leading-[1.8] text-foreground">{sentence.arabic}</p>
    <p className="mt-2 text-base font-semibold leading-relaxed text-muted-foreground">{sentence.phonetic}</p>
    <div className="mt-5 grid grid-cols-2 gap-2">
      <button type="button" onClick={listen} disabled={listening} className="rounded-2xl border border-border bg-secondary px-3 py-3 text-sm font-semibold text-foreground disabled:opacity-60">{listening ? 'Écoute…' : 'Écouter'}</button>
      <button type="button" onClick={() => setShowMeaning((shown) => !shown)} className="rounded-2xl border border-primary/30 bg-primary/10 px-3 py-3 text-sm font-semibold text-primary">Voir le sens</button>
    </div>
    {showMeaning && <p className="mt-3 rounded-2xl bg-secondary px-3 py-3 font-semibold">{sentence.translation}</p>}
  </article>
}

function ReadingSentencesChapter({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0)
  const [seriesFinished, setSeriesFinished] = useState(false)
  const [reviewIndex, setReviewIndex] = useState<number | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [reviewFinished, setReviewFinished] = useState(false)

  if (reviewIndex !== null) {
    const sentence = READING_SENTENCES[reviewIndex]
    const optionIndexes = [reviewIndex, (reviewIndex + 5) % 24, (reviewIndex + 11) % 24, (reviewIndex + 17) % 24]
    const shift = reviewIndex % 4
    const options = [...optionIndexes.slice(shift), ...optionIndexes.slice(0, shift)].map((optionIndex) => READING_SENTENCES[optionIndex])
    const choose = (answer: string) => {
      if (selectedAnswer) return
      setSelectedAnswer(answer)
      if (answer === sentence.arabic) setScore((current) => current + 1)
    }
    const next = () => {
      if (reviewIndex === READING_SENTENCES.length - 1) setReviewFinished(true)
      else { setReviewIndex(reviewIndex + 1); setSelectedAnswer(null) }
    }
    if (reviewFinished) return <div><BackBar title="Révision des phrases" onBack={onBack} /><div className="px-5 pb-10 pt-8 text-center"><div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-sm"><CheckCircle2 className="mx-auto h-14 w-14 text-primary"/><h2 className="gold-text mt-4 text-2xl font-bold">Révision terminée</h2><p className="mt-2 text-muted-foreground">Vous avez révisé les 24 phrases.</p><p className="mt-5 text-4xl font-bold text-primary">{score} / 24</p><button type="button" onClick={() => { setReviewIndex(0); setSelectedAnswer(null); setScore(0); setReviewFinished(false) }} className="gold-gradient mt-6 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">Recommencer la révision</button></div></div></div>
    return <div>
      <BackBar title="Révision des phrases" onBack={onBack} />
      <div className="mx-auto max-w-xl px-5 pb-10 pt-5">
        <div className="mb-4 flex items-center gap-3"><ProgressBar value={((reviewIndex + 1) / 24) * 100} className="h-2 flex-1"/><span className="text-xs font-bold text-primary">{reviewIndex + 1}/24</span></div>
        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-muted-foreground">Quelle phrase correspond à cette image ?</p>
          <div role="img" aria-label={sentence.translation} className="mx-auto mt-5 flex h-28 w-40 items-center justify-center rounded-3xl bg-secondary text-5xl">{sentence.image}</div>
          <div className="mt-6 space-y-3">{options.map((option) => {
            const correct = option.arabic === sentence.arabic
            const chosen = selectedAnswer === option.arabic
            const stateClass = selectedAnswer ? (correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700' : chosen ? 'border-red-500 bg-red-500/10 text-red-700' : 'border-border bg-background') : 'border-border bg-background'
            return <button key={option.arabic} type="button" onClick={() => choose(option.arabic)} dir="rtl" className={`font-arabic w-full rounded-2xl border p-3 text-xl font-bold leading-relaxed ${stateClass}`}>{option.arabic}</button>
          })}</div>
          {selectedAnswer && <div className="mt-5"><p className="font-semibold">{selectedAnswer === sentence.arabic ? 'Bonne réponse' : `Réponse correcte : ${sentence.arabic}`}</p><p className="mt-1 text-sm text-muted-foreground">{sentence.translation}</p><button type="button" onClick={next} className="gold-gradient mt-4 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{reviewIndex === 23 ? 'Voir mon résultat' : 'Question suivante'}</button></div>}
        </div>
      </div>
    </div>
  }

  if (seriesFinished) return <div>
    <BackBar title="Lire des phrases" onBack={onBack} />
    <div className="mx-auto max-w-xl px-5 pb-10 pt-8 text-center"><div className="rounded-3xl border border-border bg-card p-6 shadow-sm"><CheckCircle2 className="mx-auto h-14 w-14 text-primary"/><h2 className="gold-text mt-4 text-2xl font-bold">Série terminée</h2><p className="mt-2 text-sm text-muted-foreground">Vous avez étudié les 24 phrases.</p><button type="button" onClick={() => setReviewIndex(0)} className="gold-gradient mt-6 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">Commencer la révision finale</button><button type="button" onClick={onBack} className="mt-3 w-full rounded-2xl border border-border bg-background py-3.5 font-semibold">Retour</button></div></div>
  </div>

  const sentence = READING_SENTENCES[index]
  return <div>
    <BackBar title="Lire des phrases" onBack={onBack} />
    <div className="mx-auto max-w-xl px-5 pb-10 pt-5">
      <div className="mb-4 flex items-center gap-3"><ProgressBar value={((index + 1) / 24) * 100} className="h-2 flex-1"/><span className="text-xs font-bold text-primary">{index + 1}/24</span></div>
      <ReadingSentenceCard key={sentence.arabic} sentence={sentence} />
      <button type="button" onClick={() => index === 23 ? setSeriesFinished(true) : setIndex((current) => current + 1)} className="gold-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-primary-foreground">{index === 23 ? 'Terminer la série' : 'Suivant'}<ChevronRight className="h-5 w-5"/></button>
    </div>
  </div>
}

type ReadingShortText = { title: string; source: string; arabic: string; phonetic: string; translation: string }

const READING_SHORT_TEXTS: ReadingShortText[] = [
  {
    title: 'Se présenter et étudier',
    source: 'https://lingua.com/arabic/reading/1/',
    arabic: 'مَرْحَبًا، اسْمِي مُحَمَّدٌ. أَنَا طَالِبٌ فِي الْجَامِعَةِ أَدْرُسُ الْهَنْدَسَةَ. أُحِبُّ قِرَاءَةَ الْكُتُبِ وَالسَّفَرَ.',
    phonetic: 'Marḥaban, ismī Muḥammadun. Ana ṭālibun fi l-jāmiʿati adrusu l-handasata. Uḥibbu qirāʾata l-kutubi wa-s-safara.',
    translation: 'Bonjour, je m’appelle Mohammed. Je suis étudiant à l’université et j’étudie l’ingénierie. J’aime lire des livres et voyager.',
  },
  {
    title: 'Le temps qu’il fait',
    source: 'https://lingua.com/arabic/reading/12/',
    arabic: 'الطَّقْسُ الْيَوْمَ جَمِيلٌ جِدًّا. السَّمَاءُ صَافِيَةٌ وَالشَّمْسُ مُشْرِقَةٌ. دَرَجَةُ الْحَرَارَةِ مُعْتَدِلَةٌ وَهُنَاكَ نَسِيمٌ خَفِيفٌ.',
    phonetic: 'Aṭ-ṭaqsu l-yawma jamīlun jiddan. As-samāʾu ṣāfiyatun wa-sh-shamsu mushriqatun. Darajatu l-ḥarārati muʿtadilatun wa-hunāka nasīmun khafīfun.',
    translation: 'Il fait très beau aujourd’hui. Le ciel est dégagé et le soleil brille. La température est modérée et il y a une légère brise.',
  },
  {
    title: 'La cuisine et les plats',
    source: 'https://lingua.com/arabic/reading/8/',
    arabic: 'الْمَطْبَخُ الْعَرَبِيُّ غَنِيٌّ وَمُتَنَوِّعٌ. الْحُمُّصُ وَالْفَلَافِلُ وَالْكَبَابُ هِيَ أَطْبَاقٌ شَهِيرَةٌ.',
    phonetic: 'Al-maṭbakhu l-ʿarabiyyu ghaniyyun wa-mutanawwiʿun. Al-ḥummuṣu wa-l-falāfilu wa-l-kabābu hiya aṭbāqun shahīratun.',
    translation: 'La cuisine arabe est riche et variée. Le houmous, les falafels et le kebab sont des plats connus.',
  },
  {
    title: 'Le travail et le sport',
    source: 'https://lingua.com/arabic/reading/11/',
    arabic: 'أَعْمَلُ لِمُدَّةِ ثَمَانِي سَاعَاتٍ وَأَتَنَاوَلُ الْغَدَاءَ فِي الْمَكْتَبِ. بَعْدَ الْعَمَلِ، أَذْهَبُ إِلَى النَّادِي لِمُمَارَسَةِ الرِّيَاضَةِ.',
    phonetic: 'Aʿmalu li-muddati thamānī sāʿātin wa-atanāwalu l-ghadāʾa fi l-maktabi. Baʿda l-ʿamali, adhhabu ila n-nādī li-mumārasati r-riyāḍati.',
    translation: 'Je travaille pendant huit heures et je déjeune au bureau. Après le travail, je vais au club pour pratiquer une activité sportive.',
  },
  {
    title: 'Faire les courses',
    source: 'https://lingua.com/arabic/reading/22/',
    arabic: 'يُمْكِنُ أَيْضًا شِرَاءُ الْخَضْرَوَاتِ وَالْفَوَاكِهِ الطَّازَجَةِ مِنَ السُّوقِ. مِنَ الْمُهِمِّ مُقَارَنَةُ الْأَسْعَارِ قَبْلَ الشِّرَاءِ لِلْحُصُولِ عَلَى أَفْضَلِ الْعُرُوضِ.',
    phonetic: 'Yumkinu ayḍan shirāʾu l-khaḍrawāti wa-l-fawākihi ṭ-ṭāzajati mina s-sūqi. Mina l-muhimmi muqāranatu l-asʿāri qabla sh-shirāʾi li-l-ḥuṣūli ʿalā afḍali l-ʿurūḍi.',
    translation: 'On peut aussi acheter des légumes et des fruits frais au marché. Il est important de comparer les prix avant d’acheter pour obtenir les meilleures offres.',
  },
  {
    title: 'Ma maison',
    source: 'https://ejtaal.net/islam/madeenah-arabic/du1_11.htm',
    arabic: 'هَٰذَا بَيْتِي. بَيْتِي أَمَامَ الْمَسْجِدِ. بَيْتِي جَمِيلٌ. فِيهِ حَدِيقَةٌ صَغِيرَةٌ.',
    phonetic: 'Hādhā baytī. Baytī amāma l-masjidi. Baytī jamīlun. Fīhi ḥadīqatun ṣaghīratun.',
    translation: 'Voici ma maison. Ma maison est devant la mosquée. Ma maison est belle. Elle possède un petit jardin.',
  },
]

function ReadingShortTextsChapter({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0)
  const text = READING_SHORT_TEXTS[index]
  return <div>
    <BackBar title="Lire des textes courts" onBack={onBack} />
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-5">
      <div className="mb-4 flex items-center gap-3"><ProgressBar value={((index + 1) / READING_SHORT_TEXTS.length) * 100} className="h-2 flex-1"/><span className="text-xs font-bold text-primary">{index + 1}/{READING_SHORT_TEXTS.length}</span></div>
      <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4"><h2 className="gold-text text-xl font-bold">{text.title}</h2><a href={text.source} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-primary underline">Source</a></div>
        <p dir="rtl" className="font-arabic mt-6 text-3xl font-bold leading-[2] text-foreground">{text.arabic}</p>
        <div className="mt-6 border-t border-border pt-5"><p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Phonétique</p><p className="mt-2 text-base leading-7 text-muted-foreground">{text.phonetic}</p></div>
        <div className="mt-5 border-t border-border pt-5"><p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Traduction</p><p className="mt-2 text-base leading-7 text-foreground">{text.translation}</p></div>
      </article>
      {index < READING_SHORT_TEXTS.length - 1 ? <button type="button" onClick={() => setIndex((current) => current + 1)} className="gold-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-primary-foreground">Suivant<ChevronRight className="h-5 w-5"/></button> : <button type="button" onClick={onBack} className="gold-gradient mt-5 w-full rounded-2xl py-4 font-semibold text-primary-foreground">Terminer</button>}
    </div>
  </div>
}

function CompletionButton({ topicId, onBack }: { topicId: string; onBack: () => void }) {
  const { t } = useI18n()
  const { updateTopicProgress } = useProgress()
  return (
    <button
      type="button"
      onClick={() => {
        updateTopicProgress(topicId, 100)
        onBack()
      }}
      className="gold-gradient flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-primary-foreground shadow-lg shadow-black/20 active:scale-[0.98]"
    >
      {t('common.completed')}
      <CheckCircle2 className="h-5 w-5" />
    </button>
  )
}

function LessonOneView({ onOpen, onBack }: { onOpen: (v: View) => void; onBack: () => void }) {
  const { t, lang } = useI18n()
  const topicIds = ['alphabet', 'positions', 'short-vowels', 'long-vowels', 'tanwin', 'shadda']
  const topics = topicIds.map((id) => LEARN_TOPICS.find((topic) => topic.id === id)).filter((topic): topic is (typeof LEARN_TOPICS)[number] => Boolean(topic))
  const open = (id: string) => {
    if (id === 'alphabet') onOpen({ kind: 'alphabet' })
    else if (id === 'positions') onOpen({ kind: 'positions' })
    else if (id === 'short-vowels') onOpen({ kind: 'rules', topic: 'short-vowels' })
    else if (id === 'long-vowels') onOpen({ kind: 'rules', topic: 'long-vowels' })
    else if (id === 'tanwin') onOpen({ kind: 'rules', topic: 'tanwin' })
    else if (id === 'shadda') onOpen({ kind: 'shadda' })
  }
  return <div>
    <BackBar title={`${lang === 'ar' ? 'الدرس' : lang === 'en' ? 'Lesson' : 'Leçon'} 1 · ${lang === 'ar' ? 'الأبجدية' : lang === 'en' ? 'The alphabet' : 'L’alphabet'}`} onBack={onBack} />
    <div className="space-y-3 px-5 pb-8 pt-5">
      {topics.map((topic) => {
        const Icon = ICONS[topic.icon] ?? Type
        return <button key={topic.id} type="button" onClick={() => open(topic.id)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-start transition-transform active:scale-[0.98]">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClass(topic.accent)}`}><Icon className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="gold-text block text-sm font-semibold">{t(topic.titleKey)}</span><span className="block text-[11px] text-muted-foreground">{t(topic.subKey)}</span></span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
        </button>
      })}
    </div>
  </div>
}

function LearnMenu({ onOpen }: { onOpen: (v: View) => void }) {
  const { t, lang } = useI18n()
  const { progress } = useProgress()

  const readingTopic = {
    id: 'reading',
    icon: 'BookOpen',
    titleKey: 'learn.reading',
    subKey: 'learn.readingSub',
    progress: 0,
    accent: 'sky',
  }
  const topicsById = new Map([...LEARN_TOPICS, readingTopic].map((topic) => [topic.id, topic]))
  const lessonGroups = [
    {
      number: 1,
      title: lang === 'ar' ? 'الأبجدية' : lang === 'en' ? 'The alphabet' : 'L’alphabet',
      description: lang === 'ar' ? 'الحروف وأشكالها وجميع العلامات' : lang === 'en' ? 'Letters, their forms and all signs' : 'Les lettres, leurs formes et tous les signes',
      topicIds: ['alphabet', 'positions', 'short-vowels', 'long-vowels', 'tanwin', 'shadda'],
    },
    {
      number: 2,
      title: lang === 'ar' ? 'القراءة' : lang === 'en' ? 'Reading' : 'Lecture',
      description: lang === 'ar' ? 'قراءة الكلمات ثم الجمل والنصوص القصيرة' : lang === 'en' ? 'Read words, sentences, then short texts' : 'Lire des mots, des phrases, puis des textes courts',
      topicIds: [],
    },
    {
      number: 3,
      title: lang === 'ar' ? 'المفردات الأساسية' : lang === 'en' ? 'Essential vocabulary' : 'Vocabulaire essentiel',
      description: lang === 'ar' ? 'تعلّم الكلمات المفيدة مرتبة حسب الموضوع' : lang === 'en' ? 'Learn useful words grouped by theme' : 'Apprendre les mots utiles, regroupés par thèmes',
      topicIds: [],
    },
    {
      number: 4,
      title: lang === 'ar' ? 'القواعد وتصريف الأفعال' : lang === 'en' ? 'Grammar and conjugation' : 'Grammaire et conjugaison',
      description: lang === 'ar' ? 'فهم بنية الجملة واستخدام الأفعال' : lang === 'en' ? 'Understand sentence structure and use verbs' : 'Comprendre la phrase et apprendre à utiliser les verbes',
      topicIds: [],
    },
  ]

  return (
    <div>
      <ScreenHeader title={t('learn.title')} subtitle={t('learn.subtitle')} />
      <div className="flex flex-col gap-4 px-5 pb-6">
        {lessonGroups.map((lesson) => {
          const topics = lesson.topicIds.map((id) => topicsById.get(id)).filter((topic): topic is NonNullable<typeof topic> => Boolean(topic))
          const lessonProgress = topics.length ? Math.round(topics.reduce((sum, topic) => sum + (progress.topics[topic.id] ?? 0), 0) / topics.length) : 0
          return <section key={lesson.number} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <button type="button" onClick={() => lesson.number === 1 ? onOpen({ kind: 'lesson-one' }) : onOpen({ kind: 'empty-lesson', number: lesson.number as 2 | 3 | 4 })} className="flex w-full items-center gap-4 p-5 text-start active:bg-secondary/40">
              <span className="gold-gradient flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">{lesson.number}</span>
              <span className="min-w-0 flex-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">{lang === 'ar' ? 'الدرس' : lang === 'en' ? 'Lesson' : 'Leçon'} {lesson.number}</span>
                <span className="gold-text block text-lg font-bold">{lesson.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{lesson.description}</span>
                <span className="mt-3 flex items-center gap-2"><ProgressBar value={lessonProgress} className="h-1.5 flex-1" /><span className="gold-text text-[11px] font-bold">{lessonProgress}%</span></span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
            </button>
          </section>
        })}
      </div>
    </div>
  )
}

function PositionGlyph({ glyph }: { glyph: string }) {
  return (
    <span
      dir="rtl"
      className="font-arabic flex min-h-16 min-w-[4.5rem] shrink-0 items-center justify-center overflow-visible px-1 py-2 text-[2.75rem] font-bold leading-[1.45] text-foreground"
    >
      {glyph}
    </span>
  )
}

function AlphabetGrid({
  onBack,
  onLetter,
}: {
  onBack: () => void
  onLetter: (index: number) => void
}) {
  const { t, lang } = useI18n()
  return (
    <div>
      <BackBar title={t('learn.alphabet')} onBack={onBack} />
      <div className="grid grid-cols-3 gap-3 p-5 pb-3 sm:grid-cols-4">
        {LETTERS.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => onLetter(i)}
            className="group flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card transition-all active:scale-95"
          >
            <span className="font-arabic inline-flex min-h-14 items-center overflow-visible px-1 py-2 text-4xl leading-[1.35] text-foreground transition-colors group-active:text-primary">
              {l.glyph}
            </span>
            <span className="text-[10px] font-medium leading-tight text-muted-foreground">
              {letterDisplayName(l, lang) || l.name}
            </span>
          </button>
        ))}
      </div>
      <div className="px-5 pb-6">
        <CompletionButton topicId="alphabet" onBack={onBack} />
      </div>
    </div>
  )
}

function LetterDetail({
  index,
  onBack,
  onGo,
  onComplete,
}: {
  index: number
  onBack: () => void
  onGo: (index: number) => void
  onComplete: () => void
}) {
  const { t, lang } = useI18n()
  const { updateLetterIndex, updateTopicProgress, recordActivity } = useProgress()
  const letter = LETTERS[index]
  const hasPrev = index > 0
  const hasNext = index < LETTERS.length - 1

  useEffect(() => {
    updateLetterIndex(index)
    recordActivity()
    // Always reveal the complete hero glyph when moving between letters.
    // The application scrolls inside its own container, not the browser body.
    document.querySelector<HTMLElement>('[data-app-scroll]')?.scrollTo({ top: 0, behavior: 'instant' })
    // Progress callbacks intentionally stay out of the dependency list: they
    // are recreated when progress changes, which would otherwise loop forever.
    // A new letter index is the only event that should count as an activity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Positional forms: display the shaped glyph, but speak the base letter so
  // the audio actually plays (presentation-form glyphs are not read by TTS).
  const positions: { key: LetterPosition; glyph: string; labelKey: string }[] = [
    { key: 'isolated', glyph: pedagogicalPositionGlyph(letter, 'isolated'), labelKey: 'learn.position.isolated' },
    { key: 'initial', glyph: pedagogicalPositionGlyph(letter, 'initial'), labelKey: 'learn.position.initial' },
    { key: 'medial', glyph: pedagogicalPositionGlyph(letter, 'medial'), labelKey: 'learn.position.medial' },
    { key: 'final', glyph: pedagogicalPositionGlyph(letter, 'final'), labelKey: 'learn.position.final' },
  ]

  const handleResult = (ok: boolean) => {
    if (!ok) return
    if (hasNext) window.setTimeout(() => onGo(index + 1), 950)
    else window.setTimeout(() => {
      updateTopicProgress('alphabet', 100)
      onComplete()
    }, 950)
  }

  return (
    <div>
      <BackBar title={letterDisplayName(letter, lang) || letter.name} onBack={onBack} />

      <div className="p-5">
        {/* Hero glyph */}
        <div className="relief-panel relative rounded-3xl px-8 py-6 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: 'var(--relief-glow)' }}
          />
          <div className="relative flex min-h-[15rem] items-center justify-center overflow-visible px-5 py-8">
            <span
              dir="rtl"
              className="font-arabic inline-flex min-h-[12rem] items-center justify-center overflow-visible px-6 py-5 text-[8rem] leading-[1.55] drop-shadow-sm"
              style={{ color: 'var(--gold-medium)' }}
            >
              {letter.glyph}
            </span>
          </div>
          <p className="gold-text text-xl font-semibold">{letterDisplayName(letter, lang)}</p>
        </div>

        {/* Audio controls */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <ListenButton
            text={letterSpokenName(letter, 'ar')}
            audioSrc={letterRecordedAudio(letter)}
            label={t('learn.listen')}
            size="lg"
          />
          <PronounceButton
            letter={letter}
            lang="ar"
            label={t('learn.pronounce')}
            listeningLabel={t('learn.listening')}
            successLabel={t('learn.correct')}
            errorLabel={t('learn.tryAgain')}
            onResult={handleResult}
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">{t('learn.pronounceHint')}</p>

        {/* Positions */}
        <h2 className="mb-3 mt-7 text-sm font-semibold text-muted-foreground">
          {t('learn.positions')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {positions.map((p) => (
            <div
              key={p.key}
              className="flex min-h-20 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm shadow-black/5"
            >
              <div className="flex min-w-10 items-center justify-center">
                <PositionGlyph glyph={p.glyph} />
              </div>
              <span className="min-w-0 flex-1 text-sm font-medium text-muted-foreground">{t(p.labelKey)}</span>
              <ListenCircle
                text={letter.id === 'ha2' && lang === 'fr'
                  ? ({ isolated: 'isolée', initial: 'au début', medial: 'au milieu', final: 'à la fin' } as const)[p.key]
                  : letterPositionPhrase(letter, p.key, lang)}
                label={t('learn.listen')}
                phraseLang={lang}
                leadingArabicText={letter.id === 'ha2' && lang === 'fr' ? 'هَاوُنْ' : undefined}
                audioSequence={lang === 'fr' && letterRecordedAudio(letter)
                  ? letterPositionRecordedSequence(letterRecordedAudio(letter)!, p.key)
                  : undefined}
              />
            </div>
          ))}
        </div>

        {/* Letter navigation */}
        <div className="mt-7 flex items-center gap-3">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => hasPrev && onGo(index - 1)}
            className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-card text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {t('learn.prevLetter')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (hasNext) onGo(index + 1)
              else {
                updateTopicProgress('alphabet', 100)
                onComplete()
              }
            }}
            className="gold-gradient flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl text-sm font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-40"
          >
            {hasNext ? t('learn.nextLetter') : t('common.completed')}
            {hasNext ? <ChevronRight className="h-4 w-4 rtl:rotate-180" /> : <CheckCircle2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

// Tappable cell for positional forms — speaks e.g. "Alifoun isolé".
function PositionSoundCell({
  display,
  phrase,
  lang,
  audioSequence,
}: {
  display: string
  phrase: string
  lang: Lang
  audioSequence?: RecordedAudioSegment[]
}) {
  const [active, setActive] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        setActive(true)
        if (audioSequence) void playRecordedAudioSequence(audioSequence)
        else speakPhrase(phrase, lang)
        window.setTimeout(() => setActive(false), 800)
      }}
      className="relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border border-border bg-card transition-transform active:scale-95"
    >
      {active && (
        <span className="absolute inset-0 rounded-2xl border-2 border-primary/50 [animation:akRingPulse_0.8s_ease-out]" />
      )}
      <span
        dir="rtl"
        className="font-arabic flex min-h-[4.5rem] items-center justify-center text-[2.5rem] font-bold leading-none text-foreground"
      >
        {display}
      </span>
    </button>
  )
}

// Tappable cell that speaks the carefully tuned phonetic form. Reading an
// isolated Arabic glyph through generic TTS is unreliable (notably بُ / bou).
function SoundCell({
  display,
  translit,
  spoken,
  audioSrc,
}: {
  display: string
  translit?: string
  spoken: string
  audioSrc?: string
}) {
  const [active, setActive] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        setActive(true)
        if (audioSrc) void playRecordedAudio(audioSrc)
        else speakPhrase(spoken, 'fr')
        window.setTimeout(() => setActive(false), 800)
      }}
      className="relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border border-border bg-card transition-transform active:scale-95"
    >
      {active && (
        <span className="absolute inset-0 rounded-2xl border-2 border-primary/50 [animation:akRingPulse_0.8s_ease-out]" />
      )}
      <span className="font-arabic text-3xl leading-none text-foreground">{display}</span>
      {translit ? <span className="text-[10px] text-muted-foreground">{translit}</span> : null}
    </button>
  )
}

// All 28 letters, each shown across the given vowel/tanwin forms with audio.
function AllLettersForms({ forms }: { forms: FormDef[] }) {
  const cols = { gridTemplateColumns: `repeat(${forms.length}, minmax(0, 1fr))` }
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 px-1 text-center text-[11px] font-medium text-muted-foreground" style={cols}>
        {forms.map((f) => (
          <span key={f.key}>{f.label}</span>
        ))}
      </div>
      {LETTERS.map((l, letterIndex) => (
        <div key={l.id} className="rounded-3xl border border-border bg-card p-3">
          <p className="mb-2 px-1 text-xs font-medium text-primary">{l.name}</p>
          <div className="grid gap-2" style={cols}>
            {forms.map((f) => (
              <SoundCell
                key={f.key}
                display={f.compose(l)}
                translit={f.translit(l)}
                spoken={letterFormSpeech(l.id, f.speechKey)}
                audioSrc={f.speechKey === 'shortFatha' ? `/audio/short-fatha/${letterIndex + 1}.mp3` : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function RuleCard({ rule, long = false }: { rule: VowelRule; long?: boolean }) {
  const { t, lang } = useI18n()
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="border-b border-border bg-secondary/40 px-5 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">{t('learn.rule')}</p>
        <h3 className="gold-text text-lg font-bold text-balance">{localized(rule.title, lang)}</h3>
      </div>
      <div className="flex items-center gap-4 px-5 py-5">
        <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center overflow-visible rounded-2xl border border-primary/20 bg-primary/5 px-2 pb-3 pt-2">
          <span className={`font-arabic flex min-h-[5.25rem] items-center overflow-visible text-5xl leading-[1.65] ${long ? 'text-foreground' : 'text-primary'}`}>
            {long && rule.id === 'alif-madd' ? <LongFathaWithRedAlif glyph="ب" /> : long && rule.id === 'ya-madd' ? <LongKasraWithRedYa glyph="ب" /> : long && rule.id === 'waw-madd' ? <LongDammaWithRedWaw glyph="ب" /> : long ? rule.example : <ArabicWithRedVowels>{rule.example}</ArabicWithRedVowels>}
          </span>
          <span className={`mt-1 text-sm font-bold leading-none ${long ? 'text-foreground' : 'text-red-600'}`}>{rule.exampleTranslit}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('learn.explanation')}
          </p>
          <p className="text-sm leading-relaxed text-pretty">{localized(rule.explanation, lang)}</p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <ListenButton
          text={rule.example}
          label={t('learn.listen')}
          className="w-full"
          speechOptions={long ? { rate: '-32%' } : undefined}
        />
      </div>
    </article>
  )
}

type ShortVowelKey = 'fatha' | 'kasra' | 'damma'

type ShortVowelWord = {
  arabic: string
  transliteration: string
  translation: string
}

const SHORT_VOWEL_WORDS: Record<ShortVowelKey, ShortVowelWord[]> = {
  fatha: [
    { arabic: 'كَتَبَ', transliteration: 'kataba', translation: 'il a écrit' },
    { arabic: 'دَخَلَ', transliteration: 'dakhala', translation: 'il est entré' },
    { arabic: 'خَرَجَ', transliteration: 'kharaja', translation: 'il est sorti' },
    { arabic: 'جَلَسَ', transliteration: 'jalasa', translation: "il s'est assis" },
    { arabic: 'فَتَحَ', transliteration: 'fataḥa', translation: 'il a ouvert' },
    { arabic: 'ذَهَبَ', transliteration: 'dhahaba', translation: 'il est parti' },
    { arabic: 'رَجَعَ', transliteration: 'rajaʿa', translation: 'il est revenu' },
    { arabic: 'حَمَلَ', transliteration: 'ḥamala', translation: 'il a porté' },
    { arabic: 'غَسَلَ', transliteration: 'ghasala', translation: 'il a lavé' },
    { arabic: 'رَسَمَ', transliteration: 'rasama', translation: 'il a dessiné' },
    { arabic: 'زَرَعَ', transliteration: 'zaraʿa', translation: 'il a planté' },
    { arabic: 'سَبَحَ', transliteration: 'sabaḥa', translation: 'il a nagé' },
    { arabic: 'طَلَبَ', transliteration: 'ṭalaba', translation: 'il a demandé' },
    { arabic: 'رَفَعَ', transliteration: 'rafaʿa', translation: 'il a levé' },
    { arabic: 'مَسَحَ', transliteration: 'masaḥa', translation: 'il a essuyé' },
  ],
  kasra: [
    { arabic: 'كِتَابْ', transliteration: 'kitāb', translation: 'livre' },
    { arabic: 'جِدَارْ', transliteration: 'jidār', translation: 'mur' },
    { arabic: 'حِمَارْ', transliteration: 'ḥimār', translation: 'âne' },
    { arabic: 'لِسَانْ', transliteration: 'lisān', translation: 'langue' },
    { arabic: 'سِلَاحْ', transliteration: 'silāḥ', translation: 'arme' },
    { arabic: 'بِسَاطْ', transliteration: 'bisāṭ', translation: 'tapis' },
    { arabic: 'رِجَالْ', transliteration: 'rijāl', translation: 'hommes' },
    { arabic: 'ثِيَابْ', transliteration: 'thiyāb', translation: 'vêtements' },
    { arabic: 'حِسَابْ', transliteration: 'ḥisāb', translation: 'compte / calcul' },
    { arabic: 'نِظَامْ', transliteration: 'niẓām', translation: 'système / ordre' },
    { arabic: 'قِطَارْ', transliteration: 'qiṭār', translation: 'train' },
    { arabic: 'شِمَالْ', transliteration: 'shimāl', translation: 'gauche / nord' },
    { arabic: 'كِبَارْ', transliteration: 'kibār', translation: 'grands' },
    { arabic: 'صِغَارْ', transliteration: 'ṣighār', translation: 'petits' },
    { arabic: 'عِبَادْ', transliteration: 'ʿibād', translation: 'serviteurs / adorateurs' },
  ],
  damma: [
    { arabic: 'كُتُبْ', transliteration: 'kutub', translation: 'livres' },
    { arabic: 'رُسُلْ', transliteration: 'rusul', translation: 'messagers' },
    { arabic: 'سُبُلْ', transliteration: 'subul', translation: 'chemins / voies' },
    { arabic: 'غُرَفْ', transliteration: 'ghuraf', translation: 'chambres / pièces' },
    { arabic: 'صُحُفْ', transliteration: 'ṣuḥuf', translation: 'feuilles / pages' },
    { arabic: 'طُرُقْ', transliteration: 'ṭuruq', translation: 'routes / chemins' },
    { arabic: 'جُزُرْ', transliteration: 'juzur', translation: 'îles' },
    { arabic: 'حُجُبْ', transliteration: 'ḥujub', translation: 'voiles / barrières' },
    { arabic: 'سُفُنْ', transliteration: 'sufun', translation: 'navires / bateaux' },
    { arabic: 'أُذُنْ', transliteration: 'udhun', translation: 'oreille' },
    { arabic: 'عُنُقْ', transliteration: 'ʿunuq', translation: 'cou' },
    { arabic: 'ثُلُثْ', transliteration: 'thuluth', translation: 'un tiers' },
    { arabic: 'رُطَبْ', transliteration: 'ruṭab', translation: 'dattes fraîches' },
    { arabic: 'جُمَلْ', transliteration: 'jumal', translation: 'phrases' },
    { arabic: 'سُوَرْ', transliteration: 'suwar', translation: 'sourates / chapitres' },
  ],
}

const SHORT_VOWEL_PAGE: Record<
  ShortVowelKey,
  { title: string; titleAr: string; mark: string; speechKey: FormDef['speechKey'] }
> = {
  fatha: { title: 'La Fatha · son « a »', titleAr: 'الْفَتْحَةُ', mark: HARAKAT.fatha, speechKey: 'shortFatha' },
  kasra: { title: 'La Kasra · son « i »', titleAr: 'الْكَسْرَةُ', mark: HARAKAT.kasra, speechKey: 'shortKasra' },
  damma: { title: 'La Damma · son « ou »', titleAr: 'الضَّمَّةُ', mark: HARAKAT.damma, speechKey: 'shortDamma' },
}

/** A balanced 4 × 7 teaching chart: all 28 letters fill the grid exactly. */
function ShortVowelChart({ vowel }: { vowel: ShortVowelKey }) {
  const page = SHORT_VOWEL_PAGE[vowel]

  return (
    <section className="flex min-h-[calc(100dvh-6rem)] flex-col rounded-[2rem] border border-primary/20 bg-primary/[0.035] p-3 shadow-sm sm:p-5">
      <header className="mb-3 shrink-0 text-center">
        <p dir="rtl" className="font-arabic text-3xl font-bold text-primary sm:text-4xl">
          {page.titleAr}
        </p>
        <h2 className="mt-1 text-base font-bold text-foreground sm:text-lg">{page.title}</h2>
      </header>

      <div
        dir="rtl"
        className="grid min-h-0 flex-1 grid-cols-4 grid-rows-7 gap-1.5 sm:gap-2"
        aria-label={page.title}
      >
        {LETTERS.map((letter, letterIndex) => {
          const phonetic = LETTER_PHONETICS[letter.id]?.short[vowel] ?? ''
          return (
            <button
              key={letter.id}
              type="button"
              onClick={() => {
                if (vowel === 'fatha') void playRecordedAudio(`/audio/short-fatha/${letterIndex + 1}.mp3`)
                else if (vowel === 'kasra') void playRecordedAudio(`/audio/short-kasra/${letterIndex + 1}.mp3`)
                else void playRecordedAudio(`/audio/short-damma/${letterIndex + 1}.mp3`)
              }}
              className="flex min-h-0 flex-col items-center justify-center overflow-visible rounded-xl border border-primary/20 bg-card px-1 pb-2 pt-3 shadow-[0_2px_7px_rgba(55,42,28,0.08)] transition active:scale-95 active:bg-primary/10 sm:rounded-2xl sm:pb-2.5 sm:pt-3.5"
              aria-label={`${letter.name}, ${phonetic}`}
            >
              <span className="flex min-h-[3.8rem] items-center overflow-visible px-1 text-[clamp(1.95rem,8.7vw,3.05rem)] font-semibold leading-[1.65] text-foreground">
                <ArabicWithRedVowels>{letter.glyph + page.mark}</ArabicWithRedVowels>
              </span>
              <span dir="ltr" className="mt-1 text-[clamp(0.64rem,2.9vw,0.84rem)] font-bold leading-none text-red-600">
                {phonetic}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ArabicWithRedVowels({ children }: { children: string }) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const highlightedMarks = new Set<string>([
    HARAKAT.fatha,
    HARAKAT.kasra,
    HARAKAT.damma,
    HARAKAT.sukun,
    HARAKAT.tanwinFath,
    HARAKAT.tanwinKasr,
    HARAKAT.tanwinDamm,
  ])
  const lettersOnly = Array.from(children).filter((character) => !highlightedMarks.has(character)).join('')

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    const paint = () => {
      const bounds = wrapper.getBoundingClientRect()
      const style = window.getComputedStyle(wrapper)
      const width = Math.max(1, bounds.width)
      const height = Math.max(1, bounds.height)
      const fontSize = Number.parseFloat(style.fontSize) || 48
      const verticalPadding = fontSize * 0.35
      const canvasHeight = height + verticalPadding * 2
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.ceil(width * ratio)
      canvas.height = Math.ceil(canvasHeight * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${canvasHeight}px`
      canvas.style.top = `${-verticalPadding}px`

      const context = canvas.getContext('2d')
      if (!context) return
      context.scale(ratio, ratio)
      context.clearRect(0, 0, width, canvasHeight)
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
      context.direction = 'rtl'
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      const isSingleDamma = children.includes(HARAKAT.damma) && lettersOnly.length === 1
      const isSingleSukun = children.includes(HARAKAT.sukun) && lettersOnly.length === 1

      if (isSingleDamma) {
        context.fillStyle = style.color
        context.fillText(lettersOnly, width / 2, verticalPadding + height / 2)
        context.font = `${style.fontStyle} ${style.fontWeight} ${fontSize * 0.36}px ${style.fontFamily}`
        context.fillStyle = '#dc2626'
        context.fillText('و', width / 2, verticalPadding + height * 0.12)
        return
      }

      if (isSingleSukun) {
        context.fillStyle = style.color
        context.fillText(lettersOnly, width / 2, verticalPadding + height / 2)
        const radius = Math.min(3.5, Math.max(3, fontSize * 0.07))
        context.beginPath()
        context.arc(width / 2, verticalPadding + height * 0.12, radius, 0, Math.PI * 2)
        context.strokeStyle = '#dc2626'
        context.lineWidth = Math.max(1.35, fontSize * 0.03)
        context.stroke()
        return
      }

      context.fillStyle = '#dc2626'
      context.fillText(children, width / 2, verticalPadding + height / 2)
      context.fillStyle = style.color
      context.fillText(lettersOnly, width / 2, verticalPadding + height / 2)
    }

    paint()
    document.fonts.ready.then(paint)
    const observer = new ResizeObserver(paint)
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [children, lettersOnly])

  return (
    <span ref={wrapperRef} dir="rtl" className="relative inline-block whitespace-nowrap font-arabic text-foreground" aria-label={children}>
      <span className="opacity-0" aria-hidden="true">{children}</span>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
    </span>
  )
}

function ArabicWordWithExactRedVowels({ children, onlyTanwin = false }: { children: string; onlyTanwin?: boolean }) {
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lettersOnly = onlyTanwin
    ? children.replace(/[\u064B-\u064D]/g, '')
    : children.replace(/[\u064B-\u065F\u0670]/g, '')

  useEffect(() => {
    const wrapper = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrapper || !canvas) return

    const paint = () => {
      const bounds = wrapper.getBoundingClientRect()
      const style = window.getComputedStyle(wrapper)
      const width = Math.max(1, bounds.width)
      const height = Math.max(1, bounds.height)
      const fontSize = Number.parseFloat(style.fontSize) || 48
      const padding = fontSize * 0.38
      const cssHeight = height + padding * 2
      const ratio = window.devicePixelRatio || 1
      const pixelWidth = Math.ceil(width * ratio)
      const pixelHeight = Math.ceil(cssHeight * ratio)

      canvas.width = pixelWidth
      canvas.height = pixelHeight
      canvas.style.width = `${width}px`
      canvas.style.height = `${cssHeight}px`
      canvas.style.top = `${-padding}px`

      const fullLayer = document.createElement('canvas')
      const baseLayer = document.createElement('canvas')
      fullLayer.width = baseLayer.width = pixelWidth
      fullLayer.height = baseLayer.height = pixelHeight
      const main = canvas.getContext('2d')
      const full = fullLayer.getContext('2d')
      const base = baseLayer.getContext('2d')
      if (!main || !full || !base) return

      const configure = (context: CanvasRenderingContext2D) => {
        context.scale(ratio, ratio)
        context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
        context.direction = 'rtl'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillStyle = style.color
      }
      configure(main)
      configure(full)
      configure(base)
      const x = width / 2
      const y = padding + height / 2
      main.fillText(children, x, y)
      full.fillText(children, x, y)
      base.fillText(lettersOnly, x, y)

      const result = main.getImageData(0, 0, pixelWidth, pixelHeight)
      const fullPixels = full.getImageData(0, 0, pixelWidth, pixelHeight).data
      const basePixels = base.getImageData(0, 0, pixelWidth, pixelHeight).data
      const markPixels: Array<{ index: number; alpha: number }> = []
      for (let index = 0; index < result.data.length; index += 4) {
        if (fullPixels[index + 3] > basePixels[index + 3] + 12) {
          markPixels.push({ index, alpha: fullPixels[index + 3] })
          result.data[index] = basePixels[index]
          result.data[index + 1] = basePixels[index + 1]
          result.data[index + 2] = basePixels[index + 2]
          result.data[index + 3] = basePixels[index + 3]
        }
      }
      const downwardShift = onlyTanwin ? 0 : Math.round(fontSize * 0.1 * ratio)
      for (const pixel of markPixels) {
        const destination = pixel.index + downwardShift * pixelWidth * 4
        if (destination + 3 >= result.data.length) continue
        result.data[destination] = 220
        result.data[destination + 1] = 38
        result.data[destination + 2] = 38
        result.data[destination + 3] = Math.max(result.data[destination + 3], pixel.alpha)
      }
      main.setTransform(1, 0, 0, 1, 0, 0)
      main.putImageData(result, 0, 0)
    }

    paint()
    document.fonts.ready.then(paint)
    const observer = new ResizeObserver(paint)
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [children, lettersOnly, onlyTanwin])

  return (
    <span ref={wrapperRef} dir="rtl" className="relative inline-block whitespace-nowrap font-arabic text-foreground" aria-label={children}>
      <span className="opacity-0" aria-hidden="true">{children}</span>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />
    </span>
  )
}

function ShortVowelWordChart({ vowel }: { vowel: ShortVowelKey }) {
  const page = SHORT_VOWEL_PAGE[vowel]
  const isDamma = vowel === 'damma'
  const hasRecordedWordAudio = vowel === 'fatha' || vowel === 'kasra' || vowel === 'damma'

  return (
    <section className={`flex flex-col rounded-[2rem] border border-primary/20 bg-primary/[0.035] p-3 shadow-sm sm:p-5 ${isDamma ? 'min-h-[calc(100dvh+2rem)]' : 'min-h-[calc(100dvh-5rem)]'}`}>
      <header className="mb-3 shrink-0 text-center">
        <p dir="rtl" className="font-arabic text-3xl font-bold text-primary sm:text-4xl">{page.titleAr}</p>
        <h2 className="mt-1 text-base font-bold text-foreground sm:text-lg">
          Tableau des mots · {page.title}
        </h2>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-5 gap-1.5 sm:gap-2">
        {SHORT_VOWEL_WORDS[vowel].map((word, wordIndex) => (
          <button
            key={word.arabic}
            type="button"
            onClick={hasRecordedWordAudio
              ? () => void playRecordedAudio(`/audio/short-${vowel}-words/${wordIndex + 1}.mp3`)
              : undefined}
            disabled={!hasRecordedWordAudio}
            className={`flex min-h-0 flex-col items-center justify-center overflow-visible rounded-xl border border-primary/20 bg-card px-1 text-center shadow-[0_2px_7px_rgba(55,42,28,0.08)] sm:rounded-2xl sm:px-2 ${hasRecordedWordAudio ? 'cursor-pointer transition active:scale-95 active:bg-primary/10' : ''} ${isDamma ? 'py-4 sm:py-5' : 'py-2.5 sm:py-3'}`}
            aria-label={hasRecordedWordAudio ? `Écouter ${word.arabic}` : undefined}
          >
            <p className={`mb-1.5 flex items-center overflow-visible px-1 text-[clamp(1.65rem,7.3vw,2.65rem)] font-semibold leading-[1.9] text-foreground ${isDamma ? 'min-h-[5.25rem]' : 'min-h-[4.25rem]'}`}>
              {isDamma ? (
                <ArabicWordWithExactRedVowels>{word.arabic}</ArabicWordWithExactRedVowels>
              ) : (
                <ArabicWithRedVowels>{word.arabic}</ArabicWithRedVowels>
              )}
            </p>
            <p className="text-[clamp(0.6rem,2.7vw,0.8rem)] font-bold leading-tight text-red-600">
              {word.transliteration}
            </p>
            <p className="mt-0.5 text-[clamp(0.55rem,2.35vw,0.72rem)] leading-tight text-muted-foreground">
              {word.translation}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}

function SukunChart() {
  return (
    <section className="flex min-h-[calc(100dvh-6rem)] flex-col rounded-[2rem] border border-primary/20 bg-primary/[0.035] p-3 shadow-sm sm:p-5">
      <header className="mb-3 shrink-0 text-center">
        <p dir="rtl" className="font-arabic text-3xl font-bold text-primary sm:text-4xl">السُّكُونُ</p>
        <h2 className="mt-1 text-base font-bold text-foreground sm:text-lg">
          Le Soukoun · absence de voyelle
        </h2>
      </header>

      <div dir="rtl" className="grid min-h-0 flex-1 grid-cols-4 grid-rows-7 gap-1.5 sm:gap-2">
        {LETTERS.map((letter) => (
          <button
            key={letter.id}
            type="button"
            onClick={() => speakPhrase(letter.sound, 'fr')}
            className="flex min-h-0 flex-col items-center justify-center overflow-visible rounded-xl border border-primary/20 bg-card px-1 pb-2 pt-3 shadow-[0_2px_7px_rgba(55,42,28,0.08)] transition active:scale-95 active:bg-primary/10 sm:rounded-2xl"
            aria-label={`${letter.name} avec Soukoun`}
          >
            <span className="flex min-h-[3.8rem] items-center overflow-visible px-1 text-[clamp(1.95rem,8.7vw,3.05rem)] font-semibold leading-[1.65] text-foreground">
              <ArabicWithRedVowels>{letter.glyph + HARAKAT.sukun}</ArabicWithRedVowels>
            </span>
            <span dir="ltr" className="mt-0.5 text-[clamp(0.64rem,2.9vw,0.84rem)] font-bold leading-none text-red-600">
              {letter.sound}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function SukunWordsChart() {
  const rows = [
    ['أَنْ', 'أَ + نْ', 'an'],
    ['مِنْ', 'مِ + نْ', 'min'],
    ['هَلْ', 'هَ + لْ', 'hal'],
    ['لَمْ', 'لَ + مْ', 'lam'],
    ['قُلْ', 'قُ + لْ', 'qoul'],
    ['كَمْ', 'كَ + مْ', 'kam'],
    ['بَلْ', 'بَ + لْ', 'bal'],
    ['هُمْ', 'هُ + مْ', 'houm'],
    ['أَنْتَ', 'أَ + نْ + تَ', 'anta'],
    ['يَكْتُبُ', 'يَ + كْ + تُ + بُ', 'yaktoubou'],
  ]

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="gold-text text-xl font-bold">Le Sukūn ( ْ )</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Le <strong className="text-foreground">Sukūn ( ْ )</strong> indique que la lettre se prononce <strong className="text-foreground">sans voyelle après elle</strong>.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Par exemple : <span dir="rtl" className="font-arabic text-xl text-foreground">بَ</span> = ba, alors que <span dir="rtl" className="font-arabic text-xl text-foreground">بْ</span> = b.
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-card p-4">
        <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr] items-center gap-2 border-b border-border px-2 pb-3 text-center font-bold">
          <span>Découpage</span>
          <span>Mot</span>
          <span>Lecture</span>
        </div>
        {rows.map(([word, breakdown, reading]) => (
          <div key={word} className="grid grid-cols-[1.5fr_0.8fr_0.8fr] items-center gap-2 border-b border-border/70 px-2 py-3 text-center last:border-b-0">
            <span dir="rtl" className="font-arabic whitespace-nowrap text-xl text-foreground">{breakdown}</span>
            <span dir="rtl" className="font-arabic text-2xl text-foreground">{word}</span>
            <span className="font-semibold text-foreground">{reading}</span>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm leading-6 text-muted-foreground">
          <strong className="text-foreground">👉 À retenir :</strong> lorsqu’une lettre porte un <strong className="text-foreground">Sukūn ( ْ )</strong>, on prononce uniquement le son de la lettre, sans ajouter a, i ou ou.
        </p>
      </section>
    </div>
  )
}

type LongVowelKey = 'fatha' | 'kasra' | 'damma'

function LongFathaWithRedAlif({ glyph }: { glyph: string }) {
  return <span dir="rtl" className="inline-block whitespace-nowrap"><span>{glyph + HARAKAT.fatha}</span><span className="text-red-600">ا</span></span>
}

function LongKasraWithRedYa({ glyph }: { glyph: string }) {
  return <span dir="rtl" className="inline-block whitespace-nowrap"><span>{glyph + HARAKAT.kasra}</span><span className="text-red-600">ي</span></span>
}

function LongDammaWithRedWaw({ glyph }: { glyph: string }) {
  return <span dir="rtl" className="inline-block whitespace-nowrap"><span>{glyph + HARAKAT.damma}</span><span className="text-red-600">و</span></span>
}

function LongVowelsExplanation() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="gold-text text-center text-xl font-bold">Les voyelles longues</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          En arabe, une <strong className="text-foreground">voyelle longue</strong> est simplement une voyelle dont on <strong className="text-foreground">prolonge le son</strong>.
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Pour former une voyelle longue, on utilise une voyelle courte avec une lettre de prolongation :
        </p>
      </section>

      <section className="grid gap-3" aria-label="Formation des voyelles longues">
        <article className="rounded-2xl border border-primary/15 bg-card p-4">
          <h3 className="font-bold">Son « a » :</h3>
          <p className="mt-2 text-center text-lg font-semibold">a → ā</p>
          <p dir="ltr" className="font-arabic mt-2 text-center text-3xl text-foreground">
            َ + <span className="text-red-600">ا</span> → ـَ<span className="text-red-600">ا</span>
          </p>
        </article>

        <article className="rounded-2xl border border-primary/15 bg-card p-4">
          <h3 className="font-bold">Son « i » :</h3>
          <p className="mt-2 text-center text-lg font-semibold">i → ī</p>
          <p dir="ltr" className="font-arabic mt-2 text-center text-3xl text-foreground">
            ِ + <span className="text-red-600">ي</span> → ـِ<span className="text-red-600">ي</span>
          </p>
        </article>

        <article className="rounded-2xl border border-primary/15 bg-card p-4">
          <h3 className="font-bold">Son « ou » :</h3>
          <p className="mt-2 text-center text-lg font-semibold">ou → ū</p>
          <p dir="ltr" className="font-arabic mt-2 text-center text-3xl text-foreground">
            ُ + <span className="text-red-600">و</span> → ـُ<span className="text-red-600">و</span>
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="gold-text mb-3 font-bold">Ainsi :</h2>
        <div className="space-y-3 text-center">
          <p><strong dir="rtl" className="font-arabic text-2xl">بَ</strong> = ba <span className="mx-2">→</span> <strong dir="rtl" className="font-arabic text-2xl"><LongFathaWithRedAlif glyph="ب" /></strong> = bā</p>
          <p><strong dir="rtl" className="font-arabic text-2xl">بِ</strong> = bi <span className="mx-2">→</span> <strong dir="rtl" className="font-arabic text-2xl"><LongKasraWithRedYa glyph="ب" /></strong> = bī</p>
          <p><strong dir="rtl" className="font-arabic text-2xl">بُ</strong> = bou <span className="mx-2">→</span> <strong dir="rtl" className="font-arabic text-2xl"><LongDammaWithRedWaw glyph="ب" /></strong> = bū</p>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm leading-6">
          La voyelle longue se prononce environ <strong>deux fois plus longtemps</strong> que la voyelle courte.
        </p>
        <p className="mt-4 text-sm leading-6">
          <strong>👉 À retenir :</strong> <span className="font-arabic text-xl text-red-600">ا</span> prolonge le son « a », <span className="font-arabic text-xl text-red-600">ي</span> prolonge le son « i » et <span className="font-arabic text-xl text-red-600">و</span> prolonge le son « ou ».
        </p>
      </section>
    </div>
  )
}

function ShortVowelsExplanation() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="gold-text text-center text-xl font-bold">Les voyelles courtes</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          En arabe, les <strong className="text-foreground">voyelles courtes</strong> sont de petits signes placés <strong className="text-foreground">au-dessus ou en dessous d’une lettre</strong>. Elles permettent de savoir quel son prononcer avec cette lettre.
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Il existe <strong className="text-foreground">3 voyelles courtes principales</strong> :
        </p>
      </section>

      <section className="grid gap-3" aria-label="Les trois voyelles courtes principales">
        <article className="rounded-2xl border border-primary/15 bg-card p-4">
          <h3 className="font-bold">La Fatḥa ( <span className="font-arabic text-red-600">َ</span> ) → donne le son « <span className="text-red-600">a</span> »</h3>
          <p dir="ltr" className="mt-3 text-center text-lg font-semibold"><span className="text-3xl"><ArabicWithRedVowels>بَ</ArabicWithRedVowels></span> = <span className="text-red-600">ba</span></p>
        </article>

        <article className="rounded-2xl border border-primary/15 bg-card p-4">
          <h3 className="font-bold">La Kasra ( <span className="font-arabic text-red-600">ِ</span> ) → donne le son « <span className="text-red-600">i</span> »</h3>
          <p dir="ltr" className="mt-3 text-center text-lg font-semibold"><span className="text-3xl"><ArabicWithRedVowels>بِ</ArabicWithRedVowels></span> = <span className="text-red-600">bi</span></p>
        </article>

        <article className="rounded-2xl border border-primary/15 bg-card p-4">
          <h3 className="font-bold">La Ḍamma ( <span className="font-arabic text-red-600">ُ</span> ) → donne le son « <span className="text-red-600">ou</span> »</h3>
          <p dir="ltr" className="mt-3 text-center text-lg font-semibold"><span className="text-3xl"><ArabicWithRedVowels>بُ</ArabicWithRedVowels></span> = <span className="text-red-600">bou</span></p>
        </article>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <p className="text-sm leading-6 text-muted-foreground">
          La lettre <strong dir="rtl" className="font-arabic text-xl text-foreground">ب</strong> reste la même : c’est la petite voyelle qui change sa prononciation.
        </p>
        <div className="mt-4 space-y-3 text-center font-semibold">
          <p dir="ltr"><span className="text-2xl"><ArabicWithRedVowels>بَ</ArabicWithRedVowels></span> = <span className="text-red-600">ba</span></p>
          <p dir="ltr"><span className="text-2xl"><ArabicWithRedVowels>بِ</ArabicWithRedVowels></span> = <span className="text-red-600">bi</span></p>
          <p dir="ltr"><span className="text-2xl"><ArabicWithRedVowels>بُ</ArabicWithRedVowels></span> = <span className="text-red-600">bou</span></p>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm leading-6">
          <strong>👉 À retenir :</strong> <span className="font-arabic text-xl text-red-600">َ</span> = <span className="text-red-600">a</span> • <span className="font-arabic text-xl text-red-600">ِ</span> = <span className="text-red-600">i</span> • <span className="font-arabic text-xl text-red-600">ُ</span> = <span className="text-red-600">ou</span>
        </p>
        <p className="mt-4 text-sm leading-6">
          Contrairement aux voyelles longues, les voyelles courtes se prononcent <strong>rapidement, sans prolonger le son</strong>.
        </p>
      </section>
    </div>
  )
}

const LONG_VOWEL_PAGE: Record<
  LongVowelKey,
  { title: string; titleAr: string; compose: (glyph: string) => string; speechKey: FormDef['speechKey'] }
> = {
  fatha: {
    title: 'Fatha longue · son « ā »',
    titleAr: 'الْفَتْحَةُ الطَّوِيلَةُ',
    compose: (glyph) => glyph + HARAKAT.fatha + HARAKAT.alif,
    speechKey: 'longAlif',
  },
  kasra: {
    title: 'Kasra longue · son « ī »',
    titleAr: 'الْكَسْرَةُ الطَّوِيلَةُ',
    compose: (glyph) => glyph + HARAKAT.kasra + HARAKAT.ya,
    speechKey: 'longYa',
  },
  damma: {
    title: 'Damma longue · son « ū »',
    titleAr: 'الضَّمَّةُ الطَّوِيلَةُ',
    compose: (glyph) => glyph + HARAKAT.damma + HARAKAT.waw,
    speechKey: 'longWaw',
  },
}

function LongVowelChart({ vowel }: { vowel: LongVowelKey }) {
  const page = LONG_VOWEL_PAGE[vowel]

  return (
    <section className="flex min-h-[calc(100dvh-6rem)] flex-col rounded-[2rem] border border-primary/20 bg-primary/[0.035] p-3 shadow-sm sm:p-5">
      <header className="mb-3 shrink-0 text-center">
        <p dir="rtl" className="font-arabic text-3xl font-bold text-primary sm:text-4xl">{page.titleAr}</p>
        <h2 className="mt-1 text-base font-bold text-foreground sm:text-lg">{page.title}</h2>
      </header>
      <div dir="rtl" className="grid min-h-0 flex-1 grid-cols-4 grid-rows-7 gap-1.5 sm:gap-2" aria-label={page.title}>
        {LETTERS.map((letter, letterIndex) => {
          const phonetic = LETTER_PHONETICS[letter.id]?.long[vowel] ?? ''
          return (
            <button
              key={letter.id}
              type="button"
              onClick={() => {
                if (vowel === 'fatha') void playRecordedAudio(`/audio/long-fatha/${letterIndex + 1}.mp3`)
                else if (vowel === 'kasra') void playRecordedAudio(`/audio/long-kasra/${letterIndex + 1}.mp3`)
                else void playRecordedAudio(`/audio/long-damma-recorded/${letterIndex + 1}.mp3`)
              }}
              className="flex min-h-0 flex-col items-center justify-center overflow-visible rounded-xl border border-primary/20 bg-card px-1 pb-2 pt-3 shadow-[0_2px_7px_rgba(55,42,28,0.08)] transition active:scale-95 active:bg-primary/10 sm:rounded-2xl sm:pb-2.5 sm:pt-3.5"
              aria-label={`${letter.name}, ${phonetic}`}
            >
              <span className="font-arabic flex min-h-[3.8rem] items-center overflow-visible px-1 text-[clamp(1.8rem,8vw,2.8rem)] font-semibold leading-[1.65] text-foreground">
                {vowel === 'fatha' ? <LongFathaWithRedAlif glyph={letter.glyph} /> : vowel === 'kasra' ? <LongKasraWithRedYa glyph={letter.glyph} /> : <LongDammaWithRedWaw glyph={letter.glyph} />}
              </span>
              <span dir="ltr" className="mt-1 text-[clamp(0.64rem,2.9vw,0.84rem)] font-bold leading-none text-foreground">{phonetic}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

type TanwinPageKey = 'fatha' | 'kasra' | 'damma'

function FormulaMark({ mark, red = false }: { mark: string; red?: boolean }) {
  const isDoubleStroke = mark === 'ً' || mark === 'ٍ'
  const isDamma = mark === 'ُ' || mark === 'ٌ'
  const ink = red ? 'bg-red-600' : 'bg-foreground'

  return (
    <span
      aria-label={mark}
      className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center align-middle"
    >
      {isDamma ? (
        <span aria-hidden="true" className={`font-arabic text-[1.15rem] font-bold leading-none ${red ? 'text-red-600' : 'text-foreground'}`}>
          {mark === 'ٌ' ? 'ۥۥ' : 'ۥ'}
        </span>
      ) : (
        <span aria-hidden="true" className="relative block h-4 w-5">
          <span className={`absolute left-1/2 top-1/2 h-[2px] w-4 -translate-x-1/2 -translate-y-1/2 -rotate-[10deg] rounded-full ${ink}`} />
          {isDoubleStroke ? <span className={`absolute left-1/2 top-[calc(50%+5px)] h-[2px] w-4 -translate-x-1/2 -translate-y-1/2 -rotate-[10deg] rounded-full ${ink}`} /> : null}
        </span>
      )}
    </span>
  )
}

function TanwinExplanation() {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="gold-text text-center text-xl font-bold">Le Tanwīn (التنوين)</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Le <strong className="text-foreground">Tanwīn</strong> ressemble à une <strong className="text-foreground">voyelle courte doublée</strong>. Il ajoute simplement le son <strong className="text-foreground">« n »</strong> à la voyelle.
        </p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Il existe <strong className="text-foreground">3 Tanwīn</strong> :
        </p>
      </section>

      <section className="grid gap-3" aria-label="Les trois Tanwīn">
        <article className="rounded-2xl border border-primary/15 bg-card p-4 text-center">
          <p dir="ltr" className="flex items-center justify-center gap-3 text-lg font-bold"><FormulaMark mark="ً" red /><span>= an</span></p>
          <p dir="ltr" className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1"><strong>Exemple :</strong><span className="text-2xl"><ArabicWordWithExactRedVowels onlyTanwin>كِتَابًا</ArabicWordWithExactRedVowels></span><span>=</span><strong>kitāban</strong></p>
        </article>
        <article className="rounded-2xl border border-primary/15 bg-card p-4 text-center">
          <p dir="ltr" className="flex items-center justify-center gap-3 text-lg font-bold"><FormulaMark mark="ٍ" red /><span>= in</span></p>
          <p dir="ltr" className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1"><strong>Exemple :</strong><span className="text-2xl"><ArabicWordWithExactRedVowels onlyTanwin>كِتَابٍ</ArabicWordWithExactRedVowels></span><span>=</span><strong>kitābin</strong></p>
        </article>
        <article className="rounded-2xl border border-primary/15 bg-card p-4 text-center">
          <p dir="ltr" className="flex items-center justify-center gap-3 text-lg font-bold"><FormulaMark mark="ٌ" red /><span>= oun</span></p>
          <p dir="ltr" className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1"><strong>Exemple :</strong><span className="text-2xl"><ArabicWordWithExactRedVowels onlyTanwin>كِتَابٌ</ArabicWordWithExactRedVowels></span><span>=</span><strong>kitāboun</strong></p>
        </article>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h3 className="font-bold">Pour bien comprendre :</h3>
        <div dir="ltr" className="mt-4 space-y-4 text-lg font-semibold">
          <p className="flex items-center justify-center gap-3"><FormulaMark mark="َ" /><span>= a</span><span className="mx-1">→</span><FormulaMark mark="ً" red /><span>= an</span></p>
          <p className="flex items-center justify-center gap-3"><FormulaMark mark="ِ" /><span>= i</span><span className="mx-1">→</span><FormulaMark mark="ٍ" red /><span>= in</span></p>
          <p className="flex items-center justify-center gap-3"><FormulaMark mark="ُ" /><span>= ou</span><span className="mx-1">→</span><FormulaMark mark="ٌ" red /><span>= oun</span></p>
        </div>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm leading-6">
          <strong>👉 À retenir :</strong> lorsqu’une voyelle est doublée, on entend un petit son <strong>« n »</strong> : <strong>an, in, oun</strong>.
        </p>
      </section>
    </div>
  )
}

function TanwinFathGlyph({ glyph }: { glyph: string }) {
  return (
    <span dir="rtl" className="relative inline-block whitespace-nowrap text-foreground">
      <span>{glyph}ا</span>
      <span aria-hidden="true" className="font-arabic absolute left-[0.1em] top-[0.42em] text-[0.72em] leading-none text-red-600">ً</span>
    </span>
  )
}

const TANWIN_PAGE: Record<
  TanwinPageKey,
  { title: string; titleAr: string; compose: (glyph: string) => string; speechKey: FormDef['speechKey'] }
> = {
  fatha: {
    title: 'Tanwin Fath · son « an »',
    titleAr: 'تَنْوِينُ الْفَتْحِ',
    compose: (glyph) => glyph + HARAKAT.tanwinFath + HARAKAT.alif,
    speechKey: 'tanwinAn',
  },
  kasra: {
    title: 'Tanwin Kasr · son « in »',
    titleAr: 'تَنْوِينُ الْكَسْرِ',
    compose: (glyph) => glyph + HARAKAT.tanwinKasr,
    speechKey: 'tanwinIn',
  },
  damma: {
    title: 'Tanwin Damm · son « oun »',
    titleAr: 'تَنْوِينُ الضَّمِّ',
    compose: (glyph) => glyph + HARAKAT.tanwinDamm,
    speechKey: 'tanwinUn',
  },
}

function TanwinChart({ vowel }: { vowel: TanwinPageKey }) {
  const page = TANWIN_PAGE[vowel]

  return (
    <section className="flex min-h-[calc(100dvh-6rem)] flex-col rounded-[2rem] border border-primary/20 bg-primary/[0.035] p-3 shadow-sm sm:p-5">
      <header className="mb-3 shrink-0 text-center">
        <p dir="rtl" className="font-arabic text-3xl font-bold text-primary sm:text-4xl">{page.titleAr}</p>
        <h2 className="mt-1 text-base font-bold text-foreground sm:text-lg">{page.title}</h2>
      </header>
      <div dir="rtl" className="grid min-h-0 flex-1 grid-cols-4 grid-rows-7 gap-1.5 sm:gap-2" aria-label={page.title}>
        {LETTERS.map((letter, letterIndex) => {
          const phonetic = LETTER_PHONETICS[letter.id]?.tanwin[vowel] ?? ''
          return (
            <button
              key={letter.id}
              type="button"
              onClick={() => {
                if (vowel === 'fatha') void playRecordedAudio(`/audio/tanwin-fatha-recorded/${letterIndex + 1}.mp3`)
                else if (vowel === 'kasra') void playRecordedAudio(`/audio/tanwin-kasra-recorded/${letterIndex + 1}.mp3`)
                else if (letterIndex === 24) void playRecordedAudio('/audio/tanwin-damma-recorded/25-nun-replacement.mp3')
                else void playRecordedAudio(`/audio/tanwin-damma-recorded/${letterIndex + 1}.mp3`)
              }}
              className="flex min-h-0 flex-col items-center justify-center overflow-visible rounded-xl border border-primary/20 bg-card px-1 pb-2 pt-3 shadow-[0_2px_7px_rgba(55,42,28,0.08)] transition active:scale-95 active:bg-primary/10 sm:rounded-2xl sm:pb-2.5 sm:pt-3.5"
              aria-label={`${letter.name}, ${phonetic}`}
            >
              <span className="font-arabic flex min-h-[3.8rem] items-center overflow-visible px-1 text-[clamp(1.8rem,8vw,2.8rem)] font-semibold leading-[1.65] text-foreground">
                {vowel === 'fatha' ? (
                  <TanwinFathGlyph glyph={letter.glyph} />
                ) : (
                  <ArabicWithRedVowels>{page.compose(letter.glyph)}</ArabicWithRedVowels>
                )}
              </span>
              <span dir="ltr" className="mt-1 text-[clamp(0.64rem,2.9vw,0.84rem)] font-bold leading-none text-foreground">{phonetic}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function RulesView({
  topic,
  onBack,
}: {
  topic: 'short-vowels' | 'long-vowels' | 'tanwin'
  onBack: () => void
}) {
  const { t, lang } = useI18n()
  const [shortStep, setShortStep] = useState(0)
  const [longStep, setLongStep] = useState(0)
  const [tanwinStep, setTanwinStep] = useState(0)

  useEffect(() => {
    if (topic === 'short-vowels') {
      window.scrollTo({ top: 0, behavior: 'auto' })
      document.querySelector<HTMLElement>('[data-app-scroll]')?.scrollTo({ top: 0, behavior: 'auto' })
    }
    if (topic === 'long-vowels') {
      window.scrollTo({ top: 0, behavior: 'auto' })
      document.querySelector<HTMLElement>('[data-app-scroll]')?.scrollTo({ top: 0, behavior: 'auto' })
    }
    if (topic === 'tanwin') {
      window.scrollTo({ top: 0, behavior: 'auto' })
      document.querySelector<HTMLElement>('[data-app-scroll]')?.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [shortStep, longStep, tanwinStep, topic])

  // Per official phonetic guide: Fatha → Kasra → Damma (no sukun in reference chart).
  const shortForms: FormDef[] = [
    {
      key: 'fatha',
      label: 'Fatha ( a )',
      compose: (l) => l.glyph + HARAKAT.fatha,
      translit: (l) => LETTER_PHONETICS[l.id]?.short.fatha ?? '',
      speechKey: 'shortFatha',
    },
    {
      key: 'kasra',
      label: 'Kasra ( i )',
      compose: (l) => l.glyph + HARAKAT.kasra,
      translit: (l) => LETTER_PHONETICS[l.id]?.short.kasra ?? '',
      speechKey: 'shortKasra',
    },
    {
      key: 'damma',
      label: 'Damma ( u )',
      compose: (l) => l.glyph + HARAKAT.damma,
      translit: (l) => LETTER_PHONETICS[l.id]?.short.damma ?? '',
      speechKey: 'shortDamma',
    },
  ]
  const longForms: FormDef[] = [
    {
      key: 'aa',
      label: 'Alif ( ā )',
      compose: (l) => l.glyph + HARAKAT.fatha + HARAKAT.alif,
      translit: (l) => LETTER_PHONETICS[l.id]?.long.fatha ?? '',
      speechKey: 'longAlif',
    },
    {
      key: 'ii',
      label: "Yā' ( ī )",
      compose: (l) => l.glyph + HARAKAT.kasra + HARAKAT.ya,
      translit: (l) => LETTER_PHONETICS[l.id]?.long.kasra ?? '',
      speechKey: 'longYa',
    },
    {
      key: 'uu',
      label: 'Wāw ( ū )',
      compose: (l) => l.glyph + HARAKAT.damma + HARAKAT.waw,
      translit: (l) => LETTER_PHONETICS[l.id]?.long.damma ?? '',
      speechKey: 'longWaw',
    },
  ]
  const tanwinForms: FormDef[] = [
    {
      key: 'an',
      label: 'Tanwin ( an )',
      compose: (l) => l.glyph + HARAKAT.tanwinFath + HARAKAT.alif,
      translit: (l) => LETTER_PHONETICS[l.id]?.tanwin.fatha ?? '',
      speechKey: 'tanwinAn',
    },
    {
      key: 'in',
      label: 'Tanwin ( in )',
      compose: (l) => l.glyph + HARAKAT.tanwinKasr,
      translit: (l) => LETTER_PHONETICS[l.id]?.tanwin.kasra ?? '',
      speechKey: 'tanwinIn',
    },
    {
      key: 'un',
      label: 'Tanwin ( un )',
      compose: (l) => l.glyph + HARAKAT.tanwinDamm,
      translit: (l) => LETTER_PHONETICS[l.id]?.tanwin.damma ?? '',
      speechKey: 'tanwinUn',
    },
  ]

  const map = {
    'short-vowels': { rules: SHORT_VOWELS, title: t('learn.shortVowels'), forms: shortForms },
    'long-vowels': { rules: LONG_VOWELS, title: t('learn.longVowels'), forms: longForms },
    tanwin: { rules: TANWIN, title: t('learn.tanwin'), forms: tanwinForms },
  }
  const { rules, title, forms } = map[topic]
  // The source data is already in its teaching order: A, I, U.
  const orderedRules = rules

  if (topic === 'short-vowels') {
    const vowelPages: ShortVowelKey[] = ['fatha', 'kasra', 'damma']
    const activeVowel = shortStep > 0 ? vowelPages[Math.floor((shortStep - 1) / 2)] : undefined
    const isWordPage = shortStep > 0 && shortStep % 2 === 0
    const isSukunPage = shortStep === vowelPages.length * 2 + 1
    const isSukunWordsPage = shortStep === vowelPages.length * 2 + 2
    const previousLabel = lang === 'ar' ? 'السابق' : lang === 'en' ? 'Previous' : 'Précédent'
    const nextLabel = lang === 'ar' ? 'التالي' : lang === 'en' ? 'Next' : 'Suivant'

    return (
      <div>
        <BackBar title={title} onBack={onBack} />
        <div className="p-3 sm:p-5">
          {shortStep === 0 ? (
            <ShortVowelsExplanation />
          ) : isSukunWordsPage ? (
            <SukunWordsChart />
          ) : isSukunPage ? (
            <SukunChart />
          ) : isWordPage ? (
            <ShortVowelWordChart vowel={activeVowel!} />
          ) : (
            <ShortVowelChart vowel={activeVowel!} />
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => shortStep === 0 ? onBack() : setShortStep((step) => step - 1)}
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 font-semibold"
            >
              <ChevronLeft className="h-5 w-5" />
              {previousLabel}
            </button>
            {shortStep < vowelPages.length * 2 + 2 ? (
              <button
                type="button"
                onClick={() => setShortStep((step) => step + 1)}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-4 font-semibold text-primary-foreground shadow-sm"
              >
                {nextLabel}
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <CompletionButton topicId={topic} onBack={onBack} />
            )}
          </div>
        </div>
      </div>
    )
  }

  if (topic === 'long-vowels') {
    const vowelPages: LongVowelKey[] = ['fatha', 'kasra', 'damma']
    const activeVowel = longStep > 0 ? vowelPages[longStep - 1] : undefined
    const previousLabel = lang === 'ar' ? 'السابق' : lang === 'en' ? 'Previous' : 'Précédent'
    const nextLabel = lang === 'ar' ? 'التالي' : lang === 'en' ? 'Next' : 'Suivant'

    return (
      <div>
        <BackBar title={title} onBack={onBack} />
        <div className="p-3 sm:p-5">
          {longStep === 0 ? (
            <LongVowelsExplanation />
          ) : (
            <LongVowelChart vowel={activeVowel!} />
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => longStep === 0 ? onBack() : setLongStep((step) => step - 1)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 font-semibold">
              <ChevronLeft className="h-5 w-5" />{previousLabel}
            </button>
            {longStep < vowelPages.length ? (
              <button type="button" onClick={() => setLongStep((step) => step + 1)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-4 font-semibold text-primary-foreground shadow-sm">
                {nextLabel}<ChevronRight className="h-5 w-5" />
              </button>
            ) : <CompletionButton topicId={topic} onBack={onBack} />}
          </div>
        </div>
      </div>
    )
  }

  if (topic === 'tanwin') {
    const tanwinPages: TanwinPageKey[] = ['fatha', 'kasra', 'damma']
    const activeTanwin = tanwinStep > 0 ? tanwinPages[tanwinStep - 1] : undefined
    const previousLabel = lang === 'ar' ? 'السابق' : lang === 'en' ? 'Previous' : 'Précédent'
    const nextLabel = lang === 'ar' ? 'التالي' : lang === 'en' ? 'Next' : 'Suivant'

    return (
      <div>
        <BackBar title={title} onBack={onBack} />
        <div className="p-3 sm:p-5">
          {tanwinStep === 0 ? (
            <TanwinExplanation />
          ) : (
            <TanwinChart vowel={activeTanwin!} />
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => tanwinStep === 0 ? onBack() : setTanwinStep((step) => step - 1)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 font-semibold">
              <ChevronLeft className="h-5 w-5" />{previousLabel}
            </button>
            {tanwinStep < tanwinPages.length ? (
              <button type="button" onClick={() => setTanwinStep((step) => step + 1)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-4 font-semibold text-primary-foreground shadow-sm">
                {nextLabel}<ChevronRight className="h-5 w-5" />
              </button>
            ) : <CompletionButton topicId={topic} onBack={onBack} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <BackBar title={title} onBack={onBack} />
      <div className="flex flex-col gap-4 p-5">
        {orderedRules.map((r) => (
          <RuleCard key={r.id} rule={r} />
        ))}
        <h2 className="mt-2 text-sm font-semibold text-muted-foreground">
          {t('learn.letters')} · {t('learn.vowelForms')}
        </h2>
        <AllLettersForms forms={forms} />
        <CompletionButton topicId={topic} onBack={onBack} />
      </div>
    </div>
  )
}

function PositionsView({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n()
  const positionKeys: LetterPosition[] = ['isolated', 'initial', 'medial', 'final']
  return (
    <div>
      <BackBar title={t('learn.positions')} onBack={onBack} />
      <div className="p-5">
        <div className="mb-4 grid grid-cols-4 gap-2 text-center text-[11px] font-medium text-muted-foreground">
          <span>{t('learn.position.isolated')}</span>
          <span>{t('learn.position.initial')}</span>
          <span>{t('learn.position.medial')}</span>
          <span>{t('learn.position.final')}</span>
        </div>
        <div className="flex flex-col gap-3">
          {LETTERS.map((l) => (
            <div key={l.id} className="rounded-3xl border border-border bg-card p-3">
              <p className="mb-2 px-1 text-xs font-medium text-primary">{letterDisplayName(l, lang)}</p>
              <div className="grid grid-cols-4 gap-2">
                {positionKeys.map((posKey) => (
                  <PositionSoundCell
                    key={posKey}
                    display={pedagogicalPositionGlyph(l, posKey)}
                    phrase={letterPositionPhrase(l, posKey, lang)}
                    lang={lang}
                    audioSequence={lang === 'fr' && letterRecordedAudio(l)
                      ? letterPositionRecordedSequence(letterRecordedAudio(l)!, posKey)
                      : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <CompletionButton topicId="positions" onBack={onBack} />
        </div>
      </div>
    </div>
  )
}

function WordCard({ w }: { w: Word }) {
  const { t, lang } = useI18n()
  return (
    <article className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
      <div className="min-w-0 flex-1">
        <p className="font-arabic text-4xl leading-tight text-foreground">{w.word}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {w.translit} · {localized(w.meaning, lang)}
        </p>
      </div>
      <ListenButton text={w.word} label={t('learn.listen')} size="sm" />
    </article>
  )
}

const WORD_ILLUSTRATIONS: Record<string, string> = {
  porte: '🚪', lune: '🌙', livre: '📖', soleil: '☀️', maison: '🏠', eau: '💧', pain: '🥖', garçon: '👦',
  table: '🪑', chaise: '🪑', clé: '🔑', téléphone: '📱', sac: '👜', stylo: '🖊️', lampe: '💡', lit: '🛏️',
  fenêtre: '🪟', verre: '🥛', assiette: '🍽️', cuillère: '🥄', vêtements: '👕', chaussure: '👟', 'montre / horloge': '🕰️', miroir: '🪞',
  père: '👨', mère: '👩', frère: '👦', sœur: '👧', 'grand-père': '👴', 'grand-mère': '👵', fils: '👦', fille: '👧',
  'oncle paternel': '👨', 'tante paternelle': '👩', 'oncle maternel': '👨', 'tante maternelle': '👩', 'mari / époux': '🤵', 'femme / épouse': '👰',
  dattes: '🌴', lait: '🥛', viande: '🥩', pomme: '🍎', banane: '🍌', riz: '🍚', poulet: '🍗', poisson: '🐟', œufs: '🥚', légumes: '🥬',
  un: '1️⃣', deux: '2️⃣', trois: '3️⃣', quatre: '4️⃣', cinq: '5️⃣', six: '6️⃣', sept: '7️⃣', huit: '8️⃣', neuf: '9️⃣', dix: '🔟', blanc: '⚪', noir: '⚫', rouge: '🔴', bleu: '🔵',
  vert: '🟢', jaune: '🟡', orange: '🟠', violet: '🟣', rose: '🌸', marron: '🟤', gris: '◉',
  'blanche (féminin)': '⚪', 'noire (féminin)': '⚫', 'rouge (féminin)': '🔴', 'bleue (féminin)': '🔵', 'verte (féminin)': '🟢', 'jaune (féminin)': '🟡',
  'une porte rouge': '🚪🔴', 'un sac vert': '👜🟢', travail: '💼', bureau: '🏢', directeur: '🧑‍💼', employé: '👨‍💻', médecin: '🩺', enseignant: '🧑‍🏫', ordinateur: '💻',
  entreprise: '🏢', collègue: '👥', réunion: '🗓️', salaire: '💶',
}

const CATEGORY_VISUAL_CLUES: Record<string, string> = {
  daily: '🏠',
  family: '👨‍👩‍👧‍👦',
  food: '🍽️',
  numbers: '🔢',
  colors: '🎨',
  work: '💼',
  phrases: '💬',
}

export function vocabularyVisualClue(categoryId: string, word: Word) {
  return WORD_ILLUSTRATIONS[word.meaning.fr] ?? CATEGORY_VISUAL_CLUES[categoryId] ?? '💬'
}

function ChaddaView({ onBack }: { onBack: () => void }) {
  const [page, setPage] = useState(0)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    document.querySelector<HTMLElement>('[data-app-scroll]')?.scrollTo({ top: 0, behavior: 'auto' })
  }, [page])

  const titles = ['La Chadda — الشَّدَّة', '☀️ Les lettres solaires', '🌙 Les lettres lunaires', 'Résumé ☀️ et 🌙']
  const solarLetters = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']
  const lunarLetters = ['ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'هـ', 'و', 'ي']

  return (
    <div>
      <BackBar title={titles[page]} onBack={onBack} />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2" aria-label={`Page ${page + 1} sur 4`}>
          {[0, 1, 2, 3].map((step) => <span key={step} className={`h-2 flex-1 rounded-full ${step <= page ? 'gold-gradient' : 'bg-secondary'}`} />)}
        </div>

        {page === 0 ? <>
          <section className="rounded-3xl border border-border bg-card p-5 text-center">
            <div dir="rtl" className="font-arabic text-7xl font-bold">بَّ</div>
            <h2 className="gold-text mt-3 text-lg font-bold">Qu’est-ce que la Chadda ?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">La Chadda <span dir="ltr" className="mx-1 inline-flex items-center gap-1 align-middle text-foreground"><span>(</span><span dir="rtl" className="font-arabic text-3xl leading-none">ـّ</span><span>)</span></span> est un petit signe placé au-dessus d’une lettre arabe. Elle indique que la consonne doit être prononcée deux fois, ou plus exactement renforcée et doublée.</p>
            <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl">بَ</p><p className="text-sm">ba</p></div><div className="rounded-2xl border border-primary/25 bg-primary/5 p-3"><p dir="rtl" className="font-arabic text-3xl font-bold">بَّ</p><p className="gold-text text-sm font-bold">bba</p></div></div>
          </section>
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="gold-text mb-3 font-bold">Comment fonctionne-t-elle ?</h2>
            <p className="text-sm leading-6 text-muted-foreground">Pour l’expliquer à un débutant, on peut considérer qu’une lettre avec Chadda représente deux fois la même consonne :</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3"><span>Première lettre :</span><span><span dir="rtl" className="font-arabic text-2xl text-foreground">بْ</span> <span className="text-muted-foreground">→ b</span></span></div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3"><span>Deuxième lettre :</span><span><span dir="rtl" className="font-arabic text-2xl text-foreground">بَ</span> <span className="text-muted-foreground">→ ba</span></span></div>
            </div>
            <p className="mt-4 text-center text-sm font-semibold">En les réunissant :</p>
            <div dir="ltr" className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
              <div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl">بْ</p><p className="text-xs text-muted-foreground">b</p></div><span>+</span>
              <div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl">بَ</p><p className="text-xs text-muted-foreground">ba</p></div><span>=</span>
              <div className="rounded-2xl bg-primary/10 p-3"><p dir="rtl" className="font-arabic text-3xl font-bold">بَّ</p><p className="gold-text text-xs font-bold">bba</p></div>
            </div>
            <p className="mt-3 text-center text-sm font-semibold">b + ba = bba</p>
            <p className="mt-1 text-center text-xs text-muted-foreground">Ce résultat s’écrit en arabe : <span dir="rtl" className="font-arabic text-2xl text-foreground">بَّ</span></p>
          </section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Chadda avec les voyelles courtes</h2><div className="space-y-3">{[
            ['Chadda + Fatḥa','بَّ · تَّ · مَّ','bba · tta · mma','دَرَّسَ','darrasa','il a enseigné — le رّ est renforcé : dar-ra-sa'],
            ['Chadda + Kasra','بِّ · تِّ · مِّ','bbi · tti · mmi','مُعَلِّم','mouʿallim','enseignant — le لّ est doublé'],
            ['Chadda + Ḍamma','بُّ · تُّ · مُّ','bbou · ttou · mmou','يُحِبُّ','youḥibbou','il aime — le بّ est renforcé'],
          ].map(([name,forms,sounds,word,reading,meaning]) => <article key={name} className="rounded-2xl bg-secondary/60 p-4"><h3 className="font-semibold">{name}</h3><p dir="rtl" className="font-arabic mt-2 text-2xl">{forms}</p><p className="gold-text text-sm font-semibold">{sounds}</p><div className="mt-3 border-t border-border pt-3 text-center"><p dir="rtl" className="font-arabic text-3xl font-bold">{word}</p><p className="text-sm font-semibold">{reading}</p><p className="text-xs text-muted-foreground">{meaning}</p></div></article>)}</div></section>
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5"><h2 className="gold-text mb-3 font-bold">À retenir</h2><p className="text-sm leading-6 text-muted-foreground">La Chadda n’est pas une lettre et n’a pas de son propre. Elle signifie simplement : « Prononce cette consonne de manière doublée. »</p><div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm"><span>بَ → ba<br/>بَّ → bba</span><span>بِ → bi<br/>بِّ → bbi</span><span>بُ → bou<br/>بُّ → bbou</span></div></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Exercices guidés</h2><p className="mb-2 text-sm font-semibold">Repérez la lettre portant la Chadda :</p>{[['دَرَّسَ','رّ'],['مُعَلِّم','لّ'],['يُحِبُّ','بّ'],['الشَّمْس','شّ']].map(([word,answer]) => <div key={word} className="mb-2 flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-2"><span dir="rtl" className="font-arabic text-2xl">{word}</span><span className="text-sm text-emerald-600">✓ {answer}</span></div>)}</section>
          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="gold-text mb-3 font-bold">Pour bien comprendre</h2>
            <p className="mb-5 text-sm leading-6 text-muted-foreground">
              La forme détaillée est à gauche et la forme avec Chadda est à droite.
            </p>
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-secondary/70 px-3 py-3 text-center text-sm font-bold">
                <span>Forme détaillée</span>
                <span>=</span>
                <span>Avec Chadda</span>
              </div>
              {[
                ['تَبْبَ', 'تَبَّ'],
                ['صَكْكَ', 'صَكَّ'],
                ['عَمْمَ', 'عَمَّ'],
                ['مَرْرَ', 'مَرَّ'],
                ['حَبْبَ', 'حَبَّ'],
                ['رَدْدَ', 'رَدَّ'],
                ['شَدْدَ', 'شَدَّ'],
                ['شُدْدَ', 'شُدَّ'],
                ['مَدْدَ', 'مَدَّ'],
              ].map(([detailed, shadda]) => (
                <div key={`${detailed}-${shadda}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-border px-3 py-3 text-center">
                  <span dir="rtl" className="font-arabic text-2xl">{detailed}</span>
                  <span className="font-bold">=</span>
                  <span dir="rtl" className="font-arabic text-2xl">{shadda}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              Le principe visible est donc, par exemple : <span dir="rtl" className="font-arabic text-xl text-foreground">دْ + دَ = دَّ</span>.
            </p>
          </section>
        </> : page === 1 ? <>
          <section className="rounded-3xl border border-border bg-card p-5 text-center"><div className="text-5xl">☀️</div><h2 className="gold-text mt-2 text-xl font-bold">Les lettres solaires</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Lorsqu’un mot commence par une lettre solaire après l’article défini <span dir="rtl" className="font-arabic text-lg text-foreground">الـ</span>, le <span dir="rtl" className="font-arabic">ل</span> reste écrit mais ne se prononce pas. La première consonne du mot est alors renforcée et porte une Chadda.</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-2 font-bold">L’article défini الـ</h2><p className="text-sm leading-6 text-muted-foreground">En arabe, <span dir="rtl" className="font-arabic text-lg text-foreground">الـ</span> correspond généralement à « le, la ou les ». La manière de le prononcer dépend de la première lettre du mot.</p><div className="mt-3 rounded-2xl bg-secondary/60 p-4 text-center"><p dir="rtl" className="font-arabic text-2xl">بَيْت ← الْبَيْت</p><p className="text-sm">bayt : maison → al-bayt : la maison</p></div><p className="mt-3 text-xs text-muted-foreground">Les 28 lettres appartiennent toutes à un seul des deux groupes : 14 solaires ☀️ et 14 lunaires 🌙.</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Les 14 lettres solaires</h2><LetterFamilyGrid letters={solarLetters}/><p dir="rtl" className="font-arabic mt-4 text-center text-xl">ت ث د ذ ر ز س ش ص ض ط ظ ل ن</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Comment cela fonctionne ?</h2><div dir="ltr" className="space-y-3 text-center"><div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl">شَمْس</p><p className="text-sm">shams → soleil</p></div><div>+ article الـ ↓</div><div className="rounded-2xl bg-primary/10 p-3"><p dir="rtl" className="font-arabic text-3xl font-bold">الشَّمْس</p><p className="gold-text font-bold">ash-shams → le soleil</p></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700"><p className="text-xl">✕</p><p className="font-semibold">al-shams</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700"><p className="text-xl">✓</p><p className="font-semibold">ash-shams</p></div></div><p className="mt-3 text-sm leading-6 text-muted-foreground">Pourquoi ? Parce que ش est solaire : le ل ne se prononce pas et le ش devient شّ.</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Autres exemples</h2>{[['الرَّجُل','ar-rajoul','l’homme'],['النَّجْم','an-najm','l’étoile'],['السَّمَاء','as-samāʾ','le ciel'],['الدَّرْس','ad-dars','la leçon']].map(([word,reading,meaning]) => <div key={word} className="mb-2 grid grid-cols-[1fr_auto] items-center rounded-xl bg-secondary/60 p-3"><div><p className="gold-text font-semibold">{reading}</p><p className="text-xs text-muted-foreground">{meaning}</p></div><p dir="rtl" className="font-arabic text-2xl font-bold">{word}</p></div>)}</section>
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5"><h2 className="gold-text mb-2 font-bold">Règle à retenir ☀️</h2><p className="text-sm">Le ل de الـ <strong>ne se prononce pas</strong>.</p><p className="mt-2 text-sm">La première lettre du mot <strong>porte une Chadda et est renforcée</strong>.</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Choisissez la bonne prononciation</h2>{[['الشَّمْس','al-shams','ash-shams'],['النَّجْم','al-najm','an-najm']].map(([word,wrong,right]) => <div key={word} className="mb-3 rounded-2xl bg-secondary/60 p-3 text-center"><p dir="rtl" className="font-arabic text-2xl">{word}</p><div className="mt-2 flex justify-center gap-4 text-sm"><span className="text-red-600">✕ {wrong}</span><span className="text-emerald-600">✓ {right}</span></div></div>)}</section>
        </> : page === 2 ? <>
          <section className="rounded-3xl border border-border bg-card p-5 text-center"><div className="text-5xl">🌙</div><h2 className="gold-text mt-2 text-xl font-bold">Les lettres lunaires</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Avec une lettre lunaire, il n’y a pas d’assimilation du <span dir="rtl" className="font-arabic">ل</span>. Le ل de <span dir="rtl" className="font-arabic text-lg">الـ</span> se prononce normalement et la première lettre du mot n’est pas doublée à cause de l’article.</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Les 14 lettres lunaires</h2><LetterFamilyGrid letters={lunarLetters}/><p dir="rtl" className="font-arabic mt-4 text-center text-xl">ا ب ج ح خ ع غ ف ق ك م هـ و ي</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Comment cela fonctionne ?</h2><div dir="ltr" className="space-y-3 text-center"><div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl">قَمَر</p><p className="text-sm">qamar → lune</p></div><div>+ article الـ ↓</div><div className="rounded-2xl bg-primary/10 p-3"><p dir="rtl" className="font-arabic text-3xl font-bold">الْقَمَر</p><p className="gold-text font-bold">al-qamar → la lune</p></div></div><div className="mt-4 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700"><p className="text-xl">✕</p><p className="font-semibold">aq-qamar</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700"><p className="text-xl">✓</p><p className="font-semibold">al-qamar</p></div></div><p className="mt-3 text-sm leading-6 text-muted-foreground">Pourquoi ? Parce que ق est lunaire : on entend clairement « al » et le ق ne reçoit pas de Chadda à cause de l’article.</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Autres exemples</h2>{[['الْبَيْت','al-bayt','la maison'],['الْكِتَاب','al-kitāb','le livre'],['الْمَسْجِد','al-masjid','la mosquée'],['الْجَمَل','al-jamal','le chameau']].map(([word,reading,meaning]) => <div key={word} className="mb-2 grid grid-cols-[1fr_auto] items-center rounded-xl bg-secondary/60 p-3"><div><p className="gold-text font-semibold">{reading}</p><p className="text-xs text-muted-foreground">{meaning}</p></div><p dir="rtl" className="font-arabic text-2xl font-bold">{word}</p></div>)}</section>
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5"><h2 className="gold-text mb-2 font-bold">Règle à retenir 🌙</h2><p className="text-sm">Le ل de الـ <strong>se prononce</strong>.</p><p className="mt-2 text-sm">La première lettre du mot <strong>n’est pas doublée à cause de l’article</strong>.</p></section>
        </> : <>
          <section className="rounded-3xl border border-border bg-card p-5 text-center"><div className="text-5xl">☀️ 🌙</div><h2 className="gold-text mt-2 text-xl font-bold">Résumé des lettres solaires et lunaires</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">La prononciation du <span dir="rtl" className="font-arabic text-lg text-foreground">ل</span> de l’article défini <span dir="rtl" className="font-arabic text-lg text-foreground">الـ</span> dépend de la première lettre du mot. Ce résumé permet de comparer les deux règles.</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Pourquoi « solaire » et « lunaire » ?</h2><div className="grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-secondary/60 p-3"><div className="text-3xl">☀️</div><p dir="rtl" className="font-arabic mt-2 text-xl">الشَّمْس</p><p className="text-xs">ash-shams : le ل ne s’entend pas</p></div><div className="rounded-2xl bg-secondary/60 p-3"><div className="text-3xl">🌙</div><p dir="rtl" className="font-arabic mt-2 text-xl">الْقَمَر</p><p className="text-xs">al-qamar : le ل s’entend</p></div></div></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Tableau récapitulatif</h2><div className="overflow-hidden rounded-2xl border border-border text-sm"><div className="grid grid-cols-3 bg-secondary p-2 font-semibold"><span>Règle</span><span className="text-center">☀️ Solaire</span><span className="text-center">🌙 Lunaire</span></div>{[['Le ل','Ne se prononce pas','Se prononce'],['Chadda','Sur la lettre solaire','Pas à cause de الـ'],['Exemple','الشَّمْس','الْقَمَر'],['Lecture','ash-shams','al-qamar']].map((row) => <div key={row[0]} className="grid grid-cols-3 border-t border-border p-2"><span>{row[0]}</span><span dir={row[0]==='Exemple'?'rtl':'ltr'} className="text-center">{row[1]}</span><span dir={row[0]==='Exemple'?'rtl':'ltr'} className="text-center">{row[2]}</span></div>)}</div></section>
          <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5"><h2 className="gold-text mb-3 font-bold">Les 28 lettres sont toutes classées</h2><p className="text-sm leading-6">Il n’existe pas de troisième catégorie : les 28 lettres arabes sont réparties en <strong>14 lettres solaires</strong> et <strong>14 lettres lunaires</strong>.</p><div className="mt-4 space-y-3 text-center"><div className="rounded-2xl bg-amber-50 p-3"><p className="font-semibold">☀️ 14 lettres solaires</p><p dir="rtl" className="font-arabic mt-2 text-xl">ت ث د ذ ر ز س ش ص ض ط ظ ل ن</p></div><div className="rounded-2xl bg-slate-100 p-3"><p className="font-semibold">🌙 14 lettres lunaires</p><p dir="rtl" className="font-arabic mt-2 text-xl">ا ب ج ح خ ع غ ف ق ك م هـ و ي</p></div></div><p className="mt-4 text-center font-bold">14 + 14 = 28 lettres</p></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Le lien avec la Chadda</h2><p className="text-sm leading-6 text-muted-foreground">Après <span dir="rtl" className="font-arabic text-lg text-foreground">الـ</span>, une lettre solaire reçoit une Chadda : le <span dir="rtl" className="font-arabic text-foreground">ل</span> ne se prononce pas et la consonne suivante est renforcée. Avec une lettre lunaire, le <span dir="rtl" className="font-arabic text-foreground">ل</span> se prononce et aucune Chadda n’est ajoutée à cause de l’article.</p><div className="mt-4 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-amber-50 p-3"><p dir="rtl" className="font-arabic text-2xl">الشَّمْس</p><p className="mt-1 text-sm font-semibold">ash-shams</p><p className="text-xs text-muted-foreground">شّ est renforcé</p></div><div className="rounded-2xl bg-slate-100 p-3"><p dir="rtl" className="font-arabic text-2xl">الْقَمَر</p><p className="mt-1 text-sm font-semibold">al-qamar</p><p className="text-xs text-muted-foreground">le ل s’entend</p></div></div></section>
          <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">Solaire ☀️ ou lunaire 🌙 ?</h2><p className="mb-3 text-sm text-muted-foreground">Classez mentalement les mots, puis vérifiez :</p><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-amber-50 p-3 text-center"><p className="mb-2">☀️</p><p dir="rtl" className="font-arabic text-xl">الشَّمْس<br/>النَّجْم<br/>الرَّجُل</p></div><div className="rounded-2xl bg-slate-100 p-3 text-center"><p className="mb-2">🌙</p><p dir="rtl" className="font-arabic text-xl">الْبَيْت<br/>الْكِتَاب<br/>الْقَمَر</p></div></div></section>
        </>}

        <div className="grid grid-cols-2 gap-3">
          {page > 0 ? <button type="button" onClick={() => setPage(page - 1)} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 font-semibold"><ChevronLeft className="h-4 w-4"/>Précédent</button> : <div/>}
          {page < 3 ? <button type="button" onClick={() => setPage(page + 1)} className="gold-gradient flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-primary-foreground">Suivant<ChevronRight className="h-4 w-4"/></button> : <CompletionButton topicId="shadda" onBack={onBack}/>} 
        </div>
      </div>
    </div>
  )
}

function ChaddaViewDraft({ onBack }: { onBack: () => void }) {
  const { lang } = useI18n()
  const [page, setPage] = useState(0)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    document.querySelector<HTMLElement>('[data-app-scroll]')?.scrollTo({ top: 0, behavior: 'auto' })
  }, [page])
  const fr = lang === 'fr'
  const ar = lang === 'ar'
  const copy = ar
    ? {
        title: 'الشَّدَّةُ',
        intro: 'الشدة علامة صغيرة توضع فوق الحرف، وتدل على أن الحرف يُنطق مشدداً، وكأنه حرفان متماثلان أُدغما في حرف واحد.',
        ruleTitle: 'القاعدة الأساسية',
        rule: 'الحرف الأول ساكن، والحرف الثاني متحرك. عند الكتابة يندمجان وتوضع الشدة فوق الحرف.',
        pronounceTitle: 'كيف ننطقها؟',
        pronounce: 'نصل إلى مخرج الحرف، نحبس الصوت لحظة قصيرة، ثم ننطق الحرف مرة ثانية مع حركته. لا نضيف حركة بين الحرفين.',
        vowelsTitle: 'مع الحركات القصيرة',
        errorsTitle: 'انتبه',
        errors: 'لا نمد الحركة، ولا نفصل الحرفين بمقطع زائد، ولا نهمل التشديد؛ لأن الشدة قد تغيّر معنى الكلمة.',
        complete: 'إنهاء الدرس',
      }
    : fr
      ? {
          title: 'La Chadda — الشَّدَّةُ',
          intro: 'La Chadda est un petit signe placé au-dessus d’une consonne. Elle indique que cette consonne doit être renforcée, comme si deux lettres identiques avaient été réunies en une seule à l’écriture.',
          ruleTitle: 'La règle fondamentale',
          rule: 'Une lettre avec Chadda représente deux consonnes identiques : la première porte un Soukoun et la seconde porte une voyelle. Elles fusionnent à l’écrit et la Chadda signale ce doublement.',
          pronounceTitle: 'Comment la prononcer ?',
          pronounce: 'On atteint le point d’articulation de la consonne, on retient le son pendant un très court instant, puis on libère la même consonne avec sa voyelle. On ne place aucune voyelle entre les deux consonnes.',
          vowelsTitle: 'Avec les voyelles courtes',
          errorsTitle: 'À ne pas confondre',
          errors: 'La Chadda renforce la consonne : elle n’allonge pas la voyelle. Il ne faut ni séparer les deux consonnes par un son supplémentaire, ni oublier le doublement, car cela peut changer le sens du mot.',
          complete: 'Terminer la leçon',
        }
      : {
          title: 'The Chadda — الشَّدَّةُ',
          intro: 'The Chadda is a small sign written above a consonant. It means that the consonant is doubled or strengthened, as though two identical letters were combined in writing.',
          ruleTitle: 'The basic rule',
          rule: 'A letter with Chadda represents two identical consonants: the first has a Sukun and the second has a vowel. They merge in writing and the Chadda marks the doubling.',
          pronounceTitle: 'How is it pronounced?',
          pronounce: 'Reach the consonant’s articulation point, hold it very briefly, then release the same consonant with its vowel. Do not insert a vowel between the two consonants.',
          vowelsTitle: 'With short vowels',
          errorsTitle: 'Do not confuse them',
          errors: 'The Chadda strengthens the consonant; it does not lengthen the vowel. Do not separate the doubled consonant with an extra sound or omit the doubling.',
          complete: 'Complete lesson',
        }

  const examples = [
    { joined: 'بَّ', split: 'بْ + بَ', sound: 'bba' },
    { joined: 'بِّ', split: 'بْ + بِ', sound: 'bbi' },
    { joined: 'بُّ', split: 'بْ + بُ', sound: 'bbou' },
  ]

  const solarLetters = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن']
  const lunarLetters = ['ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'ه', 'و', 'ي']
  const nav = ar
    ? { previous: 'السابق', next: 'التالي', finish: 'إنهاء الدرس' }
    : fr
      ? { previous: 'Précédent', next: 'Suivant', finish: 'Terminer la leçon' }
      : { previous: 'Previous', next: 'Next', finish: 'Complete lesson' }

  const go = (nextPage: number) => setPage(nextPage)

  return (
    <div>
      <BackBar
        title={page === 0 ? copy.title : page === 1 ? (ar ? 'الحروف الشمسية' : fr ? 'Les lettres solaires' : 'Solar letters') : (ar ? 'الحروف القمرية' : fr ? 'Les lettres lunaires' : 'Lunar letters')}
        onBack={onBack}
      />
      <div className="flex flex-col gap-4 p-5">
        {page === 0 ? (
          <>
            <section className="rounded-3xl border border-border bg-card p-5 text-center">
              <div dir="rtl" className="font-arabic mb-3 text-7xl font-bold leading-none text-foreground">بّ</div>
              <p className="text-sm leading-6 text-muted-foreground">{copy.intro}</p>
            </section>
            <section className="rounded-3xl border border-border bg-card p-5">
              <h2 className="gold-text mb-2 text-base font-bold">{copy.ruleTitle}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{copy.rule}</p>
              <div dir="rtl" className="font-arabic mt-4 rounded-2xl bg-secondary/60 p-4 text-center text-3xl font-bold text-foreground">بْ + بَ = بَّ</div>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 text-center text-xs text-muted-foreground">
                <span>{fr ? '1. consonne sans voyelle' : ar ? '١. حرف ساكن' : '1. unvowelled consonant'}</span><span>+</span>
                <span>{fr ? '2. même consonne voyellée' : ar ? '٢. الحرف نفسه متحرك' : '2. same vowelled consonant'}</span><span>=</span>
                <span>{fr ? 'lettre renforcée' : ar ? 'حرف مشدد' : 'strengthened letter'}</span>
              </div>
            </section>
            <section className="rounded-3xl border border-border bg-card p-5">
              <h2 className="gold-text mb-2 text-base font-bold">{copy.pronounceTitle}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{copy.pronounce}</p>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>1. {fr ? 'Placez la bouche ou la langue au point d’articulation de la lettre.' : ar ? 'نصل إلى مخرج الحرف.' : 'Reach the letter’s articulation point.'}</li>
                <li>2. {fr ? 'Retenez brièvement le passage de l’air : c’est la première consonne avec Soukoun.' : ar ? 'نحبس الصوت لحظة قصيرة، وهذا هو الحرف الساكن الأول.' : 'Hold briefly: this is the first consonant with Sukun.'}</li>
                <li>3. {fr ? 'Relâchez la même consonne avec sa voyelle : a, i ou ou.' : ar ? 'ثم ننطق الحرف الثاني مع حركته.' : 'Release the same consonant with its vowel.'}</li>
              </ol>
            </section>
            <section className="rounded-3xl border border-border bg-card p-5">
              <h2 className="gold-text mb-4 text-base font-bold">{copy.vowelsTitle}</h2>
              <div className="grid grid-cols-3 gap-2">
                {examples.map((example) => (
                  <div key={example.sound} className="rounded-2xl bg-secondary/60 p-3 text-center">
                    <div dir="rtl" className="font-arabic text-4xl font-bold text-foreground">{example.joined}</div>
                    <div dir="rtl" className="font-arabic mt-2 text-sm text-muted-foreground">{example.split}</div>
                    <div dir="ltr" className="gold-text mt-1 text-sm font-bold">{example.sound}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 rounded-2xl bg-secondary/60 p-4 text-center">
                <p dir="rtl" className="font-arabic text-3xl font-bold">جَنَّةٌ</p><p className="text-sm text-muted-foreground">janna — {fr ? 'le ن est retenu puis répété' : ar ? 'النون مشددة' : 'the n is held and repeated'}</p>
                <p dir="rtl" className="font-arabic pt-2 text-3xl font-bold">مُعَلِّمٌ</p><p className="text-sm text-muted-foreground">mouʿallim — {fr ? 'le ل est doublé' : ar ? 'اللام مشددة' : 'the l is doubled'}</p>
              </div>
            </section>
            <section className="rounded-3xl border border-border bg-card p-5">
              <h2 className="gold-text mb-2 text-base font-bold">{copy.errorsTitle}</h2>
              <p className="text-sm leading-6 text-muted-foreground">{copy.errors}</p>
            </section>
          </>
        ) : page === 1 ? (
          <SolarLettersLesson lang={lang} letters={solarLetters} />
        ) : (
          <LunarLettersLesson lang={lang} letters={lunarLetters} />
        )}

        <div className="grid grid-cols-2 gap-3">
          {page > 0 ? (
            <button type="button" onClick={() => go(page - 1)} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 font-semibold">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />{nav.previous}
            </button>
          ) : <div />}
          {page < 2 ? (
            <button type="button" onClick={() => go(page + 1)} className="gold-gradient flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-primary-foreground">
              {nav.next}<ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          ) : (
            <CompletionButton topicId="shadda" onBack={onBack} />
          )}
        </div>
      </div>
    </div>
  )
}

function LetterFamilyGrid({ letters }: { letters: string[] }) {
  return <div dir="rtl" className="grid grid-cols-7 gap-2">{letters.map((letter) => <span key={letter} className="font-arabic flex aspect-square items-center justify-center rounded-xl border border-border bg-secondary/60 text-2xl font-bold">{letter}</span>)}</div>
}

function SolarLettersLesson({ lang, letters }: { lang: Lang; letters: string[] }) {
  const fr = lang === 'fr'; const ar = lang === 'ar'
  return <>
    <section className="rounded-3xl border border-border bg-card p-5 text-center"><div className="mb-2 text-5xl">☀️</div><h2 className="gold-text text-xl font-bold">{ar ? 'الحروف الشمسية' : fr ? 'Les lettres solaires' : 'Solar letters'}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{ar ? 'هي حروف لا ننطق معها لام التعريف. تندمج اللام في الحرف الشمسي التالي، ويصبح هذا الحرف مشدداً.' : fr ? 'Ce sont les lettres devant lesquelles le ل de l’article ال ne se prononce pas. Le ل s’assimile à la lettre solaire suivante, qui se prononce alors avec une Chadda.' : 'With solar letters, the ل of ال is not pronounced. It assimilates into the following solar letter, which is doubled with a Chadda.'}</p></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-2 font-bold">{fr ? 'Pourquoi les appelle-t-on « solaires » ?' : ar ? 'لماذا سُمّيت شمسية؟' : 'Why are they called “solar”?'}</h2><p className="text-sm leading-6 text-muted-foreground">{fr ? 'Le mot الشَّمْسُ (« le soleil ») commence par ش, une lettre de ce groupe. Dans ce mot, le ل de ال est écrit mais ne s’entend pas : on entend ash-shams. Le nom « solaire » sert donc de moyen pour retenir cette famille de lettres.' : ar ? 'سُمّيت بهذا الاسم نسبةً إلى كلمة الشَّمْسُ. نكتب لام التعريف، لكننا لا ننطقها، ونشدّد الشين: أَشْ شَمْس.' : 'The name comes from الشَّمْسُ, “the sun”. The ل is written but not heard, and ش is doubled: ash-shams.'}</p></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{ar ? 'الحروف الأربعة عشر' : fr ? 'Les 14 lettres solaires' : 'The 14 solar letters'}</h2><LetterFamilyGrid letters={letters} /><p dir="rtl" className="font-arabic mt-4 text-center text-lg">ت ث د ذ ر ز س ش ص ض ط ظ ل ن</p></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{ar ? 'مخطط النطق' : fr ? 'Schéma de fonctionnement' : 'How it works'}</h2><div className="space-y-3 text-center"><div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl">ال + شَمْسُ</p><p className="mt-1 text-xs text-muted-foreground">{fr ? 'Le ل rencontre une lettre solaire : ش' : ar ? 'تأتي اللام قبل حرف شمسي: ش' : 'ل meets the solar letter ش'}</p></div><div className="text-2xl">↓</div><div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl font-bold">الشَّمْسُ</p><p className="gold-text mt-1 font-bold">ash-shams — {fr ? 'et non « al-shams »' : ar ? 'ولا نقول: أل شمس' : 'not “al-shams”'}</p></div></div></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{fr ? 'Étapes de lecture' : ar ? 'خطوات القراءة' : 'Reading steps'}</h2><ol className="space-y-2 text-sm leading-6 text-muted-foreground"><li>1. {fr ? 'Repérez l’article ال au début du mot.' : ar ? 'نحدد أل التعريف.' : 'Identify ال.'}</li><li>2. {fr ? 'Regardez si la lettre suivante appartient à la liste solaire.' : ar ? 'ننظر إلى الحرف التالي: هل هو شمسي؟' : 'Check whether the next letter is solar.'}</li><li>3. {fr ? 'Ne prononcez pas le ل.' : ar ? 'لا ننطق اللام.' : 'Do not pronounce ل.'}</li><li>4. {fr ? 'Doublez la lettre solaire grâce à la Chadda.' : ar ? 'نشدد الحرف الشمسي.' : 'Double the solar letter with Chadda.'}</li></ol></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{fr ? 'Exemples' : ar ? 'أمثلة' : 'Examples'}</h2><div className="space-y-3">{[['النُّورُ','an-nour'],['الرَّجُلُ','ar-rajoul'],['السَّلَامُ','as-salām'],['الدِّينُ','ad-dīn']].map(([word,sound]) => <div key={word} className="flex items-center justify-between rounded-2xl bg-secondary/60 p-3"><span className="gold-text font-semibold">{sound}</span><span dir="rtl" className="font-arabic text-2xl font-bold">{word}</span></div>)}</div></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{fr ? 'Lire dans des phrases' : ar ? 'القراءة في جمل' : 'Reading in sentences'}</h2><p className="mb-4 text-sm leading-6 text-muted-foreground">{fr ? 'Dans chaque phrase, observez la Chadda sur la première lettre du nom défini. Elle rappelle que cette lettre est renforcée et que le ل ne se prononce pas.' : ar ? 'لاحظ الشدة على أول حرف من الاسم المعرّف. ننطق الحرف الشمسي مشدداً ولا ننطق اللام.' : 'Notice the Chadda on the first letter of the definite noun. It is doubled, while ل is silent.'}</p><div className="space-y-3">{[
      ['الشَّمْسُ سَاطِعَةٌ.', 'ash-shamsou sāṭiʿatoun', 'Le soleil est brillant.'],
      ['ذَهَبَ الرَّجُلُ إِلَى السُّوقِ.', 'dhahaba ar-rajoulou ilā as-souqi', 'L’homme est allé au marché.'],
      ['النُّورُ جَمِيلٌ.', 'an-nourou jamīloun', 'La lumière est belle.'],
    ].map(([sentence, reading, meaning]) => <article key={sentence} className="rounded-2xl bg-secondary/60 p-4 text-center"><p dir="rtl" className="font-arabic text-2xl font-bold leading-loose">{sentence}</p><p dir="ltr" className="gold-text text-sm font-semibold">{reading}</p><p className="mt-1 text-xs text-muted-foreground">{fr ? meaning : ''}</p></article>)}</div></section>
    <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5"><h2 className="gold-text mb-2 font-bold">{fr ? 'Ce qu’il faut entendre' : ar ? 'ما يجب سماعه' : 'What you should hear'}</h2><p className="text-sm leading-6 text-muted-foreground">{fr ? 'Écriture : ال + lettre solaire. Prononciation : a + lettre solaire doublée. Exemple : ال + نُور devient النُّور et se lit an-nour. Le ل ne disparaît pas de l’écriture ; il disparaît uniquement de la prononciation.' : ar ? 'نكتب اللام، لكنها لا تُنطق. تندمج في الحرف الشمسي الذي يليها ويُنطق مشدداً.' : 'The ل remains in writing but disappears in speech; the solar consonant that follows is doubled.'}</p></section>
  </>
}

function LunarLettersLesson({ lang, letters }: { lang: Lang; letters: string[] }) {
  const fr = lang === 'fr'; const ar = lang === 'ar'
  return <>
    <section className="rounded-3xl border border-border bg-card p-5 text-center"><div className="mb-2 text-5xl">🌙</div><h2 className="gold-text text-xl font-bold">{ar ? 'الحروف القمرية' : fr ? 'Les lettres lunaires' : 'Lunar letters'}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{ar ? 'هي حروف ننطق معها لام التعريف نطقاً واضحاً. تبقى اللام ساكنة، ولا يُشدّد الحرف القمري بسبب أل التعريف.' : fr ? 'Ce sont les lettres devant lesquelles le ل de l’article ال reste clairement prononcé. Le ل conserve son Soukoun et la lettre lunaire suivante n’est pas doublée à cause de l’article.' : 'With lunar letters, the ل of ال remains clearly pronounced with Sukun. The following lunar letter is not doubled because of the article.'}</p></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-2 font-bold">{fr ? 'Pourquoi les appelle-t-on « lunaires » ?' : ar ? 'لماذا سُمّيت قمرية؟' : 'Why are they called “lunar”?'}</h2><p className="text-sm leading-6 text-muted-foreground">{fr ? 'Le mot الْقَمَرُ (« la lune ») commence par ق, une lettre de ce groupe. Dans ce mot, le ل de ال est écrit et clairement prononcé : al-qamar. Le mot « lune » donne ainsi son nom à cette famille.' : ar ? 'سُمّيت نسبةً إلى كلمة الْقَمَرُ. نكتب اللام وننطقها بوضوح: أَلْ قَمَر.' : 'The name comes from الْقَمَرُ, “the moon”. The ل is both written and clearly pronounced: al-qamar.'}</p></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{ar ? 'الحروف الأربعة عشر' : fr ? 'Les 14 lettres lunaires' : 'The 14 lunar letters'}</h2><LetterFamilyGrid letters={letters} /><p dir="rtl" className="font-arabic mt-4 text-center text-lg">ا ب ج ح خ ع غ ف ق ك م ه و ي</p></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{ar ? 'مخطط النطق' : fr ? 'Schéma de fonctionnement' : 'How it works'}</h2><div className="space-y-3 text-center"><div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl">ال + قَمَرُ</p><p className="mt-1 text-xs text-muted-foreground">{fr ? 'Le ل rencontre une lettre lunaire : ق' : ar ? 'تأتي اللام قبل حرف قمري: ق' : 'ل meets the lunar letter ق'}</p></div><div className="text-2xl">↓</div><div className="rounded-2xl bg-secondary/60 p-3"><p dir="rtl" className="font-arabic text-3xl font-bold">الْقَمَرُ</p><p className="gold-text mt-1 font-bold">al-qamar — {fr ? 'le « l » est bien entendu' : ar ? 'ننطق اللام بوضوح' : 'the “l” is heard clearly'}</p></div></div></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{fr ? 'Étapes de lecture' : ar ? 'خطوات القراءة' : 'Reading steps'}</h2><ol className="space-y-2 text-sm leading-6 text-muted-foreground"><li>1. {fr ? 'Repérez l’article ال.' : ar ? 'نحدد أل التعريف.' : 'Identify ال.'}</li><li>2. {fr ? 'Vérifiez que la lettre suivante appartient à la liste lunaire.' : ar ? 'نتأكد أن الحرف التالي قمري.' : 'Check that the next letter is lunar.'}</li><li>3. {fr ? 'Prononcez clairement le son « al ».' : ar ? 'ننطق اللام الساكنة بوضوح.' : 'Pronounce “al” clearly.'}</li><li>4. {fr ? 'Prononcez ensuite la lettre lunaire normalement, sans lui ajouter de Chadda.' : ar ? 'ثم ننطق الحرف القمري دون شدة بسبب أل.' : 'Then pronounce the lunar letter normally, without adding Chadda.'}</li></ol></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{fr ? 'Exemples' : ar ? 'أمثلة' : 'Examples'}</h2><div className="space-y-3">{[['الْقَمَرُ','al-qamar'],['الْبَيْتُ','al-bayt'],['الْكِتَابُ','al-kitāb'],['الْوَلَدُ','al-walad']].map(([word,sound]) => <div key={word} className="flex items-center justify-between rounded-2xl bg-secondary/60 p-3"><span className="gold-text font-semibold">{sound}</span><span dir="rtl" className="font-arabic text-2xl font-bold">{word}</span></div>)}</div></section>
    <section className="rounded-3xl border border-border bg-card p-5"><h2 className="gold-text mb-3 font-bold">{fr ? 'Lire dans des phrases' : ar ? 'القراءة في جمل' : 'Reading in sentences'}</h2><p className="mb-4 text-sm leading-6 text-muted-foreground">{fr ? 'Dans chaque exemple, prononcez distinctement « al » avant la lettre lunaire. Le Soukoun sur le ل montre que l’on s’arrête brièvement sur ce son avant de poursuivre.' : ar ? 'ننطق « ألْ » بوضوح قبل الحرف القمري، ثم نتابع قراءة الكلمة دون تشديد الحرف التالي.' : 'Pronounce “al” clearly before the lunar letter, then continue without doubling the next consonant.'}</p><div className="space-y-3">{[
      ['الْقَمَرُ جَمِيلٌ.', 'al-qamarou jamīloun', 'La lune est belle.'],
      ['الْوَلَدُ فِي الْبَيْتِ.', 'al-waladou fī al-bayti', 'Le garçon est dans la maison.'],
      ['قَرَأَ الطِّفْلُ الْكِتَابَ.', 'qara’a aṭ-ṭiflou al-kitāba', 'L’enfant a lu le livre.'],
    ].map(([sentence, reading, meaning]) => <article key={sentence} className="rounded-2xl bg-secondary/60 p-4 text-center"><p dir="rtl" className="font-arabic text-2xl font-bold leading-loose">{sentence}</p><p dir="ltr" className="gold-text text-sm font-semibold">{reading}</p><p className="mt-1 text-xs text-muted-foreground">{fr ? meaning : ''}</p></article>)}</div></section>
    <section className="rounded-3xl border border-primary/20 bg-primary/5 p-5"><h2 className="gold-text mb-2 font-bold">{fr ? 'La différence à retenir' : ar ? 'الفرق الذي نتذكره' : 'Key difference'}</h2><div className="grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-card p-3"><div className="text-2xl">☀️</div><p className="mt-1 text-xs">{fr ? 'Solaire : le ل disparaît à l’oral et la lettre suivante est renforcée.' : ar ? 'شمسي: لا ننطق اللام ونشدد الحرف التالي.' : 'Solar: ل is silent; next letter doubles.'}</p></div><div className="rounded-2xl bg-card p-3"><div className="text-2xl">🌙</div><p className="mt-1 text-xs">{fr ? 'Lunaire : le ل se prononce et la lettre suivante reste normale.' : ar ? 'قمري: ننطق اللام والحرف التالي دون تشديد.' : 'Lunar: ل is pronounced; next letter stays normal.'}</p></div></div></section>
  </>
}

function ReadingView({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n()
  const { updateTopicProgress } = useProgress()
  const [index, setIndex] = useState(0)
  const word = READING_WORDS[index]
  const correctMeaning = localized(word.meaning, lang)
  const illustration = vocabularyVisualClue('daily', word)

  const next = () => {
    const learnedCount = index + 1
    updateTopicProgress('reading', Math.round((learnedCount / READING_WORDS.length) * 100))
    if (index + 1 >= READING_WORDS.length) {
      onBack()
      return
    }
    const nextIndex = index + 1
    setIndex(nextIndex)
  }

  return (
    <div>
      <BackBar title={t('learn.reading')} onBack={onBack} />
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>{t('learn.dailyWords')}</span>
          <span>{index + 1} / {READING_WORDS.length}</span>
        </div>
        <ProgressBar value={(index / READING_WORDS.length) * 100} />

        <article className="relief-panel mt-6 overflow-hidden rounded-3xl border border-border p-6 text-center">
          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-3xl border border-primary/20 bg-card text-7xl shadow-sm" role="img" aria-label={correctMeaning}>
            {illustration}
          </div>
          <p className="gold-text font-arabic text-6xl leading-tight">{word.word}</p>
          <p className="mt-2 text-sm text-muted-foreground">{word.translit}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{correctMeaning}</p>
          <div className="mt-5 flex justify-center">
            <ListenButton text={word.word} label={t('learn.listen')} size="sm" />
          </div>
        </article>

        <section className="mt-6 rounded-3xl border border-border bg-card p-5 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {lang === 'en' ? 'Listen and repeat this word. It will then appear in your exercises for long-term memorization.' : lang === 'ar' ? 'استمع إلى هذه الكلمة وكرّرها. ستظهر بعد ذلك في تمارينك لتثبيتها.' : 'Écoutez et répétez ce mot. Il apparaîtra ensuite dans vos exercices pour bien le mémoriser.'}
          </p>
          <button type="button" onClick={next} className="gold-gradient mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-primary-foreground">
            {index + 1 === READING_WORDS.length ? (lang === 'en' ? 'Finish' : lang === 'ar' ? 'إنهاء' : 'Terminer') : (lang === 'en' ? 'I learned it · Next' : lang === 'ar' ? 'تعلّمتها · التالي' : 'J’ai appris · Mot suivant')}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </section>
      </div>
    </div>
  )
}

type PracticeMode = 'listen' | 'write' | 'memorize' | 'review'

function stripArabicMarks(value: string) {
  return value.replace(/[\u064B-\u065F\u0670\u0640]/g, '')
}

function arabicClusters(value: string) {
  const clusters: string[] = []
  for (const char of Array.from(value)) {
    if (/[\u064B-\u065F\u0670]/.test(char) && clusters.length) clusters[clusters.length - 1] += char
    else clusters.push(char)
  }
  return clusters
}

type ContextualPosition = 'isolated' | 'initial' | 'medial' | 'final'
export type WritingPiece = { id: string; base: string; display: string; position: ContextualPosition }
const NON_JOINING_FORWARD = new Set(['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ء', 'ة', 'ى'])

function clusterBase(cluster: string) {
  return stripArabicMarks(cluster).replace(/\s/g, '')
}

function contextualPosition(clusters: string[], index: number): ContextualPosition {
  const current = clusterBase(clusters[index])
  const previous = index > 0 ? clusterBase(clusters[index - 1]) : ''
  const joinsPrevious = index > 0 && !NON_JOINING_FORWARD.has(previous)
  const joinsNext = index < clusters.length - 1 && !NON_JOINING_FORWARD.has(current)
  if (joinsPrevious && joinsNext) return 'medial'
  if (joinsPrevious) return 'final'
  if (joinsNext) return 'initial'
  return 'isolated'
}

function contextualPieceDisplay(cluster: string, position: ContextualPosition) {
  const base = clusterBase(cluster)
  const marks = cluster.replace(base, '')
  const letter = LETTERS.find((item) => item.glyph === base)
  if (!letter) return cluster
  const glyph = position === 'initial' ? letter.initial : position === 'medial' ? letter.medial : position === 'final' ? letter.final : letter.glyph
  return `${glyph}${marks}`
}

function exerciseHash(value: string, seed = 0) {
  return Array.from(value).reduce((hash, character) => Math.imul(hash ^ (character.codePointAt(0) ?? 0), 16777619) >>> 0, (2166136261 ^ seed) >>> 0)
}

export function shuffledVocabularyIndexes(length: number, seed: number) {
  const indexes = Array.from({ length }, (_, index) => index)
  let state = seed || 1
  const next = () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state)
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state)
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296
  }
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const other = Math.floor(next() * (index + 1))
    ;[indexes[index], indexes[other]] = [indexes[other], indexes[index]]
  }
  return indexes
}

export function relevantWordOptions(correct: Word, alternatives: Word[], seed: number, meaningKey?: Lang) {
  const phraseLike = /[\s؟،.!]/u.test(correct.word)
  const sameKind = alternatives.filter((item) => /[\s؟،.!]/u.test(item.word) === phraseLike)
  return variedWordOptions(correct, sameKind.length >= 4 ? sameKind : alternatives, seed, meaningKey)
}

function writingPiecesFor(word: string, variationSeed = 0) {
  const targetClusters = arabicClusters(word).filter((cluster) => clusterBase(cluster))
  const correct: WritingPiece[] = targetClusters.map((base, index) => {
    const position = contextualPosition(targetClusters, index)
    return { id: `correct-${index}`, base, position, display: contextualPieceDisplay(base, position) }
  })
  const wrongForms: WritingPiece[] = correct.slice(0, 2).map((piece, index) => {
    const positions: ContextualPosition[] = ['isolated', 'initial', 'medial', 'final']
    const position = positions.find((candidate) => candidate !== piece.position) ?? 'isolated'
    return { id: `wrong-form-${index}`, base: piece.base, position, display: contextualPieceDisplay(piece.base, position) }
  })
  const similarGroups = ['بتثني', 'جحخ', 'دذ', 'رز', 'سش', 'صض', 'طظ', 'عغ', 'فق', 'كل', 'مه', 'وؤ', 'اأإآ', 'ءئؤ']
  const bases = correct.map((piece) => clusterBase(piece.base))
  const similarLetters = bases.flatMap((base) => Array.from(similarGroups.find((group) => group.includes(base)) ?? '')).filter((glyph) => !bases.includes(glyph))
  const fallbackSimilar = LETTERS.filter((letter) => !bases.includes(letter.glyph)).map((letter) => letter.glyph)
  const distractorGlyphs = [...new Set([...similarLetters, ...fallbackSimilar])]
    .sort((a, b) => exerciseHash(a, variationSeed) - exerciseHash(b, variationSeed))
    .slice(0, 3)
  const seed = Array.from(word).reduce((sum, char) => sum + (char.codePointAt(0) ?? 0), 0)
  const distractors: WritingPiece[] = distractorGlyphs.map((glyph, index) => {
    const letter = LETTERS.find((item) => item.glyph === glyph) ?? LETTERS[(seed + index) % LETTERS.length]
    const positions: ContextualPosition[] = ['isolated', 'initial', 'medial', 'final']
    const position = positions[(seed + index) % positions.length]
    return { id: `distractor-${index}`, base: letter.glyph, position, display: contextualPieceDisplay(letter.glyph, position) }
  })
  const choices = [...correct, ...wrongForms, ...distractors]
    .map((piece) => ({ piece, score: exerciseHash(`${word}-${piece.id}`, variationSeed) }))
    .sort((a, b) => a.score - b.score)
    .map(({ piece }) => piece)
  return { targetClusters, correct, choices }
}

export function isWritingAnswerCorrect(answer: WritingPiece[], target: WritingPiece[]) {
  if (answer.length !== target.length) return false
  return answer.every((piece, index) => clusterBase(piece.base) === clusterBase(target[index].base))
}

function WordPronouncePractice({ word, lang }: { word: string; lang: Lang }) {
  const [status, setStatus] = useState<'idle' | 'listening' | 'done' | 'error'>('idle')
  const [seconds, setSeconds] = useState(8)
  const start = () => {
    if (isNativeSpeechPlatform()) {
      setStatus('listening'); setSeconds(8)
      const nativeCountdown = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
      void listenArabicNative(8000, [word]).then((result) => {
        window.clearInterval(nativeCountdown)
        if (!result.ok) { setStatus('error'); return }
        const expected = stripArabicMarks(word).replace(/\s/g, '')
        const actual = stripArabicMarks(result.heard).replace(/\s/g, '')
        setStatus(actual.includes(expected) ? 'done' : 'error')
      })
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setStatus('error'); return }
    const rec = new SR()
    let heard = ''
    setStatus('listening'); setSeconds(8)
    rec.lang = 'ar-SA'; rec.interimResults = true; rec.continuous = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) heard += ` ${event.results[i][0]?.transcript ?? ''}`
    }
    rec.onerror = () => undefined
    rec.start()
    const countdown = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    window.setTimeout(() => {
      window.clearInterval(countdown)
      try { rec.stop() } catch { /* no-op */ }
      window.setTimeout(() => {
        const expected = stripArabicMarks(word).replace(/\s/g, '')
        const actual = stripArabicMarks(heard).replace(/\s/g, '')
        setStatus(actual.includes(expected) ? 'done' : 'error')
      }, 350)
    }, 8000)
  }
  return <button type="button" onClick={start} disabled={status === 'listening'} className="classic-secondary-control flex h-12 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-semibold">
    <Mic className="h-5 w-5" />
    {status === 'listening' ? `${lang === 'en' ? 'Listening' : lang === 'ar' ? 'استماع' : 'Écoute'} · ${seconds} s` : status === 'done' ? (lang === 'en' ? 'Well pronounced' : lang === 'ar' ? 'نطق صحيح' : 'Bien prononcé') : status === 'error' ? (lang === 'en' ? 'Try again' : lang === 'ar' ? 'حاول مرة أخرى' : 'Réessayer') : (lang === 'en' ? 'Pronounce' : lang === 'ar' ? 'انطق' : 'Prononcer')}
  </button>
}

function WordPractice({ word, illustration, alternatives, onLearned, onMistake, isLast, selectedMode, onBackToModes }: { word: Word; illustration: string; alternatives: Word[]; onLearned: () => void; onMistake?: () => void; isLast: boolean; selectedMode?: PracticeMode; onBackToModes?: () => void }) {
  const { t, lang } = useI18n()
  const [mode, setMode] = useState<PracticeMode | null>(selectedMode ?? null)
  const [assembled, setAssembled] = useState<WritingPiece[]>([])
  const [usedPieces, setUsedPieces] = useState<string[]>([])
  const [memorized, setMemorized] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [puzzleWrong, setPuzzleWrong] = useState(false)
  const [puzzleCorrect, setPuzzleCorrect] = useState(false)
  const [exerciseSeed, setExerciseSeed] = useState(0)
  const [answerValidated, setAnswerValidated] = useState(false)
  const [answerCorrect, setAnswerCorrect] = useState(false)
  const meaning = localized(word.meaning, lang)
  const wordSeed = exerciseHash(word.word, exerciseSeed)
  const writing = writingPiecesFor(word.word, wordSeed)
  const memoryOptions = relevantWordOptions(word, alternatives, wordSeed)
  const reviewOptions = relevantWordOptions(word, alternatives, wordSeed + 3571, lang)

  useEffect(() => {
    setExerciseSeed(Math.floor(Math.random() * 1_000_000) + 1)
  }, [word.word])
  const addPiece = (piece: WritingPiece) => {
    if (assembled.length >= writing.correct.length || puzzleCorrect) return
    setAssembled((current) => [...current, piece])
    setUsedPieces((current) => [...current, piece.id])
    setPuzzleWrong(false)
  }
  const validateWriting = () => {
    // Arabic shaping is contextual: the same base letter can legitimately be
    // rendered by the browser with a different presentation-form code point.
    // Validate the ordered Arabic letters, not fragile internal glyph metadata.
    const correct = isWritingAnswerCorrect(assembled, writing.correct)
    playAnswerSound(correct)
    if (correct) {
      setPuzzleCorrect(true)
      if (selectedMode) window.setTimeout(onLearned, 900)
    } else {
      onMistake?.()
      setPuzzleWrong(true)
      setAssembled([])
      setUsedPieces([])
    }
  }
  const chooseAnswer = (candidate: Word) => {
    if (answerValidated) return
    setSelectedAnswer(candidate.word)
  }
  const validateAnswer = () => {
    if (!selectedAnswer || answerValidated) return
    const correct = selectedAnswer === word.word
    setAnswerValidated(true)
    setAnswerCorrect(correct)
    setMemorized(correct)
    playAnswerSound(correct)
    if (!correct) onMistake?.()
  }

  const modes: { id: PracticeMode; label: string; icon: LucideIcon }[] = [
    { id: 'listen', label: lang === 'en' ? 'Listen & pronounce' : lang === 'ar' ? 'استمع وانطق' : 'Écouter et prononcer', icon: Mic },
    ...(selectedMode ? [] : [{ id: 'write' as const, label: lang === 'en' ? 'Writing' : lang === 'ar' ? 'الكتابة' : 'Écriture', icon: PenLine }]),
    { id: 'memorize', label: lang === 'en' ? 'Memorize' : lang === 'ar' ? 'احفظ' : 'Mémoriser', icon: Brain },
    { id: 'review', label: lang === 'en' ? 'Review' : lang === 'ar' ? 'مراجعة' : 'Révision', icon: RefreshCw },
  ]

  if (!mode) return <div>
    <article className="relief-panel rounded-3xl border border-border p-6 text-center">
      <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-3xl border border-primary/20 bg-card text-7xl" role="img" aria-label={meaning}>{illustration}</div>
      <p className="gold-text font-arabic text-5xl leading-tight">{word.word}</p><p className="mt-2 text-sm text-muted-foreground">{word.translit}</p><p className="mt-1 text-lg font-semibold">{meaning}</p>
    </article>
    <div className="mt-4 flex flex-col gap-2">
      {modes.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setMode(id)} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-start font-semibold active:scale-[0.99]"><Icon className="h-5 w-5 text-primary" />{label}<ChevronRight className="ms-auto h-4 w-4 rtl:rotate-180" /></button>)}
    </div>
    <button type="button" disabled={!memorized} onClick={onLearned} className="gold-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-primary-foreground disabled:opacity-40">
      {isLast ? (lang === 'en' ? 'Finish category' : lang === 'ar' ? 'إنهاء الفئة' : 'Terminer la catégorie') : (lang === 'en' ? 'Next word' : lang === 'ar' ? 'الكلمة التالية' : 'Mot suivant')}<ChevronRight className="h-4 w-4 rtl:rotate-180" />
    </button>
  </div>

  return <div>
    <button type="button" onClick={() => selectedMode ? onBackToModes?.() : setMode(null)} className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary"><ChevronLeft className="h-4 w-4 rtl:rotate-180" />{lang === 'en' ? 'Activities' : lang === 'ar' ? 'الأنشطة' : 'Retour aux activités'}</button>

    {mode === 'listen' && <article className="relief-panel mt-4 rounded-3xl border border-border p-6 text-center">
      <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-3xl border border-primary/20 bg-card text-7xl" role="img" aria-label={meaning}>{illustration}</div>
      <p className="gold-text font-arabic text-5xl leading-tight">{word.word}</p><p className="mt-2 text-sm text-muted-foreground">{word.translit}</p><p className="mt-1 text-lg font-semibold">{meaning}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3"><ListenButton text={word.word} label={t('learn.listen')} size="sm" /><WordPronouncePractice word={word.word} lang={lang} /></div>
    </article>}

    {mode === 'write' && <section className="mt-4 rounded-3xl border border-border bg-card p-5 text-center">
      <div className="text-7xl" role="img" aria-label={meaning}>{illustration}</div>
      <p className="text-sm font-semibold">{lang === 'en' ? 'Rebuild the Arabic word' : lang === 'ar' ? 'أعِد بناء الكلمة' : 'Reconstituez le mot arabe'}</p>
      <div dir="rtl" className="mt-4 flex min-h-16 items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3"><span className="font-arabic text-4xl leading-none">{assembled.map((piece) => piece.base).join('')}</span></div>
      <div dir="rtl" className="mt-4 flex flex-wrap justify-center gap-2">{writing.choices.map((piece) => <button type="button" key={piece.id} disabled={usedPieces.includes(piece.id) || puzzleCorrect} onClick={() => addPiece(piece)} className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-border bg-background px-3 font-arabic text-3xl disabled:opacity-25">{piece.display}</button>)}</div>
      <div className="mt-4 flex gap-2"><button type="button" onClick={() => { setAssembled([]); setUsedPieces([]); setPuzzleWrong(false) }} disabled={!assembled.length || puzzleCorrect} className="flex-1 rounded-2xl border border-border py-3 font-semibold disabled:opacity-40">{lang === 'en' ? 'Clear' : lang === 'ar' ? 'مسح' : 'Effacer'}</button><button type="button" onClick={validateWriting} disabled={assembled.length !== writing.correct.length || puzzleCorrect} className="gold-gradient flex-1 rounded-2xl py-3 font-semibold text-primary-foreground disabled:opacity-40">{lang === 'en' ? 'Check' : lang === 'ar' ? 'تحقق' : 'Valider'}</button></div>
      {puzzleWrong && <div className="mt-3 rounded-2xl bg-destructive/10 p-3 text-destructive"><p className="flex items-center justify-center gap-2 text-sm font-semibold"><X className="h-4 w-4" />{lang === 'en' ? 'Incorrect answer.' : lang === 'ar' ? 'إجابة غير صحيحة.' : 'Mauvaise réponse.'}</p><p className="mt-2 text-xs">{lang === 'en' ? 'Correct spelling:' : lang === 'ar' ? 'الكتابة الصحيحة:' : 'Écriture correcte :'}</p><p dir="rtl" className="mt-1 font-arabic text-3xl text-foreground">{word.word}</p></div>}
      {puzzleCorrect && <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-5 w-5" />{lang === 'en' ? 'Correct answer!' : lang === 'ar' ? 'إجابة صحيحة!' : 'Bonne réponse !'}</p>}
    </section>}

    {mode === 'memorize' && <section className="mt-4 rounded-3xl border border-border bg-card p-5 text-center">
      <div className="text-7xl" role="img" aria-label={lang === 'fr' ? 'Indice visuel' : lang === 'ar' ? 'دليل بصري' : 'Visual clue'}>{illustration}</div><p className="mt-3 text-sm font-semibold">{lang === 'en' ? 'Choose the matching Arabic word' : lang === 'ar' ? 'اختر الكلمة العربية المناسبة' : 'Choisissez le mot arabe correspondant'}</p>
      <div className="mt-4 grid gap-2">{memoryOptions.map((option) => { const chosen = selectedAnswer === option.word; return <button type="button" key={option.word} disabled={answerValidated} onClick={() => chooseAnswer(option)} className={`relative rounded-2xl border py-3 font-arabic text-2xl active:scale-[0.98] ${chosen ? answerValidated ? answerCorrect ? 'border-emerald-500 bg-emerald-500/10' : 'border-destructive bg-destructive/10' : 'border-primary bg-primary/10' : 'border-border bg-background'}`}>{option.word}</button>})}</div>
      {!answerValidated && <button type="button" disabled={!selectedAnswer} onClick={validateAnswer} className="gold-gradient mt-4 w-full rounded-2xl py-3 font-semibold text-primary-foreground disabled:opacity-40">{lang === 'fr' ? 'Valider' : lang === 'ar' ? 'تحقق' : 'Check'}</button>}
      {answerValidated && <div className={`mt-3 rounded-2xl p-3 text-sm font-semibold ${answerCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>{answerCorrect ? (lang === 'en' ? 'Correct!' : lang === 'ar' ? 'صحيح!' : 'Bonne réponse !') : <>{lang === 'fr' ? 'Correction :' : lang === 'ar' ? 'التصحيح:' : 'Correction:'} <span dir="rtl" className="font-arabic text-xl text-foreground">{word.word}</span></>}</div>}
      {answerValidated && <button type="button" onClick={onLearned} className="gold-gradient mt-4 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Suivant' : lang === 'ar' ? 'التالي' : 'Next'}</button>}
    </section>}

    {mode === 'review' && <section className="mt-4 rounded-3xl border border-border bg-card p-5 text-center">
      <p className="font-arabic text-5xl text-primary">{word.word}</p>
      <p className="mt-3 text-sm font-semibold">{lang === 'en' ? 'What does this word mean?' : lang === 'ar' ? 'ما معنى هذه الكلمة؟' : 'Que signifie ce mot ?'}</p>
      <div className="mt-4 grid gap-2">{reviewOptions.map((option) => { const chosen = selectedAnswer === option.word; return <button type="button" key={option.word} disabled={answerValidated} onClick={() => chooseAnswer(option)} className={`relative rounded-2xl border py-3 font-semibold active:scale-[0.98] ${chosen ? answerValidated ? answerCorrect ? 'border-emerald-500 bg-emerald-500/10' : 'border-destructive bg-destructive/10' : 'border-primary bg-primary/10' : 'border-border bg-background'}`}>{localized(option.meaning, lang)}</button>})}</div>
      {!answerValidated && <button type="button" disabled={!selectedAnswer} onClick={validateAnswer} className="gold-gradient mt-4 w-full rounded-2xl py-3 font-semibold text-primary-foreground disabled:opacity-40">{lang === 'fr' ? 'Valider' : lang === 'ar' ? 'تحقق' : 'Check'}</button>}
      {answerValidated && <div className={`mt-3 rounded-2xl p-3 text-sm font-semibold ${answerCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>{answerCorrect ? (lang === 'en' ? 'Correct!' : lang === 'ar' ? 'صحيح!' : 'Bonne réponse !') : <>{lang === 'fr' ? 'Correction :' : lang === 'ar' ? 'التصحيح:' : 'Correction:'} <span className="text-foreground">{meaning}</span></>}</div>}
      {answerValidated && <button type="button" onClick={onLearned} className="gold-gradient mt-4 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Suivant' : lang === 'ar' ? 'التالي' : 'Next'}</button>}
    </section>}

    {selectedMode && mode === 'listen' && <button type="button" onClick={onLearned} className="gold-gradient mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-primary-foreground">
      {isLast ? (lang === 'en' ? 'Finish activity' : lang === 'ar' ? 'إنهاء النشاط' : 'Terminer l’activité') : (lang === 'en' ? 'Next' : lang === 'ar' ? 'التالي' : 'Suivant')}<ChevronRight className="h-4 w-4 rtl:rotate-180" />
    </button>}

  </div>
}

function VocabularyView({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n()
  const { updateTopicProgress } = useProgress()
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [wordIndex, setWordIndex] = useState<number | null>(null)
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null)
  const [mistakeIndexes, setMistakeIndexes] = useState<number[]>([])
  const [results, setResults] = useState(false)
  const [correctionQueue, setCorrectionQueue] = useState<number[] | null>(null)
  const [wordOrder, setWordOrder] = useState<number[]>([])
  const categories = [
    ...VOCABULARY,
    { id: 'phrases', label: { fr: 'Phrases utiles', ar: 'عبارات مفيدة', en: 'Useful phrases' }, words: PHRASES },
  ]
  const category = categories.find((item) => item.id === categoryId)

  if (category && practiceMode && results) {
    const correctCount = category.words.length - mistakeIndexes.length
    const percentage = Math.round((correctCount / category.words.length) * 100)
    return <div>
      <BackBar title={localized(category.label, lang)} onBack={() => { setResults(false); setPracticeMode(null); setMistakeIndexes([]) }} />
      <div className="flex flex-col items-center p-6 text-center">
        <ProgressRing value={percentage} size={112} stroke={9}><span className="text-xl font-bold">{percentage}%</span></ProgressRing>
        <h2 className="gold-text mt-5 text-2xl font-bold">{lang === 'en' ? 'Activity completed' : lang === 'ar' ? 'اكتمل النشاط' : 'Activité terminée'}</h2>
        <p className="mt-2 text-muted-foreground">{lang === 'en' ? 'Score' : lang === 'ar' ? 'النتيجة' : 'Score'} : <strong className="text-foreground">{correctCount}/{category.words.length}</strong></p>
        {mistakeIndexes.length > 0 ? <button type="button" onClick={() => { setCorrectionQueue(mistakeIndexes); setWordIndex(mistakeIndexes[0]); setResults(false) }} className="gold-gradient mt-7 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{lang === 'en' ? 'Correct my mistakes' : lang === 'ar' ? 'تصحيح أخطائي' : 'Corriger mes erreurs'}</button> : <button type="button" onClick={() => { setResults(false); setPracticeMode(null); setMistakeIndexes([]) }} className="gold-gradient mt-7 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{lang === 'en' ? 'Finish' : lang === 'ar' ? 'إنهاء' : 'Terminer'}</button>}
      </div>
    </div>
  }

  if (category && practiceMode && wordIndex !== null) {
    const actualWordIndex = wordOrder[wordIndex] ?? wordIndex
    const word = category.words[actualWordIndex]
    const allWords = categories.flatMap((item) => item.words)
    const categoryOffset = categories.slice(0, categories.findIndex((item) => item.id === category.id)).reduce((sum, item) => sum + item.words.length, 0)
    const illustration = vocabularyVisualClue(category.id, word)
    const nextWord = () => {
      updateTopicProgress('vocabulary', Math.round(((categoryOffset + wordIndex + 1) / allWords.length) * 100))
      if (correctionQueue) {
        const queuePosition = correctionQueue.indexOf(wordIndex)
        if (queuePosition + 1 < correctionQueue.length) setWordIndex(correctionQueue[queuePosition + 1])
        else { setCorrectionQueue(null); setWordIndex(null); setPracticeMode(null); setMistakeIndexes([]) }
      } else if (wordIndex + 1 < category.words.length) setWordIndex((value) => (value ?? 0) + 1)
      else { setWordIndex(null); setResults(true) }
    }
    return (
      <div>
        <BackBar title={localized(category.label, lang)} onBack={() => { setWordIndex(null); setPracticeMode(null) }} />
        <div className="p-5">
          <div className="mb-5 flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <ProgressRing value={((wordIndex + 1) / category.words.length) * 100} size={62} stroke={6} className="shrink-0">
              <span className="text-[11px] font-bold text-foreground">{Math.round(((wordIndex + 1) / category.words.length) * 100)}%</span>
            </ProgressRing>
            <div><span className="block text-sm font-semibold text-foreground">{localized(category.label, lang)}</span><span>{wordIndex + 1} / {category.words.length}</span></div>
          </div>
          <div className="mt-5"><WordPractice key={`${practiceMode}-${word.word}`} word={word} illustration={illustration} alternatives={category.words} onLearned={nextWord} onMistake={() => { if (!correctionQueue) setMistakeIndexes((current) => current.includes(wordIndex) ? current : [...current, wordIndex]) }} isLast={correctionQueue ? wordIndex === correctionQueue.at(-1) : wordIndex + 1 === category.words.length} selectedMode={practiceMode} onBackToModes={() => { setWordIndex(null); setPracticeMode(null); setCorrectionQueue(null); setMistakeIndexes([]) }} /></div>
        </div>
      </div>
    )
  }

  if (category) {
    const modes: { id: PracticeMode; label: string; description: string; icon: LucideIcon }[] = [
      { id: 'listen', label: lang === 'en' ? 'Listen & pronounce' : lang === 'ar' ? 'استمع وانطق' : 'Écouter et prononcer', description: lang === 'fr' ? 'Écoutez puis répétez chaque mot.' : lang === 'ar' ? 'استمع ثم كرر كل كلمة.' : 'Listen, then repeat every word.', icon: Mic },
      { id: 'memorize', label: lang === 'en' ? 'Memorization' : lang === 'ar' ? 'الحفظ' : 'Mémorisation', description: lang === 'fr' ? 'Associez chaque image au bon mot arabe.' : lang === 'ar' ? 'اربط كل صورة بالكلمة العربية الصحيحة.' : 'Match every picture with its Arabic word.', icon: Brain },
      { id: 'review', label: lang === 'en' ? 'Review' : lang === 'ar' ? 'المراجعة' : 'Révision', description: lang === 'fr' ? 'Vérifiez le sens des mots déjà étudiés.' : lang === 'ar' ? 'راجع معاني الكلمات التي درستها.' : 'Review the meaning of learned words.', icon: RefreshCw },
    ]
    return <div>
    <BackBar title={localized(category.label, lang)} onBack={() => setCategoryId(null)} />
    <div className="flex flex-col gap-3 p-5">
      {modes.map(({ id, label, description, icon: Icon }) => <button key={id} type="button" onClick={() => { setPracticeMode(id); setWordOrder(shuffledVocabularyIndexes(category.words.length, Math.floor(Math.random() * 1_000_000) + 1)); setWordIndex(0); setMistakeIndexes([]); setResults(false); setCorrectionQueue(null) }} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon className="h-7 w-7" /></span>
          <span className="min-w-0 flex-1"><span className="block font-bold text-foreground">{label}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span>
          <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
        </button>)}
    </div>
  </div>
  }

  return (
    <div>
      <BackBar title={t('learn.vocabulary')} onBack={onBack} />
      <div className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">{t('learn.vocabWords')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((item) => {
            const categoryEmoji: Record<string, string> = { daily: '🏠', family: '👨‍👩‍👧‍👦', food: '🍎', numbers: '🔢', colors: '🎨', work: '💼', phrases: '💬' }
            return <button key={item.id} type="button" onClick={() => { setCategoryId(item.id); setWordIndex(null) }} className="flex min-h-32 flex-col items-center justify-center rounded-3xl border border-border bg-card p-4 text-center transition active:scale-95">
              <span className="text-4xl" aria-hidden>{categoryEmoji[item.id] ?? '📚'}</span>
              <span className="gold-text mt-3 text-sm font-bold">{localized(item.label, lang)}</span>
              <span className="mt-1 text-[11px] text-muted-foreground">{item.words.length} {lang === 'en' ? 'items' : lang === 'ar' ? 'عناصر' : 'éléments'}</span>
            </button>
          })}
        </div>
      </div>
    </div>
  )
}

function GrammarCard({ point }: { point: GrammarPoint }) {
  const { t, lang } = useI18n()
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="border-b border-border bg-secondary/40 px-5 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">{t('learn.rule')}</p>
        <h3 className="gold-text text-lg font-bold text-balance">{localized(point.title, lang)}</h3>
      </div>
      <div className="flex items-center gap-4 px-5 py-5">
        <div className="flex min-h-24 shrink-0 flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <span className="font-arabic text-3xl leading-tight text-primary">{point.example}</span>
          <span className="mt-1 text-[11px] text-muted-foreground">{point.exampleTranslit}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('learn.explanation')}
          </p>
          <p className="text-sm leading-relaxed text-pretty">{localized(point.explanation, lang)}</p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <ListenButton text={point.example} label={t('learn.listen')} className="w-full" />
      </div>
    </article>
  )
}

function GrammarView({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n()
  const { updateTopicProgress } = useProgress()
  const [index, setIndex] = useState(0)
  const point = GRAMMAR[index]
  const practiceWord: Word = { word: point.example, translit: point.exampleTranslit, meaning: point.title }
  const alternatives: Word[] = GRAMMAR.map((item) => ({ word: item.example, translit: item.exampleTranslit, meaning: item.title }))
  const next = () => {
    updateTopicProgress('grammar', Math.round(((index + 1) / GRAMMAR.length) * 100))
    if (index + 1 < GRAMMAR.length) setIndex((value) => value + 1)
    else onBack()
  }
  return (
    <div>
      <BackBar title={t('learn.grammar')} onBack={onBack} />
      <div className="p-5">
        <div className="mb-5 flex items-center gap-3 text-xs font-medium text-muted-foreground">
          <ProgressRing value={((index + 1) / GRAMMAR.length) * 100} size={62} stroke={6} className="shrink-0">
            <span className="text-[11px] font-bold text-foreground">{Math.round(((index + 1) / GRAMMAR.length) * 100)}%</span>
          </ProgressRing>
          <div><span className="block text-sm font-semibold text-foreground">{localized(point.title, lang)}</span><span>{index + 1} / {GRAMMAR.length}</span></div>
        </div>
        <div className="mt-5 rounded-3xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">{t('learn.explanation')}</p>
          <p className="mt-2 text-sm leading-relaxed text-pretty">{localized(point.explanation, lang)}</p>
        </div>
        <div className="mt-4"><WordPractice key={point.id} word={practiceWord} illustration="🧩" alternatives={alternatives} onLearned={next} isLast={index + 1 === GRAMMAR.length} /></div>
      </div>
    </div>
  )
}
