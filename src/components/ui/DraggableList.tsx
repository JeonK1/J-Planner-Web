import { useState, useMemo, type ReactNode } from 'react'

export interface DraggableListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number, dragHandle: ReactNode) => ReactNode;
  onReorder: (reorderedItems: T[]) => void;
  enabled?: boolean;
  className?: string;
  gap?: number;
}

export function DragHandle() {
  return (
    <span
      className="cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
      title="드래그하여 순서 변경"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" />
        <circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="10" r="1.5" />
        <circle cx="15" cy="10" r="1.5" />
        <circle cx="9" cy="15" r="1.5" />
        <circle cx="15" cy="15" r="1.5" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="15" cy="20" r="1.5" />
      </svg>
    </span>
  )
}

export function DraggableList<T>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
  enabled = true,
  className,
  gap = 16,
}: DraggableListProps<T>) {
  const [draggedKey, setDraggedKey] = useState<string | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)

  const draggedIdx = draggedKey !== null
    ? items.findIndex((item) => keyExtractor(item) === draggedKey)
    : null
  const dragOverIdx = dragOverKey !== null
    ? items.findIndex((item) => keyExtractor(item) === dragOverKey)
    : null

  const previewActive = draggedIdx !== null && dragOverIdx !== null && draggedIdx !== dragOverIdx

  const previewItems = useMemo(() => {
    if (draggedIdx === null || dragOverIdx === null || draggedIdx === dragOverIdx) {
      return items
    }
    const result = [...items]
    const [moved] = result.splice(draggedIdx, 1)
    result.splice(dragOverIdx, 0, moved)
    return result
  }, [items, draggedIdx, dragOverIdx])

  const handleDragStart = (key: string) => {
    setDraggedKey(key)
  }

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault()
    if (key === draggedKey) return
    if (dragOverKey !== key) setDragOverKey(key)
  }

  const handleDrop = () => {
    if (previewActive) {
      onReorder(previewItems)
    }
    setDraggedKey(null)
    setDragOverKey(null)
  }

  const handleDragEnd = () => {
    setDraggedKey(null)
    setDragOverKey(null)
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap }}>
      {previewItems.map((item, index) => {
        const key = keyExtractor(item)
        const isDragPreview = key === draggedKey && previewActive
        const dragHandle = enabled ? <DragHandle /> : null

        return (
          <div
            key={key}
            draggable={enabled}
            onDragStart={() => handleDragStart(key)}
            onDragOver={(e) => handleDragOver(e, key)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`transition-all duration-200 ${
              isDragPreview
                ? 'rounded-xl opacity-40 ring-2 ring-blue-400 ring-offset-2'
                : ''
            }`}
          >
            {renderItem(item, index, dragHandle)}
          </div>
        )
      })}
    </div>
  )
}
