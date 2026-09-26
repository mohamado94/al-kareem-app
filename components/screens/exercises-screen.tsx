'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  ListChecks,
  Volume2,
  Headphones,
  MoveHorizontal,
  SpellCheck,
  Trophy,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useProgress } from '@/lib/progress/context'
import { ScreenHeader, ProgressBar, accentClass } from '@/components/ui-bits'
import { ListenButton } from '@/components/audio-button'
import { speakArabic } from '@/lib/speech'
import { buildDailyQuestions } from '@/lib/daily-exercises'
import { cn } from '@/lib/utils'
import { playAnswerSound } from '@/lib/feedback-sounds'
import { masteryTopics } from '@/lib/progress/mastery'

type ExType = 'choose' | 'match' | 'listen' | 'place' | 'complete'

const EX_LIST: {
  id: ExType
  icon: LucideIcon
  titleKey: string
  accent: string
  diffKey: string
}[] = [
  { id: 'choose', icon: ListChecks, titleKey: 'ex.chooseAnswer', accent: 'gold', diffKey: 'ex.difficulty.easy' },
  { id: 'match', icon: Volume2, titleKey: 'ex.matchSound', accent: 'teal', diffKey: 'ex.difficulty.easy' },
  { id: 'listen', icon: Headphones, titleKey: 'ex.listenChoose', accent: 'violet', diffKey: 'ex.difficulty.medium' },
  { id: 'place', icon: MoveHorizontal, titleKey: 'ex.placeLetter', accent: 'sky', diffKey: 'ex.difficulty.medium' },
  { id: 'complete', icon: SpellCheck, titleKey: 'ex.completeWord', accent: 'amber', diffKey: 'ex.difficulty.hard' },
]

export function ExercisesScreen() {
  const { updateUiState } = useProgress()
  const [active, setActive] = useState<ExType | null>(null)

  const start = (type: ExType) => {
    const sessionSeed = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setActive(type)
    updateUiState({ exerciseType: type, exerciseSessionSeed: sessionSeed, exerciseIndex: 0, exerciseScore: 0, exerciseSelected: null, exerciseChecked: false })
  }

  const exit = () => {
    setActive(null)
    updateUiState({ exerciseType: null, exerciseSessionSeed: null, exerciseIndex: 0, exerciseScore: 0, exerciseSelected: null, exerciseChecked: false })
  }

  if (active) return <QuizRunner type={active} onExit={exit} />
  return <ExerciseMenu onStart={start} />
}

