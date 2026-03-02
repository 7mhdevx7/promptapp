import { getServerSession } from "next-auth/next"
import { authOptions } from "@/src/infrastructure/auth/auth.config"
import { redirect } from "next/navigation"
import { container } from "@/src/interfaces/web/lib/config"
import Link from "next/link"
import { Box, Flex, Grid, Heading, Text, Button, Card, Badge } from "@radix-ui/themes"

function statusColor(status: string): "green" | "yellow" | "gray" {
  if (status === "active") return "green"
  if (status === "draft") return "yellow"
  return "gray"
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (session === null) redirect("/login")

  const [prompts, tags, groups] = await Promise.all([
    container.promptRepo.searchPrompts({}),
    container.tagRepo.getTags(),
    container.groupRepo.getGroups(),
  ])

  const counts = {
    total: prompts.length,
    active: prompts.filter((p) => p.status === "active").length,
    draft: prompts.filter((p) => p.status === "draft").length,
    archived: prompts.filter((p) => p.status === "archived").length,
    tags: tags.length,
    groups: groups.length,
  }

  const recentPrompts = prompts
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <Box>
      <Flex align="center" justify="between" mb="5">
        <Heading size="5">Dashboard</Heading>
        <Button asChild>
          <Link href="/prompts/new">New prompt</Link>
        </Button>
      </Flex>

      <Grid columns={{ initial: "2", sm: "3", md: "6" }} gap="4" mb="7">
        {[
          { label: "Total prompts", value: counts.total },
          { label: "Active", value: counts.active },
          { label: "Draft", value: counts.draft },
          { label: "Archived", value: counts.archived },
          { label: "Tags", value: counts.tags },
          { label: "Groups", value: counts.groups },
        ].map((stat) => (
          <Card key={stat.label}>
            <Text as="p" size="6" weight="bold">
              {stat.value}
            </Text>
            <Text as="p" size="1" color="gray" mt="1">
              {stat.label}
            </Text>
          </Card>
        ))}
      </Grid>

      <Card>
        <Flex
          align="center"
          justify="between"
          pb="3"
          style={{ borderBottom: "1px solid var(--gray-4)" }}
        >
          <Text weight="medium" size="2">
            Recent prompts
          </Text>
          <Text asChild size="2" color="indigo">
            <Link href="/prompts">View all</Link>
          </Text>
        </Flex>

        {recentPrompts.length === 0 ? (
          <Flex align="center" justify="center" py="6">
            <Text size="2" color="gray">
              No prompts yet.{" "}
              <Text asChild color="indigo" size="2">
                <Link href="/prompts/new">Create one</Link>
              </Text>
            </Text>
          </Flex>
        ) : (
          <Box>
            {recentPrompts.map((prompt, index) => (
              <Box
                key={prompt.id}
                style={index > 0 ? { borderTop: "1px solid var(--gray-4)" } : {}}
              >
                <Link href={`/prompts/${prompt.id}`} style={{ textDecoration: "none" }}>
                  <Flex
                    align="center"
                    justify="between"
                    px="1"
                    py="3"
                    style={{ transition: "background-color 0.15s" }}
                    className="hover:bg-[var(--gray-2)] rounded"
                  >
                    <Box>
                      <Text as="p" size="2" weight="medium">
                        {prompt.name}
                      </Text>
                      {prompt.description !== undefined && (
                        <Text
                          as="p"
                          size="1"
                          color="gray"
                          mt="1"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "20rem",
                          }}
                        >
                          {prompt.description}
                        </Text>
                      )}
                    </Box>
                    <Badge variant="soft" color={statusColor(prompt.status)} size="1">
                      {prompt.status}
                    </Badge>
                  </Flex>
                </Link>
              </Box>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  )
}
