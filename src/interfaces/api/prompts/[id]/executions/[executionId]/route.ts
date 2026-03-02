import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { container } from "@/src/interfaces/web/lib/config"

interface RouteContext {
  params: Promise<{ id: string; executionId: string }>
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { executionId } = await context.params

  try {
    const execution = await container.executionRepo.getExecutionById(executionId)
    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 })
    }
    return NextResponse.json({ execution })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