function ExerciseMenu({ onStart }: { onStart: (t: ExType) => void }) {
  const { t } = useI18n()
  return (
    <div>
      <ScreenHeader title={t('ex.title')} subtitle={t('ex.subtitle')} />
      <div className="flex flex-col gap-3 px-5 pb-6">
        {EX_LIST.map((ex) => {
          const Icon = ex.icon
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onStart(ex.id)}
              className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4 text-start transition-transform active:scale-[0.98]"
            >
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accentClass(ex.accent)}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-balance">{t(ex.titleKey)}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {t(ex.diffKey)}
                  </span>
                  <span className="text-[11px] text-primary">{t('ex.interactive')}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground rtl:rotate-180" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function QuizRunner({ type, onExit }: { type: ExType; onExit: () => void }) {
  const { t, lang } = useI18n()
  const { progress, recordExerciseScore, markValidatedItems, updateUiState } = useProgress()
  const verifiedTopics = useMemo(() => masteryTopics(progress.validatedItems), [progress.validatedItems])
  const fallbackSeed = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`)
  const sessionSeed = progress.ui.exerciseSessionSeed ?? fallbackSeed.current
  const questions = useMemo(
    () => buildDailyQuestions(type, verifiedTopics, lang, new Date(), sessionSeed, progress.validatedItems, progress.introducedTopics),
    [type, verifiedTopics, lang, sessionSeed, progress.validatedItems, progress.introducedTopics],
  )

  const [index, setIndex] = useState(() => progress.ui.exerciseType === type ? progress.ui.exerciseIndex : 0)
  const [selected, setSelected] = useState<number | null>(() => progress.ui.exerciseType === type ? progress.ui.exerciseSelected : null)
  const [checked, setChecked] = useState(() => progress.ui.exerciseType === type ? progress.ui.exerciseChecked : false)
  const [score, setScore] = useState(() => progress.ui.exerciseType === type ? progress.ui.exerciseScore : 0)
  const [finished, setFinished] = useState(false)
  const [questionOrder, setQuestionOrder] = useState(() => questions.map((_, questionIndex) => questionIndex))
  const [mistakeIndexes, setMistakeIndexes] = useState<number[]>([])
  const [correctionMode, setCorrectionMode] = useState(false)
  const [correctionMistakes, setCorrectionMistakes] = useState<number[]>([])
  const [correctionsComplete, setCorrectionsComplete] = useState(false)
  const mistakeSet = useRef(new Set<number>())
  const recorded = useRef(false)

  useEffect(() => {
    if (finished && !recorded.current) {
      recorded.current = true
      recordExerciseScore(type, score, questions.length)
    }
  }, [finished, score, type, questions.length, recordExerciseScore])

  useEffect(() => {
    if (!progress.ui.exerciseSessionSeed) updateUiState({ exerciseSessionSeed: sessionSeed })
    // Seed initialization is performed once for legacy/incomplete sessions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    updateUiState({ exerciseType: type, exerciseIndex: index, exerciseScore: score, exerciseSelected: selected, exerciseChecked: checked })
    // Save only when the user's quiz state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, index, score, selected, checked])

  const actualQuestionIndex = questionOrder[index] ?? 0
  const q = questions[actualQuestionIndex]
  if (!q) return <div className="flex h-full flex-col"><QuizTopBar onExit={onExit} progress={0} /><div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><h2 className="gold-text text-2xl font-bold">{lang === 'fr' ? 'Commencez par apprendre' : lang === 'ar' ? 'ابدأ بالتعلّم أولاً' : 'Start by learning'}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{lang === 'fr' ? 'Validez d’abord des éléments du parcours. Les exercices du jour utiliseront uniquement ce que vous avez réellement appris.' : lang === 'ar' ? 'تحقق أولاً من عناصر المسار. ستستخدم التمارين اليومية فقط ما تعلمته بالفعل.' : 'Validate learning items first. Daily exercises will only use material you have actually learned.'}</p><button type="button" onClick={onExit} className="gold-gradient mt-7 w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{t('common.back')}</button></div></div>
  const isListen = Boolean(q.audioText)
  const isCorrect = selected === q.answerIndex

  const onChoose = (choice: number) => {
    if (checked) return
    setSelected(choice)
  }

  const onValidate = () => {
    if (selected === null || checked) return
    setChecked(true)
    const correct = selected === q.answerIndex
    playAnswerSound(correct)
    if (!correct) {
      if (correctionMode) setCorrectionMistakes((current) => current.includes(actualQuestionIndex) ? current : [...current, actualQuestionIndex])
      else {
        mistakeSet.current.add(actualQuestionIndex)
        setMistakeIndexes((current) => current.includes(actualQuestionIndex) ? current : [...current, actualQuestionIndex])
      }
    }
    if (correct) {
      const idParts = q.id.split('-')
      const stableQuestionId = q.module === 'alphabet' || q.module === 'positions'
        ? idParts.slice(2).join('-')
        : q.module === 'vocabulary' || q.module === 'grammar'
          ? `${q.promptGlyph ?? q.audioText ?? ''}`
          : q.id
      const masteryKey = `${q.module}:${stableQuestionId}`
      markValidatedItems(q.module, [masteryKey])
      if (!correctionMode && !mistakeSet.current.has(actualQuestionIndex)) setScore((s) => s + 1)
    }
  }

  const onNext = () => {
    if (index + 1 >= questionOrder.length) {
      if (correctionMode) {
        if (correctionMistakes.length) {
          setQuestionOrder(correctionMistakes)
          setCorrectionMistakes([])
          setIndex(0)
          setSelected(null)
          setChecked(false)
          return
        }
        setCorrectionMode(false)
        setCorrectionsComplete(true)
        setFinished(true)
        return
      }
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setChecked(false)
  }

  const restart = () => {
    updateUiState({ exerciseSessionSeed: `${Date.now()}-${Math.random().toString(36).slice(2)}`, exerciseIndex: 0, exerciseScore: 0, exerciseSelected: null, exerciseChecked: false })
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setScore(0)
    setFinished(false)
    setQuestionOrder(questions.map((_, questionIndex) => questionIndex))
    setMistakeIndexes([])
    mistakeSet.current.clear()
    setCorrectionMode(false)
    setCorrectionMistakes([])
    setCorrectionsComplete(false)
    recorded.current = false
  }

  const correctMistakes = () => {
    setQuestionOrder(mistakeIndexes)
    setIndex(0)
    setSelected(null)
    setChecked(false)
    setFinished(false)
    setCorrectionMode(true)
    setCorrectionMistakes([])
    setCorrectionsComplete(false)
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="flex h-full flex-col">
        <QuizTopBar onExit={onExit} progress={100} />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="gold-gradient mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-xl shadow-black/40">
            <Trophy className="h-12 w-12 text-primary-foreground" />
          </span>
          <h2 className="gold-text text-2xl font-bold">{t('ex.done')}</h2>
          <p className="mt-2 text-muted-foreground">{t('ex.score')}</p>
          <p className="gold-text mt-4 text-5xl font-bold">
            {score}/{questions.length}
          </p>
          <p className="gold-text mt-1 text-sm font-bold">{pct}%</p>
          <div className="mt-10 flex w-full flex-col gap-3">
            {mistakeIndexes.length > 0 && !correctionsComplete && <button
              type="button"
              onClick={correctMistakes}
              className="gold-gradient flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-primary-foreground active:scale-[0.98]"
            >
              <RotateCcw className="h-5 w-5" />
              {lang === 'en' ? 'Correct my mistakes' : lang === 'ar' ? 'تصحيح أخطائي' : 'Corriger mes erreurs'}
            </button>}
            <button
              type="button"
              onClick={restart}
              className="gold-gradient flex items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-primary-foreground active:scale-[0.98]"
            >
              <RotateCcw className="h-5 w-5" />
              {t('ex.restart')}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-2xl border border-border bg-card py-3.5 font-semibold active:scale-[0.98]"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <QuizTopBar onExit={onExit} progress={((index + (checked ? 1 : 0)) / questionOrder.length) * 100} />

      <div className="flex-1 px-5 pt-4">
        <p className="text-xs font-medium text-muted-foreground">
          {correctionMode ? (lang === 'en' ? 'Correction' : lang === 'ar' ? 'تصحيح' : 'Correction') : t('ex.question')} {index + 1} {t('ex.of')} {questionOrder.length}
        </p>
        <h2 className="mt-1 text-xl font-bold text-balance text-foreground">
          {isListen ? t('ex.listenPrompt') : t('ex.chooseAnswer')}
        </h2>

        {/* Prompt */}
        <div className="mt-6 flex flex-col items-center">
          {isListen ? (
            <button
              type="button"
              onClick={() => speakArabic(q.audioText ?? '')}
              aria-label={t('learn.listen')}
              className="gold-gradient flex h-28 w-28 items-center justify-center rounded-full shadow-xl shadow-black/40 active:scale-95"
            >
              <Volume2 className="h-12 w-12 text-primary-foreground" />
            </button>
          ) : (
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-3xl border border-primary/20 bg-primary/5">
              <span className="font-arabic text-6xl leading-none text-primary">{q.promptGlyph}</span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            const isSel = selected === i
            const showCorrect = checked && isCorrect && i === q.answerIndex
            const showWrong = checked && isSel && i !== q.answerIndex
            return (
              <button
                key={i}
                type="button"
                disabled={checked}
                onClick={() => onChoose(i)}
                className={cn(
                  'relative flex h-24 flex-col items-center justify-center gap-1 rounded-3xl border-2 bg-card transition-all active:scale-95',
                  isSel && !checked && 'border-primary bg-primary/10',
                  !isSel && !checked && 'border-border',
                  showCorrect && 'border-[var(--success)] bg-[oklch(0.72_0.13_155/0.12)]',
                  showWrong && 'border-destructive bg-destructive/10',
                )}
              >
                <span className={cn(opt.arabic ? 'font-arabic text-3xl leading-none' : 'px-2 text-center text-sm font-semibold')}>
                  {opt.text}
                </span>
                {showCorrect && (
                  <span className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--success)]">
                    <Check className="h-4 w-4 text-background" />
                  </span>
                )}
                {showWrong && (
                  <span className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive">
                    <X className="h-4 w-4 text-background" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* The answer is revealed only after explicit validation. */}
      <div className="p-5">
        {!checked && <button type="button" disabled={selected === null} onClick={onValidate} className="gold-gradient w-full rounded-2xl py-3.5 font-semibold text-primary-foreground disabled:opacity-40">
          {lang === 'en' ? 'Check' : lang === 'ar' ? 'تحقق' : 'Valider'}
        </button>}
        {checked && (
          <><div className={cn('mb-3 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold', isCorrect ? 'bg-[oklch(0.72_0.13_155/0.15)] text-[var(--success)]' : 'bg-destructive/15 text-destructive')}>
              {isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {isCorrect ? t('ex.correct') : <span>{t('ex.wrong')} · {lang === 'fr' ? 'Réponse :' : lang === 'ar' ? 'الإجابة:' : 'Answer:'} <strong>{q.options[q.answerIndex]?.text}</strong></span>}
            </div><button type="button" onClick={onNext} className="gold-gradient w-full rounded-2xl py-3.5 font-semibold text-primary-foreground">{lang === 'en' ? 'Next' : lang === 'ar' ? 'التالي' : 'Suivant'}</button></>
        )}
      </div>
    </div>
  )
}

function QuizTopBar({ onExit, progress }: { onExit: () => void; progress: number }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-3 px-4 py-3 pt-6">
      <button
        type="button"
        onClick={onExit}
        aria-label={t('common.back')}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card active:scale-90"
      >
        <ChevronLeft className="h-5 w-5 rtl:hidden" />
        <ChevronRight className="hidden h-5 w-5 rtl:block" />
      </button>
      <ProgressBar value={progress} />
    </div>
  )
}
