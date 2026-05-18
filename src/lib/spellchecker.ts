import nspell from 'nspell';

let spellInstance: ReturnType<typeof nspell> | null = null;
let loadPromise: Promise<void> | null = null;
let _ready = false;

/** Hunspell sözlüğünü yükler. İlk çağrıda fetch, sonraki çağrılarda anında döner. */
export async function loadSpellChecker(): Promise<void> {
  if (spellInstance) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const [aff, dic] = await Promise.all([
      fetch('/dictionary/tr_TR.aff').then(r => r.text()),
      fetch('/dictionary/tr_TR.dic').then(r => r.text()),
    ]);
    spellInstance = nspell({ aff, dic });
    _ready = true;
  })();

  return loadPromise;
}

/** Sözlük yüklendi mi? */
export function isSpellCheckerReady(): boolean {
  return _ready;
}

/** Hunspell ile Türkçe kelime doğrulaması — kök + çekimli formları kapsar. */
export function isValidTurkishWord(word: string): boolean {
  if (!spellInstance) return false;
  return spellInstance.correct(word);
}

/** Yanlış yazılmış kelime için öneri listesi. */
export function getSuggestions(word: string, max = 5): string[] {
  if (!spellInstance) return [];
  return spellInstance.suggest(word).slice(0, max);
}
