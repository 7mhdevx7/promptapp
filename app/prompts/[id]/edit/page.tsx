import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { redirect, notFound } from "next/navigation"
import { container } from "@/src/interfaces/web/lib/config"
import PromptEditor from "@/components/prompts/PromptEditor"
import Link from "next/link"
import { Box, Heading, Text } from "@radix-ui/themes"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPromptPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (session === null) redirect("/login")

  const { id } = await params
  const result = await container.getPromptUseCase.execute(id)

  if (result === null) notFound()

  const { prompt, versions } = result
  const latestVersion = versions[0]
  const userId = session.user.id
  const groups = await container.groupRepo.getGroups(userId)
  const tags = await container.tagRepo.getTags(userId)

  return (
    <Box>
      <Text asChild size="2" color="indigo" mb="4" style={{ display: "block" }}>
        <Link href={`/prompts/${prompt.id}`}>← Back to prompt</Link>
      </Text>
      <Heading size="5" mb="5">
        Edit prompt
      </Heading>
      <PromptEditor
        mode="edit"
        promptId={prompt.id}
        initialValues={{
          name: prompt.name,
          description: prompt.description,
          content: latestVersion?.content ?? "",
          status: prompt.status,
          groupId: prompt.groupId,
          tagIds: prompt.tagIds,
        }}
        groups={groups}
        tags={tags}
      />
    </Box>
  )
}
