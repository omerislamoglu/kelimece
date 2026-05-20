interface SpellInstance {
  correct: (word: string) => boolean
  suggest: (word: string) => string[]
}

let spellInstance: SpellInstance | null = null
let loadPromise: Promise<void> | null = null
let loadError: Error | null = null
let _ready = false

/** Hunspell sözlüğünü yükler. İlk çağrıda fetch, sonraki çağrılarda anında döner. */
export async function loadSpellChecker(): Promise<void> {
  if (spellInstance) return
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const { default: nspell } = await import('nspell')
    const [aff, dic] = await Promise.all([
      fetch('/dictionary/tr_TR.aff').then((r) => {
        if (!r.ok) throw new Error(`Hunspell aff yüklenemedi: ${r.status}`)
        return r.text()
      }),
      fetch('/dictionary/tr_TR.dic').then((r) => {
        if (!r.ok) throw new Error(`Hunspell dic yüklenemedi: ${r.status}`)
        return r.text()
      }),
    ])
    spellInstance = nspell({ aff, dic })
    loadError = null
    _ready = true
  })().catch((error: unknown) => {
    loadPromise = null
    _ready = false
    loadError = error instanceof Error ? error : new Error(String(error))
    throw loadError
  })

  return loadPromise
}

/** Sözlük yüklendi mi? */
export function isSpellCheckerReady(): boolean {
  return _ready
}

/** Son Hunspell yükleme hatası. Fallback için sadece bilgi amaçlıdır. */
export function getSpellCheckerLoadError(): Error | null {
  return loadError
}

/** Hunspell ile Türkçe kelime doğrulaması — kök + çekimli formları kapsar. */
export function isValidTurkishWord(word: string): boolean {
  if (!spellInstance) return false
  return spellInstance.correct(word)
}

/** Yanlış yazılmış kelime için öneri listesi. */
export function getSuggestions(word: string, max = 5): string[] {
  if (!spellInstance) return []
  return spellInstance.suggest(word).slice(0, max)
}
