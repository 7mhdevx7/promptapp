"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Document, DocumentMeta, EditorSession, SaveStatus } from "@/lib/editor/types"
import { useDocuments } from "./useDocuments"
import { useAutosave } from "./useAutosave"

const SYNC_INTERVAL_MS = 5000

export interface ConflictState {
  docId: string
  localContent: string
  remoteDoc: Document
}

export function useEditorState() {
  const { metas, fetchMetas, fetchDocument, createDocument, deleteDocument, updateMeta } =
    useDocuments()

  const [openTabs, setOpenTabs] = useState<DocumentMeta[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [contentMap, setContentMap] = useState<Record<string, string>>({})
  const [versionMap, setVersionMap] = useState<Record<string, number>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [conflictState, setConflictState] = useState<ConflictState | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [showMarkdownFullView, setShowMarkdownFullView] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const activeDoc = openTabs.find((t) => t.id === activeTabId) ?? null
  const activeContent = activeTabId ? (contentMap[activeTabId] ?? "") : ""
  const activeVersion = activeTabId ? (versionMap[activeTabId] ?? 0) : 0

  // Stable ref to latest contentMap for use inside polling interval
  const contentMapRef = useRef(contentMap)
  useEffect(() => { contentMapRef.current = contentMap }, [contentMap])

  const lastSeenUpdatedAt = useRef<Record<string, number>>({})
  const skipNextPersist = useRef(false)
  const persistAbortRef = useRef<AbortController | null>(null)
  const lastPersistedStateRef = useRef<string>("")

  // --- Session persistence ---

  const persistSession = useCallback(async (session: EditorSession) => {
    persistAbortRef.current?.abort()
    const controller = new AbortController()
    persistAbortRef.current = controller
    try {
      await fetch("/api/editor/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
        signal: controller.signal,
      })
    } catch (err) {
      if ((err as Error).name === "AbortError") return
    }
  }, [])

  // Load session + documents on mount
  useEffect(() => {
    async function init() {
      const [sessionRes] = await Promise.all([
        fetch("/api/editor/session"),
        fetchMetas(),
      ])

      if (!sessionRes.ok) { setSessionLoaded(true); return }

      const session: EditorSession = await sessionRes.json()

      if (session.openTabIds.length === 0) { setSessionLoaded(true); return }

      const docs = await Promise.all(
        session.openTabIds.map((id) => fetchDocument(id))
      )

      const validDocs = docs.filter((d): d is Document => d !== null)
      const validTabs = validDocs.map((d) => d.meta)
      const newContent: Record<string, string> = {}
      const newVersions: Record<string, number> = {}

      for (const d of validDocs) {
        newContent[d.id] = d.content
        newVersions[d.id] = d.meta.version ?? 0
        lastSeenUpdatedAt.current[d.id] = d.meta.updatedAt
      }

      skipNextPersist.current = true
      setOpenTabs(validTabs)
      setContentMap(newContent)
      setVersionMap(newVersions)
      setActiveTabId(
        session.activeTabId && validDocs.some((d) => d.id === session.activeTabId)
          ? session.activeTabId
          : validTabs[0]?.id ?? null
      )
      setSessionLoaded(true)
    }
    void init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist session whenever tabs change
  useEffect(() => {
    if (!sessionLoaded) return

    if (skipNextPersist.current) {
      skipNextPersist.current = false
      return
    }

    const stateKey = openTabs.map((t) => t.id).join(",") + "|" + (activeTabId ?? "")
    if (stateKey === lastPersistedStateRef.current) return
    lastPersistedStateRef.current = stateKey

    void persistSession({
      openTabIds: openTabs.map((t) => t.id),
      activeTabId,
    })
  }, [openTabs, activeTabId, sessionLoaded, persistSession])

  // --- Tab operations ---

  const openDocument = useCallback(
    async (docId: string) => {
      if (openTabs.some((t) => t.id === docId)) {
        setActiveTabId(docId)
        return
      }
      const doc = await fetchDocument(docId)
      if (!doc) return
      lastSeenUpdatedAt.current[docId] = doc.meta.updatedAt
      setVersionMap((prev) => ({ ...prev, [docId]: doc.meta.version ?? 0 }))
      setOpenTabs((prev) => [...prev, doc.meta])
      setContentMap((prev) => ({ ...prev, [docId]: doc.content }))
      setActiveTabId(docId)
    },
    [openTabs, fetchDocument]
  )

  const closeTab = useCallback(
    (docId: string) => {
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t.id !== docId)
        if (activeTabId === docId) {
          const idx = prev.findIndex((t) => t.id === docId)
          const fallback = next[Math.max(0, idx - 1)]?.id ?? null
          setActiveTabId(fallback)
        }
        return next
      })
      setContentMap((prev) => {
        const copy = { ...prev }
        delete copy[docId]
        return copy
      })
    },
    [activeTabId]
  )

  const newDocument = useCallback(async () => {
    const doc = await createDocument("Untitled", "txt")
    if (!doc) return
    lastSeenUpdatedAt.current[doc.id] = doc.meta.updatedAt
    setVersionMap((prev) => ({ ...prev, [doc.id]: doc.meta.version ?? 0 }))
    setOpenTabs((prev) => [...prev, doc.meta])
    setContentMap((prev) => ({ ...prev, [doc.id]: "" }))
    setActiveTabId(doc.id)
  }, [createDocument])

  const closeAndDelete = useCallback(
    async (docId: string) => {
      closeTab(docId)
      await deleteDocument(docId)
    },
    [closeTab, deleteDocument]
  )

  const setContent = useCallback((docId: string, content: string) => {
    setContentMap((prev) => ({ ...prev, [docId]: content }))
  }, [])

  const handleMetaUpdate = useCallback(
    (meta: DocumentMeta) => {
      updateMeta(meta)
      setOpenTabs((prev) => prev.map((t) => (t.id === meta.id ? meta : t)))
      lastSeenUpdatedAt.current[meta.id] = meta.updatedAt
      setVersionMap((prev) => ({ ...prev, [meta.id]: meta.version ?? 0 }))
    },
    [updateMeta]
  )

  // --- Rename active document ---
  const renameDocument = useCallback(
    async (name: string, extension: string) => {
      if (!activeTabId) return
      const res = await fetch(`/api/editor/documents/${activeTabId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: activeContent,
          name,
          extension,
          clientVersion: activeVersion,
        }),
      })
      if (res.ok) {
        const meta: DocumentMeta = await res.json()
        handleMetaUpdate(meta)
      }
    },
    [activeTabId, activeContent, activeVersion, handleMetaUpdate]
  )

  // --- Download active document ---
  const downloadDocument = useCallback(() => {
    if (!activeDoc) return
    const blob = new Blob([activeContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeDoc.name}.${activeDoc.extension}`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeDoc, activeContent])

  // --- Conflict handling ---

  const handleConflict = useCallback((remoteDoc: Document) => {
    if (!activeTabId) return
    const localContent = contentMapRef.current[activeTabId] ?? ""
    setConflictState({ docId: activeTabId, localContent, remoteDoc })
  }, [activeTabId])

  // --- Autosave ---
  const { saveNow, saveWithVersion, resetLastSaved, getLastSaved } = useAutosave({
    docId: activeTabId,
    content: activeContent,
    name: activeDoc?.name ?? "Untitled",
    extension: activeDoc?.extension ?? "txt",
    version: activeVersion,
    onStatusChange: setSaveStatus,
    onMetaUpdate: handleMetaUpdate,
    onConflict: handleConflict,
  })

  const resolveConflict = useCallback((choice: "local" | "remote") => {
    if (!conflictState) return
    const { docId, localContent, remoteDoc } = conflictState

    if (choice === "remote") {
      setContentMap((prev) => ({ ...prev, [docId]: remoteDoc.content }))
      setVersionMap((prev) => ({ ...prev, [docId]: remoteDoc.meta.version ?? 0 }))
      lastSeenUpdatedAt.current[docId] = remoteDoc.meta.updatedAt
      handleMetaUpdate(remoteDoc.meta)
      // Tell autosave this is the current saved state so it doesn't re-save remote content
      resetLastSaved(remoteDoc.content)
    } else {
      // 'local': overwrite remote using remote's current version as clientVersion
      saveWithVersion(docId, localContent, remoteDoc.meta.version ?? 0)
    }

    setConflictState(null)
  }, [conflictState, handleMetaUpdate, resetLastSaved, saveWithVersion])

  // Flush pending save before switching tabs
  const switchToTab = useCallback((docId: string) => {
    saveNow()
    setActiveTabId(docId)
  }, [saveNow])

  // --- Polling sync ---
  useEffect(() => {
    if (!activeTabId) return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/editor/documents/${activeTabId}`)
      if (!res.ok) return
      const doc: Document = await res.json()

      const lastSeen = lastSeenUpdatedAt.current[activeTabId] ?? 0
      if (doc.meta.updatedAt <= lastSeen) return

      // Remote is newer — check if we have unsaved local changes
      const lastSaved = getLastSaved()
      const currentContent = contentMapRef.current[activeTabId] ?? ""
      const isDirty = lastSaved !== "" && currentContent !== lastSaved

      if (isDirty && doc.content !== currentContent) {
        // Both sides changed — let user decide
        setConflictState({ docId: activeTabId, localContent: currentContent, remoteDoc: doc })
        return
      }

      // Safe to apply remote
      lastSeenUpdatedAt.current[activeTabId] = doc.meta.updatedAt
      setContentMap((cur) => {
        if (cur[activeTabId] === doc.content) return cur
        return { ...cur, [activeTabId]: doc.content }
      })
      handleMetaUpdate(doc.meta)
    }, SYNC_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [activeTabId, handleMetaUpdate, getLastSaved])

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key === "p" && !e.shiftKey) {
        e.preventDefault()
        setShowSearch((v) => !v)
      }
      if (meta && e.key === "p" && e.shiftKey) {
        e.preventDefault()
        setShowPalette((v) => !v)
      }
      if (meta && e.key === "w") {
        e.preventDefault()
        if (activeTabId) closeTab(activeTabId)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activeTabId, closeTab])

  return {
    metas,
    openTabs,
    activeTabId,
    activeDoc,
    activeContent,
    saveStatus,
    conflictState,
    showSearch,
    showPalette,
    showMarkdownPreview,
    showMarkdownFullView,
    sessionLoaded,
    setActiveTabId,
    switchToTab,
    openDocument,
    closeTab,
    closeAndDelete,
    newDocument,
    setContent,
    renameDocument,
    downloadDocument,
    resolveConflict,
    setShowSearch,
    setShowPalette,
    setShowMarkdownPreview,
    setShowMarkdownFullView,
  }
}
