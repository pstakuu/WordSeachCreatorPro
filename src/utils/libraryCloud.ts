import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDb, isFirebaseConfigured } from '../firebase'
import type { WordSearchPuzzle } from '../types'
import { isPuzzle } from './puzzleStorage'

export async function loadLibraryFromCloud(
  libraryId: string,
): Promise<WordSearchPuzzle[] | null> {
  const db = getDb()
  if (!db) {
    return null
  }

  const snapshot = await getDoc(doc(db, 'libraries', libraryId))
  if (!snapshot.exists()) {
    return []
  }

  const data = snapshot.data()
  if (!Array.isArray(data.puzzles)) {
    return []
  }

  return data.puzzles.filter(isPuzzle)
}

export async function saveLibraryToCloud(
  libraryId: string,
  puzzles: WordSearchPuzzle[],
): Promise<void> {
  const db = getDb()
  if (!db) {
    return
  }

  await setDoc(doc(db, 'libraries', libraryId), {
    puzzles,
    updatedAt: serverTimestamp(),
  })
}

export { isFirebaseConfigured }
