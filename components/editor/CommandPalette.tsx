"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export interface PaletteCommand {
  id: string
  label: string
  description?: string
  action: () => void
}

interface CommandPaletteProps {
  commands: PaletteCommand[]
  onClose: () => void
}

export function CommandPalette({ commands, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setHighlighted(0)
  }, [query])

  const run = useCallback(
    (cmd: PaletteCommand) => {
      cmd.action()
      onClose()
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlighted((h) => Math.max(h - 1, 0))
      } else if (e.key === "Enter") {
        const cmd = filtered[highlighted]
        if (cmd) run(cmd)
      } else if (e.key === "Escape") {
        onClose()
      }
    },
    [filtered, highlighted, run, onClose]
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
        <div className="flex items-center border-b border-[#3c3c3c] px-3">
          <span className="text-[#858585] text-xs mr-2">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command…"
            className="flex-1 py-3 bg-transparent text-[#cccccc] placeholder-[#858585] text-sm outline-none"
          />
        </div>
        <ul className="max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-[#858585] text-sm">No commands found</li>
          )}
          {filtered.map((cmd, i) => (
            <li
              key={cmd.id}
              onClick={() => run(cmd)}
              className={`px-4 py-2.5 cursor-pointer flex flex-col
                ${i === highlighted ? "bg-[#094771]" : "hover:bg-[#2a2d2e]"}`}
            >
              <span className="text-sm text-[#cccccc]">{cmd.label}</span>
              {cmd.description && (
                <span className="text-xs text-[#858585]">{cmd.description}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
