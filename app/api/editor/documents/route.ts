import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { listDocumentMetas, createDocument } from "@/lib/editor/redis"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const docs = await listDocumentMetas(session.user.id)
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const name: string = body.name ?? "Untitled"
  const extension: string = body.extension ?? "txt"

  const doc = await createDocument(session.user.id, name, extension)
  return NextResponse.json(doc, { status: 201 })
}
