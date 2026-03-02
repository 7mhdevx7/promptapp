import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { redirect } from "next/navigation"
import { container } from "@/src/interfaces/web/lib/config"
import PromptEditor from "@/components/prompts/PromptEditor"
import { Box, Heading } from "@radix-ui/themes"

export default async function NewPromptPage() {
  const session = await getServerSession(authOptions)
  if (session === null) redirect("/login")

  const groups = await container.groupRepo.getGroups()
  const tags = await container.tagRepo.getTags()

  return (
    <Box>
      <Heading size="5" mb="5">
        New prompt
      </Heading>
      <PromptEditor mode="create" groups={groups} tags={tags} />
    </Box>
  )
}
