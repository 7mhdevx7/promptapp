import { redis } from "@/src/infrastructure/redis/RedisClient"
import type { Document, DocumentMeta, EditorSession } from "./types"
import { v4 as uuidv4 } from "uuid"

const DOCUMENT_LIST_KEY = (userId: string) => `user:${userId}:documents`
const DOCUMENT_CONTENT_KEY = (docId: string) => `document:${docId}`
const DOCUMENT_META_KEY = (docId: string) => `document:${docId}:meta`
const SESSION_KEY = (userId: string) => `user:${userId}:session`

// --- Documents ---

export async function listDocumentMetas(userId: string): Promise<DocumentMeta[]> {
  const ids = await redis.lrange<string>(DOCUMENT_LIST_KEY(userId), 0, -1)
  if (!ids || ids.length === 0) return []

  const metas = await Promise.all(
    ids.map((id) => redis.get<DocumentMeta>(DOCUMENT_META_KEY(id)))
  )

  return metas
    .filter((m): m is DocumentMeta => m !== null && m.userId === userId)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getDocument(docId: string, userId: string): Promise<Document | null> {
  const meta = await redis.get<DocumentMeta>(DOCUMENT_META_KEY(docId))
  if (!meta || meta.userId !== userId) return null

  const content = (await redis.get<string>(DOCUMENT_CONTENT_KEY(docId))) ?? ""
  return { id: docId, content, meta }
}

export async function createDocument(
  userId: string,
  name: string,
  extension: string
): Promise<Document> {
  const id = uuidv4()
  const meta: DocumentMeta = {
    id,
    name,
    extension,
    updatedAt: Date.now(),
    userId,
    version: 1,
  }

  await Promise.all([
    redis.set(DOCUMENT_META_KEY(id), JSON.stringify(meta)),
    redis.set(DOCUMENT_CONTENT_KEY(id), ""),
    redis.lpush(DOCUMENT_LIST_KEY(userId), id),
  ])

  return { id, content: "", meta }
}

type UpdateResult =
  | { ok: true; meta: DocumentMeta }
  | { ok: false; conflict: true; document: Document }
  | null

export async function updateDocument(
  docId: string,
  userId: string,
  content: string,
  name?: string,
  extension?: string,
  clientVersion?: number
): Promise<UpdateResult> {
  const meta = await redis.get<DocumentMeta>(DOCUMENT_META_KEY(docId))
  if (!meta || meta.userId !== userId) return null

  const serverVersion = meta.version ?? 0
  if (clientVersion !== undefined && clientVersion !== serverVersion) {
    const currentContent = (await redis.get<string>(DOCUMENT_CONTENT_KEY(docId))) ?? ""
    return {
      ok: false,
      conflict: true,
      document: { id: docId, content: currentContent, meta: { ...meta, version: serverVersion } },
    }
  }

  const updated: DocumentMeta = {
    ...meta,
    name: name ?? meta.name,
    extension: extension ?? meta.extension,
    updatedAt: Date.now(),
    version: serverVersion + 1,
  }

  await Promise.all([
    redis.set(DOCUMENT_META_KEY(docId), JSON.stringify(updated)),
    redis.set(DOCUMENT_CONTENT_KEY(docId), content),
  ])

  return { ok: true, meta: updated }
}

export async function deleteDocument(docId: string, userId: string): Promise<boolean> {
  const meta = await redis.get<DocumentMeta>(DOCUMENT_META_KEY(docId))
  if (!meta || meta.userId !== userId) return false

  // Remove from list
  const ids = await redis.lrange<string>(DOCUMENT_LIST_KEY(userId), 0, -1)
  const filtered = ids.filter((id) => id !== docId)

  await Promise.all([
    redis.del(DOCUMENT_META_KEY(docId)),
    redis.del(DOCUMENT_CONTENT_KEY(docId)),
  ])

  // Rebuild list without the deleted id
  if (filtered.length > 0) {
    await redis.del(DOCUMENT_LIST_KEY(userId))
    // lpush adds in reverse, so push in reverse order to maintain order
    for (let i = filtered.length - 1; i >= 0; i--) {
      await redis.lpush(DOCUMENT_LIST_KEY(userId), filtered[i]!)
    }
  } else {
    await redis.del(DOCUMENT_LIST_KEY(userId))
  }

  return true
}

// --- Session ---

export async function getSession(userId: string): Promise<EditorSession> {
  const session = await redis.get<EditorSession>(SESSION_KEY(userId))
  return session ?? { openTabIds: [], activeTabId: null }
}

export async function saveSession(userId: string, session: EditorSession): Promise<void> {
  await redis.set(SESSION_KEY(userId), JSON.stringify(session))
}
