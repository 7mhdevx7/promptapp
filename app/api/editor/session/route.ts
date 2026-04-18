import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { getSession, saveSession } from "@/lib/editor/redis"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const editorSession = await getSession(session.user.id)
  return NextResponse.json(editorSession)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  await saveSession(session.user.id, {
    openTabIds: body.openTabIds ?? [],
    activeTabId: body.activeTabId ?? null,
  })

  return NextResponse.json({ success: true })
}
