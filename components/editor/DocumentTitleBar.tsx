"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { DocumentMeta } from "@/lib/editor/types"

interface DocumentTitleBarProps {
  doc: DocumentMeta | null
  onRename: (name: string, extension: string) => void
  onDownload: () => void
  onDelete: () => void
}

function parseFilename(raw: string): { name: string; extension: string } {
  const lastDot = raw.lastIndexOf(".")
  if (lastDot <= 0) return { name: raw || "Untitled", extension: "txt" }
  return { name: raw.slice(0, lastDot), extension: raw.slice(lastDot + 1) }
}

export function DocumentTitleBar({ doc, onRename, onDownload, onDelete }: DocumentTitleBarProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = useCallback(() => {
    if (!doc) return
    setDraft(`${doc.name}.${doc.extension}`)
    setEditing(true)
  }, [doc])

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commit = useCallback(() => {
    const { name, extension } = parseFilename(draft.trim())
    onRename(name, extension)
    setEditing(false)
  }, [draft, onRename])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") commit()
      else if (e.key === "Escape") setEditing(false)
    },
    [commit]
  )

  if (!doc) return <span className="text-xs text-[#858585]">No document open</span>

  const fullName = `${doc.name}.${doc.extension}`

  return (
    <div className="flex items-center gap-2 min-w-0">
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="bg-[#3c3c3c] text-[#cccccc] text-xs px-2 py-0.5 rounded outline-none border border-[#007acc] w-48 font-mono"
        />
      ) : (
        <button
          onClick={startEdit}
          className="text-xs text-[#858585] hover:text-[#cccccc] font-mono truncate max-w-[200px]"
          title="Click to rename"
        >
          {fullName}
        </button>
      )}

      <button
        onClick={onDownload}
        className="text-xs text-[#858585] hover:text-[#cccccc] shrink-0"
        title={`Download ${fullName}`}
        aria-label="Download file"
      >
        ↓
      </button>
      <button
        onClick={() => {
          if (window.confirm(`Delete "${fullName}"?`)) onDelete()
        }}
        className="text-xs text-[#858585] hover:text-[#f14c4c] shrink-0"
        title={`Delete ${fullName}`}
        aria-label="Delete file"
      >
        🗑
      </button>
    </div>
  )
}
