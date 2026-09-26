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
import { useProgress } from '@/lib/progress/context'
import { ScreenHeader, ProgressBar, ProgressRing, accentClass } from '@/components/ui-bits'
import { ListenButton, ListenCircle, PronounceButton } from '@/components/audio-button'
import { speakArabic, speakPhrase, playRecordedAudio, playRecordedAudioSequence, stopSpeech, type RecordedAudioSegment } from '@/lib/speech'
import { letterPositionPhrase, type LetterPosition } from '@/lib/letter-position-speech'
import { letterSpokenName, letterDisplayName } from '@/lib/letter-spoken-names'
import { letterRecordedAudio } from '@/lib/letter-recorded-audio'
import { letterPositionRecordedSequence } from '@/lib/letter-position-recorded-audio'
import { pedagogicalPositionGlyph } from '@/lib/letter-position-glyphs'
import { LETTER_PHONETICS, letterFormSpeech } from '@/lib/letter-phonetics'
import { playAnswerSound } from '@/lib/feedback-sounds'
import { addUniqueMistake, advanceCorrection, initialAttemptSummary } from '@/lib/guided-validation'
import { masteryTopics } from '@/lib/progress/mastery'
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
} from '@/lib/data'

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
  | { kind: 'menu'; block?: LearnBlockId }
  | { kind: 'alphabet' }
  | { kind: 'letter'; index: number }
  | { kind: 'rules'; topic: 'short-vowels' | 'long-vowels' | 'tanwin' }
  | { kind: 'positions' }
  | { kind: 'shadda' }
  | { kind: 'reading' }
  | { kind: 'vocabulary'; categoryId?: string; direct?: boolean; returnBlock?: LearnBlockId; lessonIndex?: number }
  | { kind: 'grammar' }

export type LearnBlockId = 'reading' | 'phrases' | 'literary' | 'quran'

export type LearnStart = {
  block: LearnBlockId
  topicId?: string
  categoryId?: string
  lessonIndex?: number
}

function initialLearnView(start?: LearnStart): View {
  if (!start) return { kind: 'menu' }
  if (start.categoryId) return { kind: 'vocabulary', categoryId: start.categoryId, direct: true, returnBlock: start.block, lessonIndex: start.lessonIndex }
  if (start.topicId === 'alphabet') return { kind: 'alphabet' }
  if (start.topicId === 'positions') return { kind: 'positions' }
  if (start.topicId === 'short-vowels' || start.topicId === 'long-vowels' || start.topicId === 'tanwin') return { kind: 'rules', topic: start.topicId }
  if (start.topicId === 'shadda') return { kind: 'shadda' }
  if (start.topicId === 'reading') return { kind: 'reading' }
  return { kind: 'menu', block: start.block }
}

function restoredLearnView(saved: string): View {
  if (!saved || saved === 'menu') return { kind: 'menu' }
  try {
    const parsed = JSON.parse(saved) as View
    if (!parsed || typeof parsed !== 'object' || typeof parsed.kind !== 'string') return { kind: 'menu' }
    if (!['menu', 'alphabet', 'letter', 'rules', 'positions', 'shadda', 'reading', 'vocabulary', 'grammar'].includes(parsed.kind)) return { kind: 'menu' }
    if (parsed.kind === 'letter' && (!Number.isInteger(parsed.index) || parsed.index < 0 || parsed.index >= LETTERS.length)) return { kind: 'alphabet' }
    return parsed
  } catch {
    return { kind: 'menu' }
  }
}

