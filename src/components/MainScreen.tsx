import type { WordSearchPuzzle } from '../types'

type MainScreenProps = {
  puzzles: WordSearchPuzzle[]
  onAdd: () => void
  onOpen: (id: string) => void
}

export function MainScreen({ puzzles, onAdd, onOpen }: MainScreenProps) {
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
          <button
            key={puzzle.id}
            type="button"
            className="puzzle-card"
            onClick={() => onOpen(puzzle.id)}
          >
            <span className="puzzle-card-name">{puzzle.name}</span>
            <span className="puzzle-card-count">
              {puzzle.words.length} word{puzzle.words.length === 1 ? '' : 's'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
