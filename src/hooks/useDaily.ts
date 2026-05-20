import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { calculateScore } from '../lib/puzzle'
import { playSound, vibrate } from '../lib/sounds'
import { firePangramConfetti, fireAllFoundConfetti } from '../lib/confetti'
import { isAcceptedWord, normalizeWord } from '../lib/dictionary'
import { isSpellCheckerReady, loadSpellChecker } from '../lib/spellchecker'
import { fetchDefinition } from '../lib/definitions'
import { COIN_PER_BONUS } from '../lib/constants'
import type { MessageType, InputFeedback } from './useGame'
import {
  getDailyPuzzle,
  loadDailyState,
  saveDailyState,
  recordDailyCompletion,
  getToday,
  type DailyPuzzle,
} from '../lib/dailyPuzzle'

interface DailyMessage {
  text: string
  type: MessageType
  reportable?: boolean
}

export function useDaily() {
  const today = getToday()
  const dateStr = today.toISOString().slice(0, 10)

  const [puzzle] = useState<DailyPuzzle>(() => getDailyPuzzle(today))

  const [initialState] = useState(() => {
    const saved = loadDailyState(dateStr)
    return {
      foundWords: saved?.foundWords ?? [],
      bonusWords: saved?.bonusWords ?? [],
      score: saved?.score ?? 0,
      completed: saved?.completed ?? false,
    }
  })

  const [foundWords, setFoundWords] = useState<string[]>(
    initialState.foundWords,
  )
  const [bonusWords, setBonusWords] = useState<string[]>(
    initialState.bonusWords,
  )
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(initialState.score)
  const [message, setMessage] = useState<DailyMessage | null>(null)
  const [completed, setCompleted] = useState(initialState.completed)
  const [inputFeedback, setInputFeedback] = useState<InputFeedback>(null)
  const [scoreBump, setScoreBump] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  const foundWordsSet = useMemo(() => new Set(foundWords), [foundWords])
  const bonusWordsSet = useMemo(() => new Set(bonusWords), [bonusWords])

  // Debounced save
  useEffect(() => {
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveDailyState({
        date: dateStr,
        foundWords,
        bonusWords,
        score,
        completed,
      })
    }, 500)
    return () => clearTimeout(saveTimeoutRef.current)
  }, [dateStr, foundWords, bonusWords, score, completed])

  const showMessage = useCallback(
    (text: string, type: DailyMessage['type'], reportable?: boolean) => {
      setMessage({ text, type, reportable })
      setTimeout(() => setMessage(null), reportable ? 4000 : 2000)
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
    // Daily puzzle letters are fixed — we just shuffle the non-center ones visually
    // But we don't mutate puzzle.letters since it's deterministic
    playSound('click')
    vibrate(10)
  }, [])

  const submitWord = useCallback(async () => {
    const word = normalizeWord(currentInput)
    setCurrentInput('')

    if (word.length < 4) {
      showMessage('En az 4 harf gerekli', 'warning')
      triggerFeedback('warning')
      playSound('error')
      vibrate([30, 50, 30])
      return
    }

    if (foundWordsSet.has(word) || bonusWordsSet.has(word)) {
      showMessage('Bu kelimeyi zaten buldun', 'info')
      triggerFeedback('info')
      playSound('error')
      return
    }

    const invalidChar = [...word].find((ch) => !puzzle.letters.includes(ch))
    if (invalidChar) {
      showMessage(
        `Bu harf bulmacada yok: ${invalidChar.toLocaleUpperCase('tr-TR')}`,
        'error',
      )
      triggerFeedback('error')
      playSound('error')
      vibrate([30, 50, 30])
      return
    }

    if (!word.includes(puzzle.centerLetter)) {
      if (isAcceptedWord(word)) {
        showMessage('Doğru kelime, ama ortadaki harf yok', 'info')
        triggerFeedback('info')
      } else {
        showMessage('Ortadaki harf kelimede olmalı', 'warning')
        triggerFeedback('warning')
      }
      playSound('error')
      vibrate([30, 50, 30])
      return
    }

    const isTargetWord = puzzle.validWords.includes(word)

    if (isTargetWord) {
      const points = calculateScore(word, puzzle.letters)
      const isPangram = puzzle.pangrams.includes(word)

      const newFoundWords = [...foundWords, word]
      setFoundWords(newFoundWords)
      setScore((prev) => prev + points)
      triggerScoreBump()
      fetchDefinition(word)

      if (isPangram) {
        showMessage(`Tam Kelime! +${points} puan`, 'success')
        triggerFeedback('pangram')
        playSound('pangram')
        vibrate([50, 30, 50, 30, 80])
        firePangramConfetti()
      } else {
        showMessage(`+${points} puan`, 'success')
        triggerFeedback('success')
        playSound('success')
        vibrate(20)
      }

      // Check if all words found
      if (newFoundWords.length >= puzzle.validWords.length && !completed) {
        setTimeout(() => {
          setCompleted(true)
          const isPerfect = newFoundWords.length === puzzle.validWords.length
          recordDailyCompletion(dateStr, isPerfect)
          fireAllFoundConfetti()
        }, 600)
      }
      return
    }

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
      fetchDefinition(word)
      showMessage(`Bonus kelime! +${COIN_PER_BONUS} puan`, 'success')
      triggerFeedback('bonus')
      playSound('success')
      vibrate(20)
      return
    }

    showMessage('Sözlükte bulunamadı', 'error', true)
    triggerFeedback('error')
    playSound('error')
    vibrate([30, 50, 30])
  }, [
    puzzle,
    currentInput,
    foundWords,
    foundWordsSet,
    bonusWordsSet,
    completed,
    dateStr,
    showMessage,
    triggerFeedback,
    triggerScoreBump,
  ])

  const markCompleted = useCallback(() => {
    if (completed) return
    setCompleted(true)
    const isPerfect = foundWords.length === puzzle.validWords.length
    recordDailyCompletion(dateStr, isPerfect)
  }, [completed, foundWords.length, puzzle.validWords.length, dateStr])

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
    message,
    completed,
    inputFeedback,
    scoreBump,
    dateStr,
    addLetter,
    removeLetter,
    clearInput,
    shuffleLetters,
    submitWord,
    markCompleted,
    showMessage,
  }
}
