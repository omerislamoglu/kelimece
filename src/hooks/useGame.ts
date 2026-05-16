import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { calculateScore } from '../lib/puzzle'
import { playSound, vibrate } from '../lib/sounds'
import { firePangramConfetti, fireAllFoundConfetti } from '../lib/confetti'
import { WORD_SET } from '../lib/dictionary'
import {
  COIN_PER_WORD,
  COIN_PER_PANGRAM,
  COIN_PER_BONUS,
  HINT_COST,
  INITIAL_COINS,
  STORAGE_KEYS,
} from '../lib/constants'
import {
  generateLevelPuzzle,
  calculateStars,
  loadProgress,
  saveProgress,
  type LevelPuzzle,
  type LevelProgress,
} from '../lib/levels'

interface GameMessage {
  text: string
  type: 'success' | 'error' | 'info'
}

export type InputFeedback = 'success' | 'error' | 'pangram' | 'bonus' | null

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
    return JSON.parse(raw)
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

  const showMessage = useCallback((text: string, type: GameMessage['type']) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 2000)
  }, [])

  const triggerFeedback = useCallback((type: InputFeedback) => {
    setInputFeedback(type)
    setTimeout(() => setInputFeedback(null), 500)
  }, [])

  const triggerScoreBump = useCallback(() => {
    setScoreBump(true)
    setTimeout(() => setScoreBump(false), 300)
  }, [])

  const addLetter = useCallback((letter: string) => {
    setCurrentInput((prev) => prev + letter)
    playSound('click')
    vibrate(10)
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
    playSound('click')
    vibrate(10)
  }, [puzzle])

  const submitWord = useCallback(() => {
    const word = currentInput.toLowerCase()
    setCurrentInput('')

    if (word.length < 4) {
      showMessage('En az 4 harf gerekli', 'error')
      triggerFeedback('error')
      playSound('error')
      vibrate([30, 50, 30])
      return
    }

    if (!word.includes(puzzle.centerLetter)) {
      showMessage('Merkez harf kullanilmali', 'error')
      triggerFeedback('error')
      playSound('error')
      vibrate([30, 50, 30])
      return
    }

    // Already found as target word?
    if (foundWordsSet.has(word)) {
      showMessage('Bu kelimeyi zaten buldunuz', 'info')
      triggerFeedback('error')
      playSound('error')
      return
    }

    // Already found as bonus word?
    if (bonusWordsSet.has(word)) {
      showMessage('Bu kelimeyi zaten buldunuz', 'info')
      triggerFeedback('error')
      playSound('error')
      return
    }

    // Is it a target word (in the puzzle's valid words)?
    const isTargetWord = puzzle.validWords.includes(word)

    if (isTargetWord) {
      // Normal target word flow
      const points = calculateScore(word, puzzle.letters)
      const isPangram = puzzle.pangrams.includes(word)
      const coinReward = isPangram ? COIN_PER_PANGRAM : COIN_PER_WORD

      const newFoundWords = [...foundWords, word]
      setFoundWords(newFoundWords)
      setScore((prev) => prev + points)
      setCoins((prev) => prev + coinReward)
      triggerScoreBump()

      if (isPangram) {
        showMessage(
          `Tam Kelime! +${points} puan, +${coinReward} jeton`,
          'success',
        )
        triggerFeedback('pangram')
        playSound('pangram')
        vibrate([50, 30, 50, 30, 80])
        firePangramConfetti()
      } else {
        showMessage(`+${points} puan, +${coinReward} jeton`, 'success')
        triggerFeedback('success')
        playSound('success')
        vibrate(20)
      }

      // Level complete check
      if (newFoundWords.length >= puzzle.targetWordCount && !levelComplete) {
        setTimeout(() => {
          const stars = calculateStars(
            newFoundWords.length,
            puzzle.targetWordCount,
            puzzle.validWords.length,
          )
          const newProgress: LevelProgress = {
            currentLevel: progress.currentLevel,
            completedLevels: progress.completedLevels.includes(puzzle.level)
              ? progress.completedLevels
              : [...progress.completedLevels, puzzle.level],
            totalStars: progress.totalStars + stars,
          }
          setProgress(newProgress)
          saveProgress(newProgress)
          setLevelComplete(true)
          fireAllFoundConfetti()
        }, 600)
      }
      return
    }

    // Not a target word — is it a real Turkish word in the dictionary?
    if (WORD_SET.has(word)) {
      // Bonus word!
      setBonusWords((prev) => [...prev, word])
      setCoins((prev) => prev + COIN_PER_BONUS)
      showMessage(`Bonus kelime! +${COIN_PER_BONUS} jeton`, 'success')
      triggerFeedback('bonus')
      playSound('success')
      vibrate(20)
      return
    }

    // Not a real word at all
    showMessage('Gecerli bir kelime degil', 'error')
    triggerFeedback('error')
    playSound('error')
    vibrate([30, 50, 30])
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
  ])

  const useHint = useCallback(() => {
    if (coins < HINT_COST) {
      showMessage(`Yetersiz jeton (${HINT_COST} jeton gerekli)`, 'error')
      playSound('error')
      return
    }

    // Find an unfound target word
    const unfound = puzzle.validWords.filter((w) => !foundWordsSet.has(w))
    if (unfound.length === 0) {
      showMessage('Tum kelimeleri zaten buldunuz!', 'info')
      return
    }

    // Pick a random unfound word and reveal it
    const revealedWord = unfound[Math.floor(Math.random() * unfound.length)]

    setCoins((prev) => prev - HINT_COST)
    const newFoundWords = [...foundWords, revealedWord]
    setFoundWords(newFoundWords)

    const points = calculateScore(revealedWord, puzzle.letters)
    setScore((prev) => prev + points)
    triggerScoreBump()

    showMessage(`Ipucu: "${revealedWord}" açıldı! -${HINT_COST} jeton`, 'info')
    playSound('success')
    vibrate(20)

    // Level complete check after hint
    if (newFoundWords.length >= puzzle.targetWordCount && !levelComplete) {
      setTimeout(() => {
        const stars = calculateStars(
          newFoundWords.length,
          puzzle.targetWordCount,
          puzzle.validWords.length,
        )
        const newProgress: LevelProgress = {
          currentLevel: progress.currentLevel,
          completedLevels: progress.completedLevels.includes(puzzle.level)
            ? progress.completedLevels
            : [...progress.completedLevels, puzzle.level],
          totalStars: progress.totalStars + stars,
        }
        setProgress(newProgress)
        saveProgress(newProgress)
        setLevelComplete(true)
        fireAllFoundConfetti()
      }, 600)
    }
  }, [
    coins,
    puzzle,
    foundWords,
    foundWordsSet,
    levelComplete,
    progress,
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
    clearLevelState()
  }, [progress])

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
    useHint,
    addCoins,
    showMessage,
    nextLevel,
    setLevelComplete,
  }
}
