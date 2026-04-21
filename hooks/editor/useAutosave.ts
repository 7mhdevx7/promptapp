"use client"

import { useEffect, useRef, useCallback } from "react"
import type { SaveStatus, DocumentMeta } from "@/lib/editor/types"

interface UseAutosaveParams {
  docId: string | null
  content: string
  name: string
  extension: string
  debounceMs?: number
  onStatusChange: (status: SaveStatus) => void
  onMetaUpdate: (meta: DocumentMeta) => void
}

// Keeps a stable ref to the latest callback — avoids recreating `save` on every render
// when parent passes inline functions (advanced-use-latest)
function useLatest<T>(value: T) {
  const ref = useRef(value)
  ref.current = value
  return ref
}

export function useAutosave({
  docId,
  content,
  name,
  extension,
  debounceMs = 800,
  onStatusChange,
  onMetaUpdate,
}: UseAutosaveParams) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>("")

  // Stable refs — save() never needs to be recreated due to callback identity changes
  const onStatusChangeRef = useLatest(onStatusChange)
  const onMetaUpdateRef = useLatest(onMetaUpdate)
  const nameRef = useLatest(name)
  const extensionRef = useLatest(extension)

  const save = useCallback(async (docIdToSave: string, contentToSave: string) => {
    onStatusChangeRef.current("saving")
    try {
      const res = await fetch(`/api/editor/documents/${docIdToSave}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToSave,
          name: nameRef.current,
          extension: extensionRef.current,
        }),
      })
      if (res.ok) {
        const meta: DocumentMeta = await res.json()
        lastSavedRef.current = contentToSave
        onMetaUpdateRef.current(meta)
        onStatusChangeRef.current("saved")
      } else {
        onStatusChangeRef.current("error")
      }
    } catch {
      onStatusChangeRef.current("error")
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!docId || content === lastSavedRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      void save(docId, content)
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [docId, content, debounceMs, save])

  const saveNow = useCallback(() => {
    if (!docId || content === lastSavedRef.current) return
    if (timerRef.current) clearTimeout(timerRef.current)
    void save(docId, content)
  }, [docId, content, save])

  // Reset lastSaved when switching documents so the new doc content triggers a save comparison
  useEffect(() => {
    lastSavedRef.current = ""
  }, [docId])

  return { saveNow }
}
