import { useEffect, useRef, useState } from 'react'
import './App.css'
import { CreateWordSearch } from './components/CreateWordSearch'
import { MainScreen } from './components/MainScreen'
import { PlayWordSearch } from './components/PlayWordSearch'
import { StartScreen } from './components/StartScreen'
import type { AppView, WordSearchPuzzle } from './types'
import {
  isFirebaseConfigured,
  loadLibraryFromCloud,
  saveLibraryToCloud,
} from './utils/libraryCloud'
import {
  buildLibraryShareUrl,
  getLibraryIdFromUrl,
  getOrCreateLibraryId,
  loadPuzzles,
  openOwnLibraryUrl,
  savePuzzles,
} from './utils/puzzleStorage'
import { generateWordSearch } from './utils/wordSearchGenerator'

function App() {
  const myLibraryId = useRef(getOrCreateLibraryId())
  const sharedLibraryId = getLibraryIdFromUrl()
  const activeLibraryId = sharedLibraryId ?? myLibraryId.current
  const isOwner = activeLibraryId === myLibraryId.current
  const cloudEnabled = isFirebaseConfigured()

  const [view, setView] = useState<AppView>('start')
  const [puzzles, setPuzzles] = useState<WordSearchPuzzle[]>(() =>
    isOwner ? loadPuzzles() : [],
  )
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'saving' | 'error'>('idle')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [libraryReady, setLibraryReady] = useState(!cloudEnabled)
  const skipNextCloudSave = useRef(true)

  useEffect(() => {
    let cancelled = false

    async function hydrateLibrary() {
      if (!cloudEnabled) {
        setLibraryReady(true)
        return
      }

      setSyncStatus('loading')
      try {
        const remotePuzzles = await loadLibraryFromCloud(activeLibraryId)
        if (cancelled) {
          return
        }

        if (isOwner) {
          const localPuzzles = loadPuzzles()
          if (remotePuzzles && remotePuzzles.length > 0) {
            setPuzzles(remotePuzzles)
            savePuzzles(remotePuzzles)
          } else if (localPuzzles.length > 0) {
            setPuzzles(localPuzzles)
            await saveLibraryToCloud(activeLibraryId, localPuzzles)
          } else {
            setPuzzles([])
          }
        } else {
          setPuzzles(remotePuzzles ?? [])
        }

        setSyncStatus('idle')
      } catch {
        if (!cancelled) {
          setSyncStatus('error')
          if (isOwner) {
            setPuzzles(loadPuzzles())
          }
        }
      } finally {
        if (!cancelled) {
          skipNextCloudSave.current = true
          setLibraryReady(true)
        }
      }
    }

    void hydrateLibrary()
    return () => {
      cancelled = true
    }
  }, [activeLibraryId, cloudEnabled, isOwner])

  useEffect(() => {
    if (!libraryReady || !isOwner) {
      return
    }

    savePuzzles(puzzles)

    if (!cloudEnabled) {
      return
    }

    if (skipNextCloudSave.current) {
      skipNextCloudSave.current = false
      return
    }

    let cancelled = false
    setSyncStatus('saving')

    void saveLibraryToCloud(activeLibraryId, puzzles)
      .then(() => {
        if (!cancelled) {
          setSyncStatus('idle')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSyncStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [puzzles, libraryReady, isOwner, cloudEnabled, activeLibraryId])

  const activePuzzle = puzzles.find((puzzle) => puzzle.id === activePuzzleId) ?? null

  const handleCreateDone = (name: string, words: string[]) => {
    if (!isOwner) {
      return
    }

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

  const handleShare = async () => {
    const url = buildLibraryShareUrl(myLibraryId.current)
    setShareUrl(url)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // URL is still shown on screen if clipboard access is blocked.
    }
  }

  const handleGoToMyLibrary = () => {
    openOwnLibraryUrl()
    window.location.reload()
  }

  return (
    <>
      {view === 'start' ? <StartScreen onStart={() => setView('main')} /> : null}

      {view === 'main' ? (
        <MainScreen
          puzzles={puzzles}
          isOwner={isOwner}
          cloudEnabled={cloudEnabled}
          syncStatus={syncStatus}
          shareUrl={shareUrl}
          onAdd={() => {
            setCreateError(null)
            setView('create')
          }}
          onOpen={(id) => {
            setActivePuzzleId(id)
            setView('play')
          }}
          onDelete={(id) => {
            if (!isOwner) {
              return
            }
            setPuzzles((current) => current.filter((puzzle) => puzzle.id !== id))
            if (activePuzzleId === id) {
              setActivePuzzleId(null)
            }
          }}
          onShare={() => {
            void handleShare()
          }}
          onGoToMyLibrary={handleGoToMyLibrary}
        />
      ) : null}

      {view === 'create' && isOwner ? (
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
