"use client"

import { useState, useEffect, type FormEvent } from "react"
import type { PromptGroup } from "@/src/domain/entities/PromptGroup"
import { formatDate } from "@/src/interfaces/web/lib/time"
import {
  Box,
  Flex,
  Heading,
  Text,
  TextField,
  Button,
  Card,
  Callout,
} from "@radix-ui/themes"

export default function GroupsPage() {
  const [groups, setGroups] = useState<PromptGroup[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    void fetch("/api/groups")
      .then((res) => res.json())
      .then((data: { groups?: PromptGroup[] }) => {
        setGroups(data.groups ?? [])
        setFetching(false)
      })
  }, [])

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(typeof data.error === "string" ? data.error : "Failed to create group")
      return
    }

    const data = (await res.json()) as { group: PromptGroup }
    setGroups((prev) => [data.group, ...prev])
    setName("")
    setDescription("")
  }

  return (
    <Box>
      <Heading size="5" mb="5">
        Groups
      </Heading>

      <Card mb="5">
        <Text weight="medium" size="2" mb="3" style={{ display: "block" }}>
          Create group
        </Text>
        {error !== null && (
          <Callout.Root color="red" size="1" mb="3">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <form onSubmit={handleCreate}>
          <Flex direction="column" gap="3">
            <TextField.Root
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Group name"
              style={{ width: "100%" }}
            />
            <TextField.Root
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              style={{ width: "100%" }}
            />
            <Box>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create"}
              </Button>
            </Box>
          </Flex>
        </form>
      </Card>

      <Card>
        <Box pb="3" style={{ borderBottom: "1px solid var(--gray-4)" }}>
          <Text weight="medium" size="2">
            All groups ({groups.length})
          </Text>
        </Box>
        {fetching ? (
          <Flex align="center" justify="center" py="6">
            <Text size="2" color="gray">
              Loading…
            </Text>
          </Flex>
        ) : groups.length === 0 ? (
          <Flex align="center" justify="center" py="6">
            <Text size="2" color="gray">
              No groups yet.
            </Text>
          </Flex>
        ) : (
          <Box>
            {groups.map((group, index) => (
              <Flex
                key={group.id}
                align="start"
                justify="between"
                py="3"
                style={index > 0 ? { borderTop: "1px solid var(--gray-4)" } : {}}
              >
                <Box>
                  <Text as="p" size="2" weight="medium">
                    {group.name}
                  </Text>
                  {group.description !== undefined && (
                    <Text as="p" size="1" color="gray" mt="1">
                      {group.description}
                    </Text>
                  )}
                </Box>
                <Text size="1" color="gray" style={{ flexShrink: 0, marginLeft: "1rem" }}>
                  {formatDate(group.createdAt)}
                </Text>
              </Flex>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  )
}
