"use client"

import Link from "next/link"
import { useState } from "react"
import type { Prompt } from "@/src/domain/entities/Prompt"
import type { PromptGroup } from "@/src/domain/entities/PromptGroup"
import type { Tag } from "@/src/domain/entities/Tag"
import { formatDate } from "@/src/interfaces/web/lib/time"
import CopyButton from "@/components/ui/CopyButton"
import { Box, Flex, Text, TextField, Badge, Card } from "@radix-ui/themes"

interface PromptListProps {
  prompts: Prompt[]
  groups: PromptGroup[]
  tags: Tag[]
}

function statusColor(status: string): "green" | "yellow" | "gray" {
  if (status === "active") return "green"
  if (status === "draft") return "yellow"
  return "gray"
}

export default function PromptList({ prompts, groups, tags }: PromptListProps) {
  const [query, setQuery] = useState("")

  const groupMap = new Map(groups.map((g) => [g.id, g.name]))
  const tagMap = new Map(tags.map((t) => [t.id, t.name]))

  const filtered = prompts.filter((p) => {
    if (query.trim().length === 0) return true
    const q = query.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false)
    )
  })

  function getTagNames(tagIds?: string[] | undefined): string[] {
    if (!tagIds) return []
    return tagIds
      .map((id) => tagMap.get(id))
      .filter((name): name is string => name !== undefined)
  }

  function makeGetText(promptId: string): () => Promise<string> {
    return async () => {
      const res = await fetch(`/api/prompts/${promptId}`)
      if (!res.ok) return ""

      const data = (await res.json()) as {
        versions?: Array<{ content: string }>
      }

      return data.versions?.[0]?.content ?? ""
    }
  }

  return (
    <Box>
      <Box mb="4">
        <TextField.Root
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts…"
          style={{ maxWidth: "24rem" }}
        />
      </Box>

      {filtered.length === 0 ? (
        <Card>
          <Flex direction="column" align="center" py="8" gap="2">
            <Text size="2" color="gray">
              {query.length > 0 ? "No prompts match your search." : "No prompts yet."}
            </Text>
            {query.length === 0 && (
              <Text asChild size="2" color="indigo">
                <Link href="/prompts/new">Create your first prompt</Link>
              </Text>
            )}
          </Flex>
        </Card>
      ) : (
        <Flex direction="column" gap="3">
          {filtered.map((prompt) => {
            const promptTags = getTagNames(prompt.tagIds)
            return (
              <Link
                key={prompt.id}
                href={`/prompts/${prompt.id}`}
                className="block relative group"
                style={{ textDecoration: "none" }}
              >
                <Card
                  style={{
                    cursor: "pointer",
                    transition: "box-shadow 0.15s",
                  }}
                >
                  <Flex align="start" justify="between" gap="3">
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        as="p"
                        weight="medium"
                        size="2"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {prompt.name}
                      </Text>
                      {prompt.description !== undefined && (
                        <Text
                          as="p"
                          size="2"
                          color="gray"
                          mt="1"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {prompt.description}
                        </Text>
                      )}
                      <Flex align="center" gap="2" mt="2" wrap="wrap">
                        <Text size="1" color="gray">
                          v{prompt.latestVersionNumber}
                        </Text>
                        {prompt.groupId !== undefined && (
                          <Badge variant="soft" color="gray" size="1">
                            {groupMap.get(prompt.groupId) ?? "Group"}
                          </Badge>
                        )}
                        {promptTags.map((tagName) => (
                          <Badge key={tagName} variant="soft" color="indigo" size="1">
                            {tagName}
                          </Badge>
                        ))}
                        <Text size="1" color="gray">
                          {formatDate(prompt.updatedAt)}
                        </Text>
                      </Flex>
                    </Box>
                    <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                      <Badge variant="soft" color={statusColor(prompt.status)} size="1">
                        {prompt.status}
                      </Badge>
                      <span
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className="opacity-0 group-hover:opacity-100"
                        style={{ transition: "opacity 0.15s" }}
                      >
                        <CopyButton getText={makeGetText(prompt.id)} />
                      </span>
                    </Flex>
                  </Flex>
                </Card>
              </Link>
            )
          })}
        </Flex>
      )}
    </Box>
  )
}
