"use client"

import { useCallback } from "react"
import type { DocumentMeta } from "@/lib/editor/types"

interface EditorTabsProps {
  tabs: DocumentMeta[]
  activeTabId: string | null
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
}

export function EditorTabs({ tabs, activeTabId, onSelect, onClose, onNew }: EditorTabsProps) {
  const handleClose = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      onClose(id)
    },
    [onClose]
  )

  return (
    <div className="flex h-9 items-end bg-[#252526] border-b border-[#3c3c3c] overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`
              group flex items-center gap-1.5 px-3 h-full min-w-0 max-w-[180px] cursor-pointer
              border-r border-[#3c3c3c] text-xs select-none shrink-0
              ${isActive
                ? "bg-[#1e1e1e] text-[#cccccc] border-t-2 border-t-[#007acc]"
                : "bg-[#2d2d2d] text-[#969696] hover:bg-[#1e1e1e] hover:text-[#cccccc]"
              }
            `}
          >
            <span className="truncate">{tab.name}.{tab.extension}</span>
            <button
              onClick={(e) => handleClose(e, tab.id)}
              className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 hover:text-white rounded p-0.5"
              aria-label="Close tab"
            >
              ×
            </button>
          </div>
        )
      })}

      <button
        onClick={onNew}
        className="flex items-center justify-center px-3 h-full text-[#969696] hover:text-white hover:bg-[#1e1e1e] text-lg shrink-0"
        aria-label="New document"
        title="New document"
      >
        +
      </button>
    </div>
  )
}
