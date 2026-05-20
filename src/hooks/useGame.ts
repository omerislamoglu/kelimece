import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { calculateScore } from '../lib/puzzle'
import {
  playLetterTap,
  playSuccess,
  playPangram,
  playError,
  playCoin,
  playAchievement,
  vibrate,
} from '../lib/sounds'
import { firePangramConfetti, fireAllFoundConfetti } from '../lib/confetti'
import { isAcceptedWord, normalizeWord } from '../lib/dictionary'
import { isSpellCheckerReady, loadSpellChecker } from '../lib/spellchecker'
import { reportWord } from '../lib/wordReports'
import { fetchDefinition } from '../lib/definitions'
import {
  COIN_PER_BONUS,
  HINT_COST_LETTER_COUNT,
  HINT_COST_FIRST_LETTER,
  HINT_COST_REVEAL,
  INITIAL_COINS,
  STORAGE_KEYS,
  localDateStr,
} from '../lib/constants'
import {
  getLetterCountHint,
  getFirstLetterHint,
  pickRandomUnfoundWord,
  isFreeHintAvailable,
  consumeFreeHint,
  type LetterCountHint,
  type FirstLetterHint,
} from '../lib/hints'
import {
  recordWordFound,
  recordLevelComplete,
  recordHintUsed,
  recordCoinsEarned,
} from '../lib/stats'
import {
  generateLevelPuzzle,
  calculateStars,
  loadProgress,
  saveProgress,
  type LevelPuzzle,
  type LevelProgress,
} from '../lib/levels'

export type MessageType = 'success' | 'error' | 'info' | 'warning'

interface GameMessage {
  text: string
  type: MessageType
  reportable?: boolean
}

export type InputFeedback =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'pangram'
  | 'bonus'
  | null

interface LevelState {
  level: number
  foundWords: string[]
  bonusWords: string[]
  score: number
}

const LEVEL_STATE_KEY = 'kelimece-level-state'

function loadLevelState(level: number): LevelState | null {
  try {
    const raw = localStorage.getItem(LEVEL_STATE_KEY)
    if (!raw) return null
    const saved: LevelState = JSON.parse(raw)
    if (saved.level !== level) return null
    return saved
  } catch {
    return null
  }
}

function saveLevelState(state: LevelState): void {
  try {
    localStorage.setItem(LEVEL_STATE_KEY, JSON.stringify(state))
  } catch {
    // silently ignore
  }
}

function clearLevelState(): void {
  try {
    localStorage.removeItem(LEVEL_STATE_KEY)
  } catch {
    // silently ignore
  }
}

function loadCoins(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.coins)
    if (!raw) return INITIAL_COINS
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'number' || !Number.isFinite(parsed) || parsed < 0) {
      return INITIAL_COINS
    }
    return parsed
  } catch {
    return INITIAL_COINS
  }
}

function saveCoins(coins: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.coins, JSON.stringify(coins))
  } catch {
    // silently ignore
  }
}

