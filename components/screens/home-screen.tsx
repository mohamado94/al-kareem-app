'use client'

import {
  Flame,
  Play,
  ChevronRight,
  BookMarked,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { Tab } from '@/components/bottom-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { VoiceSwitcher } from '@/components/voice-switcher'
import { ProgressRing } from '@/components/ui-bits'
import { HadithSection } from '@/components/hadith-section'
import { LEVELS } from '@/lib/data'
import { localized } from '@/lib/i18n-content'
import { useProgress } from '@/lib/progress/context'
import { masteryItemCount, masteryTopics, TOPIC_MASTERY_TOTALS } from '@/lib/progress/mastery'
import type { LearnBlockId, LearnStart } from '@/components/screens/learn-screen'

const BLOCK_TOPICS: Partial<Record<LearnBlockId, string[]>> = {
  reading: ['alphabet', 'positions', 'short-vowels', 'long-vowels', 'tanwin', 'reading'],
}

const BLOCK_LESSON_KEYS: Partial<Record<LearnBlockId, string[]>> = {
  phrases: [
    'lesson:lesson-objects:0', 'lesson:lesson-objects:1',
    'lesson:lesson-family:0', 'lesson:lesson-family:1', 'lesson:lesson-family:2',
  ],
  literary: [
    'lesson:lesson-greetings:0', 'lesson:lesson-understanding:0',
    'lesson:communication-self:0', 'lesson:communication-family:0',
    'lesson:communication-needs:0', 'lesson:communication-shopping:0',
    'lesson:communication-directions:0', 'lesson:communication-day:0',
  ],
}

const READING_STEPS = [
  { id: 'alphabet', label: { fr: 'Apprendre les lettres', ar: 'تعلّم الحروف', en: 'Learn the letters' } },
  { id: 'positions', label: { fr: 'Formes et assemblages', ar: 'أشكال الحروف ووصلها', en: 'Letter forms and joining' } },
  { id: 'short-vowels', label: { fr: 'Voyelles courtes', ar: 'الحركات القصيرة', en: 'Short vowels' } },
  { id: 'long-vowels', label: { fr: 'Voyelles longues', ar: 'حروف المد', en: 'Long vowels' } },
  { id: 'tanwin', label: { fr: 'Tanwīn', ar: 'التنوين', en: 'Tanwin' } },
  { id: 'reading', label: { fr: 'Lecture guidée', ar: 'القراءة الموجهة', en: 'Guided reading' } },
] as const

const GUIDED_LESSONS = [
  { block: 'phrases' as const, key: 'lesson:lesson-objects:0', categoryId: 'lesson-objects', lessonIndex: 0, label: { fr: 'Désigner les objets · leçon 1', ar: 'تسمية الأشياء · الدرس ١', en: 'Name objects · lesson 1' } },
  { block: 'phrases' as const, key: 'lesson:lesson-objects:1', categoryId: 'lesson-objects', lessonIndex: 1, label: { fr: 'Désigner les objets · leçon 2', ar: 'تسمية الأشياء · الدرس ٢', en: 'Name objects · lesson 2' } },
  { block: 'phrases' as const, key: 'lesson:lesson-family:0', categoryId: 'lesson-family', lessonIndex: 0, label: { fr: 'Parler de sa famille · leçon 1', ar: 'الحديث عن العائلة · الدرس ١', en: 'Talk about family · lesson 1' } },
  { block: 'phrases' as const, key: 'lesson:lesson-family:1', categoryId: 'lesson-family', lessonIndex: 1, label: { fr: 'Parler de sa famille · leçon 2', ar: 'الحديث عن العائلة · الدرس ٢', en: 'Talk about family · lesson 2' } },
  { block: 'phrases' as const, key: 'lesson:lesson-family:2', categoryId: 'lesson-family', lessonIndex: 2, label: { fr: 'Parler de sa famille · leçon 3', ar: 'الحديث عن العائلة · الدرس ٣', en: 'Talk about family · lesson 3' } },
  { block: 'literary' as const, key: 'lesson:lesson-greetings:0', categoryId: 'lesson-greetings', lessonIndex: 0, label: { fr: 'Faire connaissance', ar: 'التعارف', en: 'Getting acquainted' } },
  { block: 'literary' as const, key: 'lesson:lesson-understanding:0', categoryId: 'lesson-understanding', lessonIndex: 0, label: { fr: 'Se faire comprendre', ar: 'طلب التوضيح', en: 'Making yourself understood' } },
  { block: 'literary' as const, key: 'lesson:communication-self:0', categoryId: 'communication-self', lessonIndex: 0, label: { fr: 'Parler de soi', ar: 'الحديث عن النفس', en: 'Talking about yourself' } },
  { block: 'literary' as const, key: 'lesson:communication-family:0', categoryId: 'communication-family', lessonIndex: 0, label: { fr: 'Présenter sa famille', ar: 'تقديم العائلة', en: 'Introducing your family' } },
  { block: 'literary' as const, key: 'lesson:communication-needs:0', categoryId: 'communication-needs', lessonIndex: 0, label: { fr: 'Exprimer ses goûts et ses besoins', ar: 'التعبير عن الأذواق والاحتياجات', en: 'Expressing likes and needs' } },
  { block: 'literary' as const, key: 'lesson:communication-shopping:0', categoryId: 'communication-shopping', lessonIndex: 0, label: { fr: 'Acheter et commander', ar: 'الشراء والطلب', en: 'Shopping and ordering' } },
  { block: 'literary' as const, key: 'lesson:communication-directions:0', categoryId: 'communication-directions', lessonIndex: 0, label: { fr: 'Demander son chemin', ar: 'السؤال عن الطريق', en: 'Asking for directions' } },
  { block: 'literary' as const, key: 'lesson:communication-day:0', categoryId: 'communication-day', lessonIndex: 0, label: { fr: 'Parler de sa journée', ar: 'الحديث عن اليوم', en: 'Talking about your day' } },
] as const

export function globalAvailableProgress(validatedItems: Record<string, Record<string, true>>) {
  const readingCompleted = READING_STEPS.reduce((sum, step) => sum + Math.min(TOPIC_MASTERY_TOTALS[step.id], masteryItemCount(step.id, validatedItems)), 0)
  const readingTotal = READING_STEPS.reduce((sum, step) => sum + TOPIC_MASTERY_TOTALS[step.id], 0)
  const vocabularyEvidence = validatedItems.vocabulary ?? {}
  const guidedCompleted = GUIDED_LESSONS.filter((lesson) => vocabularyEvidence[lesson.key]).length
  const completed = readingCompleted + guidedCompleted
  const total = readingTotal + GUIDED_LESSONS.length
  return { completed, total, percentage: completed >= total ? 100 : Math.floor((completed / total) * 100) }
}

export function nextLearningStep(topics: Record<string, number>, vocabularyEvidence: Record<string, true>) {
  const reading = READING_STEPS.find((step) => (topics[step.id] ?? 0) < 100)
  if (reading) return { start: { block: 'reading', topicId: reading.id } as LearnStart, label: reading.label }
  const lesson = GUIDED_LESSONS.find((item) => !vocabularyEvidence[item.key])
  if (lesson) return { start: { block: lesson.block, categoryId: lesson.categoryId, lessonIndex: lesson.lessonIndex } as LearnStart, label: lesson.label }
  return null
}

export function learningBlockProgress(blockId: LearnBlockId, topics: Record<string, number>, vocabularyEvidence: Record<string, true>) {
  const topicIds = BLOCK_TOPICS[blockId] ?? []
  if (topicIds.length) {
    const total = topicIds.length * 100
    const completed = topicIds.reduce((sum, id) => sum + (topics[id] ?? 0), 0)
    return completed >= total ? 100 : Math.floor((completed / total) * 100)
  }
  const lessonKeys = BLOCK_LESSON_KEYS[blockId] ?? []
  if (!lessonKeys.length) return 0
  const completed = lessonKeys.filter((key) => vocabularyEvidence[key]).length
  return completed >= lessonKeys.length ? 100 : Math.floor((completed / lessonKeys.length) * 100)
}

export function HomeScreen({ onNavigate, onOpenLearn }: { onNavigate: (t: Tab) => void; onOpenLearn: (start?: LearnStart) => void }) {
  const { t, lang } = useI18n()
  const { progress } = useProgress()
  const verifiedTopics = masteryTopics(progress.validatedItems)

  const vocabularyEvidence = progress.validatedItems.vocabulary ?? {}
  const globalProgress = globalAvailableProgress(progress.validatedItems)
  const nextStep = nextLearningStep(verifiedTopics, vocabularyEvidence)
  const sectionProgress = Object.fromEntries(LEVELS.map((level) => [level.id, learningBlockProgress(level.blockId, verifiedTopics, vocabularyEvidence)]))
  const completedSections = LEVELS.filter((level) => level.unitCount > 0 && sectionProgress[level.id] === 100).length
  const continueStart = nextStep?.start ?? { block: 'reading' as const }

  return (
    <div>
      <header className="flex items-center justify-between px-5 pb-2 pt-8">
        <div className="flex items-center gap-3">
          <div className="gold-gradient-bright flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg shadow-black/25">
            <span className="font-arabic text-2xl leading-none text-primary-foreground">ك</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('home.greeting')}</p>
            <p className="gold-text text-base font-bold leading-tight">{t('home.welcomeSub')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1.5">
            <Flame className="h-4 w-4 text-primary" />
            <span className="gold-text text-sm font-bold">{progress.stats.streak}</span>
          </div>
          <VoiceSwitcher />
          <LanguageSwitcher />
        </div>
      </header>

      <p className="px-5 pb-5 text-sm text-muted-foreground">{t('home.subtitle')}</p>

      <div className="px-5">
        <button
          type="button"
          onClick={() => onOpenLearn(continueStart)}
          className="relief-panel group relative w-full overflow-hidden rounded-3xl p-5 text-start"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -end-8 -top-10 h-40 w-40 rounded-full opacity-60 blur-2xl"
            style={{ background: 'var(--relief-glow)' }}
          />
          <div className="relative flex items-center gap-4">
            <ProgressRing value={globalProgress.percentage} size={62}>
              <span className="gold-text text-sm font-bold">{globalProgress.percentage}%</span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-primary">{lang === 'fr' ? 'Mon parcours' : lang === 'ar' ? 'مساري' : 'My pathway'}</p>
              <p className="gold-text truncate text-lg font-bold">{nextStep ? `${lang === 'fr' ? 'Prochaine étape' : lang === 'ar' ? 'الخطوة التالية' : 'Next step'} : ${localized(nextStep.label, lang)}` : (lang === 'fr' ? 'Parcours disponible terminé' : lang === 'ar' ? 'اكتمل المسار المتاح' : 'Available pathway complete')}</p>
              <p className="truncate text-xs text-muted-foreground">
                {globalProgress.percentage}% {lang === 'fr' ? 'du parcours disponible' : lang === 'ar' ? 'من المسار المتاح' : 'of the available pathway'}
              </p>
            </div>
          </div>
          <div className="gold-gradient-bright relative mt-4 flex items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-primary-foreground shadow-sm shadow-black/15 transition-transform group-active:scale-[0.98]">
            <Play className="h-4 w-4 fill-current" />
            {nextStep ? (lang === 'fr' ? 'Continuer mon apprentissage' : lang === 'ar' ? 'متابعة تعلّمي' : 'Continue learning') : (lang === 'fr' ? 'Revoir mon parcours' : lang === 'ar' ? 'مراجعة مساري' : 'Review my pathway')}
          </div>
        </button>
      </div>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {t('home.yourProgress')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={BookMarked} value={String(completedSections)} label={lang === 'fr' ? 'Sections terminées' : lang === 'ar' ? 'أقسام مكتملة' : 'Completed sections'} />
          <button type="button" onClick={() => onNavigate('exercises')} className="flex flex-col items-center gap-1.5 rounded-3xl border border-border bg-card px-2 py-4 active:scale-[0.98]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12">
              <Dumbbell className="h-[18px] w-[18px] text-primary" />
            </span>
            <span className="gold-text text-sm font-bold leading-none">{t('home.startExercises')}</span>
            <span className="text-[11px] text-muted-foreground">{t('home.exercises')}</span>
          </button>
        </div>
      </section>

      <HadithSection />

      <section className="px-5 pb-6 pt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          {t('home.levels')}
        </h2>
        <div className="flex flex-col gap-3">
          {LEVELS.map((lvl) => {
            const pct = sectionProgress[lvl.id] ?? 0
            return (
              <button
                type="button"
                key={lvl.id}
                onClick={() => onOpenLearn({ block: lvl.blockId })}
                className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 text-start transition-transform active:scale-[0.99]"
              >
                <ProgressRing value={pct} size={52}>
                  <span className="gold-text text-xs font-bold">{pct}%</span>
                </ProgressRing>
                <div className="min-w-0 flex-1">
                  <p className="gold-text truncate font-semibold">{localized(lvl.title, lang)}</p>
                  <p className="text-xs text-muted-foreground">
                    {lvl.unitCount > 0 ? `${lvl.unitCount} ${localized(lvl.unitLabel, lang)}` : localized(lvl.unitLabel, lang)}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-3xl border border-border bg-card px-2 py-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12">
        <Icon className="h-[18px] w-[18px] text-primary" />
      </span>
      <span className="gold-text text-lg font-bold leading-none">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}
