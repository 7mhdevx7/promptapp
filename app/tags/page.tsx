"use client"

import { useState, useEffect, type FormEvent } from "react"
import type { Tag } from "@/src/domain/entities/Tag"
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

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    void fetch("/api/tags")
      .then((res) => res.json())
      .then((data: { tags?: Tag[] }) => {
        setTags(data.tags ?? [])
        setFetching(false)
      })
  }, [])

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(typeof data.error === "string" ? data.error : "Failed to create tag")
      return
    }

    const data = (await res.json()) as { tag: Tag }
    setTags((prev) => [data.tag, ...prev])
    setName("")
  }

  return (
    <Box>
      <Heading size="5" mb="5">
        Tags
      </Heading>

      <Card mb="5">
        <Text weight="medium" size="2" mb="3" style={{ display: "block" }}>
          Create tag
        </Text>
        {error !== null && (
          <Callout.Root color="red" size="1" mb="3">
            <Callout.Text>{error}</Callout.Text>
          </Callout.Root>
        )}
        <form onSubmit={handleCreate}>
          <Flex gap="2">
            <TextField.Root
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Tag name"
              style={{ flex: 1 }}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </Button>
          </Flex>
        </form>
      </Card>

      <Card>
        <Box pb="3" style={{ borderBottom: "1px solid var(--gray-4)" }}>
          <Text weight="medium" size="2">
            All tags ({tags.length})
          </Text>
        </Box>
        {fetching ? (
          <Flex align="center" justify="center" py="6">
            <Text size="2" color="gray">
              Loading…
            </Text>
          </Flex>
        ) : tags.length === 0 ? (
          <Flex align="center" justify="center" py="6">
            <Text size="2" color="gray">
              No tags yet.
            </Text>
          </Flex>
        ) : (
          <Box>
            {tags.map((tag, index) => (
              <Flex
                key={tag.id}
                align="center"
                justify="between"
                py="3"
                style={index > 0 ? { borderTop: "1px solid var(--gray-4)" } : {}}
              >
                <Text size="2" weight="medium">
                  {tag.name}
                </Text>
                <Text size="1" color="gray">
                  {formatDate(tag.createdAt)}
                </Text>
              </Flex>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  )
}
