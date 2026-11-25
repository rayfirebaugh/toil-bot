import { useState } from 'react'
import './App.css'

function App() {
  const [draft, setDraft] = useState('')
  const [items, setItems] = useState([])

  const addItem = (event) => {
    event.preventDefault()
    const text = draft.trim()

    if (!text) return

    setItems((currentItems) => [
      ...currentItems,
      { id: crypto.randomUUID(), text },
    ])
    setDraft('')
  }

  const finishItem = (id) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id),
    )
  }

  const bumpItem = (id) => {
    setItems((currentItems) => {
      const bumpedItem = currentItems.find((item) => item.id === id)
      if (!bumpedItem) return currentItems

      return [
        ...currentItems.filter((item) => item.id !== id),
        bumpedItem,
      ]
    })
  }

  return (
    <main className="task-page">
      <form className="entry-bar" onSubmit={addItem}>
        <label className="sr-only" htmlFor="task-input">
          New task
        </label>
        <input
          id="task-input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What needs to get done?"
          autoComplete="off"
        />
        <button className="add-button" type="submit">
          Add
        </button>
      </form>

      <section className="task-list" aria-label="Tasks">
        {items.length === 0 ? (
          <p className="empty-state">Nothing here yet.</p>
        ) : (
          items.map((item) => (
            <article className="task-card" key={item.id}>
              <p className="task-text">{item.text}</p>
              <div className="task-actions">
                <button
                  className="finish-button"
                  type="button"
                  onClick={() => finishItem(item.id)}
                >
                  Finish
                </button>
                <button
                  className="bump-button"
                  type="button"
                  onClick={() => bumpItem(item.id)}
                >
                  Bump
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}

export default App
