import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import type { Puzzle } from '../types'
import { generateDailyPuzzle, calculateScore } from '../lib/puzzle'
import { updateStats } from '../lib/stats'
import { playSound, vibrate } from '../lib/sounds'
import { firePangramConfetti, fireAllFoundConfetti } from '../lib/confetti'

interface GameMessage {
  text: string
  type: 'success' | 'error' | 'info'
}

export type InputFeedback = 'success' | 'error' | 'pangram' | null

interface SavedState {
  date: string
  foundWords: string[]
  score: number
  finished: boolean
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

function saveState(date: string, foundWords: string[], score: number, finished: boolean) {
  const state: SavedState = { date, foundWords, score, finished }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useGame() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState<GameMessage | null>(null)
  const [gameComplete, setGameComplete] = useState(false)
  const [finished, setFinished] = useState(false)
  const [inputFeedback, setInputFeedback] = useState<InputFeedback>(null)
  const [scoreBump, setScoreBump] = useState(false)
  const statsRecorded = useRef(false)

  // Puzzle'i olustur ve kayitli durumu yukle
  useEffect(() => {
    const today = new Date()
    const dailyPuzzle = generateDailyPuzzle(today)
    setPuzzle(dailyPuzzle)

    const saved = loadSavedState(dailyPuzzle.date)
    if (saved) {
      setFoundWords(saved.foundWords)
      setScore(saved.score)
      if (saved.finished) {
        setFinished(true)
        statsRecorded.current = true
      }
    }
  }, [])

  // foundWords veya score degistiginde localStorage'a kaydet
  useEffect(() => {
    if (!puzzle) return
    saveState(puzzle.date, foundWords, score, finished)
  }, [puzzle, foundWords, score, finished])

  const showMessage = useCallback(
    (text: string, type: GameMessage['type']) => {
      setMessage({ text, type })
      setTimeout(() => setMessage(null), 2000)
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
    if (!puzzle) return
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

  const finishGame = useCallback(
    (date: string, finalScore: number, wordsFound: number) => {
      if (statsRecorded.current) return
      statsRecorded.current = true
      setFinished(true)
      setGameComplete(true)
      updateStats(date, finalScore, wordsFound)
    },
    [],
  )

  const submitWord = useCallback(() => {
    if (!puzzle) return

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

    const letterSet = new Set(puzzle.letters)
    if (![...word].every((ch) => letterSet.has(ch))) {
      showMessage('Sadece verilen harfler kullanilabilir', 'error')
      triggerFeedback('error')
      playSound('error')
      vibrate([30, 50, 30])
      return
    }

    if (foundWords.includes(word)) {
      showMessage('Bu kelimeyi zaten buldunuz', 'info')
      triggerFeedback('error')
      playSound('error')
      return
    }

    if (!puzzle.validWords.includes(word)) {
      showMessage('Gecerli bir kelime degil', 'error')
      triggerFeedback('error')
      playSound('error')
      vibrate([30, 50, 30])
      return
    }

    const points = calculateScore(word, puzzle.letters)
    const isPangram = puzzle.pangrams.includes(word)

    setFoundWords((prev) => [...prev, word])
    setScore((prev) => prev + points)
    triggerScoreBump()

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

    // Tum kelimeler bulunduysa otomatik oyun bitisi
    const newFoundWords = [...foundWords, word]
    if (puzzle.validWords.length === newFoundWords.length) {
      setTimeout(() => fireAllFoundConfetti(), 500)
      finishGame(puzzle.date, score + points, newFoundWords.length)
    }
  }, [puzzle, currentInput, foundWords, score, showMessage, finishGame, triggerFeedback, triggerScoreBump])

  const endGame = useCallback(() => {
    if (!puzzle) return
    finishGame(puzzle.date, score, foundWords.length)
  }, [puzzle, score, foundWords.length, finishGame])

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
    gameComplete,
    finished,
    inputFeedback,
    scoreBump,
    addLetter,
    removeLetter,
    clearInput,
    shuffleLetters,
    submitWord,
    showMessage,
    endGame,
    setGameComplete,
  }
}
