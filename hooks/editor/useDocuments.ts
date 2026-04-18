"use client"

import { useState, useCallback } from "react"
import type { Document, DocumentMeta } from "@/lib/editor/types"

export function useDocuments() {
  const [metas, setMetas] = useState<DocumentMeta[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMetas = useCallback(async () => {
    const res = await fetch("/api/editor/documents")
    if (res.ok) {
      const data: DocumentMeta[] = await res.json()
      setMetas(data)
    }
  }, [])

  const fetchDocument = useCallback(async (docId: string): Promise<Document | null> => {
    const res = await fetch(`/api/editor/documents/${docId}`)
    if (!res.ok) return null
    return res.json()
  }, [])

  const createDocument = useCallback(
    async (name: string, extension: string): Promise<Document | null> => {
      setLoading(true)
      try {
        const res = await fetch("/api/editor/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, extension }),
        })
        if (!res.ok) return null
        const doc: Document = await res.json()
        setMetas((prev) => [doc.meta, ...prev])
        return doc
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteDocument = useCallback(async (docId: string): Promise<boolean> => {
    const res = await fetch(`/api/editor/documents/${docId}`, { method: "DELETE" })
    if (res.ok) {
      setMetas((prev) => prev.filter((m) => m.id !== docId))
    }
    return res.ok
  }, [])

  const updateMeta = useCallback((meta: DocumentMeta) => {
    setMetas((prev) => prev.map((m) => (m.id === meta.id ? meta : m)))
  }, [])

  return { metas, loading, fetchMetas, fetchDocument, createDocument, deleteDocument, updateMeta }
}
