const CACHE_KEY = 'kelimece-definitions'

export interface WordDefinition {
  word: string
  meaning: string
  type?: string
  example?: string
}

function loadCache(): Record<string, WordDefinition> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveToCache(def: WordDefinition): void {
  try {
    const cache = loadCache()
    cache[def.word] = def
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // quota exceeded — ignore
  }
}

export async function fetchDefinition(
  word: string,
): Promise<WordDefinition | null> {
  const cached = loadCache()[word]
  if (cached) return cached

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(
      `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`,
      { signal: controller.signal },
    )
    clearTimeout(timeout)

    if (!res.ok) return null

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null

    const entry = data[0]
    const firstMeaning = entry.anlamlarListe?.[0]
    if (!firstMeaning?.anlam) return null

    const def: WordDefinition = {
      word,
      meaning: firstMeaning.anlam,
      type: firstMeaning.ozelliklerListe?.[0]?.tam_adi,
      example: firstMeaning.orneklerListe?.[0]?.ornek,
    }

    saveToCache(def)
    return def
  } catch {
    return null
  }
}
