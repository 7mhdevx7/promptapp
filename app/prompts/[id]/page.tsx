import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { redirect, notFound } from "next/navigation"
import { container } from "@/src/interfaces/web/lib/config"
import Link from "next/link"
import { formatDate } from "@/src/interfaces/web/lib/time"
import PromptContent from "@/components/prompts/PromptContent"
import PromptExecutor from "@/components/prompts/PromptExecutor"
import ExecutionHistory from "@/components/prompts/ExecutionHistory"
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  ScrollArea,
} from "@radix-ui/themes"

interface PageProps {
  params: Promise<{ id: string }>
}

function statusColor(status: string): "green" | "yellow" | "gray" {
  if (status === "active") return "green"
  if (status === "draft") return "yellow"
  return "gray"
}

export default async function PromptDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (session === null) redirect("/login")

  const { id } = await params
  const result = await container.getPromptUseCase.execute(id)

  if (result === null) notFound()

  const { prompt, versions } = result
  const latestVersion = versions[0]

  // Load execution history
  const executions = await container.getExecutionHistoryUseCase.execute(id, 50)

  return (
    <Flex direction="column" gap="5">
      {/* Header */}
      <Flex align="start" justify="between">
        <Box>
          <Text asChild size="2" color="indigo" mb="2" style={{ display: "block" }}>
            <Link href="/prompts">← Prompts</Link>
          </Text>
          <Heading size="5">{prompt.name}</Heading>
          {prompt.description !== undefined && (
            <Text as="p" color="gray" mt="1">
              {prompt.description}
            </Text>
          )}
        </Box>
        <Flex align="center" gap="3">
          <Badge variant="soft" color={statusColor(prompt.status)} size="2">
            {prompt.status}
          </Badge>
          <Button asChild size="2">
            <Link href={`/prompts/${prompt.id}/edit`}>Edit</Link>
          </Button>
        </Flex>
      </Flex>

      {/* Current content */}
      {latestVersion !== undefined && <PromptContent version={latestVersion} />}

      {/* Executor */}
      {latestVersion !== undefined && (
        <Box>
          <Heading size="3" mb="4">
            Use Prompt
          </Heading>
          <PromptExecutor promptId={prompt.id} version={latestVersion} />
        </Box>
      )}

      {/* Execution History */}
      <Box>
        <Heading size="3" mb="4">
          History
        </Heading>
        <ExecutionHistory promptId={prompt.id} initialExecutions={executions} />
      </Box>

      {/* Version history */}
      <Card>
        <Box pb="3" style={{ borderBottom: "1px solid var(--gray-4)" }}>
          <Text weight="medium" size="2">
            Version history{" "}
            <Text color="gray" weight="regular">
              ({versions.length})
            </Text>
          </Text>
        </Box>
        {versions.length === 0 ? (
          <Box px="1" py="4">
            <Text size="2" color="gray">
              No versions yet.
            </Text>
          </Box>
        ) : (
          <Box>
            {versions.map((version, index) => (
              <Box
                key={version.id}
                py="3"
                style={index > 0 ? { borderTop: "1px solid var(--gray-4)" } : {}}
              >
                <Flex align="start" justify="between" mb="2">
                  <Box>
                    <Text size="2" weight="medium">
                      v{version.versionNumber}
                    </Text>
                    {version.changelog !== undefined && (
                      <Text size="2" color="gray" ml="2">
                        {version.changelog}
                      </Text>
                    )}
                  </Box>
                  <Text size="1" color="gray">
                    {formatDate(version.createdAt)}
                  </Text>
                </Flex>
                <ScrollArea style={{ maxHeight: "8rem" }}>
                  <Box
                    p="2"
                    style={{
                      backgroundColor: "var(--gray-2)",
                      borderRadius: "var(--radius-2)",
                    }}
                  >
                    <pre
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--gray-11)",
                        whiteSpace: "pre-wrap",
                        fontFamily: "monospace",
                        margin: 0,
                        overflowY: "auto",
                      }}
                    >
                      {version.content}
                    </pre>
                  </Box>
                </ScrollArea>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* Timestamps */}
      <Flex gap="4">
        <Text size="1" color="gray">
          Created: {formatDate(prompt.createdAt)}
        </Text>
        <Text size="1" color="gray">
          Updated: {formatDate(prompt.updatedAt)}
        </Text>
      </Flex>
    </Flex>
  )
}
