import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { container } from "@/src/interfaces/web/lib/config"
import { CreateGroupSchema } from "@/src/application/use-cases/CreateGroupUseCase"

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const groups = await container.groupRepo.getGroups(session.user.id)
  return NextResponse.json({ groups })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: unknown = await req.json()
  const parsed = CreateGroupSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const group = await container.createGroupUseCase.execute(parsed.data, session.user.id)
    return NextResponse.json({ group }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
