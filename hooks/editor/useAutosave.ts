"use client"

import { useEffect, useRef, useCallback } from "react"
import type { SaveStatus, DocumentMeta, Document } from "@/lib/editor/types"

interface UseAutosaveParams {
  docId: string | null
  content: string
  name: string
  extension: string
  version: number
  debounceMs?: number
  onStatusChange: (status: SaveStatus) => void
  onMetaUpdate: (meta: DocumentMeta) => void
  onConflict: (remoteDoc: Document) => void
}

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
  version,
  debounceMs = 800,
  onStatusChange,
  onMetaUpdate,
  onConflict,
}: UseAutosaveParams) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>("")

  const onStatusChangeRef = useLatest(onStatusChange)
  const onMetaUpdateRef = useLatest(onMetaUpdate)
  const onConflictRef = useLatest(onConflict)
  const nameRef = useLatest(name)
  const extensionRef = useLatest(extension)
  const versionRef = useLatest(version)

  const save = useCallback(async (
    docIdToSave: string,
    contentToSave: string,
    overrideVersion?: number
  ) => {
    onStatusChangeRef.current("saving")
    try {
      const res = await fetch(`/api/editor/documents/${docIdToSave}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToSave,
          name: nameRef.current,
          extension: extensionRef.current,
          clientVersion: overrideVersion ?? versionRef.current,
        }),
      })
      if (res.status === 409) {
        const remoteDoc: Document = await res.json()
        onStatusChangeRef.current("error")
        onConflictRef.current(remoteDoc)
        return
      }
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

  // Force-save with a specific version — used when resolving a conflict as 'keep mine'
  const saveWithVersion = useCallback((docIdToSave: string, contentToSave: string, ver: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    void save(docIdToSave, contentToSave, ver)
  }, [save])

  // Mark content as already saved — used when resolving conflict as 'load remote'
  // so autosave doesn't immediately re-save the incoming remote content
  const resetLastSaved = useCallback((c: string) => {
    lastSavedRef.current = c
  }, [])

  const getLastSaved = useCallback(() => lastSavedRef.current, [])

  useEffect(() => {
    lastSavedRef.current = ""
  }, [docId])

  return { saveNow, saveWithVersion, resetLastSaved, getLastSaved }
}
