const STORAGE_KEY = 'kelimece-sound'
const VIBRATION_KEY = 'kelimece-vibration'

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
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

type SoundType = 'success' | 'error' | 'pangram' | 'click'

const SOUNDS: Record<
  SoundType,
  {
    freq: number
    duration: number
    type: OscillatorType
    gain: number
    ramp?: number
  }[]
> = {
  click: [{ freq: 600, duration: 0.04, type: 'sine', gain: 0.08 }],
  success: [
    { freq: 523, duration: 0.1, type: 'sine', gain: 0.12 },
    { freq: 659, duration: 0.1, type: 'sine', gain: 0.12 },
    { freq: 784, duration: 0.15, type: 'sine', gain: 0.1 },
  ],
  error: [
    { freq: 200, duration: 0.15, type: 'square', gain: 0.06 },
    { freq: 160, duration: 0.2, type: 'square', gain: 0.05 },
  ],
  pangram: [
    { freq: 523, duration: 0.1, type: 'sine', gain: 0.12 },
    { freq: 659, duration: 0.1, type: 'sine', gain: 0.12 },
    { freq: 784, duration: 0.1, type: 'sine', gain: 0.12 },
    { freq: 1047, duration: 0.25, type: 'sine', gain: 0.15 },
  ],
}

export function playSound(type: SoundType) {
  if (!isSoundEnabled()) return

  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const notes = SOUNDS[type]
    let offset = 0

    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = note.type
      osc.frequency.value = note.freq
      gain.gain.setValueAtTime(note.gain, ctx.currentTime + offset)
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + offset + note.duration,
      )

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime + offset)
      osc.stop(ctx.currentTime + offset + note.duration + 0.05)

      offset += note.duration * 0.8
    }
  } catch {
    // Web Audio API kullanılamıyorsa sessizce devam et
  }
}
