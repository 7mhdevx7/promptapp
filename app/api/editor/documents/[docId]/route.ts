import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { getDocument, updateDocument, deleteDocument } from "@/lib/editor/redis"

type Params = { params: Promise<{ docId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { docId } = await params
  const doc = await getDocument(docId, session.user.id)
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(doc)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { docId } = await params
  const body = await req.json()
  const { content, name, extension, clientVersion } = body

  const result = await updateDocument(
    docId, session.user.id, content ?? "", name, extension,
    clientVersion !== undefined ? Number(clientVersion) : undefined
  )
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!result.ok) return NextResponse.json(result.document, { status: 409 })

  return NextResponse.json(result.meta)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { docId } = await params
  const ok = await deleteDocument(docId, session.user.id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true })
}
