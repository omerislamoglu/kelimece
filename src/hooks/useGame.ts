import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Puzzle } from '../types'
import { generateDailyPuzzle, calculateScore } from '../lib/puzzle'

interface GameMessage {
  text: string
  type: 'success' | 'error' | 'info'
}

interface SavedState {
  date: string
  foundWords: string[]
  score: number
}

const STORAGE_KEY = 'kelimece-game'

function loadSavedState(date: string): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved: SavedState = JSON.parse(raw)
    if (saved.date !== date) return null
    return saved
  } catch {
    return null
  }
}

function saveState(date: string, foundWords: string[], score: number) {
  const state: SavedState = { date, foundWords, score }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useGame() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState<GameMessage | null>(null)

  // Puzzle'ı oluştur ve kayıtlı durumu yükle
  useEffect(() => {
    const today = new Date()
    const dailyPuzzle = generateDailyPuzzle(today)
    setPuzzle(dailyPuzzle)

    const saved = loadSavedState(dailyPuzzle.date)
    if (saved) {
      setFoundWords(saved.foundWords)
      setScore(saved.score)
    }
  }, [])

  // foundWords veya score değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (!puzzle) return
    saveState(puzzle.date, foundWords, score)
  }, [puzzle, foundWords, score])

  const showMessage = useCallback(
    (text: string, type: GameMessage['type']) => {
      setMessage({ text, type })
      setTimeout(() => setMessage(null), 2000)
    },
    [],
  )

  const addLetter = useCallback((letter: string) => {
    setCurrentInput((prev) => prev + letter)
  }, [])

  const removeLetter = useCallback(() => {
    setCurrentInput((prev) => prev.slice(0, -1))
  }, [])

  const clearInput = useCallback(() => {
    setCurrentInput('')
  }, [])

  const shuffleLetters = useCallback(() => {
    if (!puzzle) return
    const [center, ...rest] = puzzle.letters
    const shuffled = [...rest]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setPuzzle({ ...puzzle, letters: [center, ...shuffled] })
  }, [puzzle])

  const submitWord = useCallback(() => {
    if (!puzzle) return

    const word = currentInput.toLowerCase()
    setCurrentInput('')

    if (word.length < 4) {
      showMessage('En az 4 harf gerekli', 'error')
      return
    }

    if (!word.includes(puzzle.centerLetter)) {
      showMessage('Merkez harf kullanılmalı', 'error')
      return
    }

    const letterSet = new Set(puzzle.letters)
    if (![...word].every((ch) => letterSet.has(ch))) {
      showMessage('Sadece verilen harfler kullanılabilir', 'error')
      return
    }

    if (foundWords.includes(word)) {
      showMessage('Bu kelimeyi zaten buldunuz', 'info')
      return
    }

    if (!puzzle.validWords.includes(word)) {
      showMessage('Geçerli bir kelime değil', 'error')
      return
    }

    const points = calculateScore(word, puzzle.letters)
    const isPangram = puzzle.pangrams.includes(word)

    setFoundWords((prev) => [...prev, word])
    setScore((prev) => prev + points)

    if (isPangram) {
      showMessage(`Tam Kelime! +${points} puan`, 'success')
    } else {
      showMessage(`+${points} puan`, 'success')
    }
  }, [puzzle, currentInput, foundWords, showMessage])

  const maxScore = useMemo(() => {
    if (!puzzle) return 0
    return puzzle.validWords.reduce(
      (sum, w) => sum + calculateScore(w, puzzle.letters),
      0,
    )
  }, [puzzle])

  return {
    puzzle,
    foundWords,
    currentInput,
    score,
    maxScore,
    message,
    addLetter,
    removeLetter,
    clearInput,
    shuffleLetters,
    submitWord,
    showMessage,
  }
}
