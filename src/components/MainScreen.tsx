import { useEffect, useRef, useState } from 'react'
import type { WordSearchPuzzle } from '../types'

type MainScreenProps = {
  puzzles: WordSearchPuzzle[]
  isOwner: boolean
  cloudEnabled: boolean
  syncStatus: 'idle' | 'loading' | 'saving' | 'error'
  shareUrl: string | null
  onAdd: () => void
  onOpen: (id: string) => void
  onDelete: (id: string) => void
  onShare: () => void
  onGoToMyLibrary: () => void
}

const LONG_PRESS_MS = 500

type PuzzleCardProps = {
  puzzle: WordSearchPuzzle
  canDelete: boolean
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}

function PuzzleCard({ puzzle, canDelete, onOpen, onDelete }: PuzzleCardProps) {
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
    if (!canDelete) {
      return
    }
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

export function MainScreen({
  puzzles,
  isOwner,
  cloudEnabled,
  syncStatus,
  shareUrl,
  onAdd,
  onOpen,
  onDelete,
  onShare,
  onGoToMyLibrary,
}: MainScreenProps) {
  return (
    <div className="main-screen">
      <h1 className="screen-title">{isOwner ? 'My Word Searches' : 'Shared Word Searches'}</h1>

      {!isOwner ? (
        <p className="library-banner">
          You are viewing someone else&apos;s library. You can play puzzles, but only the owner
          can add or delete them.
        </p>
      ) : null}

      {isOwner && !cloudEnabled ? (
        <p className="library-banner warning">
          Cloud sharing is not configured yet. Puzzles still save on this device only.
        </p>
      ) : null}

      {syncStatus === 'loading' ? <p className="library-status">Loading library…</p> : null}
      {syncStatus === 'saving' ? <p className="library-status">Saving…</p> : null}
      {syncStatus === 'error' ? (
        <p className="library-status error">Could not sync with the cloud. Local copy kept.</p>
      ) : null}

      <div className="library-actions">
        {isOwner && cloudEnabled ? (
          <button type="button" className="secondary-button" onClick={onShare}>
            Share my library
          </button>
        ) : null}
        {!isOwner ? (
          <button type="button" className="secondary-button" onClick={onGoToMyLibrary}>
            Go to my library
          </button>
        ) : null}
      </div>

      {shareUrl ? (
        <div className="share-url-box">
          <p>Link copied. Share this URL:</p>
          <code>{shareUrl}</code>
        </div>
      ) : null}

      <div className="puzzle-grid">
        {isOwner ? (
          <button
            type="button"
            className="add-puzzle-button"
            onClick={onAdd}
            aria-label="Add a word search"
          >
            <span className="add-puzzle-plus">+</span>
          </button>
        ) : null}
        {puzzles.map((puzzle) => (
          <PuzzleCard
            key={puzzle.id}
            puzzle={puzzle}
            canDelete={isOwner}
            onOpen={onOpen}
            onDelete={onDelete}
          />
        ))}
      </div>

      {!isOwner && puzzles.length === 0 && syncStatus !== 'loading' ? (
        <p className="empty-library">This shared library does not have any word searches yet.</p>
      ) : null}
    </div>
  )
}
