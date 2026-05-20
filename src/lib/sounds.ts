const STORAGE_KEY = 'kelimece-sound'
const VIBRATION_KEY = 'kelimece-vibration'

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== 'false'
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, String(enabled))
}

export function isVibrationEnabled(): boolean {
  return localStorage.getItem(VIBRATION_KEY) !== 'false'
}

export function setVibrationEnabled(enabled: boolean) {
  localStorage.setItem(VIBRATION_KEY, String(enabled))
}

export function vibrate(pattern: number | number[] = 10) {
  if (!isVibrationEnabled()) return
  navigator.vibrate?.(pattern)
}

// ── Helpers ────────────────────────────────────────────────────────────────────

interface Note {
  freq: number
  duration: number
  type: OscillatorType
  gain: number
}

function playNotes(notes: Note[], overlap = 0.8) {
  if (!isSoundEnabled()) return
  try {
    const ctx = getCtx()
    let offset = 0
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = note.type
      osc.frequency.value = note.freq
      g.gain.setValueAtTime(note.gain, ctx.currentTime + offset)
      g.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + offset + note.duration,
      )
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(ctx.currentTime + offset)
      osc.stop(ctx.currentTime + offset + note.duration + 0.05)
      offset += note.duration * overlap
    }
  } catch {
    // Web Audio API unavailable — silently continue
  }
}

function playChord(
  freqs: number[],
  duration: number,
  gain: number,
  type: OscillatorType = 'sine',
) {
  if (!isSoundEnabled()) return
  try {
    const ctx = getCtx()
    for (const freq of freqs) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      g.gain.setValueAtTime(gain / freqs.length, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration + 0.05)
    }
  } catch {
    // silently continue
  }
}

// ── Sound effects ─────────────────────────────────────────────────────────────

/** Short click/tap — 440Hz sine, 30ms */
export function playLetterTap() {
  playNotes([{ freq: 440, duration: 0.03, type: 'sine', gain: 0.08 }])
}

/** Soft submit chime — two-note chord */
export function playSubmit() {
  playChord([523, 659], 0.12, 0.14)
}

/** Rising 3-note success — C5 E5 G5 */
export function playSuccess() {
  playNotes([
    { freq: 523, duration: 0.1, type: 'sine', gain: 0.12 },
    { freq: 659, duration: 0.1, type: 'sine', gain: 0.12 },
    { freq: 784, duration: 0.15, type: 'sine', gain: 0.1 },
  ])
}

/** Enchanting 5-note pangram chord — C5 E5 G5 B5 C6 */
export function playPangram() {
  playNotes(
    [
      { freq: 523, duration: 0.1, type: 'sine', gain: 0.12 },
      { freq: 659, duration: 0.1, type: 'sine', gain: 0.12 },
      { freq: 784, duration: 0.1, type: 'sine', gain: 0.12 },
      { freq: 988, duration: 0.12, type: 'sine', gain: 0.13 },
      { freq: 1047, duration: 0.25, type: 'sine', gain: 0.15 },
    ],
    0.75,
  )
}

/** Low buzzer error — 220Hz square, 100ms */
export function playError() {
  playNotes([{ freq: 220, duration: 0.1, type: 'square', gain: 0.06 }])
}

/** Level complete fanfare — 4-note crescendo */
export function playLevelComplete() {
  playNotes(
    [
      { freq: 523, duration: 0.12, type: 'sine', gain: 0.1 },
      { freq: 659, duration: 0.12, type: 'sine', gain: 0.12 },
      { freq: 784, duration: 0.12, type: 'sine', gain: 0.14 },
      { freq: 1047, duration: 0.3, type: 'sine', gain: 0.18 },
    ],
    0.85,
  )
}

/** Coin ching — high tinkly */
export function playCoin() {
  playNotes([
    { freq: 1800, duration: 0.04, type: 'sine', gain: 0.1 },
    { freq: 2400, duration: 0.08, type: 'sine', gain: 0.08 },
  ])
}

/** Achievement tada — short celebratory fanfare */
export function playAchievement() {
  playNotes(
    [
      { freq: 659, duration: 0.08, type: 'sine', gain: 0.1 },
      { freq: 784, duration: 0.08, type: 'sine', gain: 0.12 },
      { freq: 1047, duration: 0.2, type: 'sine', gain: 0.15 },
    ],
    0.7,
  )
}

// ── Legacy API (kept for compatibility) ────────────────────────────────────────

type SoundType = 'success' | 'error' | 'pangram' | 'click'

export function playSound(type: SoundType) {
  switch (type) {
    case 'click':
      playLetterTap()
      break
    case 'success':
      playSuccess()
      break
    case 'error':
      playError()
      break
    case 'pangram':
      playPangram()
      break
  }
}
