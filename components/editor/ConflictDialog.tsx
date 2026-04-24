"use client"

import type { ConflictState } from "@/hooks/editor/useEditorState"

interface ConflictDialogProps {
  conflict: ConflictState
  onResolve: (choice: "local" | "remote") => void
}

export function ConflictDialog({ conflict, onResolve }: ConflictDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[420px] rounded border border-[#3c3c3c] bg-[#252526] shadow-2xl">
        <div className="border-b border-[#3c3c3c] px-5 py-3">
          <h2 className="text-sm font-semibold text-[#cccccc]">Edit conflict</h2>
        </div>
        <div className="px-5 py-4 text-[13px] text-[#9d9d9d] leading-relaxed">
          <p>
            This document was modified from another device while you were editing.
            Both versions have unsaved changes — choose which one to keep.
          </p>
        </div>
        <div className="flex flex-col gap-2 px-5 pb-5">
          <button
            onClick={() => onResolve("local")}
            className="w-full rounded border border-[#007acc] bg-[#007acc]/10 px-4 py-2.5 text-left text-[13px] text-[#cccccc] hover:bg-[#007acc]/20 transition-colors"
          >
            <span className="font-medium text-[#4fc3f7]">Keep mine</span>
            <span className="ml-2 text-[#9d9d9d]">— overwrite remote with your current edits</span>
          </button>
          <button
            onClick={() => onResolve("remote")}
            className="w-full rounded border border-[#3c3c3c] px-4 py-2.5 text-left text-[13px] text-[#cccccc] hover:border-[#858585] hover:bg-[#2a2d2e] transition-colors"
          >
            <span className="font-medium text-[#cccccc]">Load remote</span>
            <span className="ml-2 text-[#9d9d9d]">— discard your edits, use the other device&apos;s version</span>
          </button>
        </div>
      </div>
    </div>
  )
}