export function useGame() {
  const [progress, setProgress] = useState<LevelProgress>(loadProgress)
  const [coins, setCoins] = useState(loadCoins)

  const [initialState] = useState(() => {
    const puzzle = generateLevelPuzzle(progress.currentLevel)
    const saved = loadLevelState(progress.currentLevel)
    return {
      puzzle,
      foundWords: saved?.foundWords ?? [],
      bonusWords: saved?.bonusWords ?? [],
      score: saved?.score ?? 0,
    }
  })

  const [puzzle, setPuzzle] = useState<LevelPuzzle>(initialState.puzzle)
  const [foundWords, setFoundWords] = useState<string[]>(
    initialState.foundWords,
  )
  const [bonusWords, setBonusWords] = useState<string[]>(
    initialState.bonusWords,
  )
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(initialState.score)
  const [message, setMessage] = useState<GameMessage | null>(null)
  const [levelComplete, setLevelComplete] = useState(false)
  const [inputFeedback, setInputFeedback] = useState<InputFeedback>(null)
  const [scoreBump, setScoreBump] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const foundWordsSet = useMemo(() => new Set(foundWords), [foundWords])
  const bonusWordsSet = useMemo(() => new Set(bonusWords), [bonusWords])

  const targetReached = foundWords.length >= puzzle.targetWordCount

  // Debounced save
  useEffect(() => {
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveLevelState({
        level: puzzle.level,
        foundWords,
        bonusWords,
        score,
      })
    }, 500)
    return () => clearTimeout(saveTimeoutRef.current)
  }, [puzzle.level, foundWords, bonusWords, score])

  // Save coins whenever they change
  useEffect(() => {
    saveCoins(coins)
  }, [coins])

  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const showMessage = useCallback(
    (text: string, type: GameMessage['type'], reportable?: boolean) => {
      clearTimeout(messageTimeoutRef.current)
      setMessage({ text, type, reportable })
      messageTimeoutRef.current = setTimeout(
        () => setMessage(null),
        reportable ? 4000 : 2000,
      )
    },
    [],
  )

  const triggerFeedback = useCallback((type: InputFeedback) => {
    setInputFeedback(type)
    setTimeout(() => setInputFeedback(null), 500)
  }, [])

  const triggerScoreBump = useCallback(() => {
    setScoreBump(true)
    setTimeout(() => setScoreBump(false), 300)
  }, [])

  const hintsUsedThisLevel = useRef(false)

  const processAchievements = useCallback(async () => {
    const { checkAchievements, unlockAchievement } =
      await import('../lib/achievements')
    const newIds = checkAchievements()
    for (const id of newIds) {
      const achievement = unlockAchievement(id)
      if (achievement) {
        setCoins((prev) => prev + achievement.reward)
        recordCoinsEarned(achievement.reward)
        setTimeout(() => {
          showMessage(
            `Başarı: ${achievement.title}! +${achievement.reward} jeton`,
            'success',
          )
          playAchievement()
          vibrate([50, 30, 50, 30, 50])
        }, 800)
      }
    }
  }, [showMessage])

  const addLetter = useCallback((letter: string) => {
    setCurrentInput((prev) => prev + letter)
    // Sound + vibration handled in LetterGrid for immediate feedback
  }, [])

  const removeLetter = useCallback(() => {
    setCurrentInput((prev) => prev.slice(0, -1))
  }, [])

  const clearInput = useCallback(() => {
    setCurrentInput('')
  }, [])

  const shuffleLetters = useCallback(() => {
    const [center, ...rest] = puzzle.letters
    const shuffled = [...rest]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setPuzzle({ ...puzzle, letters: [center, ...shuffled] })
    playLetterTap()
    vibrate(10)
  }, [puzzle])

  const lastRejectedWordRef = useRef<string | null>(null)

  const submitWord = useCallback(async () => {
    const word = normalizeWord(currentInput)
    setCurrentInput('')

    // 1) Too short
    if (word.length < 4) {
      showMessage('En az 4 harf gerekli', 'warning')
      triggerFeedback('warning')
      playError()
      vibrate(30)
      return
    }

    // 2) Already found?
    if (foundWordsSet.has(word) || bonusWordsSet.has(word)) {
      showMessage('Bu kelimeyi zaten buldun', 'info')
      triggerFeedback('info')
      playError()
      return
    }

    // 3) Invalid character not in puzzle
    const invalidChar = [...word].find((ch) => !puzzle.letters.includes(ch))
    if (invalidChar) {
      showMessage(
        `Bu harf bulmacada yok: ${invalidChar.toLocaleUpperCase('tr-TR')}`,
        'error',
      )
      triggerFeedback('error')
      playError()
      vibrate(30)
      return
    }

    // 4) Missing center letter
    if (!word.includes(puzzle.centerLetter)) {
      if (isAcceptedWord(word)) {
        showMessage('Doğru kelime, ama ortadaki harf yok', 'info')
        triggerFeedback('info')
      } else {
        showMessage('Ortadaki harf kelimede olmalı', 'warning')
        triggerFeedback('warning')
      }
      playError()
      vibrate(30)
      return
    }

    // 5) Target word
    const isTargetWord = puzzle.validWords.includes(word)

    if (isTargetWord) {
      const points = calculateScore(word, puzzle.letters)
      const isPangram = puzzle.pangrams.includes(word)

      const newFoundWords = [...foundWords, word]
      setFoundWords(newFoundWords)
      setScore((prev) => prev + points)
      triggerScoreBump()

      recordWordFound(word, isPangram, false)
      fetchDefinition(word)
      processAchievements()

      if (isPangram) {
        showMessage(`Tam Kelime! +${points} puan`, 'success')
        triggerFeedback('pangram')
        playPangram()
        vibrate([100, 50, 100])
        firePangramConfetti()
      } else {
        showMessage(`+${points} puan`, 'success')
        triggerFeedback('success')
        playSuccess()
        vibrate(50)
      }

      // Level complete check
      if (newFoundWords.length >= puzzle.targetWordCount && !levelComplete) {
        setTimeout(() => {
          const stars = calculateStars(
            newFoundWords.length,
            puzzle.targetWordCount,
            puzzle.validWords.length,
          )
          const prevStars = progress.levelStars[puzzle.level] ?? 0
          const extraStars = Math.max(0, stars - prevStars)
          const newProgress: LevelProgress = {
            currentLevel: progress.currentLevel,
            completedLevels: progress.completedLevels.includes(puzzle.level)
              ? progress.completedLevels
              : [...progress.completedLevels, puzzle.level],
            totalStars: progress.totalStars + extraStars,
            levelStars: {
              ...progress.levelStars,
              [puzzle.level]: Math.max(stars, prevStars),
            },
          }
          setProgress(newProgress)
          saveProgress(newProgress)
          setLevelComplete(true)
          fireAllFoundConfetti()
          if (!progress.completedLevels.includes(puzzle.level)) {
            recordLevelComplete(stars)
            if (!hintsUsedThisLevel.current) {
              void import('../lib/achievements').then(({ recordNoHintLevel }) =>
                recordNoHintLevel(puzzle.level),
              )
            }
            processAchievements()
          }
        }, 600)
      }
      return
    }

    // 6) Bonus word (accepted by hunspell / user dict but not a target)
    if (!isAcceptedWord(word) && !isSpellCheckerReady()) {
      try {
        await loadSpellChecker()
      } catch {
        showMessage(
          navigator.onLine
            ? 'Sözlük yüklenemedi, temel sözlükle devam'
            : 'Bağlantı yok, offline moda geçildi',
          'warning',
        )
      }
    }

    if (isAcceptedWord(word)) {
      setBonusWords((prev) => [...prev, word])
      setCoins((prev) => prev + COIN_PER_BONUS)
      recordWordFound(word, false, true)
      recordCoinsEarned(COIN_PER_BONUS)
      fetchDefinition(word)
      showMessage(`Bonus kelime! +${COIN_PER_BONUS} jeton`, 'success')
      triggerFeedback('bonus')
      playSuccess()
      playCoin()
      vibrate(50)
      processAchievements()
      return
    }

    // 7) Not found in any dictionary — reportable
    lastRejectedWordRef.current = word
    showMessage('Sözlükte bulunamadı', 'error', true)
    triggerFeedback('error')
    playError()
    vibrate(30)
  }, [
    puzzle,
    currentInput,
    foundWords,
    foundWordsSet,
    bonusWordsSet,
    levelComplete,
    progress,
    showMessage,
    triggerFeedback,
    triggerScoreBump,
    processAchievements,
  ])

  const reportLastRejectedWord = useCallback(() => {
    const word = lastRejectedWordRef.current
    if (!word) return

    // Daily limit: max 3 reports
    const todayKey = localDateStr()
    const REPORT_COUNT_KEY = 'kelimece-report-count'
    try {
      const raw = localStorage.getItem(REPORT_COUNT_KEY)
      const data = raw ? JSON.parse(raw) : { date: '', count: 0 }
      if (data.date === todayKey && data.count >= 3) {
        showMessage('Günlük bildirim hakkın doldu (3/3)', 'info')
        return
      }
      const newCount = data.date === todayKey ? data.count + 1 : 1
      localStorage.setItem(
        REPORT_COUNT_KEY,
        JSON.stringify({ date: todayKey, count: newCount }),
      )
    } catch {
      // continue anyway
    }

    reportWord({
      word,
      context: 'rejected_but_valid',
      level: puzzle.level,
      timestamp: Date.now(),
    })

    setCoins((prev) => prev + 10)
    recordCoinsEarned(10)
    lastRejectedWordRef.current = null
    showMessage('Bildirildi, teşekkürler! +10 jeton', 'success')
    playCoin()
    vibrate(50)
  }, [puzzle.level, showMessage])

  const freeHintAvailable = isFreeHintAvailable()

  const spendCoinsForHint = useCallback(
    (cost: number): boolean => {
      hintsUsedThisLevel.current = true
      if (freeHintAvailable) {
        consumeFreeHint()
        showMessage('Günlük ücretsiz ipucu kullanıldı!', 'info')
        return true
      }
      if (coins < cost) {
        showMessage(`Yetersiz jeton (${cost} jeton gerekli)`, 'error')
        playError()
        return false
      }
      setCoins((prev) => prev - cost)
      recordHintUsed(cost)
      return true
    },
    [coins, freeHintAvailable, showMessage],
  )

  const useLetterCountHint = useCallback((): LetterCountHint[] | null => {
    if (!spendCoinsForHint(HINT_COST_LETTER_COUNT)) return null
    const result = getLetterCountHint(puzzle, foundWords)
    if (result.length === 0) {
      showMessage('Tum kelimeleri zaten buldunuz!', 'info')
      return null
    }
    playSuccess()
    return result
  }, [puzzle, foundWords, spendCoinsForHint, showMessage])

  const useFirstLetterHint = useCallback((): FirstLetterHint[] | null => {
    if (!spendCoinsForHint(HINT_COST_FIRST_LETTER)) return null
    const result = getFirstLetterHint(puzzle, foundWords)
    if (result.length === 0) {
      showMessage('Tum kelimeleri zaten buldunuz!', 'info')
      return null
    }
    playSuccess()
    return result
  }, [puzzle, foundWords, spendCoinsForHint, showMessage])

  const useRevealHint = useCallback((): string | null => {
    const word = pickRandomUnfoundWord(puzzle, foundWords)
    if (!word) {
      showMessage('Tum kelimeleri zaten buldunuz!', 'info')
      return null
    }
    if (!spendCoinsForHint(HINT_COST_REVEAL)) return null

    const newFoundWords = [...foundWords, word]
    setFoundWords(newFoundWords)
    recordWordFound(word, puzzle.pangrams.includes(word), false)
    fetchDefinition(word)

    const points = Math.floor(calculateScore(word, puzzle.letters) / 2)
    setScore((prev) => prev + points)
    triggerScoreBump()

    showMessage(`"${word}" açıldı! +${points} puan (yarı)`, 'info')
    playSuccess()
    vibrate(50)

    // Level complete check after hint
    if (newFoundWords.length >= puzzle.targetWordCount && !levelComplete) {
      setTimeout(() => {
        const stars = calculateStars(
          newFoundWords.length,
          puzzle.targetWordCount,
          puzzle.validWords.length,
        )
        const prevStars = progress.levelStars[puzzle.level] ?? 0
        const extraStars = Math.max(0, stars - prevStars)
        const newProgress: LevelProgress = {
          currentLevel: progress.currentLevel,
          completedLevels: progress.completedLevels.includes(puzzle.level)
            ? progress.completedLevels
            : [...progress.completedLevels, puzzle.level],
          totalStars: progress.totalStars + extraStars,
          levelStars: {
            ...progress.levelStars,
            [puzzle.level]: Math.max(stars, prevStars),
          },
        }
        setProgress(newProgress)
        saveProgress(newProgress)
        setLevelComplete(true)
        fireAllFoundConfetti()
        if (!progress.completedLevels.includes(puzzle.level)) {
          recordLevelComplete(stars)
        }
      }, 600)
    }

    return word
  }, [
    puzzle,
    foundWords,
    levelComplete,
    progress,
    spendCoinsForHint,
    showMessage,
    triggerScoreBump,
  ])

  const addCoins = useCallback((amount: number) => {
    setCoins((prev) => prev + amount)
  }, [])

  const nextLevel = useCallback(() => {
    const next = progress.currentLevel + 1
    const newProgress: LevelProgress = {
      ...progress,
      currentLevel: next,
    }
    setProgress(newProgress)
    saveProgress(newProgress)

    const newPuzzle = generateLevelPuzzle(next)
    setPuzzle(newPuzzle)
    setFoundWords([])
    setBonusWords([])
    setScore(0)
    setCurrentInput('')
    setLevelComplete(false)
    hintsUsedThisLevel.current = false
    clearLevelState()
  }, [progress])

  const goToLevel = useCallback((level: number) => {
    const newPuzzle = generateLevelPuzzle(level)
    const saved = loadLevelState(level)
    setPuzzle(newPuzzle)
    setFoundWords(saved?.foundWords ?? [])
    setBonusWords(saved?.bonusWords ?? [])
    setScore(saved?.score ?? 0)
    setCurrentInput('')
    setLevelComplete(false)
  }, [])

  const maxScore = useMemo(() => {
    return puzzle.validWords.reduce(
      (sum, w) => sum + calculateScore(w, puzzle.letters),
      0,
    )
  }, [puzzle])

  return {
    puzzle,
    foundWords,
    bonusWords,
    currentInput,
    score,
    maxScore,
    coins,
    message,
    levelComplete,
    targetReached,
    inputFeedback,
    scoreBump,
    progress,
    addLetter,
    removeLetter,
    clearInput,
    shuffleLetters,
    submitWord,
    reportLastRejectedWord,
    useLetterCountHint,
    useFirstLetterHint,
    useRevealHint,
    freeHintAvailable,
    addCoins,
    goToLevel,
    showMessage,
    nextLevel,
    setLevelComplete,
  }
}
