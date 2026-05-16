const STORAGE_KEY = 'kelimece-tutorial-completed'

export function isTutorialCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function resetTutorial(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function completeTutorial(): void {
  localStorage.setItem(STORAGE_KEY, 'true')
}
