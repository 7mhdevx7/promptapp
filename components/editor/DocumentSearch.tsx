"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { DocumentMeta } from "@/lib/editor/types"

interface DocumentSearchProps {
  docs: DocumentMeta[]
  onSelect: (id: string) => void
  onClose: () => void
}

export function DocumentSearch({ docs, onSelect, onClose }: DocumentSearchProps) {
  const [query, setQuery] = useState("")
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? docs.filter((d) =>
        `${d.name}.${d.extension}`.toLowerCase().includes(query.toLowerCase())
      )
    : docs

  useEffect(() => {
    inputRef.current?.focus()
    setHighlighted(0)
  }, [])

  useEffect(() => {
    setHighlighted(0)
  }, [query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlighted((h) => Math.max(h - 1, 0))
      } else if (e.key === "Enter") {
        const doc = filtered[highlighted]
        if (doc) { onSelect(doc.id); onClose() }
      } else if (e.key === "Escape") {
        onClose()
      }
    },
    [filtered, highlighted, onSelect, onClose]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#252526] border border-[#3c3c3c] rounded shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search documents…"
          className="w-full px-4 py-3 bg-transparent text-[#cccccc] placeholder-[#858585] text-sm outline-none border-b border-[#3c3c3c]"
        />
        <ul className="max-h-72 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-[#858585] text-sm">No documents found</li>
          )}
          {filtered.map((doc, i) => (
            <li
              key={doc.id}
              onClick={() => { onSelect(doc.id); onClose() }}
              className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2
                ${i === highlighted ? "bg-[#094771] text-white" : "text-[#cccccc] hover:bg-[#2a2d2e]"}`}
            >
              <span className="text-[#858585] font-mono text-xs">
                {doc.extension}
              </span>
              <span className="truncate">{doc.name}.{doc.extension}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
