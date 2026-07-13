import { useState } from 'react'

type CreateWordSearchProps = {
  onDone: (name: string, words: string[]) => void
  onCancel: () => void
  errorMessage?: string | null
}

export function CreateWordSearch({ onDone, onCancel, errorMessage }: CreateWordSearchProps) {
  const [name, setName] = useState('')
  const [wordInputs, setWordInputs] = useState([''])

  const handleAddWordField = () => {
    setWordInputs((current) => [...current, ''])
  }

  const handleWordChange = (index: number, value: string) => {
    setWordInputs((current) =>
      current.map((word, wordIndex) => (wordIndex === index ? value : word)),
    )
  }

  const handleDone = () => {
    onDone(name, wordInputs)
  }

  return (
    <div className="create-screen">
      <h1 className="screen-title">Create Word Search</h1>

      <label className="field-label" htmlFor="puzzle-name">
        Word search name
      </label>
      <input
        id="puzzle-name"
        className="text-input"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Enter a name"
      />

      <div className="words-section">
        <p className="field-label">Words to hide in the puzzle</p>
        {wordInputs.map((word, index) => (
          <input
            key={`word-${index}`}
            className="text-input"
            type="text"
            value={word}
            onChange={(event) => handleWordChange(index, event.target.value)}
            placeholder={`Word ${index + 1}`}
          />
        ))}
        <button type="button" className="secondary-button" onClick={handleAddWordField}>
          + Add another word
        </button>
      </div>

      {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

      <div className="action-row">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="primary-button" onClick={handleDone}>
          Done
        </button>
      </div>
    </div>
  )
}
