"use client"

import type { SaveStatus } from "@/lib/editor/types"

const STATUS_CONFIG = {
  idle: { text: "", className: "" },
  saving: { text: "Saving…", className: "text-[#858585]" },
  saved: { text: "Saved", className: "text-[#4ec994]" },
  error: { text: "Save failed", className: "text-[#f44747]" },
} satisfies Record<SaveStatus, { text: string; className: string }>

export function SaveIndicator({ status }: { status: SaveStatus }) {
  const { text, className } = STATUS_CONFIG[status]
  if (!text) return null
  return <span className={`text-xs transition-colors ${className}`}>{text}</span>
}
