import type { WordSearchPuzzle } from '../types'

const STORAGE_KEY = 'word-search-creator-pro:puzzles'

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

function isPuzzle(value: unknown): value is WordSearchPuzzle {
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
    const raw = localStorage.getItem(STORAGE_KEY)
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(puzzles))
  } catch {
    // Ignore quota / private-mode write failures so the app still runs.
  }
}
