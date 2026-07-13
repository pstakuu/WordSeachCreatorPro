import { useEffect, useRef, useState } from 'react'
import type { WordSearchPuzzle } from '../types'

type MainScreenProps = {
  puzzles: WordSearchPuzzle[]
  onAdd: () => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

const LONG_PRESS_MS = 500

type PuzzleCardProps = {
  puzzle: WordSearchPuzzle
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

function PuzzleCard({ puzzle, onOpen, onDelete }: PuzzleCardProps) {
  const [showDelete, setShowDelete] = useState(false)
  const longPressTimer = useRef<number | null>(null)
  const longPressTriggered = useRef(false)

  const clearLongPressTimer = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const startLongPress = () => {
    longPressTriggered.current = false
    clearLongPressTimer()
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true
      setShowDelete(true)
    }, LONG_PRESS_MS)
  }

  const endLongPress = () => {
    clearLongPressTimer()
  }

  const handleOpen = () => {
    if (longPressTriggered.current || showDelete) {
      return
    }
    onOpen(puzzle.id)
  }

  const handleDelete = () => {
    onDelete(puzzle.id)
    setShowDelete(false)
  }

  useEffect(() => {
    return () => clearLongPressTimer()
  }, [])

  return (
    <div className="puzzle-card-wrapper">
      <button
        type="button"
        className={`puzzle-card${showDelete ? ' puzzle-card-active' : ''}`}
        onClick={handleOpen}
        onMouseDown={startLongPress}
        onMouseUp={endLongPress}
        onMouseLeave={endLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={endLongPress}
        onTouchCancel={endLongPress}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span className="puzzle-card-name">{puzzle.name}</span>
        <span className="puzzle-card-count">
          {puzzle.words.length} word{puzzle.words.length === 1 ? '' : 's'}
        </span>
      </button>
      {showDelete ? (
        <div className="puzzle-delete-menu">
          <button type="button" className="delete-puzzle-button" onClick={handleDelete}>
            Delete Word Search
          </button>
          <button
            type="button"
            className="secondary-button cancel-delete-button"
            onClick={() => setShowDelete(false)}
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function MainScreen({ puzzles, onAdd, onOpen, onDelete }: MainScreenProps) {
  return (
    <div className="main-screen">
      <h1 className="screen-title">My Word Searches</h1>
      <div className="puzzle-grid">
        <button
          type="button"
          className="add-puzzle-button"
          onClick={onAdd}
          aria-label="Add a word search"
        >
          <span className="add-puzzle-plus">+</span>
        </button>
        {puzzles.map((puzzle) => (
          <PuzzleCard
            key={puzzle.id}
            puzzle={puzzle}
            onOpen={onOpen}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
