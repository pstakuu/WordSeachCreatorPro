export type Direction = {
  dr: number
  dc: number
}

export type PlacedWord = {
  word: string
  startRow: number
  startCol: number
  direction: Direction
}

export type WordSearchPuzzle = {
  id: string
  name: string
  words: string[]
  grid: string[][]
  placedWords: PlacedWord[]
}

export type AppView = 'start' | 'main' | 'create' | 'play'

export type CellPosition = {
  row: number
  col: number
}
