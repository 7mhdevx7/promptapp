import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { redirect } from "next/navigation"
import { container } from "@/src/interfaces/web/lib/config"
import Link from "next/link"
import PromptList from "@/components/prompts/PromptList"
import type { Prompt, PromptStatus } from "@/src/domain/entities/Prompt"
import { Box, Flex, Heading, Button } from "@radix-ui/themes"

interface SearchParams {
  q?: string
  status?: string
  groupId?: string
}

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await getServerSession(authOptions)
  if (session === null) redirect("/login")

  const params = await searchParams
  const status = ["draft", "active", "archived"].includes(params.status ?? "")
    ? (params.status as PromptStatus)
    : undefined

  const userId = session.user.id
  const prompts = await container.searchPromptsUseCase.execute({
    q: params.q,
    groupId: params.groupId,
    status,
  }, userId)

  const groups = await container.groupRepo.getGroups(userId)
  const tags = await container.tagRepo.getTags(userId)

  return (
    <Box>
      <Flex align="center" justify="between" mb="5">
        <Heading size="5">Prompts</Heading>
        <Button asChild>
          <Link href="/prompts/new">New prompt</Link>
        </Button>
      </Flex>

      <Flex gap="2" mb="4" wrap="wrap">
        <Button
          asChild
          variant={status === undefined ? "solid" : "outline"}
          color="gray"
          size="2"
          style={{ borderRadius: "9999px" }}
        >
          <Link href="/prompts">All</Link>
        </Button>
        {(["draft", "active", "archived"] as PromptStatus[]).map((s) => (
          <Button
            key={s}
            asChild
            variant={status === s ? "solid" : "outline"}
            color="gray"
            size="2"
            style={{ borderRadius: "9999px" }}
          >
            <Link href={`/prompts?status=${s}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          </Button>
        ))}
      </Flex>

      <PromptList prompts={prompts as Prompt[]} groups={groups} tags={tags} />
    </Box>
  )
}