export function LearnScreen({ initialStart }: { initialStart?: LearnStart }) {
  const { progress, updateUiState } = useProgress()
  const [view, setView] = useState<View>(() => initialStart ? initialLearnView(initialStart) : restoredLearnView(progress.ui.learnView))

  const changeView = (next: View) => {
    setView(next)
    updateUiState({ learnView: JSON.stringify(next) })
  }

  if (view.kind === 'menu') return <LearnMenu initialBlock={view.block} onOpen={changeView} />

  if (view.kind === 'alphabet') {
    return (
      <AlphabetGrid
        onBack={() => changeView({ kind: 'menu', block: 'reading' })}
        onLetter={(index) => changeView({ kind: 'letter', index })}
      />
    )
  } else if (view.kind === 'letter') {
    return (
      <LetterDetail
        index={view.index}
        onBack={() => changeView({ kind: 'alphabet' })}
        onGo={(index) => changeView({ kind: 'letter', index })}
        onComplete={() => changeView({ kind: 'menu', block: 'reading' })}
      />
    )
  } else if (view.kind === 'rules') {
    return <RulesView topic={view.topic} onBack={() => changeView({ kind: 'menu', block: 'reading' })} />
  } else if (view.kind === 'positions') {
    return <PositionsView onBack={() => changeView({ kind: 'menu', block: 'reading' })} />
  } else if (view.kind === 'shadda') {
    return <ChaddaView onBack={() => changeView({ kind: 'menu', block: 'reading' })} />
  } else if (view.kind === 'vocabulary') {
    return <VocabularyView initialCategoryId={view.categoryId} initialLessonIndex={view.lessonIndex} directEntry={view.direct} onBack={() => changeView({ kind: 'menu', block: view.returnBlock ?? 'phrases' })} />
  } else if (view.kind === 'grammar') {
    return <GrammarView onBack={() => changeView({ kind: 'menu', block: 'phrases' })} />
  }
  return <ReadingView onBack={() => changeView({ kind: 'menu', block: 'reading' })} />
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

function CompletionButton({ topicId, onBack }: { topicId: string; onBack: () => void }) {
  const { t, lang } = useI18n()
  const { markTopicIntroduced } = useProgress()
  const validatesTopic = topicId !== 'alphabet'
  return (
    <button
      type="button"
      onClick={() => {
        if (validatesTopic) markTopicIntroduced(topicId)
        onBack()
      }}
      className="gold-gradient flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-primary-foreground shadow-lg shadow-black/20 active:scale-[0.98]"
    >
      {validatesTopic
        ? (lang === 'fr' ? 'Passer aux exercices' : lang === 'ar' ? 'الانتقال إلى التمارين' : 'Continue to exercises')
        : t('common.back')}
      {validatesTopic ? <ChevronRight className="h-5 w-5 rtl:rotate-180" /> : <ChevronLeft className="h-5 w-5 rtl:rotate-180" />}
    </button>
  )
}

function LearnMenu({ initialBlock, onOpen }: { initialBlock?: LearnBlockId; onOpen: (v: View) => void }) {
  const { t } = useI18n()
  const { progress } = useProgress()
  const verifiedTopics = masteryTopics(progress.validatedItems)
  const [selectedBlock, setSelectedBlock] = useState<LearnBlockId | null>(initialBlock ?? null)

  const open = (id: string) => {
    if (id === 'alphabet') onOpen({ kind: 'alphabet' })
    else if (id === 'short-vowels') onOpen({ kind: 'rules', topic: 'short-vowels' })
    else if (id === 'long-vowels') onOpen({ kind: 'rules', topic: 'long-vowels' })
    else if (id === 'tanwin') onOpen({ kind: 'rules', topic: 'tanwin' })
    else if (id === 'shadda') onOpen({ kind: 'shadda' })
    else if (id === 'positions') onOpen({ kind: 'positions' })
    else if (id === 'reading') onOpen({ kind: 'reading' })
    else if (id === 'vocabulary') onOpen({ kind: 'vocabulary' })
    else if (id === 'grammar') onOpen({ kind: 'grammar' })
  }

  const directTopicIds = new Set(['alphabet', 'positions', 'short-vowels', 'long-vowels', 'tanwin', 'shadda'])
  const readingTopics = LEARN_TOPICS.filter((topic) => directTopicIds.has(topic.id))
  const TopicButton = ({ topic, step }: { topic: (typeof LEARN_TOPICS)[number]; step?: number }) => {
    const Icon = ICONS[topic.icon] ?? Type
    const title = topic.id === 'alphabet'
      ? 'Apprendre les lettres'
      : topic.id === 'positions'
        ? 'Formes et assemblages'
        : t(topic.titleKey)
    return (
      <button
        type="button"
        onClick={() => open(topic.id)}
        className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-start transition-transform active:scale-[0.98]"
      >
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accentClass(topic.accent)}`}>
          {step ? <span className="text-lg font-bold">{step}</span> : <Icon className="h-6 w-6" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="gold-text font-semibold text-balance">{title}</p>
          <p className="mb-2 text-xs text-muted-foreground">{t(topic.subKey)}</p>
          <div className="flex items-center gap-2">
            <ProgressBar value={verifiedTopics[topic.id] ?? 0} className="h-1.5 flex-1" />
            <span className="gold-text text-[11px] font-bold">{verifiedTopics[topic.id] ?? 0}%</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
      </button>
    )
  }

  if (selectedBlock === 'reading') {
    return (
      <div>
        <BackBar title="Leçon 1 · L’alphabet" onBack={() => setSelectedBlock(null)} />
        <div className="px-5 pb-8 pt-5">
          <div className="space-y-3">
            {readingTopics.map((topic, index) => <TopicButton key={topic.id} topic={topic} step={index + 1} />)}
          </div>
        </div>
      </div>
    )
  }

  if (selectedBlock) {
    const emptyLesson = {
      phrases: { number: 2, title: 'Lecture' },
      literary: { number: 3, title: 'Vocabulaire essentiel' },
      quran: { number: 4, title: 'Grammaire et conjugaison' },
    }[selectedBlock]
    if (selectedBlock === 'phrases') {
      const chapters = ['Lire des mots', 'Lire des phrases', 'Lire des textes courts']
      return <div>
        <BackBar title={`Leçon 2 · ${emptyLesson.title}`} onBack={() => setSelectedBlock(null)} />
        <div className="space-y-3 px-5 pb-8 pt-5">
          {chapters.map((chapter, index) => <div key={chapter} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
            <span className="gold-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-primary-foreground">{index + 1}</span>
            <span className="gold-text text-base font-bold">{chapter}</span>
          </div>)}
        </div>
      </div>
    }
    return <div><BackBar title={`Leçon ${emptyLesson.number} · ${emptyLesson.title}`} onBack={() => setSelectedBlock(null)} /></div>
  }

  if (selectedBlock === 'phrases') {
    const lessons = [
      { id: 'lesson-objects', number: 1, title: 'Désigner les objets', description: 'Reconnaître et nommer les objets du quotidien.', note: 'Noms et exercices disponibles · démonstratifs à préparer.' },
      { id: 'lesson-family', number: 2, title: 'Parler de sa famille', description: 'Famille proche puis parenté élargie, avec distinctions paternelles et maternelles.', note: '16 termes répartis en petites séries · phrases familiales à préparer.' },
    ]
    return (
      <div>
        <BackBar title="Premiers mots et premières phrases" onBack={() => setSelectedBlock(null)} />
        <div className="space-y-5 px-5 pb-8 pt-5">
          <p className="text-sm leading-relaxed text-muted-foreground">Ce socle commun prépare aussi bien la communication en arabe littéraire que la compréhension linguistique du Coran.</p>
          <div className="space-y-3">
            {lessons.map((lesson) => <button key={lesson.id} type="button" onClick={() => onOpen({ kind: 'vocabulary', categoryId: lesson.id, direct: true })} className="flex w-full items-start gap-4 rounded-3xl border border-border bg-card p-4 text-start active:scale-[0.98]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{lesson.number}</span>
              <span className="min-w-0 flex-1"><span className="gold-text block font-semibold">{lesson.title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{lesson.description}</span><span className="mt-2 block text-[11px] font-medium text-primary">{lesson.note}</span></span>
              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
            </button>)}
          </div>
          <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-4">
            <p className="font-semibold">À intégrer plus tard dans les leçons</p>
            <p className="mt-1 text-xs text-muted-foreground">Verbes courants, questions et négation restent des repères à préparer ; ils ne forment plus de fausses leçons séparées.</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mes fiches de référence</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => onOpen({ kind: 'vocabulary' })} className="rounded-2xl border border-border bg-card p-4 text-start"><MessagesSquare className="mb-2 h-5 w-5 text-primary"/><span className="block text-sm font-semibold">Tous les mots et phrases</span></button>
              <button type="button" onClick={() => onOpen({ kind: 'grammar' })} className="rounded-2xl border border-border bg-card p-4 text-start"><SpellCheck className="mb-2 h-5 w-5 text-primary"/><span className="block text-sm font-semibold">Fiches de grammaire</span></button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedBlock === 'literary' || selectedBlock === 'quran') {
    const literary = selectedBlock === 'literary'
    if (literary) {
      const chapters = [
        { id: 'lesson-greetings', number: 1, title: 'Faire connaissance', description: 'Dire bonjour et au revoir, se présenter, demander le nom et l’origine.', detail: 'Dialogue · compréhension · reconstruction · réponse en contexte' },
        { id: 'lesson-understanding', number: 2, title: 'Se faire comprendre', description: 'Dire que l’on ne comprend pas et demander une répétition ou une explication.', detail: 'Expressions · variantes masculin/féminin · exercices guidés' },
        { id: 'communication-self', number: 3, title: 'Parler de soi', description: 'Parler de son domicile, de ses études et de son métier.', detail: 'Expressions · compréhension · reconstruction · réponse en contexte' },
        { id: 'communication-family', number: 4, title: 'Présenter sa famille', description: 'Présenter ses proches en réutilisant le vocabulaire familial.', detail: 'Phrases utiles · compréhension · reconstruction · réponse en contexte' },
        { id: 'communication-needs', number: 5, title: 'Exprimer ses goûts et ses besoins', description: 'Dire ce que l’on aime, préfère, veut ou dont on a besoin.', detail: 'Expressions · compréhension · reconstruction · réponse en contexte' },
        { id: 'communication-shopping', number: 6, title: 'Acheter et commander', description: 'Demander le prix, choisir une quantité et commander simplement.', detail: 'Expressions · nombres · compréhension · réponse en contexte' },
        { id: 'communication-directions', number: 7, title: 'Demander son chemin', description: 'Demander un lieu et comprendre des directions simples.', detail: 'Lieux · directions · reconstruction · réponse en contexte' },
        { id: 'communication-day', number: 8, title: 'Parler de sa journée', description: 'Parler de ses activités, horaires et rendez-vous simples.', detail: 'Temps · activités · reconstruction · réponse en contexte' },
      ]
      return <div>
        <BackBar title="Communiquer en arabe littéraire" onBack={() => setSelectedBlock(null)} />
        <div className="space-y-5 px-5 pb-8 pt-5">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Situations de communication</p>
            <h2 className="gold-text mt-2 text-xl font-bold">Comprendre et répondre</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Chaque chapitre commence par quelques expressions, puis alterne dialogue, compréhension et construction de réponses en arabe littéraire moderne.</p>
          </div>
          <div className="space-y-3">{chapters.map((chapter) => <button key={chapter.id} type="button" onClick={() => onOpen({ kind: 'vocabulary', categoryId: chapter.id, direct: true, returnBlock: 'literary' })} className="flex w-full items-start gap-4 rounded-3xl border border-border bg-card p-4 text-start active:scale-[0.98]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{chapter.number}</span>
            <span className="min-w-0 flex-1"><span className="gold-text block font-semibold">{chapter.title}</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{chapter.description}</span><span className="mt-2 block text-[11px] font-medium text-primary">{chapter.detail}</span></span>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
          </button>)}</div>
          <p className="text-xs leading-relaxed text-muted-foreground">Ces huit chapitres sont accessibles librement dans le mode découverte. Leur consultation seule ne valide pas la progression.</p>
        </div>
      </div>
    }
    return (
      <div>
        <BackBar title={literary ? 'Communiquer en arabe littéraire' : 'Comprendre le Coran'} onBack={() => setSelectedBlock(null)} />
        <div className="space-y-4 px-5 pb-8 pt-5">
          <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Contenu à préparer</p>
            <h2 className="gold-text mt-2 text-xl font-bold">{literary ? 'Arabe littéraire uniquement' : 'Compréhension linguistique'}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {literary
                ? 'Les futures leçons utiliseront la fuṣḥā, sans dialecte, avec des contenus linguistiques vérifiés.'
                : 'Les futurs extraits seront exacts, référencés par sourate et verset, avec une traduction du sens clairement sourcée.'}
            </p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">Ce parcours pourra être commencé après le socle commun, indépendamment de l’autre parcours. Aucun exercice non vérifié n’est affiché dans cet aperçu.</p>
        </div>
      </div>
    )
  }

  const blocks: { id: LearnBlockId; number: number; title: string; description: string; icon: LucideIcon }[] = [
    { id: 'reading', number: 1, title: 'L’alphabet', description: 'Les lettres, leurs formes et tous les signes déjà inclus.', icon: Type },
    { id: 'phrases', number: 2, title: 'Lecture', description: 'Lire des mots, des phrases, puis des textes courts.', icon: BookOpen },
    { id: 'literary', number: 3, title: 'Vocabulaire essentiel', description: 'Apprendre les mots utiles, regroupés par thèmes.', icon: MessagesSquare },
    { id: 'quran', number: 4, title: 'Grammaire et conjugaison', description: 'Comprendre les règles de la phrase et apprendre à utiliser les verbes.', icon: SpellCheck },
  ]

  return (
    <div>
      <ScreenHeader title={t('learn.title')} subtitle={t('learn.subtitle')} />
      <div className="space-y-5 px-5 pb-8">
        <div className="space-y-3">
          {blocks.map((block) => {
            const Icon = block.icon
            return (
              <button key={block.id} type="button" onClick={() => setSelectedBlock(block.id)} className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.98]">
                <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{block.number}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="gold-text font-semibold">{block.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{block.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
              </button>
            )
          })}
        </div>
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
            className="group relative flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card transition-all active:scale-95"
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
  const { updateLetterIndex, markValidatedItems, recordActivity } = useProgress()
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
    markValidatedItems('alphabet', [`letter:${letter.id}`])
    if (hasNext) window.setTimeout(() => onGo(index + 1), 950)
    else window.setTimeout(() => {
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
            lang={lang}
            label={t('learn.pronounce')}
            listeningLabel={t('learn.listening')}
            successLabel={t('learn.correct')}
            errorLabel={t('learn.tryAgain')}
            unavailableLabel={lang === 'fr'
              ? 'Micro ou reconnaissance vocale indisponible'
              : lang === 'ar'
                ? 'الميكروفون أو التعرّف الصوتي غير متاح'
                : 'Microphone or speech recognition unavailable'}
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
            <div
              key={letter.id}
              onClick={
                vowel === 'fatha'
                  ? () => void playRecordedAudio(`/audio/short-fatha/${letterIndex + 1}.mp3`)
                  : vowel === 'kasra'
                    ? () => void playRecordedAudio(`/audio/short-kasra/${letterIndex + 1}.mp3`)
                    : vowel === 'damma'
                      ? () => void playRecordedAudio(`/audio/short-damma/${letterIndex + 1}.mp3`)
                      : undefined
              }
              className="flex min-h-0 flex-col items-center justify-center overflow-visible rounded-xl border border-primary/20 bg-card px-1 pb-2 pt-3 shadow-[0_2px_7px_rgba(55,42,28,0.08)] sm:rounded-2xl sm:pb-2.5 sm:pt-3.5"
              aria-label={`${letter.name}, ${phonetic}`}
            >
              <span className="flex min-h-[3.8rem] items-center overflow-visible px-1 text-[clamp(1.95rem,8.7vw,3.05rem)] font-semibold leading-[1.65] text-foreground">
                <ArabicWithRedVowels>{letter.glyph + page.mark}</ArabicWithRedVowels>
              </span>
              <span dir="ltr" className="mt-1 text-[clamp(0.64rem,2.9vw,0.84rem)] font-bold leading-none text-red-600">
                {phonetic}
              </span>
            </div>
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
  père: '👨', mère: '👩', frère: '👦', sœur: '👧', dattes: '🌴', lait: '🥛', viande: '🥩', pomme: '🍎',
  banane: '🍌', riz: '🍚', poulet: '🍗', poisson: '🐟', œufs: '🥚', légumes: '🥬',
  un: '1️⃣', deux: '2️⃣', trois: '3️⃣', quatre: '4️⃣', cinq: '5️⃣', six: '6️⃣', sept: '7️⃣', huit: '8️⃣', neuf: '9️⃣', dix: '🔟',
  blanc: '⚪', noir: '⚫', rouge: '🔴', bleu: '🔵',
  vert: '🟢', jaune: '🟡', orange: '🟠', violet: '🟣', rose: '🌸', marron: '🟤', gris: '◉',
  'blanche (féminin)': '⚪', 'noire (féminin)': '⚫', 'rouge (féminin)': '🔴', 'bleue (féminin)': '🔵',
  'verte (féminin)': '🟢', 'jaune (féminin)': '🟡', 'orange (féminin)': '🟠', 'violette (féminin)': '🟣',
  'rose (féminin)': '🌸', 'marron (féminin)': '🟤', 'grise (féminin)': '◉', 'une porte rouge': '🚪🔴', 'un sac vert': '👜🟢',
  travail: '💼', bureau: '🏢', directeur: '🧑‍💼', employé: '👨‍💻', médecin: '🩺', enseignant: '🧑‍🏫', ordinateur: '💻',
}

export type VocabularyStimulus = { kind: 'visual' | 'number' | 'text'; value: string }

export function resolveVocabularyStimulus(categoryId: string, word: Word, lang: Lang = 'fr'): VocabularyStimulus {
  if (categoryId === 'numbers') return { kind: 'number', value: word.meaning.ar }
  const visual = WORD_ILLUSTRATIONS[word.meaning.fr]
  if (visual) return { kind: 'visual', value: visual }
  return { kind: 'text', value: localized(word.meaning, lang) }
}

function VocabularyStimulusCard({ stimulus, label, compact = false }: { stimulus: VocabularyStimulus; label: string; compact?: boolean }) {
  const isText = stimulus.kind === 'text'
  return <div
    className={`${compact ? '' : 'mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-3xl border border-primary/20 bg-card shadow-sm'} ${isText ? 'px-3 text-center text-lg font-bold leading-snug' : 'text-7xl'}`}
    role={isText ? undefined : 'img'}
    aria-label={label}
  >{stimulus.value}</div>
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
  const { progress, markValidatedItems, updateUiState } = useProgress()
  const [index, setIndex] = useState(() => Math.min(progress.ui.readingWordIndex, Math.max(0, READING_WORDS.length - 1)))
  const word = READING_WORDS[index]
  const correctMeaning = localized(word.meaning, lang)
  const stimulus = resolveVocabularyStimulus('daily', word, lang)

  const next = () => {
    markValidatedItems('reading', [`word:${word.word}`])
    if (index + 1 >= READING_WORDS.length) {
      onBack()
      return
    }
    const nextIndex = index + 1
    setIndex(nextIndex)
    updateUiState({ readingWordIndex: nextIndex })
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
          <VocabularyStimulusCard stimulus={stimulus} label={correctMeaning} />
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

export function wordPronunciationMatches(transcript: string, expectedWord: string) {
  const expected = stripArabicMarks(expectedWord).replace(/\s/g, '')
  const actual = stripArabicMarks(transcript).replace(/\s/g, '')
  return Boolean(expected && actual && actual.includes(expected))
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

export function variedWordOptions(correct: Word, alternatives: Word[], seed: number, meaningKey?: Lang) {
  const seen = new Set<string>()
  const candidates = alternatives.filter((item) => {
    if (item.word === correct.word) return false
    const key = meaningKey ? localized(item.meaning, meaningKey) : item.word
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const distractors = candidates
    .sort((a, b) => exerciseHash(a.word, seed) - exerciseHash(b.word, seed))
    .slice(0, 3)
  return [correct, ...distractors]
    .sort((a, b) => exerciseHash(a.word, seed + 7919) - exerciseHash(b.word, seed + 7919))
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
  const [status, setStatus] = useState<'idle' | 'listening' | 'done' | 'error' | 'unavailable'>('idle')
  const [unavailableMessage, setUnavailableMessage] = useState('')
  const [seconds, setSeconds] = useState(8)
  const showUnavailable = (message: string) => {
    setUnavailableMessage(message)
    setStatus('unavailable')
    window.setTimeout(() => setStatus('idle'), 6000)
  }
  const start = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { showUnavailable('Reconnaissance vocale non prise en charge par ce navigateur'); return }
    const rec = new SR()
    let heard = ''
    let technicalFailure = false
    setStatus('listening'); setSeconds(8)
    rec.lang = 'ar-SA'; rec.interimResults = true; rec.continuous = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) heard += ` ${event.results[i][0]?.transcript ?? ''}`
    }
    rec.onerror = (event: { error?: string }) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        technicalFailure = true
        showUnavailable('Autorisation du microphone ou de la reconnaissance refusée')
      } else if (event.error === 'audio-capture') {
        technicalFailure = true
        showUnavailable('Microphone inaccessible ou déjà utilisé')
      } else if (event.error === 'network') {
        technicalFailure = true
        showUnavailable('Connexion au service de reconnaissance vocale impossible')
      }
    }
    try { rec.start() } catch {
      showUnavailable('Impossible de démarrer la reconnaissance vocale')
      return
    }
    const countdown = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000)
    window.setTimeout(() => {
      window.clearInterval(countdown)
      try { rec.stop() } catch { /* no-op */ }
      window.setTimeout(() => {
        if (technicalFailure) return
        setStatus(wordPronunciationMatches(heard, word) ? 'done' : 'error')
      }, 350)
    }, 8000)
  }
  return <button type="button" onClick={start} disabled={status === 'listening'} className="classic-secondary-control flex h-12 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-semibold">
    <Mic className="h-5 w-5" />
    {status === 'listening' ? `${lang === 'en' ? 'Listening' : lang === 'ar' ? 'استماع' : 'Écoute'} · ${seconds} s` : status === 'done' ? (lang === 'en' ? 'Well pronounced' : lang === 'ar' ? 'نطق صحيح' : 'Bien prononcé') : status === 'error' ? (lang === 'en' ? 'Try again' : lang === 'ar' ? 'حاول مرة أخرى' : 'Réessayer') : status === 'unavailable' ? unavailableMessage : (lang === 'en' ? 'Pronounce' : lang === 'ar' ? 'انطق' : 'Prononcer')}
  </button>
}

function WordPractice({ word, stimulus, alternatives, onLearned, onMistake, onValidated, isLast, selectedMode, onBackToModes }: { word: Word; stimulus: VocabularyStimulus; alternatives: Word[]; onLearned: () => void; onMistake?: () => void; onValidated?: () => void; isLast: boolean; selectedMode?: PracticeMode; onBackToModes?: () => void }) {
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
  const memoryOptions = variedWordOptions(word, alternatives, wordSeed)
  const reviewOptions = variedWordOptions(word, alternatives, wordSeed + 3571, lang)

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
      onValidated?.()
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
    else onValidated?.()
  }

  const modes: { id: PracticeMode; label: string; icon: LucideIcon }[] = [
    { id: 'listen', label: lang === 'en' ? 'Listen & pronounce' : lang === 'ar' ? 'استمع وانطق' : 'Écouter et prononcer', icon: Mic },
    { id: 'write', label: lang === 'en' ? 'Writing' : lang === 'ar' ? 'الكتابة' : 'Écriture', icon: PenLine },
    { id: 'memorize', label: lang === 'en' ? 'Memorize' : lang === 'ar' ? 'احفظ' : 'Mémoriser', icon: Brain },
    { id: 'review', label: lang === 'en' ? 'Review' : lang === 'ar' ? 'مراجعة' : 'Révision', icon: RefreshCw },
  ]

  if (!mode) return <div>
    <article className="relief-panel rounded-3xl border border-border p-6 text-center">
      <VocabularyStimulusCard stimulus={stimulus} label={meaning} />
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
      <VocabularyStimulusCard stimulus={stimulus} label={meaning} />
      <p className="gold-text font-arabic text-5xl leading-tight">{word.word}</p><p className="mt-2 text-sm text-muted-foreground">{word.translit}</p><p className="mt-1 text-lg font-semibold">{meaning}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3"><ListenButton text={word.word} label={t('learn.listen')} size="sm" /><WordPronouncePractice word={word.word} lang={lang} /></div>
    </article>}

    {mode === 'write' && <section className="mt-4 rounded-3xl border border-border bg-card p-5 text-center">
      <VocabularyStimulusCard stimulus={stimulus} label={meaning} compact />
      <p className="text-sm font-semibold">{lang === 'en' ? 'Rebuild the Arabic word' : lang === 'ar' ? 'أعِد بناء الكلمة' : 'Reconstituez le mot arabe'}</p>
      <div dir="rtl" className="mt-4 flex min-h-16 items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3"><span className="font-arabic text-4xl leading-none">{assembled.map((piece) => piece.base).join('')}</span></div>
      <div dir="rtl" className="mt-4 flex flex-wrap justify-center gap-2">{writing.choices.map((piece) => <button type="button" key={piece.id} disabled={usedPieces.includes(piece.id) || puzzleCorrect} onClick={() => addPiece(piece)} className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-border bg-background px-3 font-arabic text-3xl disabled:opacity-25">{piece.display}</button>)}</div>
      <div className="mt-4 flex gap-2"><button type="button" onClick={() => { setAssembled([]); setUsedPieces([]); setPuzzleWrong(false) }} disabled={!assembled.length || puzzleCorrect} className="flex-1 rounded-2xl border border-border py-3 font-semibold disabled:opacity-40">{lang === 'en' ? 'Clear' : lang === 'ar' ? 'مسح' : 'Effacer'}</button><button type="button" onClick={validateWriting} disabled={assembled.length !== writing.correct.length || puzzleCorrect} className="gold-gradient flex-1 rounded-2xl py-3 font-semibold text-primary-foreground disabled:opacity-40">{lang === 'en' ? 'Check' : lang === 'ar' ? 'تحقق' : 'Valider'}</button></div>
      {puzzleWrong && <div className="mt-3 rounded-2xl bg-destructive/10 p-3 text-destructive"><p className="flex items-center justify-center gap-2 text-sm font-semibold"><X className="h-4 w-4" />{lang === 'en' ? 'Incorrect answer.' : lang === 'ar' ? 'إجابة غير صحيحة.' : 'Mauvaise réponse.'}</p><p className="mt-2 text-xs">{lang === 'en' ? 'Correct spelling:' : lang === 'ar' ? 'الكتابة الصحيحة:' : 'Écriture correcte :'}</p><p dir="rtl" className="mt-1 font-arabic text-3xl text-foreground">{word.word}</p></div>}
      {puzzleCorrect && <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-5 w-5" />{lang === 'en' ? 'Correct answer!' : lang === 'ar' ? 'إجابة صحيحة!' : 'Bonne réponse !'}</p>}
    </section>}

    {mode === 'memorize' && <section className="mt-4 rounded-3xl border border-border bg-card p-5 text-center">
      <VocabularyStimulusCard stimulus={stimulus} label={meaning} compact /><p className="mt-3 text-sm font-semibold">{lang === 'en' ? 'Choose the matching Arabic word' : lang === 'ar' ? 'اختر الكلمة العربية المناسبة' : 'Choisissez le mot arabe correspondant'}</p>
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

const COMMUNICATION_CATEGORY_IDS = [
  'lesson-greetings', 'lesson-understanding', 'communication-self', 'communication-family',
  'communication-needs', 'communication-shopping', 'communication-directions', 'communication-day',
] as const
const GUIDED_LANGUAGE_CATEGORY_IDS = ['phrases', 'introductions', 'conversation', 'sentence-building', 'verbs', ...COMMUNICATION_CATEGORY_IDS]
const GUIDED_LESSON_SIZE = 6

const DIALOGUE_REPLIES: Record<string, string> = {
  'السَّلَامُ عَلَيْكُم': 'وَعَلَيْكُمُ السَّلَام',
  'كَيْفَ حَالُك؟': 'أَنَا بِخَيْر',
  'كَيْفَ حَالُكِ؟': 'أَنَا بِخَيْر',
  'شُكْرًا جَزِيلًا': 'عَفْوًا',
  'صَبَاحُ الْخَيْر': 'صَبَاحُ النُّور',
  'مَسَاءُ الْخَيْر': 'مَسَاءُ النُّور',
  'مَعَ السَّلَامَة': 'إِلَى اللِّقَاء',
  'مَا اسْمُكَ؟': 'اِسْمِي أَحْمَد',
  'مِنْ أَيْنَ أَنْتَ؟': 'أَنَا مِنْ فَرَنْسَا',
  'لَا أَفْهَمُ': 'نَعَمْ، سَأُعِيدُ.',
  'هَلْ يُمْكِنُكَ أَنْ تُعِيدَ، مِنْ فَضْلِكَ؟': 'نَعَمْ، سَأُعِيدُ.',
  'تَكَلَّمْ بِبُطْءٍ، مِنْ فَضْلِكَ.': 'حَسَنًا، سَأَتَكَلَّمُ بِبُطْءٍ.',
  'مَا مَعْنَى هَذِهِ الْكَلِمَةِ؟': 'سَأَشْرَحُهَا لَكَ.',
  'شُكْرًا لَكَ.': 'عَفْوًا.',
  'أَيْنَ تَسْكُنُ؟': 'أَسْكُنُ فِي بَارِيسَ.',
  'أَيْنَ تَسْكُنِينَ؟': 'أَسْكُنُ فِي بَارِيسَ.',
  'مَاذَا تَدْرُسُ؟': 'أَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ.',
  'مَاذَا تَدْرُسِينَ؟': 'أَدْرُسُ اللُّغَةَ الْعَرَبِيَّةَ.',
  'مَا عَمَلُكَ؟': 'أَعْمَلُ مُعَلِّمًا.',
  'هَلْ لَدَيْكَ إِخْوَةٌ؟': 'نَعَمْ، لَدَيَّ أَخٌ وَأُخْتٌ.',
  'هَلْ لَدَيْكِ إِخْوَةٌ؟': 'نَعَمْ، لَدَيَّ أَخٌ وَأُخْتٌ.',
  'مَاذَا تُحِبُّ؟': 'أُحِبُّ الْقِرَاءَةَ.',
  'مَاذَا تُحِبِّينَ؟': 'أُحِبُّ الْقِرَاءَةَ.',
  'مَاذَا تُرِيدُ؟': 'أُرِيدُ مَاءً، مِنْ فَضْلِكَ.',
  'مَاذَا تُرِيدِينَ؟': 'أُرِيدُ مَاءً، مِنْ فَضْلِكَ.',
  'كَمْ سِعْرُ هَذَا؟': 'سِعْرُهُ عَشَرَةُ يُورُوهَاتٍ.',
  'هَلْ عِنْدَكُمْ شَايٌ؟': 'نَعَمْ، عِنْدَنَا شَايٌ.',
  'أَيْنَ الْمَحَطَّةُ؟': 'الْمَحَطَّةُ أَمَامَكَ.',
  'كَيْفَ أَذْهَبُ إِلَى السُّوقِ؟': 'اِذْهَبْ مُسْتَقِيمًا.',
  'مَتَى تَسْتَيْقِظُ؟': 'أَسْتَيْقِظُ فِي السَّاعَةِ السَّابِعَةِ.',
  'مَتَى تَسْتَيْقِظِينَ؟': 'أَسْتَيْقِظُ فِي السَّاعَةِ السَّابِعَةِ.',
}

type GuidedExercise =
  | { kind: 'discover'; word: Word }
  | { kind: 'recognize'; word: Word }
  | { kind: 'build'; word: Word }
  | { kind: 'dialogue'; word: Word; reply: Word }

type ConversationTurn = { speaker: 'a' | 'b'; word: Word }

function GuidedLanguageLesson({ persistenceKey, title, lessonNote, words, allWords, conversationTurns, introWords, strictAssessment = false, lessonNumber, lessonCount, onBack, onComplete }: { persistenceKey: string; title: string; lessonNote?: string; words: Word[]; allWords: Word[]; conversationTurns?: ConversationTurn[]; introWords?: Word[]; strictAssessment?: boolean; lessonNumber: number; lessonCount: number; onBack: () => void; onComplete: () => void }) {
  const { lang } = useI18n()
  const { progress: savedProgress, updateUiState } = useProgress()
  const saved = savedProgress.ui.guidedLessonKey === persistenceKey ? savedProgress.ui : null
  const dialogueExercises = words.flatMap((word) => {
    const replyText = DIALOGUE_REPLIES[word.word]
    const reply = replyText ? allWords.find((candidate) => candidate.word === replyText) : undefined
    return reply ? [{ kind: 'dialogue' as const, word, reply }] : []
  }).slice(0, 3)
  const [exerciseIndex, setExerciseIndex] = useState(saved?.guidedExerciseIndex ?? 0)
  const [answer, setAnswer] = useState<string | null>(saved?.guidedAnswer ?? null)
  const [builtTokens, setBuiltTokens] = useState<string[]>(saved?.guidedBuiltTokens ?? [])
  const [mistakes, setMistakes] = useState(saved?.guidedMistakes ?? 0)
  const [finished, setFinished] = useState(saved?.guidedFinished ?? false)
  const [choiceSeed, setChoiceSeed] = useState(saved?.guidedChoiceSeed ?? 0)
  const [conversationStep, setConversationStep] = useState(saved?.guidedConversationStep ?? (conversationTurns?.length ? 1 : 0))
  const [practiceStarted, setPracticeStarted] = useState(saved?.guidedPracticeStarted ?? !conversationTurns?.length)
  const [chapterStarted, setChapterStarted] = useState(saved?.guidedChapterStarted ?? !introWords?.length)
  const [validated, setValidated] = useState(saved?.guidedValidated ?? false)
  const [validationCorrect, setValidationCorrect] = useState<boolean | null>(saved?.guidedValidationCorrect ?? null)
  const [initialMistakeIndexes, setInitialMistakeIndexes] = useState<number[]>(saved?.guidedInitialMistakeIndexes ?? [])
  const [initialPassComplete, setInitialPassComplete] = useState(saved?.guidedInitialPassComplete ?? false)
  const [reviewQueue, setReviewQueue] = useState<number[] | null>(saved?.guidedReviewQueue ?? null)
  const [reviewPosition, setReviewPosition] = useState(saved?.guidedReviewPosition ?? 0)
  const [reviewMistakeIndexes, setReviewMistakeIndexes] = useState<number[]>(saved?.guidedReviewMistakeIndexes ?? [])
  const [reviewRound, setReviewRound] = useState(saved?.guidedReviewRound ?? 0)
  const latestMessageRef = useRef<HTMLDivElement | null>(null)
  const strictValidation = strictAssessment || Boolean(conversationTurns?.length)
  const completeLesson = () => {
    updateUiState({ guidedLessonKey: null, guidedExerciseIndex: 0, guidedAnswer: null, guidedBuiltTokens: [], guidedMistakes: 0, guidedFinished: false, guidedChoiceSeed: 0, guidedConversationStep: 0, guidedPracticeStarted: false, guidedChapterStarted: false, guidedValidated: false, guidedValidationCorrect: null, guidedInitialMistakeIndexes: [], guidedInitialPassComplete: false, guidedReviewQueue: null, guidedReviewPosition: 0, guidedReviewMistakeIndexes: [], guidedReviewRound: 0 })
    onComplete()
  }

  useEffect(() => {
    if (!saved?.guidedChoiceSeed) setChoiceSeed(Math.floor(Math.random() * 1_000_000) + 1)
  }, [saved?.guidedChoiceSeed])

  useEffect(() => {
    updateUiState({ guidedLessonKey: persistenceKey, guidedExerciseIndex: exerciseIndex, guidedAnswer: answer, guidedBuiltTokens: builtTokens, guidedMistakes: mistakes, guidedFinished: finished, guidedChoiceSeed: choiceSeed, guidedConversationStep: conversationStep, guidedPracticeStarted: practiceStarted, guidedChapterStarted: chapterStarted, guidedValidated: validated, guidedValidationCorrect: validationCorrect, guidedInitialMistakeIndexes: initialMistakeIndexes, guidedInitialPassComplete: initialPassComplete, guidedReviewQueue: reviewQueue, guidedReviewPosition: reviewPosition, guidedReviewMistakeIndexes: reviewMistakeIndexes, guidedReviewRound: reviewRound })
  }, [persistenceKey, exerciseIndex, answer, builtTokens, mistakes, finished, choiceSeed, conversationStep, practiceStarted, chapterStarted, validated, validationCorrect, initialMistakeIndexes, initialPassComplete, reviewQueue, reviewPosition, reviewMistakeIndexes, reviewRound, updateUiState])

  useEffect(() => () => stopSpeech(), [])

  useEffect(() => {
    if (!practiceStarted) latestMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [conversationStep, practiceStarted])

  // Discovery remains progressive, but every assessment session mixes its
  // question types and order. A fresh visit therefore cannot be solved by
  // remembering the position or the sequence from the previous visit.
  const assessmentExercises: GuidedExercise[] = [
    ...words.map((word) => ({ kind: 'recognize' as const, word })),
    ...words.filter((word) => word.word.trim().split(/\s+/).length > 1).map((word) => ({ kind: 'build' as const, word })),
    ...dialogueExercises,
  ].sort((a, b) => {
    const exerciseKey = (item: GuidedExercise) => `${item.kind}-${item.word.word}`
    return exerciseHash(exerciseKey(a), choiceSeed + 104729) - exerciseHash(exerciseKey(b), choiceSeed + 104729)
  })
  const exercises: GuidedExercise[] = [
    ...(introWords?.length ? [] : words.map((word) => ({ kind: 'discover' as const, word }))),
    ...assessmentExercises,
  ]
  const activeExerciseIndex = reviewQueue ? (reviewQueue[reviewPosition] ?? 0) : exerciseIndex
  const exercise = exercises[activeExerciseIndex]
  const shownPosition = reviewQueue ? reviewPosition : exerciseIndex
  const shownTotal = reviewQueue ? reviewQueue.length : exercises.length
  const progress = finished ? 100 : Math.round(((shownPosition + 1) / shownTotal) * 100)

  const advance = () => {
    setAnswer(null)
    setBuiltTokens([])
    setValidated(false)
    setValidationCorrect(null)
    if (!strictValidation) {
      if (exerciseIndex + 1 < exercises.length) setExerciseIndex((current) => current + 1)
      else setFinished(true)
      return
    }
    if (reviewQueue) {
      const correctionAdvance = advanceCorrection(reviewQueue, reviewPosition, reviewMistakeIndexes)
      if (correctionAdvance.kind === 'next') {
        setReviewPosition(correctionAdvance.position)
      } else if (correctionAdvance.kind === 'repeat') {
        setReviewQueue(correctionAdvance.queue)
        setReviewPosition(0)
        setReviewMistakeIndexes([])
        setReviewRound((current) => current + 1)
      } else {
        setFinished(true)
      }
    } else if (exerciseIndex + 1 < exercises.length) {
      setExerciseIndex((current) => current + 1)
    } else {
      setInitialPassComplete(true)
    }
  }
  const choose = (value: string, expected: string) => {
    if (validated) return
    setAnswer(value)
    if (strictValidation) return
    const correct = value === expected
    playAnswerSound(correct)
    if (!correct) setMistakes((current) => current + 1)
  }
  const validateAttempt = (correct: boolean) => {
    if (validated) return
    setValidated(true)
    setValidationCorrect(correct)
    playAnswerSound(correct)
    if (correct) return
    setMistakes((current) => current + 1)
    if (reviewQueue) {
      setReviewMistakeIndexes((current) => addUniqueMistake(current, activeExerciseIndex))
    } else {
      setInitialMistakeIndexes((current) => addUniqueMistake(current, activeExerciseIndex))
    }
  }
  const startCorrections = () => {
    setReviewQueue(initialMistakeIndexes)
    setReviewPosition(0)
    setReviewMistakeIndexes([])
    setReviewRound(1)
    setInitialPassComplete(false)
    setAnswer(null)
    setBuiltTokens([])
    setValidated(false)
    setValidationCorrect(null)
  }
  const choicesFor = (correct: Word) => {
    // Pull distractors from the complete lesson pool, eliminate duplicate
    // meanings, and vary both the distractors and the correct-answer position
    // for every question and every new session.
    const seed = exerciseHash(correct.word, choiceSeed + activeExerciseIndex * 8191 + reviewRound * 65537)
    return variedWordOptions(correct, allWords, seed, lang)
  }
  const startChapterDialogue = () => {
    setChapterStarted(true)
    const firstTurn = conversationTurns?.[0]
    if (firstTurn) void speakArabic(firstTurn.word.word)
  }
  const continueConversation = () => {
    if (!conversationTurns?.length) return
    const nextTurn = conversationTurns[conversationStep]
    setConversationStep((current) => Math.min(current + 1, conversationTurns.length))
    if (nextTurn) void speakArabic(nextTurn.word.word)
  }

  if (!chapterStarted && introWords?.length) return <div>
    <BackBar title={title} onBack={onBack} />
    <div className="p-5">
      <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{lang === 'fr' ? `Chapitre ${lessonNumber}` : lang === 'ar' ? `الفصل ${lessonNumber}` : `Chapter ${lessonNumber}`}</p>
        <h2 className="gold-text mt-2 text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{conversationTurns?.length ? (lang === 'fr' ? 'Découvrez d’abord les expressions indispensables. Vous les retrouverez ensuite dans le dialogue et les exercices.' : lang === 'ar' ? 'تعرّف أولاً إلى العبارات الأساسية، ثم ستجدها في الحوار والتمارين.' : 'First discover the essential expressions. You will then use them in the dialogue and exercises.') : (lang === 'fr' ? 'Découvrez les expressions avec leur sens et leur prononciation, puis entraînez-vous avec les exercices.' : lang === 'ar' ? 'تعرّف إلى العبارات ومعانيها ونطقها، ثم تدرّب عليها في التمارين.' : 'Study the expressions, their meaning and pronunciation, then practise them in the exercises.')}</p>
      </div>
      <div className="mt-5 space-y-3">{introWords.map((word) => <article key={word.word} className="rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3"><div><p dir="rtl" className="font-arabic text-2xl font-bold text-primary">{word.word}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">{word.translit}</p></div><ListenCircle text={word.word} label={lang === 'fr' ? 'Écouter' : lang === 'ar' ? 'استمع' : 'Listen'} /></div>
        <p className="mt-3 text-sm font-semibold">{localized(word.meaning, lang)}</p>
      </article>)}</div>
      <button type="button" onClick={startChapterDialogue} className="gold-gradient mt-6 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{conversationTurns?.length ? (lang === 'fr' ? 'Commencer' : lang === 'ar' ? 'ابدأ' : 'Start') : (lang === 'fr' ? 'Commencer les exercices' : lang === 'ar' ? 'ابدأ التمارين' : 'Start exercises')}</button>
    </div>
  </div>

  if (!practiceStarted && conversationTurns?.length) {
    const visibleTurns = conversationTurns.slice(0, conversationStep)
    const dialogueComplete = conversationStep >= conversationTurns.length
    const speakerName = (speaker: 'a' | 'b') => speaker === 'a'
      ? (lang === 'fr' ? 'Ahmed' : lang === 'ar' ? 'أحمد' : 'Ahmed')
      : (lang === 'fr' ? 'Youssef' : lang === 'ar' ? 'يوسف' : 'Youssef')
    return <div>
      <BackBar title={title} onBack={onBack} />
      <div className="p-5">
        <div className="mb-4 rounded-3xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-bold">{lang === 'fr' ? 'Premiers échanges' : lang === 'ar' ? 'الحوار الأول' : 'First conversation'}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lang === 'fr' ? 'Observez comment les deux personnes comprennent la situation et répondent naturellement. Chaque réplique reste visible pour suivre le fil.' : lang === 'ar' ? 'لاحظ كيف يفهم الشخصان الموقف ويجيبان بصورة مناسبة. تبقى كل جملة ظاهرة لمتابعة الحوار.' : 'See how the speakers understand the situation and respond naturally. Every line stays visible so you can follow the exchange.'}</p>
        </div>
        <div className="max-h-[58vh] space-y-3 overflow-y-auto rounded-3xl border border-border bg-secondary/30 p-4" aria-live="polite">
          {visibleTurns.map((turn, index) => {
            const ownSide = turn.speaker === 'a'
            return <div key={`${turn.word.word}-${index}`} ref={index === visibleTurns.length - 1 ? latestMessageRef : undefined} className={`flex ${ownSide ? 'justify-end' : 'justify-start'}`}>
              <article className={`max-w-[88%] rounded-3xl px-4 py-3 shadow-sm ${ownSide ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border border-border bg-card text-foreground'}`}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className={`text-[11px] font-bold ${ownSide ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{speakerName(turn.speaker)}</span>
                  <ListenCircle text={turn.word.word} label={lang === 'fr' ? 'Écouter' : lang === 'ar' ? 'استمع' : 'Listen'} />
                </div>
                <p dir="rtl" className="font-arabic text-2xl font-bold leading-relaxed">{turn.word.word}</p>
                <p dir="ltr" className={`mt-1 text-xs font-semibold ${ownSide ? 'text-primary-foreground/85' : 'text-primary'}`}>{turn.word.translit}</p>
                <p className={`mt-1 text-sm ${ownSide ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>{localized(turn.word.meaning, lang)}</p>
              </article>
            </div>
          })}
        </div>
        {!dialogueComplete ? <button type="button" onClick={continueConversation} className="gold-gradient mt-5 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">
          {lang === 'fr' ? 'Continuer' : lang === 'ar' ? 'متابعة' : 'Continue'}
        </button> : <section className="mt-5 rounded-3xl border border-primary/20 bg-primary/5 p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <h2 className="mt-2 font-bold">{lang === 'fr' ? 'Dialogue terminé' : lang === 'ar' ? 'انتهى الحوار' : 'Conversation complete'}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{lang === 'fr' ? 'Passez maintenant aux exercices sur les expressions que vous venez de découvrir.' : lang === 'ar' ? 'انتقل الآن إلى تمارين العبارات التي تعلمتها.' : 'Now practise the expressions you have just discovered.'}</p>
          <button type="button" onClick={() => { stopSpeech(); setPracticeStarted(true); setExerciseIndex(0) }} className="gold-gradient mt-4 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Terminé' : lang === 'ar' ? 'تمّ' : 'Done'}</button>
        </section>}
      </div>
    </div>
  }

  if (strictValidation && initialPassComplete) {
    const { score: initialScore } = initialAttemptSummary(exercises.length, initialMistakeIndexes)
    return <div>
      <BackBar title={title} onBack={onBack} />
      <div className="flex flex-col items-center p-6 text-center">
        <ProgressRing value={Math.round((initialScore / exercises.length) * 100)} size={116} stroke={9}><span className="text-xl font-bold">{initialScore}/{exercises.length}</span></ProgressRing>
        <h2 className="gold-text mt-5 text-2xl font-bold">{lang === 'fr' ? 'Premier passage terminé' : lang === 'ar' ? 'انتهت المحاولة الأولى' : 'First attempt complete'}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{lang === 'fr' ? `Résultat initial : ${initialScore} bonne${initialScore > 1 ? 's' : ''} réponse${initialScore > 1 ? 's' : ''} sur ${exercises.length}.` : lang === 'ar' ? `النتيجة الأولى: ${initialScore} من ${exercises.length}.` : `Initial result: ${initialScore} out of ${exercises.length}.`}</p>
        {initialMistakeIndexes.length ? <>
          <p className="mt-3 text-sm font-semibold text-foreground">{lang === 'fr' ? `${initialMistakeIndexes.length} erreur${initialMistakeIndexes.length > 1 ? 's' : ''} à retravailler.` : lang === 'ar' ? `${initialMistakeIndexes.length} أخطاء للمراجعة.` : `${initialMistakeIndexes.length} mistake${initialMistakeIndexes.length === 1 ? '' : 's'} to review.`}</p>
          <button type="button" onClick={startCorrections} className="gold-gradient mt-7 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{lang === 'fr' ? 'Corriger mes erreurs' : lang === 'ar' ? 'تصحيح أخطائي' : 'Correct my mistakes'}</button>
        </> : <button type="button" onClick={completeLesson} className="gold-gradient mt-7 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{lang === 'fr' ? 'Terminer la séance' : lang === 'ar' ? 'إنهاء الدرس' : 'Finish session'}</button>}
      </div>
    </div>
  }

  if (finished) return <div>
    <BackBar title={title} onBack={onBack} />
    <div className="flex flex-col items-center p-6 text-center">
      <ProgressRing value={100} size={116} stroke={9}><CheckCircle2 className="h-9 w-9 text-emerald-600" /></ProgressRing>
      <h2 className="gold-text mt-5 text-2xl font-bold">{strictValidation ? (lang === 'fr' ? 'Séance validée !' : lang === 'ar' ? 'تم اجتياز الدرس!' : 'Session completed!') : (lang === 'fr' ? 'Leçon terminée !' : lang === 'ar' ? 'اكتمل الدرس!' : 'Lesson completed!')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{strictValidation ? (lang === 'fr' ? `Résultat initial conservé : ${exercises.length - initialMistakeIndexes.length}/${exercises.length} · ${initialMistakeIndexes.length} erreur${initialMistakeIndexes.length > 1 ? 's' : ''} retravaillée${initialMistakeIndexes.length > 1 ? 's' : ''}.` : lang === 'ar' ? `النتيجة الأولى: ${exercises.length - initialMistakeIndexes.length}/${exercises.length} · تمت مراجعة الأخطاء.` : `Initial result kept: ${exercises.length - initialMistakeIndexes.length}/${exercises.length} · mistakes reviewed.`) : (lang === 'fr' ? `${words.length} expressions travaillées · ${mistakes} erreur${mistakes > 1 ? 's' : ''}` : lang === 'ar' ? `${words.length} عبارات · ${mistakes} أخطاء` : `${words.length} expressions practised · ${mistakes} mistake${mistakes === 1 ? '' : 's'}`)}</p>
      <div className="mt-6 w-full rounded-3xl border border-primary/20 bg-primary/5 p-5 text-start">
        <p className="text-sm font-bold">{lang === 'fr' ? 'À retenir' : lang === 'ar' ? 'للمراجعة' : 'Key phrases'}</p>
        <div className="mt-3 space-y-3">{words.map((word) => <div key={word.word} className="flex items-center justify-between gap-3"><div><p dir="rtl" className="font-arabic text-xl">{word.word}</p><p className="text-xs text-muted-foreground">{localized(word.meaning, lang)}</p></div><ListenCircle text={word.word} label={lang === 'fr' ? 'Écouter' : lang === 'ar' ? 'استمع' : 'Listen'} /></div>)}</div>
      </div>
      <button type="button" onClick={completeLesson} className="gold-gradient mt-6 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{lessonNumber < lessonCount ? (lang === 'fr' ? 'Leçon suivante' : lang === 'ar' ? 'الدرس التالي' : 'Next lesson') : (lang === 'fr' ? 'Terminer le parcours' : lang === 'ar' ? 'إنهاء المسار' : 'Finish course')}</button>
    </div>
  </div>

  const instruction = exercise.kind === 'discover'
    ? (lang === 'fr' ? 'Écoutez, puis répétez à voix haute' : lang === 'ar' ? 'استمع ثم كرر بصوت عالٍ' : 'Listen, then repeat aloud')
    : exercise.kind === 'recognize'
      ? (lang === 'fr' ? 'Choisissez la bonne traduction' : lang === 'ar' ? 'اختر الترجمة الصحيحة' : 'Choose the correct translation')
      : exercise.kind === 'build'
        ? (lang === 'fr' ? 'Remettez les mots dans le bon ordre' : lang === 'ar' ? 'رتب الكلمات ترتيبًا صحيحًا' : 'Put the words in the correct order')
        : (lang === 'fr' ? 'Choisissez la réponse naturelle' : lang === 'ar' ? 'اختر الرد المناسب' : 'Choose the natural reply')

  return <div>
    <BackBar title={`${title} · ${lessonNumber}/${lessonCount}`} onBack={onBack} />
    <div className="p-5">
      {lessonNote && <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Repère pédagogique : </strong>{lessonNote}</div>}
      <div className="mb-5 flex items-center gap-3"><ProgressRing value={progress} size={58} stroke={6}><span className="text-[10px] font-bold">{progress}%</span></ProgressRing><div><p className="text-xs font-bold uppercase tracking-wide text-primary">{reviewQueue ? (lang === 'fr' ? 'Correction · ' : lang === 'ar' ? 'مراجعة · ' : 'Review · ') : ''}{instruction}</p><p className="mt-1 text-xs text-muted-foreground">{shownPosition + 1} / {shownTotal}</p></div></div>

      {exercise.kind === 'discover' && <section className="relief-panel rounded-3xl border border-border p-6 text-center">
        <span className="text-6xl" aria-hidden>💬</span>
        <p dir="rtl" className="gold-text mt-4 font-arabic text-4xl leading-relaxed">{exercise.word.word}</p>
        <p className="mt-2 text-sm text-muted-foreground">{exercise.word.translit}</p>
        <p className="mt-2 text-lg font-semibold">{localized(exercise.word.meaning, lang)}</p>
        <div className="mt-6 flex justify-center gap-3"><ListenButton text={exercise.word.word} label={lang === 'fr' ? 'Écouter' : lang === 'ar' ? 'استمع' : 'Listen'} /><WordPronouncePractice word={exercise.word.word} lang={lang} /></div>
        <button type="button" onClick={advance} className="gold-gradient mt-6 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Continuer' : lang === 'ar' ? 'متابعة' : 'Continue'}</button>
      </section>}

      {exercise.kind === 'recognize' && <section className="rounded-3xl border border-border bg-card p-5 text-center">
        <div className="flex items-center justify-center gap-3"><p dir="rtl" className="font-arabic text-4xl text-primary">{exercise.word.word}</p><ListenCircle text={exercise.word.word} label={lang === 'fr' ? 'Écouter' : lang === 'ar' ? 'استمع' : 'Listen'} /></div>
        <div className="mt-6 grid gap-3">{choicesFor(exercise.word).map((choice) => { const selected = answer === choice.word; const correct = choice.word === exercise.word.word; const reveal = strictValidation && validated; return <button key={choice.word} type="button" disabled={reveal || (!strictValidation && answer === exercise.word.word)} onClick={() => choose(choice.word, exercise.word.word)} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${selected ? reveal ? correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700' : 'border-destructive bg-destructive/10 text-destructive' : strictValidation ? 'border-primary bg-primary/10' : correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700' : 'border-destructive bg-destructive/10 text-destructive' : 'border-border bg-background'}`}>{localized(choice.meaning, lang)}</button>})}</div>
        {strictValidation ? <>
          {!validated && <button type="button" disabled={!answer} onClick={() => validateAttempt(answer === exercise.word.word)} className="gold-gradient mt-5 w-full rounded-2xl py-3 font-semibold text-primary-foreground disabled:opacity-40">{lang === 'fr' ? 'Valider' : lang === 'ar' ? 'تحقق' : 'Check'}</button>}
          {validated && <div className={`mt-4 rounded-2xl p-4 text-start ${validationCorrect ? 'bg-emerald-500/10 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}><p className="font-semibold">{validationCorrect ? (lang === 'fr' ? 'Bonne réponse.' : lang === 'ar' ? 'إجابة صحيحة.' : 'Correct answer.') : (lang === 'fr' ? 'Réponse incorrecte.' : lang === 'ar' ? 'إجابة غير صحيحة.' : 'Incorrect answer.')}</p>{!validationCorrect && <p className="mt-2 text-sm text-foreground">{lang === 'fr' ? 'Réponse attendue :' : lang === 'ar' ? 'الإجابة الصحيحة:' : 'Expected answer:'} <strong>{localized(exercise.word.meaning, lang)}</strong></p>}</div>}
          {validated && <button type="button" onClick={advance} className="gold-gradient mt-4 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Suivant' : lang === 'ar' ? 'التالي' : 'Next'}</button>}
        </> : <>{answer && answer !== exercise.word.word && <p className="mt-3 text-sm font-semibold text-destructive">{lang === 'fr' ? 'Réessayez.' : lang === 'ar' ? 'حاول مرة أخرى.' : 'Try again.'}</p>}{answer === exercise.word.word && <button type="button" onClick={advance} className="gold-gradient mt-5 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Continuer' : lang === 'ar' ? 'متابعة' : 'Continue'}</button>}</>}
      </section>}

      {exercise.kind === 'build' && (() => {
        const correctTokens = exercise.word.word.trim().split(/\s+/)
        const distractorCount = Math.max(3, 5 - correctTokens.length)
        const distractorTokens = Array.from(new Set(
          allWords
            .filter((word) => word.word !== exercise.word.word)
            .flatMap((word) => word.word.trim().split(/\s+/))
            .filter((token) => !correctTokens.includes(token)),
        ))
          .sort((a, b) => {
            const tokenScore = (token: string) => Array.from(token).reduce((sum, character) => sum * 31 + character.charCodeAt(0), choiceSeed + activeExerciseIndex * 97 + reviewRound * 1009)
            return tokenScore(a) - tokenScore(b)
          })
          .slice(0, distractorCount)
        const available = [...correctTokens, ...distractorTokens].sort((a, b) => {
          const tokenScore = (token: string) => Array.from(token).reduce((sum, character) => sum * 37 + character.charCodeAt(0), choiceSeed + activeExerciseIndex * 53 + reviewRound * 1013)
          return tokenScore(a) - tokenScore(b)
        })
        const complete = builtTokens.length === correctTokens.length
        const correct = complete && builtTokens.every((token, index) => token === correctTokens[index])
        return <section className="rounded-3xl border border-border bg-card p-5 text-center">
          <p className="text-sm font-semibold">{localized(exercise.word.meaning, lang)}</p>
          <div dir="rtl" className="mt-4 flex min-h-16 flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-3">{builtTokens.map((token, index) => <button key={`${token}-${index}`} type="button" disabled={strictValidation && validated} onClick={() => setBuiltTokens((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl bg-card px-3 py-2 font-arabic text-2xl disabled:opacity-70">{token}</button>)}</div>
          <div dir="rtl" className="mt-4 flex flex-wrap justify-center gap-2">{available.map((token, index) => { const usedCount = builtTokens.filter((item) => item === token).length; const priorCount = available.slice(0, index).filter((item) => item === token).length; return <button key={`${token}-${index}`} type="button" disabled={usedCount > priorCount || (strictValidation && validated)} onClick={() => setBuiltTokens((current) => [...current, token])} className="rounded-xl border border-border bg-background px-3 py-2 font-arabic text-2xl disabled:opacity-25">{token}</button>})}</div>
          {strictValidation ? <>
            {!validated && <button type="button" disabled={!builtTokens.length} onClick={() => validateAttempt(correct)} className="gold-gradient mt-5 w-full rounded-2xl py-3 font-semibold text-primary-foreground disabled:opacity-40">{lang === 'fr' ? 'Valider' : lang === 'ar' ? 'تحقق' : 'Check'}</button>}
            {validated && <div className={`mt-4 rounded-2xl p-4 ${validationCorrect ? 'bg-emerald-500/10 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}><p className="font-semibold">{validationCorrect ? (lang === 'fr' ? 'Bonne réponse.' : lang === 'ar' ? 'إجابة صحيحة.' : 'Correct answer.') : (lang === 'fr' ? 'Ordre incorrect.' : lang === 'ar' ? 'الترتيب غير صحيح.' : 'Incorrect order.')}</p>{!validationCorrect && <><p className="mt-2 text-xs text-foreground">{lang === 'fr' ? 'Ordre attendu :' : lang === 'ar' ? 'الترتيب الصحيح:' : 'Expected order:'}</p><p dir="rtl" className="mt-1 font-arabic text-2xl text-foreground">{exercise.word.word}</p></>}</div>}
            {validated && <button type="button" onClick={advance} className="gold-gradient mt-4 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Suivant' : lang === 'ar' ? 'التالي' : 'Next'}</button>}
          </> : <>{complete && !correct && <button type="button" onClick={() => { setMistakes((current) => current + 1); playAnswerSound(false); setBuiltTokens([]) }} className="mt-5 w-full rounded-2xl border border-destructive py-3 font-semibold text-destructive">{lang === 'fr' ? 'Ordre incorrect — réessayer' : lang === 'ar' ? 'الترتيب غير صحيح — حاول مرة أخرى' : 'Incorrect order — try again'}</button>}{correct && <button type="button" onClick={() => { playAnswerSound(true); advance() }} className="gold-gradient mt-5 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Bonne réponse — continuer' : lang === 'ar' ? 'إجابة صحيحة — متابعة' : 'Correct — continue'}</button>}</>}
        </section>
      })()}

      {exercise.kind === 'dialogue' && <section className="rounded-3xl border border-border bg-card p-5">
        <div className="rounded-2xl bg-secondary/50 p-4"><p dir="rtl" className="font-arabic text-2xl">{exercise.word.word}</p><p className="mt-1 text-xs text-muted-foreground">{localized(exercise.word.meaning, lang)}</p></div>
        <p className="my-4 text-center text-sm font-semibold">{lang === 'fr' ? 'Que répondez-vous ?' : lang === 'ar' ? 'بماذا تجيب؟' : 'How do you reply?'}</p>
        <div className="grid gap-3">{choicesFor(exercise.reply).map((choice) => { const selected = answer === choice.word; const correct = choice.word === exercise.reply.word; const reveal = strictValidation && validated; return <button key={choice.word} type="button" disabled={reveal || (!strictValidation && answer === exercise.reply.word)} onClick={() => choose(choice.word, exercise.reply.word)} className={`rounded-2xl border px-4 py-3 text-start ${selected ? reveal ? correct ? 'border-emerald-500 bg-emerald-500/10' : 'border-destructive bg-destructive/10' : strictValidation ? 'border-primary bg-primary/10' : correct ? 'border-emerald-500 bg-emerald-500/10' : 'border-destructive bg-destructive/10' : 'border-border'}`}><span dir="rtl" className="block font-arabic text-xl">{choice.word}</span><span className="mt-1 block text-xs text-muted-foreground">{localized(choice.meaning, lang)}</span></button>})}</div>
        {strictValidation ? <>
          {!validated && <button type="button" disabled={!answer} onClick={() => validateAttempt(answer === exercise.reply.word)} className="gold-gradient mt-5 w-full rounded-2xl py-3 font-semibold text-primary-foreground disabled:opacity-40">{lang === 'fr' ? 'Valider' : lang === 'ar' ? 'تحقق' : 'Check'}</button>}
          {validated && <div className={`mt-4 rounded-2xl p-4 ${validationCorrect ? 'bg-emerald-500/10 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}><p className="font-semibold">{validationCorrect ? (lang === 'fr' ? 'Bonne réponse.' : lang === 'ar' ? 'إجابة صحيحة.' : 'Correct answer.') : (lang === 'fr' ? 'Réponse incorrecte.' : lang === 'ar' ? 'إجابة غير صحيحة.' : 'Incorrect answer.')}</p>{!validationCorrect && <div className="mt-2 text-foreground"><p className="text-xs">{lang === 'fr' ? 'Réponse naturelle attendue :' : lang === 'ar' ? 'الجواب المناسب:' : 'Expected natural reply:'}</p><p dir="rtl" className="mt-1 font-arabic text-xl">{exercise.reply.word}</p><p className="text-xs text-muted-foreground">{localized(exercise.reply.meaning, lang)}</p></div>}</div>}
          {validated && <button type="button" onClick={advance} className="gold-gradient mt-4 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Suivant' : lang === 'ar' ? 'التالي' : 'Next'}</button>}
        </> : <>{answer === exercise.reply.word && <button type="button" onClick={advance} className="gold-gradient mt-5 w-full rounded-2xl py-3 font-semibold text-primary-foreground">{lang === 'fr' ? 'Continuer' : lang === 'ar' ? 'متابعة' : 'Continue'}</button>}</>}
      </section>}
    </div>
  </div>
}

function VocabularyView({ initialCategoryId, initialLessonIndex, directEntry = false, onBack }: { initialCategoryId?: string; initialLessonIndex?: number; directEntry?: boolean; onBack: () => void }) {
  const { t, lang } = useI18n()
  const { progress, markValidatedItems } = useProgress()
  const savedGuidedKey = progress.ui.guidedLessonKey
  const savedGuidedSeparator = savedGuidedKey?.lastIndexOf(':') ?? -1
  const savedGuidedCategory = savedGuidedSeparator > 0 ? savedGuidedKey!.slice(0, savedGuidedSeparator) : null
  const savedGuidedLesson = savedGuidedSeparator > 0 ? Number(savedGuidedKey!.slice(savedGuidedSeparator + 1)) : null
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId ?? savedGuidedCategory)
  const [wordIndex, setWordIndex] = useState<number | null>(null)
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null)
  const [mistakeIndexes, setMistakeIndexes] = useState<number[]>([])
  const [results, setResults] = useState(false)
  const [correctionQueue, setCorrectionQueue] = useState<number[] | null>(null)
  const [correctionMistakes, setCorrectionMistakes] = useState<number[]>([])
  const [correctionsComplete, setCorrectionsComplete] = useState(false)
  const [correctionRound, setCorrectionRound] = useState(0)
  const [guidedLessonIndex, setGuidedLessonIndex] = useState<number | null>(directEntry && initialCategoryId ? (initialLessonIndex ?? 0) : (Number.isInteger(savedGuidedLesson) ? savedGuidedLesson : null))
  const introductions = VOCABULARY.find((group) => group.id === 'introductions')?.words ?? []
  const conversation = VOCABULARY.find((group) => group.id === 'conversation')?.words ?? []
  const communicationHelp = VOCABULARY.find((group) => group.id === 'communication-help')?.words ?? []
  const dailyObjects = VOCABULARY.find((group) => group.id === 'daily')?.words ?? []
  const family = VOCABULARY.find((group) => group.id === 'family')?.words ?? []
  const categories = [
    ...VOCABULARY,
    { id: 'phrases', label: { fr: 'Saluer et répondre', ar: 'التحية والرد', en: 'Greetings and replies' }, words: PHRASES },
    { id: 'lesson-greetings', label: { fr: 'Faire connaissance', ar: 'التَّعَارُف', en: 'Getting acquainted' }, words: [...PHRASES, ...introductions, ...conversation] },
    { id: 'lesson-understanding', label: { fr: 'Se faire comprendre', ar: 'طَلَبُ التَّوْضِيح', en: 'Making yourself understood' }, words: communicationHelp },
    { id: 'lesson-objects', label: { fr: 'Désigner les objets', ar: 'تسمية الأشياء', en: 'Name everyday objects' }, words: dailyObjects.slice(0, 12) },
    { id: 'lesson-family', label: { fr: 'Parler de sa famille', ar: 'الحديث عن العائلة', en: 'Talk about family' }, words: family },
  ]
  const category = categories.find((item) => item.id === categoryId)

  if (category && guidedLessonIndex !== null) {
    const greetingDialogueSpec: { speaker: 'a' | 'b'; text: string }[] = [
      { speaker: 'a', text: 'السَّلَامُ عَلَيْكُم' },
      { speaker: 'b', text: 'وَعَلَيْكُمُ السَّلَام' },
      { speaker: 'a', text: 'كَيْفَ حَالُك؟' },
      { speaker: 'b', text: 'أَنَا بِخَيْر' },
      { speaker: 'b', text: 'وَأَنْتَ؟' },
      { speaker: 'a', text: 'الْحَمْدُ لِلَّه' },
      { speaker: 'b', text: 'مَا اسْمُكَ؟' },
      { speaker: 'a', text: 'اِسْمِي أَحْمَد' },
      { speaker: 'b', text: 'مِنْ أَيْنَ أَنْتَ؟' },
      { speaker: 'a', text: 'أَنَا مِنْ فَرَنْسَا' },
      { speaker: 'b', text: 'تَشَرَّفْتُ بِمَعْرِفَتِكَ' },
      { speaker: 'a', text: 'مَعَ السَّلَامَة' },
      { speaker: 'b', text: 'إِلَى اللِّقَاء' },
    ]
    // The chat-style progressive exchange is an intentional variation used
    // only by “Faire connaissance”. Other chapters introduce their material
    // with ordinary expression cards before the same assessment activities.
    const dialogueSpec = category.id === 'lesson-greetings' ? greetingDialogueSpec : undefined
    const guidedConversation = dialogueSpec
      ? dialogueSpec.flatMap((turn) => {
        const word = category.words.find((candidate) => candidate.word === turn.text)
        return word ? [{ speaker: turn.speaker, word }] : []
      })
      : undefined
    const singleChapter = COMMUNICATION_CATEGORY_IDS.includes(category.id as (typeof COMMUNICATION_CATEGORY_IDS)[number])
    const lessonCount = singleChapter ? 1 : Math.ceil(category.words.length / GUIDED_LESSON_SIZE)
    const lessonWords = guidedConversation?.length
      ? guidedConversation.map((turn) => turn.word)
      : category.id === 'lesson-understanding'
        ? category.words
      : singleChapter
        ? category.words
      : category.words.slice(guidedLessonIndex * GUIDED_LESSON_SIZE, (guidedLessonIndex + 1) * GUIDED_LESSON_SIZE)
    const introWords = category.id === 'lesson-greetings'
      ? ['السَّلَامُ عَلَيْكُم', 'شُكْرًا جَزِيلًا', 'مَعَ السَّلَامَة'].flatMap((text) => category.words.find((word) => word.word === text) ?? [])
      : category.id === 'lesson-understanding'
        ? category.words
      : singleChapter
        ? category.words
        : undefined
    const lessonNotes: Record<string, string> = {
      'lesson-greetings': 'Le dialogue emploie les formes adressées à un homme. Les variantes adressées à une femme sont également proposées dans les exercices : ـكَ / أَنْتَ devient ـكِ / أَنْتِ.',
      'lesson-understanding': 'En arabe littéraire, la terminaison change selon l’interlocuteur : تُعِيدَ / تَكَلَّمْ pour un homme, تُعِيدِي / تَكَلَّمِي pour une femme.',
      'lesson-objects': 'Les noms sont appris ici seuls. La désignation avec « ceci / cela » reste à préparer et n’est pas simulée.',
      'lesson-family': 'Les 16 termes avancent par petites séries : famille proche, grands-parents, branches paternelle et maternelle, puis conjoint et descendants. Les possessifs « mon / ma » restent à préparer.',
    }
    return <GuidedLanguageLesson persistenceKey={`${category.id}:${guidedLessonIndex}`} title={localized(category.label, lang)} lessonNote={lessonNotes[category.id]} words={lessonWords} allWords={category.words} conversationTurns={guidedConversation} introWords={introWords} strictAssessment={singleChapter} lessonNumber={guidedLessonIndex + 1} lessonCount={lessonCount} onBack={() => directEntry ? onBack() : setGuidedLessonIndex(null)} onComplete={() => {
      // Lesson mastery counts the stable lesson key once. Word evidence is
      // stored separately so daily practice may reuse only expressions the
      // learner has actually completed here; mastery filters these word keys.
      markValidatedItems('vocabulary', [
        `lesson:${category.id}:${guidedLessonIndex}`,
        ...lessonWords.map((word) => `guided:${category.id}:${word.word}`),
      ])
      if (guidedLessonIndex + 1 < lessonCount) setGuidedLessonIndex((current) => (current ?? 0) + 1)
      else if (directEntry) onBack()
      else { setGuidedLessonIndex(null); setCategoryId(null) }
    }} />
  }

  if (category && practiceMode && results) {
    const correctCount = category.words.length - mistakeIndexes.length
    const percentage = Math.round((correctCount / category.words.length) * 100)
    return <div>
      <BackBar title={localized(category.label, lang)} onBack={() => { setResults(false); setPracticeMode(null); setMistakeIndexes([]) }} />
      <div className="flex flex-col items-center p-6 text-center">
        <ProgressRing value={percentage} size={112} stroke={9}><span className="text-xl font-bold">{percentage}%</span></ProgressRing>
        <h2 className="gold-text mt-5 text-2xl font-bold">{lang === 'en' ? 'Activity completed' : lang === 'ar' ? 'اكتمل النشاط' : 'Activité terminée'}</h2>
        <p className="mt-2 text-muted-foreground">{lang === 'en' ? 'Initial score' : lang === 'ar' ? 'النتيجة الأولى' : 'Score initial'} : <strong className="text-foreground">{correctCount}/{category.words.length}</strong></p>
        {correctionsComplete && mistakeIndexes.length > 0 && <p className="mt-3 text-sm font-semibold text-emerald-600">{lang === 'fr' ? `${mistakeIndexes.length} erreur${mistakeIndexes.length > 1 ? 's' : ''} retravaillée${mistakeIndexes.length > 1 ? 's' : ''}.` : lang === 'ar' ? 'تمت مراجعة الأخطاء.' : 'Mistakes reviewed.'}</p>}
        {mistakeIndexes.length > 0 && !correctionsComplete ? <button type="button" onClick={() => { setCorrectionQueue(mistakeIndexes); setCorrectionMistakes([]); setCorrectionRound(1); setWordIndex(mistakeIndexes[0]); setResults(false) }} className="gold-gradient mt-7 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{lang === 'en' ? 'Correct my mistakes' : lang === 'ar' ? 'تصحيح أخطائي' : 'Corriger mes erreurs'}</button> : <button type="button" onClick={() => { setResults(false); setPracticeMode(null); setMistakeIndexes([]); setCorrectionsComplete(false); setCorrectionRound(0) }} className="gold-gradient mt-7 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{lang === 'en' ? 'Finish' : lang === 'ar' ? 'إنهاء' : 'Terminer'}</button>}
      </div>
    </div>
  }

  if (category && practiceMode && wordIndex !== null) {
    const word = category.words[wordIndex]
    const stimulus = resolveVocabularyStimulus(category.id, word, lang)
    const nextWord = () => {
      if (correctionQueue) {
        const queuePosition = correctionQueue.indexOf(wordIndex)
        if (queuePosition + 1 < correctionQueue.length) setWordIndex(correctionQueue[queuePosition + 1])
        else if (correctionMistakes.length) {
          const nextQueue = [...new Set(correctionMistakes)]
          setCorrectionQueue(nextQueue)
          setCorrectionMistakes([])
          setCorrectionRound((current) => current + 1)
          setWordIndex(nextQueue[0])
        } else {
          setCorrectionQueue(null)
          setWordIndex(null)
          setCorrectionsComplete(true)
          setResults(true)
        }
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
          <div className="mt-5"><WordPractice key={`${practiceMode}-${word.word}-${correctionQueue ? `correction-${correctionRound}` : 'initial'}`} word={word} stimulus={stimulus} alternatives={category.words} onLearned={nextWord} onMistake={() => { if (correctionQueue) setCorrectionMistakes((current) => addUniqueMistake(current, wordIndex)); else setMistakeIndexes((current) => addUniqueMistake(current, wordIndex)) }} onValidated={() => markValidatedItems('vocabulary', [`${category.id}:${word.word}`])} isLast={correctionQueue ? wordIndex === correctionQueue.at(-1) : wordIndex + 1 === category.words.length} selectedMode={practiceMode} onBackToModes={() => { setWordIndex(null); setPracticeMode(null); setCorrectionQueue(null); setCorrectionMistakes([]); setMistakeIndexes([]) }} /></div>
        </div>
      </div>
    )
  }

  if (category) {
    const modes: { id: PracticeMode; label: string; description: string; icon: LucideIcon }[] = [
      { id: 'listen', label: lang === 'en' ? 'Listen & pronounce' : lang === 'ar' ? 'استمع وانطق' : 'Écouter et prononcer', description: lang === 'fr' ? 'Écoutez puis répétez chaque mot.' : lang === 'ar' ? 'استمع ثم كرر كل كلمة.' : 'Listen, then repeat every word.', icon: Mic },
      { id: 'write', label: lang === 'en' ? 'Writing' : lang === 'ar' ? 'الكتابة' : 'Écriture', description: lang === 'fr' ? 'Reconstituez chaque mot grâce à son indice.' : lang === 'ar' ? 'أعِد بناء كل كلمة بمساعدة الدليل.' : 'Rebuild every word using its clue.', icon: PenLine },
      { id: 'memorize', label: lang === 'en' ? 'Memorization' : lang === 'ar' ? 'الحفظ' : 'Mémorisation', description: lang === 'fr' ? 'Associez chaque indice au bon mot arabe.' : lang === 'ar' ? 'اربط كل دليل بالكلمة العربية الصحيحة.' : 'Match every clue with its Arabic word.', icon: Brain },
      { id: 'review', label: lang === 'en' ? 'Review' : lang === 'ar' ? 'المراجعة' : 'Révision', description: lang === 'fr' ? 'Vérifiez le sens des mots déjà étudiés.' : lang === 'ar' ? 'راجع معاني الكلمات التي درستها.' : 'Review the meaning of learned words.', icon: RefreshCw },
    ]
    const guided = GUIDED_LANGUAGE_CATEGORY_IDS.includes(category.id)
    const lessonCount = Math.ceil(category.words.length / GUIDED_LESSON_SIZE)
    return <div>
    <BackBar title={localized(category.label, lang)} onBack={() => setCategoryId(null)} />
    <div className="flex flex-col gap-3 p-5">
      {guided && <section className="mb-2">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5"><p className="text-xs font-bold uppercase tracking-wide text-primary">{lang === 'fr' ? 'Parcours guidé' : lang === 'ar' ? 'مسار موجه' : 'Guided course'}</p><h2 className="gold-text mt-1 text-xl font-bold">{lang === 'fr' ? 'Parlez dès la première leçon' : lang === 'ar' ? 'تحدث من الدرس الأول' : 'Speak from the first lesson'}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{lang === 'fr' ? 'Chaque leçon dure environ 10 minutes et mélange écoute, reconnaissance, construction et dialogue.' : lang === 'ar' ? 'يستغرق كل درس نحو عشر دقائق ويجمع بين الاستماع والتعرف وبناء الجمل والحوار.' : 'Each lesson takes about 10 minutes and mixes listening, recognition, sentence building and dialogue.'}</p></div>
        <div className="mt-3 grid gap-3">{Array.from({ length: lessonCount }, (_, lessonIndex) => {
          const start = lessonIndex * GUIDED_LESSON_SIZE
          const count = Math.min(GUIDED_LESSON_SIZE, category.words.length - start)
          return <button key={lessonIndex} type="button" onClick={() => setGuidedLessonIndex(lessonIndex)} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 text-start active:scale-[0.99]"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary font-bold text-primary">{lessonIndex + 1}</span><span className="min-w-0 flex-1"><span className="block font-bold">{lang === 'fr' ? `Leçon ${lessonIndex + 1}` : lang === 'ar' ? `الدرس ${lessonIndex + 1}` : `Lesson ${lessonIndex + 1}`}</span><span className="mt-1 block text-xs text-muted-foreground">≈ 10 min · {count} {lang === 'fr' ? 'expressions' : lang === 'ar' ? 'عبارات' : 'expressions'}</span></span><ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" /></button>
        })}</div>
        <h3 className="mb-1 mt-6 text-sm font-bold text-muted-foreground">{lang === 'fr' ? 'Entraînement libre' : lang === 'ar' ? 'تدريب حر' : 'Free practice'}</h3>
      </section>}
      {modes.map(({ id, label, description, icon: Icon }) => <button key={id} type="button" onClick={() => { setPracticeMode(id); setWordIndex(0); setMistakeIndexes([]); setResults(false); setCorrectionQueue(null) }} className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 text-start active:scale-[0.99]">
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
        {[
          { title: { fr: 'Parler en arabe, pas à pas', ar: 'التحدث بالعربية خطوة بخطوة', en: 'Speak Arabic, step by step' }, description: { fr: 'Les expressions les plus utiles pour commencer une vraie conversation.', ar: 'أهم العبارات لبدء محادثة حقيقية.', en: 'The most useful expressions to start a real conversation.' }, ids: ['phrases', 'introductions', 'conversation'] },
          { title: { fr: 'Construire ses propres phrases', ar: 'بناء جملك الخاصة', en: 'Build your own sentences' }, description: { fr: 'Des modèles simples à compléter, puis les verbes indispensables.', ar: 'قوالب سهلة لإكمالها ثم الأفعال الأساسية.', en: 'Simple sentence patterns, followed by essential verbs.' }, ids: ['sentence-building', 'verbs'] },
          { title: { fr: 'Vocabulaire par thème', ar: 'المفردات حسب الموضوع', en: 'Vocabulary by topic' }, description: { fr: 'Les objets et les mots à reconnaître dans la vie quotidienne.', ar: 'أشياء وكلمات من الحياة اليومية.', en: 'Objects and words to recognize in everyday life.' }, ids: ['daily', 'family', 'food', 'numbers', 'colors', 'work'] },
        ].map((section) => {
          const sectionCategories = section.ids.map((id) => categories.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item))
          const categoryEmoji: Record<string, string> = { daily: '🏠', family: '👨‍👩‍👧‍👦', food: '🍎', numbers: '🔢', colors: '🎨', work: '💼', phrases: '👋', introductions: '🙋', conversation: '💬', 'sentence-building': '🧱', verbs: '⚡' }
          return <section key={section.ids[0]} className="mb-7 last:mb-0">
            <h2 className="gold-text text-base font-bold">{localized(section.title, lang)}</h2>
            <p className="mb-4 mt-1 text-xs leading-5 text-muted-foreground">{localized(section.description, lang)}</p>
            <div className="grid grid-cols-2 gap-3">
              {sectionCategories.map((item) => <button key={item.id} type="button" onClick={() => { setCategoryId(item.id); setWordIndex(null) }} className="flex min-h-36 flex-col items-center justify-center rounded-3xl border border-border bg-card p-4 text-center transition active:scale-95">
                <span className="text-4xl" aria-hidden>{categoryEmoji[item.id] ?? '📚'}</span>
                <span className="gold-text mt-3 text-sm font-bold">{localized(item.label, lang)}</span>
                <span className="mt-1 text-[11px] text-muted-foreground">{item.words.length} {lang === 'en' ? 'items' : lang === 'ar' ? 'عناصر' : 'éléments'}</span>
              </button>)}
            </div>
          </section>
        })}
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
  const { markValidatedItems } = useProgress()
  const [index, setIndex] = useState(0)
  const point = GRAMMAR[index]
  const practiceWord: Word = { word: point.example, translit: point.exampleTranslit, meaning: point.title }
  const alternatives: Word[] = GRAMMAR.map((item) => ({ word: item.example, translit: item.exampleTranslit, meaning: item.title }))
  const next = () => {
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
        <div className="mt-4"><WordPractice key={point.id} word={practiceWord} stimulus={{ kind: 'text', value: localized(point.title, lang) }} alternatives={alternatives} onLearned={next} onValidated={() => markValidatedItems('grammar', [`rule:${point.id}`])} isLast={index + 1 === GRAMMAR.length} /></div>
      </div>
    </div>
  )
}
