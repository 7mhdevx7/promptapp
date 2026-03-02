"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { PromptGroup } from "@/src/domain/entities/PromptGroup"
import type { PromptStatus } from "@/src/domain/entities/Prompt"
import type { Tag } from "@/src/domain/entities/Tag"
import { resolvePrompt } from "@/lib/promptParser"
import CopyButton from "@/components/ui/CopyButton"
import DynamicPromptFields from "@/components/prompt/DynamicPromptFields"
import DynamicVariablesHelp from "@/components/prompt/DynamicVariablesHelp"
import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
  TextField,
  TextArea,
  Select,
  Checkbox,
  Callout,
  Card,
} from "@radix-ui/themes"

interface PromptEditorCreateProps {
  mode: "create"
  groups: PromptGroup[]
  tags: Tag[]
}

interface PromptEditorEditProps {
  mode: "edit"
  promptId: string
  groups: PromptGroup[]
  tags: Tag[]
  initialValues: {
    name: string
    content: string
    description?: string | undefined
    status: PromptStatus
    groupId?: string | undefined
    tagIds?: string[] | undefined
  }
}

type PromptEditorProps = PromptEditorCreateProps | PromptEditorEditProps

export default function PromptEditor(props: PromptEditorProps) {
  const router = useRouter()
  const isEdit = props.mode === "edit"

  const [name, setName] = useState(isEdit ? props.initialValues.name : "")
  const [content, setContent] = useState(isEdit ? props.initialValues.content : "")
  const [description, setDescription] = useState(
    isEdit ? (props.initialValues.description ?? "") : ""
  )
  const [status, setStatus] = useState<PromptStatus>(
    isEdit ? props.initialValues.status : "draft"
  )
  const [groupId, setGroupId] = useState(
    isEdit ? (props.initialValues.groupId ?? "") : ""
  )
  const [tagIds, setTagIds] = useState<string[]>(
    isEdit ? (props.initialValues.tagIds ?? []) : []
  )
  const [changelog, setChangelog] = useState("")
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const resolvedPrompt = resolvePrompt(content, variableValues)

  const handleVariableValuesChange = useCallback((values: Record<string, string>) => {
    setVariableValues(values)
  }, [])

  function toggleTag(tagId: string) {
    if (tagIds.includes(tagId)) {
      setTagIds(tagIds.filter((id) => id !== tagId))
    } else {
      setTagIds([...tagIds, tagId])
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const body = {
      name,
      content,
      description: description.trim() || undefined,
      status,
      groupId: groupId || undefined,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      ...(isEdit && changelog.trim() ? { changelog } : {}),
    }

    const url = isEdit ? `/api/prompts/${props.promptId}` : "/api/prompts"
    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)

    if (!res.ok) {
      const data = (await res.json()) as { error?: unknown }
      if (typeof data.error === "string") {
        setError(data.error)
      } else {
        setError("Failed to save prompt")
      }
      return
    }

    if (isEdit) {
      router.push(`/prompts/${props.promptId}`)
    } else {
      const data = (await res.json()) as { prompt: { id: string } }
      router.push(`/prompts/${data.prompt.id}`)
    }

    router.refresh()
  }

  return (
    <Card asChild size="3">
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          {error !== null && (
            <Callout.Root color="red" size="1">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          )}

          <Box>
            <Text
              as="label"
              htmlFor="name"
              size="2"
              weight="medium"
              mb="1"
              style={{ display: "block" }}
            >
              Name <Text color="red">*</Text>
            </Text>
            <TextField.Root
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              placeholder="Give your prompt a clear name"
              style={{ width: "100%" }}
            />
          </Box>

          <Box>
            <Text
              as="label"
              htmlFor="description"
              size="2"
              weight="medium"
              mb="1"
              style={{ display: "block" }}
            >
              Description
            </Text>
            <TextField.Root
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              style={{ width: "100%" }}
            />
          </Box>

          <Box>
            <Flex align="center" justify="between" mb="1">
              <Flex align="center" gap="2">
                <Text as="label" htmlFor="content" size="2" weight="medium">
                  Content <Text color="red">*</Text>
                </Text>
                <DynamicVariablesHelp />
              </Flex>
              <CopyButton text={resolvedPrompt} disabled={!content} />
            </Flex>
            <TextArea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              placeholder="Write your prompt here…"
              style={{ width: "100%", fontFamily: "monospace" }}
            />
          </Box>

          <DynamicPromptFields template={content} onChange={handleVariableValuesChange} />

          {isEdit && (
            <Box>
              <Text
                as="label"
                htmlFor="changelog"
                size="2"
                weight="medium"
                mb="1"
                style={{ display: "block" }}
              >
                Changelog note
              </Text>
              <TextField.Root
                id="changelog"
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="What changed? (shown in version history)"
                style={{ width: "100%" }}
              />
            </Box>
          )}

          <Grid columns="2" gap="4">
            <Box>
              <Text
                as="label"
                htmlFor="status"
                size="2"
                weight="medium"
                mb="1"
                style={{ display: "block" }}
              >
                Status
              </Text>
              <Select.Root
                value={status}
                onValueChange={(val) => setStatus(val as PromptStatus)}
              >
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  <Select.Item value="draft">Draft</Select.Item>
                  <Select.Item value="active">Active</Select.Item>
                  <Select.Item value="archived">Archived</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text
                as="label"
                htmlFor="groupId"
                size="2"
                weight="medium"
                mb="1"
                style={{ display: "block" }}
              >
                Group
              </Text>
              <Select.Root
                value={groupId || "__none__"}
                onValueChange={(val) => setGroupId(val === "__none__" ? "" : val)}
              >
                <Select.Trigger style={{ width: "100%" }} />
                <Select.Content>
                  <Select.Item value="__none__">No group</Select.Item>
                  {props.groups.map((group) => (
                    <Select.Item key={group.id} value={group.id}>
                      {group.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Grid>

          {props.tags.length > 0 && (
            <Box>
              <Text as="p" size="2" weight="medium" mb="2">
                Tags
              </Text>
              <Flex direction="column" gap="2">
                {props.tags.map((tag) => (
                  <Flex key={tag.id} align="center" gap="2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={tagIds.includes(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                    <Text
                      as="label"
                      htmlFor={`tag-${tag.id}`}
                      size="2"
                      style={{ cursor: "pointer" }}
                    >
                      {tag.name}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          )}

          <Flex justify="end" gap="3" pt="2">
            <Button
              type="button"
              variant="outline"
              color="gray"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create prompt"}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  )
}
