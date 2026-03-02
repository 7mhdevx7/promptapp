import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { container } from "@/src/interfaces/web/lib/config"
import { CreatePromptSchema } from "@/src/application/dto/CreatePromptDTO"
import { SearchPromptSchema } from "@/src/application/dto/SearchPromptDTO"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const parsed = SearchPromptSchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    groupId: searchParams.get("groupId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const prompts = await container.searchPromptsUseCase.execute(parsed.data)
  return NextResponse.json({ prompts })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions)
  if (session === null) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: unknown = await req.json()
  const parsed = CreatePromptSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const userId = session.user.id
    const prompt = await container.createPromptUseCase.execute(parsed.data, userId)
    return NextResponse.json({ prompt }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
