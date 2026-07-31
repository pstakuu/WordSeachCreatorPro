import type { WordSearchPuzzle } from '../types'

const PUZZLES_KEY = 'word-search-creator-pro:puzzles'
const LIBRARY_ID_KEY = 'word-search-creator-pro:library-id'

function isDirection(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }

  const direction = value as { dr?: unknown; dc?: unknown }
  return typeof direction.dr === 'number' && typeof direction.dc === 'number'
}

function isPlacedWord(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false
  }

  const placedWord = value as {
    word?: unknown
    startRow?: unknown
    startCol?: unknown
    direction?: unknown
  }

  return (
    typeof placedWord.word === 'string' &&
    typeof placedWord.startRow === 'number' &&
    typeof placedWord.startCol === 'number' &&
    isDirection(placedWord.direction)
  )
}

export function isPuzzle(value: unknown): value is WordSearchPuzzle {
  if (!value || typeof value !== 'object') {
    return false
  }

  const puzzle = value as {
    id?: unknown
    name?: unknown
    words?: unknown
    grid?: unknown
    placedWords?: unknown
  }

  return (
    typeof puzzle.id === 'string' &&
    typeof puzzle.name === 'string' &&
    Array.isArray(puzzle.words) &&
    puzzle.words.every((word) => typeof word === 'string') &&
    Array.isArray(puzzle.grid) &&
    puzzle.grid.every(
      (row) => Array.isArray(row) && row.every((cell) => typeof cell === 'string'),
    ) &&
    Array.isArray(puzzle.placedWords) &&
    puzzle.placedWords.every(isPlacedWord)
  )
}

export function loadPuzzles(): WordSearchPuzzle[] {
  try {
    const raw = localStorage.getItem(PUZZLES_KEY)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isPuzzle)
  } catch {
    return []
  }
}

export function savePuzzles(puzzles: WordSearchPuzzle[]): void {
  try {
    localStorage.setItem(PUZZLES_KEY, JSON.stringify(puzzles))
  } catch {
    // Ignore quota / private-mode write failures so the app still runs.
  }
}

export function getOrCreateLibraryId(): string {
  try {
    const existing = localStorage.getItem(LIBRARY_ID_KEY)
    if (existing && existing.length >= 32) {
      return existing
    }
  } catch {
    // Fall through and create a new id.
  }

  const libraryId = crypto.randomUUID()
  try {
    localStorage.setItem(LIBRARY_ID_KEY, libraryId)
  } catch {
    // Still return the id for this session even if persistence fails.
  }
  return libraryId
}

export function getLibraryIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const libraryId = params.get('library')
  if (!libraryId || libraryId.length < 32) {
    return null
  }
  return libraryId
}

export function buildLibraryShareUrl(libraryId: string): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('library', libraryId)
  return url.toString()
}

export function openOwnLibraryUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete('library')
  window.history.replaceState({}, '', url.toString())
}

export function openSharedLibraryUrl(libraryId: string): void {
  const url = new URL(window.location.href)
  url.searchParams.set('library', libraryId)
  window.history.replaceState({}, '', url.toString())
}
