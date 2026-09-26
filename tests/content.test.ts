import { describe, expect, it } from 'vitest'
import { buildDailyQuestions } from '../lib/daily-exercises'
import { DEFAULT_PROGRESS } from '../lib/progress/types'
import { LETTERS, PROPHETS, VOCABULARY } from '../lib/data'
import { dailyHadithIndex } from '../components/hadith-section'
import { globalAvailableProgress, learningBlockProgress, nextLearningStep } from '../components/screens/home-screen'
import { TOPIC_MASTERY_TOTALS } from '../lib/progress/mastery'

describe('published learning data', () => {
  it('contains the 28 unique Arabic letters', () => {
    expect(LETTERS).toHaveLength(28)
    expect(new Set(LETTERS.map((letter) => letter.id)).size).toBe(28)
  })

  it('lists 25 prophets from Adam to Muhammad', () => {
    expect(PROPHETS).toHaveLength(25)
    expect(PROPHETS[0].id).toBe('adam')
    expect(PROPHETS.at(-1)?.id).toBe('muhammad')
  })

  it('contains a complete standard-Arabic clarification situation with gender variants', () => {
    const clarification = VOCABULARY.find((group) => group.id === 'communication-help')
    expect(clarification).toBeDefined()
    expect(clarification!.words.map((word) => word.word)).toEqual(expect.arrayContaining([
      'لَا أَفْهَمُ',
      'هَلْ يُمْكِنُكَ أَنْ تُعِيدَ، مِنْ فَضْلِكَ؟',
      'هَلْ يُمْكِنُكِ أَنْ تُعِيدِي، مِنْ فَضْلِكِ؟',
      'تَكَلَّمْ بِبُطْءٍ، مِنْ فَضْلِكَ.',
      'تَكَلَّمِي بِبُطْءٍ، مِنْ فَضْلِكِ.',
      'مَا مَعْنَى هَذِهِ الْكَلِمَةِ؟',
    ]))
    expect(clarification!.words.every((word) => word.meaning.fr && word.meaning.ar && word.meaning.en)).toBe(true)
  })

  it('contains all six additional literary-Arabic communication chapters', () => {
    const ids = [
      'communication-self', 'communication-family', 'communication-needs',
      'communication-shopping', 'communication-directions', 'communication-day',
    ]
    for (const id of ids) {
      const chapter = VOCABULARY.find((group) => group.id === id)
      expect(chapter, id).toBeDefined()
      expect(chapter!.words.length, id).toBeGreaterThanOrEqual(6)
      expect(chapter!.words.every((word) => word.meaning.fr && word.meaning.ar && word.meaning.en && word.translit)).toBe(true)
      expect(chapter!.words.every((word) => /[\u064B-\u0652]/u.test(word.word))).toBe(true)
    }
  })

  it('creates a stable resumable exercise and a different new session', () => {
    const date = new Date('2026-09-12T12:00:00Z')
    const first = buildDailyQuestions('choose', DEFAULT_PROGRESS.topics, 'fr', date, 'session-a')
    const second = buildDailyQuestions('choose', DEFAULT_PROGRESS.topics, 'fr', date, 'session-a')
    const nextSession = buildDailyQuestions('choose', DEFAULT_PROGRESS.topics, 'fr', date, 'session-b')
    expect(first.length).toBeGreaterThanOrEqual(8)
    expect(first.length).toBeLessThanOrEqual(10)
    expect(second).toEqual(first)
    expect(nextSession.map((question) => question.id)).not.toEqual(first.map((question) => question.id))
    expect(new Set(first.map((question) => question.module))).toEqual(new Set(['alphabet']))
    for (const question of first) {
      expect(question.answerIndex).toBeGreaterThanOrEqual(0)
      expect(question.answerIndex).toBeLessThan(question.options.length)
    }
  })

  it('unlocks exercise families only after their lessons have started', () => {
    const topics = Object.fromEntries(Object.keys(DEFAULT_PROGRESS.topics).map((key) => [key, 100]))
    const questions = buildDailyQuestions('choose', topics, 'fr', new Date('2026-09-12T12:00:00Z'), 'all-learned')
    expect(new Set(questions.map((question) => question.module))).toEqual(new Set([
      'alphabet', 'positions', 'short-vowels', 'long-vowels', 'tanwin', 'vocabulary', 'grammar',
    ]))
  })

  it('gives a new learner no exercise containing unknown material', () => {
    const questions = buildDailyQuestions('choose', DEFAULT_PROGRESS.topics, 'fr', new Date('2026-09-12T12:00:00Z'), 'new-user', {})
    expect(questions).toEqual([])
  })

  it('limits an alphabet learner to the exact validated letters', () => {
    const evidence = { alphabet: { 'letter:alif': true as const, 'letter:ba': true as const } }
    const questions = buildDailyQuestions('choose', DEFAULT_PROGRESS.topics, 'fr', new Date('2026-09-12T12:00:00Z'), 'partial-alphabet', evidence)
    expect(questions.length).toBeGreaterThan(0)
    expect(new Set(questions.map((question) => question.module))).toEqual(new Set(['alphabet']))
    expect(questions.every((question) => question.id.includes('alif') || question.id.includes('ba'))).toBe(true)
  })

  it('does not introduce later topics when only the complete alphabet is validated', () => {
    const evidence = { alphabet: Object.fromEntries(LETTERS.map((letter) => [`letter:${letter.id}`, true])) as Record<string, true> }
    const questions = buildDailyQuestions('choose', DEFAULT_PROGRESS.topics, 'fr', new Date('2026-09-12T12:00:00Z'), 'alphabet-only', evidence)
    expect(new Set(questions.map((question) => question.module))).toEqual(new Set(['alphabet']))
  })

  it('adds a studied topic to practice without treating it as mastered', () => {
    const evidence = { alphabet: Object.fromEntries(LETTERS.map((letter) => [`letter:${letter.id}`, true])) as Record<string, true> }
    const questions = buildDailyQuestions('choose', DEFAULT_PROGRESS.topics, 'fr', new Date('2026-09-12T12:00:00Z'), 'positions-studied', evidence, { positions: true })
    expect(new Set(questions.map((question) => question.module))).toEqual(new Set(['alphabet', 'positions']))
    expect('positions' in evidence).toBe(false)
  })

  it('computes home pathway progress from the real section evidence', () => {
    const emptyTopics = { alphabet: 0, positions: 0, 'short-vowels': 0, 'long-vowels': 0, tanwin: 0, reading: 0 }
    expect(learningBlockProgress('reading', emptyTopics, {})).toBe(0)
    expect(learningBlockProgress('reading', { ...emptyTopics, alphabet: 50 }, {})).toBe(8)
    expect(learningBlockProgress('reading', Object.fromEntries(Object.keys(emptyTopics).map((key) => [key, 100])), {})).toBe(100)

    expect(learningBlockProgress('phrases', {}, {
      'lesson:lesson-objects:0': true,
      'lesson:lesson-family:0': true,
    })).toBe(40)
    expect(learningBlockProgress('literary', {}, { 'lesson:lesson-greetings:0': true })).toBe(12)
    expect(learningBlockProgress('literary', {}, {
      'lesson:lesson-greetings:0': true,
      'lesson:lesson-understanding:0': true,
      'lesson:communication-self:0': true,
      'lesson:communication-family:0': true,
      'lesson:communication-needs:0': true,
      'lesson:communication-shopping:0': true,
      'lesson:communication-directions:0': true,
      'lesson:communication-day:0': true,
    })).toBe(100)
    expect(learningBlockProgress('quran', {}, {})).toBe(0)
  })

  it('computes global available progress without duplicates or future content', () => {
    expect(globalAvailableProgress({})).toMatchObject({ completed: 0, percentage: 0 })
    const partial = globalAvailableProgress({
      alphabet: { 'letter:alif': true },
      vocabulary: {
        'lesson:lesson-greetings:0': true,
        'guided:lesson-greetings:السَّلَامُ عَلَيْكُم': true,
      },
    })
    expect(partial.completed).toBe(2)
    expect(partial.percentage).toBeLessThan(100)

    const complete = {
      alphabet: Object.fromEntries(Array.from({ length: TOPIC_MASTERY_TOTALS.alphabet }, (_, index) => [`letter:${index}`, true])) as Record<string, true>,
      positions: Object.fromEntries(Array.from({ length: TOPIC_MASTERY_TOTALS.positions }, (_, index) => [`position:${index}`, true])) as Record<string, true>,
      'short-vowels': Object.fromEntries(Array.from({ length: TOPIC_MASTERY_TOTALS['short-vowels'] }, (_, index) => [`short:${index}`, true])) as Record<string, true>,
      'long-vowels': Object.fromEntries(Array.from({ length: TOPIC_MASTERY_TOTALS['long-vowels'] }, (_, index) => [`long:${index}`, true])) as Record<string, true>,
      tanwin: Object.fromEntries(Array.from({ length: TOPIC_MASTERY_TOTALS.tanwin }, (_, index) => [`tanwin:${index}`, true])) as Record<string, true>,
      reading: Object.fromEntries(Array.from({ length: TOPIC_MASTERY_TOTALS.reading }, (_, index) => [`word:${index}`, true])) as Record<string, true>,
      vocabulary: Object.fromEntries([
        'lesson:lesson-objects:0', 'lesson:lesson-objects:1',
        'lesson:lesson-family:0', 'lesson:lesson-family:1', 'lesson:lesson-family:2',
        'lesson:lesson-greetings:0', 'lesson:lesson-understanding:0',
        'lesson:communication-self:0', 'lesson:communication-family:0',
        'lesson:communication-needs:0', 'lesson:communication-shopping:0',
        'lesson:communication-directions:0', 'lesson:communication-day:0',
      ].map((key) => [key, true])) as Record<string, true>,
    }
    expect(globalAvailableProgress(complete).percentage).toBe(100)
  })

  it('resumes at the first real unfinished step', () => {
    const empty = { alphabet: 0, positions: 0, 'short-vowels': 0, 'long-vowels': 0, tanwin: 0, reading: 0 }
    expect(nextLearningStep(empty, {})?.start).toEqual({ block: 'reading', topicId: 'alphabet' })
    const readingDone = Object.fromEntries(Object.keys(empty).map((key) => [key, 100]))
    expect(nextLearningStep(readingDone, {})?.start).toEqual({ block: 'phrases', categoryId: 'lesson-objects', lessonIndex: 0 })
    expect(nextLearningStep(readingDone, {
      'lesson:lesson-objects:0': true,
      'lesson:lesson-objects:1': true,
      'lesson:lesson-family:0': true,
      'lesson:lesson-family:1': true,
      'lesson:lesson-family:2': true,
    })?.start).toEqual({ block: 'literary', categoryId: 'lesson-greetings', lessonIndex: 0 })
  })

  it('rotates the hadith every local calendar day', () => {
    const first = dailyHadithIndex(new Date(2026, 8, 12, 23, 30), 8)
    const sameDay = dailyHadithIndex(new Date(2026, 8, 12, 1, 0), 8)
    const nextDay = dailyHadithIndex(new Date(2026, 8, 13, 1, 0), 8)
    expect(sameDay).toBe(first)
    expect(nextDay).not.toBe(first)
  })
})
