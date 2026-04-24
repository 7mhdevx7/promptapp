export interface DocumentMeta {
  id: string
  name: string
  extension: string
  updatedAt: number // unix ms
  userId: string
  version: number
}

export interface Document {
  id: string
  content: string
  meta: DocumentMeta
}

export interface EditorSession {
  openTabIds: string[]
  activeTabId: string | null
}

export type SaveStatus = "idle" | "saving" | "saved" | "error"
