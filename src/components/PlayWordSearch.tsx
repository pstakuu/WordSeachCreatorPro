import { useMemo, useState } from 'react'
import type { CellPosition, WordSearchPuzzle } from '../types'
import {
  getCellsForSelection,
  isWordFound,
  selectionMatchesWord,
} from '../utils/wordSearchGenerator'

type PlayWordSearchProps = {
  puzzle: WordSearchPuzzle
  onBack: () => void
}

function cellKey({ row, col }: CellPosition): string {
  return `${row}-${col}`
}

export function PlayWordSearch({ puzzle, onBack }: PlayWordSearchProps) {
  const [selectionStart, setSelectionStart] = useState<CellPosition | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<CellPosition | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [foundWords, setFoundWords] = useState<string[]>([])

  const selectedCells = useMemo(() => {
    if (!selectionStart || !selectionEnd) {
      return []
    }
    return getCellsForSelection(selectionStart, selectionEnd)
  }, [selectionStart, selectionEnd])

  const selectedCellKeys = useMemo(
    () => new Set(selectedCells.map((cell) => cellKey(cell))),
    [selectedCells],
  )

  const foundCellKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const placedWord of puzzle.placedWords) {
      if (!foundWords.includes(placedWord.word)) {
        continue
      }

      for (let i = 0; i < placedWord.word.length; i += 1) {
        const row = placedWord.startRow + placedWord.direction.dr * i
        const col = placedWord.startCol + placedWord.direction.dc * i
        keys.add(cellKey({ row, col }))
      }
    }
    return keys
  }, [foundWords, puzzle.placedWords])

  const beginSelection = (cell: CellPosition) => {
    setSelectionStart(cell)
    setSelectionEnd(cell)
    setIsSelecting(true)
  }

  const updateSelection = (cell: CellPosition) => {
    if (!isSelecting || !selectionStart) {
      return
    }
    setSelectionEnd(cell)
  }

  const endSelection = () => {
    if (!selectionStart || !selectionEnd) {
      setIsSelecting(false)
      return
    }

    const cells = getCellsForSelection(selectionStart, selectionEnd)
    const selectedWord = selectionMatchesWord(puzzle.grid, cells)

    if (selectedWord && isWordFound(selectedWord, puzzle)) {
      const normalized = selectedWord.toUpperCase()
      const match = puzzle.words.find(
        (word) => word === normalized || word === normalized.split('').reverse().join(''),
      )

      if (match && !foundWords.includes(match)) {
        setFoundWords((current) => [...current, match])
      }
    }

    setSelectionStart(null)
    setSelectionEnd(null)
    setIsSelecting(false)
  }

  return (
    <div className="play-screen">
      <div className="play-header">
        <button type="button" className="secondary-button" onClick={onBack}>
          Back
        </button>
        <h1 className="screen-title">{puzzle.name}</h1>
      </div>

      <div className="play-content">
        <div
          className="word-search-grid"
          onMouseLeave={endSelection}
          onMouseUp={endSelection}
          onTouchEnd={endSelection}
        >
          {puzzle.grid.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="word-search-row">
              {row.map((letter, colIndex) => {
                const key = cellKey({ row: rowIndex, col: colIndex })
                const isSelected = selectedCellKeys.has(key)
                const isFound = foundCellKeys.has(key)

                return (
                  <button
                    key={key}
                    type="button"
                    className={`grid-cell${isSelected ? ' selected' : ''}${isFound ? ' found' : ''}`}
                    onMouseDown={() => beginSelection({ row: rowIndex, col: colIndex })}
                    onMouseEnter={() => updateSelection({ row: rowIndex, col: colIndex })}
                    onTouchStart={() => beginSelection({ row: rowIndex, col: colIndex })}
                    onTouchMove={(event) => {
                      const touch = event.touches[0]
                      const target = document.elementFromPoint(touch.clientX, touch.clientY)
                      const rowValue = target?.getAttribute('data-row')
                      const colValue = target?.getAttribute('data-col')
                      if (rowValue && colValue) {
                        updateSelection({ row: Number(rowValue), col: Number(colValue) })
                      }
                    }}
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <aside className="word-list">
          <h2>Word list</h2>
          <ul>
            {puzzle.words.map((word) => (
              <li key={word} className={foundWords.includes(word) ? 'found-word' : ''}>
                {word}
              </li>
            ))}
          </ul>
          {foundWords.length === puzzle.words.length ? (
            <p className="success-message">You found every word!</p>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
