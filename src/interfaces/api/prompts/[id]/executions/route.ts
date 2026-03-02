import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { container } from "@/src/interfaces/web/lib/config"
import { CreateExecutionSchema } from "@/src/application/dto/CreateExecutionDTO"

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

  try {
    const executions = await container.getExecutionHistoryUseCase.execute(id, 50)
    return NextResponse.json({ executions })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params
  const body: unknown = await req.json()
  const parsed = CreateExecutionSchema.safeParse({
    ...(body as Record<string, unknown>),
    promptId: id,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const userId = session.user.id
    const execution = await container.createExecutionUseCase.execute(parsed.data, userId)
    return NextResponse.json({ execution }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
