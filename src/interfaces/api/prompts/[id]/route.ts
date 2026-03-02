import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { container } from "@/src/interfaces/web/lib/config"
import { UpdatePromptSchema } from "@/src/application/dto/UpdatePromptDTO"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const result = await container.getPromptUseCase.execute(id)

  if (result === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(result)
}

export async function PUT(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const body: unknown = await req.json()
  const parsed = UpdatePromptSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const userId = session.user.id
    const prompt = await container.updatePromptUseCase.execute(id, parsed.data, userId)
    return NextResponse.json({ prompt })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    const status = message === "Prompt not found" ? 404 : 422
    return NextResponse.json({ error: message }, { status })
  }
}
