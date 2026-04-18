"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Document, DocumentMeta, EditorSession, SaveStatus } from "@/lib/editor/types"
import { useDocuments } from "./useDocuments"
import { useAutosave } from "./useAutosave"

const SYNC_INTERVAL_MS = 5000

export function useEditorState() {
  const { metas, fetchMetas, fetchDocument, createDocument, deleteDocument, updateMeta } =
    useDocuments()

  const [openTabs, setOpenTabs] = useState<DocumentMeta[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [contentMap, setContentMap] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [showSearch, setShowSearch] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false)
  const [showMarkdownFullView, setShowMarkdownFullView] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  const activeDoc = openTabs.find((t) => t.id === activeTabId) ?? null
  const activeContent = activeTabId ? (contentMap[activeTabId] ?? "") : ""

  // Tracks the last updatedAt we've seen per document.
  // Initialized when a doc is loaded and updated after every save.
  // Prevents the sync poll from overwriting local edits that haven't been
  // saved yet — without this, the first poll always passes (updatedAt > 0)
  // and stomps on content typed before autosave fires.
  const lastSeenUpdatedAt = useRef<Record<string, number>>({})

  // --- Session persistence ---

  const persistSession = useCallback(async (session: EditorSession) => {
    await fetch("/api/editor/session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    })
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

      for (const d of validDocs) {
        newContent[d.id] = d.content
        // Seed ref so the first poll doesn't see this as a "new" remote update
        lastSeenUpdatedAt.current[d.id] = d.meta.updatedAt
      }

      setOpenTabs(validTabs)
      setContentMap(newContent)
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
      // Seed ref before the polling effect picks this up
      lastSeenUpdatedAt.current[docId] = doc.meta.updatedAt
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
      // After a save completes, advance the pointer so the next poll
      // doesn't treat our own save as an incoming remote update
      lastSeenUpdatedAt.current[meta.id] = meta.updatedAt
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
        body: JSON.stringify({ content: activeContent, name, extension }),
      })
      if (res.ok) {
        const meta: DocumentMeta = await res.json()
        handleMetaUpdate(meta)
      }
    },
    [activeTabId, activeContent, handleMetaUpdate]
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

  // --- Autosave ---
  useAutosave({
    docId: activeTabId,
    content: activeContent,
    name: activeDoc?.name ?? "Untitled",
    extension: activeDoc?.extension ?? "txt",
    onStatusChange: setSaveStatus,
    onMetaUpdate: handleMetaUpdate,
  })

  // --- Polling sync ---
  useEffect(() => {
    if (!activeTabId) return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/editor/documents/${activeTabId}`)
      if (!res.ok) return
      const doc: Document = await res.json()

      const lastSeen = lastSeenUpdatedAt.current[activeTabId] ?? 0
      if (doc.meta.updatedAt <= lastSeen) return // nothing new from remote

      // Only a genuinely newer remote version reaches here
      lastSeenUpdatedAt.current[activeTabId] = doc.meta.updatedAt
      setContentMap((cur) => {
        if (cur[activeTabId] === doc.content) return cur
        return { ...cur, [activeTabId]: doc.content }
      })
      handleMetaUpdate(doc.meta)
    }, SYNC_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [activeTabId, handleMetaUpdate])

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
    showSearch,
    showPalette,
    showMarkdownPreview,
    showMarkdownFullView,
    sessionLoaded,
    setActiveTabId,
    openDocument,
    closeTab,
    closeAndDelete,
    newDocument,
    setContent,
    renameDocument,
    downloadDocument,
    setShowSearch,
    setShowPalette,
    setShowMarkdownPreview,
    setShowMarkdownFullView,
  }
}
