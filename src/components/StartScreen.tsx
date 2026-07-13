type StartScreenProps = {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="start-screen">
      <h1 className="title-rainbow">Word Search Creator Pro</h1>
      <button type="button" className="primary-button" onClick={onStart}>
        Start
      </button>
    </div>
  )
}
