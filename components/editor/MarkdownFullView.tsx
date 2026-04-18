"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false })

interface MarkdownFullViewProps {
  content: string
  filename: string
  onClose: () => void
}

export function MarkdownFullView({ content, filename, onClose }: MarkdownFullViewProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1e1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#3c3c3c] shrink-0">
        <span className="text-xs text-[#858585] font-mono">{filename}</span>
        <button
          onClick={onClose}
          className="text-[#858585] hover:text-[#cccccc] text-sm px-2 py-1 rounded hover:bg-[#2a2d2e] transition-colors"
          title="Close (Esc)"
        >
          ✕ Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-12
          prose prose-invert prose-sm
          prose-headings:text-[#e8e8e8] prose-headings:font-semibold
          prose-h1:text-3xl prose-h1:border-b prose-h1:border-[#3c3c3c] prose-h1:pb-3
          prose-h2:text-2xl prose-h2:border-b prose-h2:border-[#3c3c3c] prose-h2:pb-2
          prose-p:text-[#cccccc] prose-p:leading-7
          prose-a:text-[#4fc1ff] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#e8e8e8]
          prose-code:text-[#ce9178] prose-code:bg-[#2d2d2d] prose-code:px-1 prose-code:rounded prose-code:text-sm
          prose-pre:bg-[#252526] prose-pre:border prose-pre:border-[#3c3c3c]
          prose-blockquote:border-l-[#007acc] prose-blockquote:text-[#858585]
          prose-li:text-[#cccccc]
          prose-hr:border-[#3c3c3c]
          max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
