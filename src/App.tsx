import { useState } from 'react'
import './App.css'
import { CreateWordSearch } from './components/CreateWordSearch'
import { MainScreen } from './components/MainScreen'
import { PlayWordSearch } from './components/PlayWordSearch'
import { StartScreen } from './components/StartScreen'
import type { AppView, WordSearchPuzzle } from './types'
import { generateWordSearch } from './utils/wordSearchGenerator'

function App() {
  const [view, setView] = useState<AppView>('start')
  const [puzzles, setPuzzles] = useState<WordSearchPuzzle[]>([])
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const activePuzzle = puzzles.find((puzzle) => puzzle.id === activePuzzleId) ?? null

  const handleCreateDone = (name: string, words: string[]) => {
    const puzzle = generateWordSearch(crypto.randomUUID(), name, words)

    if (!puzzle) {
      setCreateError(
        'Could not fit all words in the puzzle. Try shorter words or fewer words.',
      )
      return
    }

    setPuzzles((current) => [...current, puzzle])
    setCreateError(null)
    setView('main')
  }

  return (
    <>
      {view === 'start' ? <StartScreen onStart={() => setView('main')} /> : null}

      {view === 'main' ? (
        <MainScreen
          puzzles={puzzles}
          onAdd={() => {
            setCreateError(null)
            setView('create')
          }}
          onOpen={(id) => {
            setActivePuzzleId(id)
            setView('play')
          }}
          onDelete={(id) => {
            setPuzzles((current) => current.filter((puzzle) => puzzle.id !== id))
            if (activePuzzleId === id) {
              setActivePuzzleId(null)
            }
          }}
        />
      ) : null}

      {view === 'create' ? (
        <CreateWordSearch
          errorMessage={createError}
          onCancel={() => {
            setCreateError(null)
            setView('main')
          }}
          onDone={handleCreateDone}
        />
      ) : null}

      {view === 'play' && activePuzzle ? (
        <PlayWordSearch
          puzzle={activePuzzle}
          onBack={() => {
            setActivePuzzleId(null)
            setView('main')
          }}
        />
      ) : null}
    </>
  )
}

export default App
