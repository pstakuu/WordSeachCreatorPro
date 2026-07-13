import type { Direction, PlacedWord, WordSearchPuzzle } from '../types'

const DIRECTIONS: Direction[] = [
  { dr: 0, dc: 1 },
  { dr: 0, dc: -1 },
  { dr: 1, dc: 0 },
  { dr: -1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: -1, dc: 1 },
  { dr: -1, dc: -1 },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomLetter(): string {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
}

function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: Direction,
): boolean {
  const size = grid.length

  for (let i = 0; i < word.length; i += 1) {
    const r = row + direction.dr * i
    const c = col + direction.dc * i

    if (r < 0 || r >= size || c < 0 || c >= size) {
      return false
    }

    const existing = grid[r][c]
    if (existing !== '' && existing !== word[i]) {
      return false
    }
  }

  return true
}

function placeWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: Direction,
): void {
  for (let i = 0; i < word.length; i += 1) {
    const r = row + direction.dr * i
    const c = col + direction.dc * i
    grid[r][c] = word[i]
  }
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function calculateGridSize(words: string[]): number {
  const longestWord = Math.max(...words.map((word) => word.length))
  return Math.max(10, longestWord + 2, Math.ceil(Math.sqrt(words.join('').length * 2)))
}

export function generateWordSearch(
  id: string,
  name: string,
  rawWords: string[],
): WordSearchPuzzle | null {
  const words = rawWords
    .map((word) => word.trim().toUpperCase())
    .filter((word) => word.length > 0)

  if (words.length === 0 || !name.trim()) {
    return null
  }

  const size = calculateGridSize(words)
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ''))
  const placedWords: PlacedWord[] = []

  for (const word of shuffle(words)) {
    let placed = false
    const attempts = size * size * DIRECTIONS.length

    for (let attempt = 0; attempt < attempts && !placed; attempt += 1) {
      const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
      const row = Math.floor(Math.random() * size)
      const col = Math.floor(Math.random() * size)

      if (canPlaceWord(grid, word, row, col, direction)) {
        placeWord(grid, word, row, col, direction)
        placedWords.push({ word, startRow: row, startCol: col, direction })
        placed = true
      }
    }

    if (!placed) {
      return null
    }
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (grid[row][col] === '') {
        grid[row][col] = randomLetter()
      }
    }
  }

  return {
    id,
    name: name.trim(),
    words,
    grid,
    placedWords,
  }
}

export function getCellsForSelection(
  start: { row: number; col: number },
  end: { row: number; col: number },
): { row: number; col: number }[] {
  const rowDelta = end.row - start.row
  const colDelta = end.col - start.col
  const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta))

  if (steps === 0) {
    return [start]
  }

  const dr = rowDelta === 0 ? 0 : rowDelta / Math.abs(rowDelta)
  const dc = colDelta === 0 ? 0 : colDelta / Math.abs(colDelta)

  if (Math.abs(rowDelta) !== steps && Math.abs(colDelta) !== steps) {
    return []
  }

  const cells: { row: number; col: number }[] = []
  for (let i = 0; i <= steps; i += 1) {
    cells.push({
      row: start.row + dr * i,
      col: start.col + dc * i,
    })
  }

  return cells
}

export function selectionMatchesWord(
  grid: string[][],
  cells: { row: number; col: number }[],
): string | null {
  if (cells.length < 2) {
    return null
  }

  return cells.map(({ row, col }) => grid[row][col]).join('')
}

export function isWordFound(
  selectedWord: string,
  puzzle: WordSearchPuzzle,
): boolean {
  const normalized = selectedWord.toUpperCase()
  const reversed = normalized.split('').reverse().join('')
  return puzzle.words.includes(normalized) || puzzle.words.includes(reversed)
}
