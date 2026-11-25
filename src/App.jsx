import { useRef, useState } from 'react'
import './App.css'

function App() {
  const [draft, setDraft] = useState('')
  const [items, setItems] = useState([])
  const [draggedId, setDraggedId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const draggedIdRef = useRef(null)
  const dropTargetRef = useRef(null)

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

  const moveItem = (sourceId, targetId, position = 'before') => {
    if (!sourceId || sourceId === targetId) return

    setItems((currentItems) => {
      const sourceIndex = currentItems.findIndex((item) => item.id === sourceId)
      const targetIndex = currentItems.findIndex((item) => item.id === targetId)
      if (sourceIndex === -1 || targetIndex === -1) return currentItems

      const reorderedItems = [...currentItems]
      const [movedItem] = reorderedItems.splice(sourceIndex, 1)
      let insertionIndex = reorderedItems.findIndex((item) => item.id === targetId)
      if (position === 'after') insertionIndex += 1
      reorderedItems.splice(insertionIndex, 0, movedItem)
      return reorderedItems
    })
  }

  const startDragging = (event, id) => {
    setDraggedId(id)
    setDropTarget(null)
    draggedIdRef.current = id
    dropTargetRef.current = null
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
  }

  const dragOver = (event, id) => {
    if (!draggedId) return

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const bounds = event.currentTarget.getBoundingClientRect()
    const position = event.clientY < bounds.top + bounds.height / 2
      ? 'before'
      : 'after'
    const target = { id, position }
    dropTargetRef.current = target
    setDropTarget(target)
  }

  const finishDragging = (event) => {
    event?.preventDefault()
    const sourceId = draggedIdRef.current
    const target = dropTargetRef.current
    if (sourceId && target && target.id !== sourceId) {
      moveItem(sourceId, target.id, target.position)
    }
    draggedIdRef.current = null
    dropTargetRef.current = null
    setDraggedId(null)
    setDropTarget(null)
  }

  const cancelDragging = () => {
    finishDragging()
  }

  const dragOverList = (event) => {
    if (!draggedIdRef.current) return

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const cards = [...event.currentTarget.querySelectorAll('[data-task-id]')]
      .filter((card) => card.dataset.taskId !== draggedIdRef.current)

    if (cards.length === 0) return

    let nearest = cards[0]
    let nearestDistance = Number.POSITIVE_INFINITY
    let position = 'before'

    cards.forEach((card) => {
      const bounds = card.getBoundingClientRect()
      const midpoint = bounds.top + bounds.height / 2
      const distance = Math.abs(event.clientY - midpoint)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearest = card
        position = event.clientY < midpoint ? 'before' : 'after'
      }
    })

    const target = { id: nearest.dataset.taskId, position }
    dropTargetRef.current = target
    setDropTarget(target)
  }

  const moveItemWithKeyboard = (id, offset) => {
    setItems((currentItems) => {
      const index = currentItems.findIndex((item) => item.id === id)
      const targetIndex = index + offset
      if (index === -1 || targetIndex < 0 || targetIndex >= currentItems.length) {
        return currentItems
      }

      const reorderedItems = [...currentItems]
      const [movedItem] = reorderedItems.splice(index, 1)
      reorderedItems.splice(targetIndex, 0, movedItem)
      return reorderedItems
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

      <section
        className="task-list"
        aria-label="Tasks"
        onDragOver={dragOverList}
        onDrop={finishDragging}
      >
        {items.length === 0 ? (
          <p className="empty-state">Nothing here yet.</p>
        ) : (
          items.map((item) => (
            <article
              className={[
                'task-card',
                draggedId === item.id ? 'is-dragging' : '',
                dropTarget?.id === item.id ? `drop-${dropTarget.position}` : '',
              ].filter(Boolean).join(' ')}
              data-task-id={item.id}
              key={item.id}
              onDragOver={(event) => dragOver(event, item.id)}
              onDrop={finishDragging}
              onDragEnd={cancelDragging}
            >
              <button
                className="drag-handle"
                type="button"
                draggable="true"
                aria-label={`Move ${item.text}`}
                title="Drag to rearrange"
                onDragStart={(event) => startDragging(event, item.id)}
                onDragEnd={cancelDragging}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    moveItemWithKeyboard(item.id, -1)
                  } else if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    moveItemWithKeyboard(item.id, 1)
                  }
                }}
              >
                <span aria-hidden="true">⠿</span>
              </button>
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
