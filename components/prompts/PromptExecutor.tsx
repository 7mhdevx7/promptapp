"use client"

import { useState } from "react"
import type { PromptVersion } from "@/src/domain/entities/PromptVersion"
import { extractVariables, hasVariables } from "@/src/domain/services/VariableParser"
import CopyButton from "@/components/ui/CopyButton"
import {
  Box,
  Flex,
  Text,
  Button,
  TextField,
  Card,
  Callout,
  ScrollArea,
} from "@radix-ui/themes"

interface PromptExecutorProps {
  promptId: string
  version: PromptVersion
}

interface FormVariable {
  name: string
  value: string
}

export default function PromptExecutor({ promptId, version }: PromptExecutorProps) {
  const requiredVariables = extractVariables(version.content)
  const hasVars = hasVariables(version.content)

  const [formVariables, setFormVariables] = useState<FormVariable[]>(() =>
    requiredVariables.map((name) => ({ name, value: "" }))
  )
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleVariableChange(index: number, value: string) {
    const updated = [...formVariables]
    const current = updated[index]
    if (current) {
      updated[index] = { name: current.name, value }
    }
    setFormVariables(updated)
  }

  async function handleExecute(e: { preventDefault(): void }) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/prompts/${promptId}/executions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variables: formVariables,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: unknown }
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to execute prompt"
        )
      }

      const data = (await res.json()) as { execution?: { generatedContent: string } }
      if (data.execution?.generatedContent) {
        setGeneratedContent(data.execution.generatedContent)
        dispatchEvent(new CustomEvent("executionCreated", { detail: { promptId } }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex direction="column" gap="5">
      {/* Variables form */}
      {hasVars && (
        <Card>
          <Text as="p" size="3" weight="bold" mb="4">
            Variables
          </Text>
          <form onSubmit={handleExecute}>
            <Flex direction="column" gap="4">
              {error !== null && (
                <Callout.Root color="red" size="1">
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              )}

              {formVariables.map((variable, index) => (
                <Box key={variable.name}>
                  <Text
                    as="label"
                    htmlFor={`var-${variable.name}`}
                    size="2"
                    weight="medium"
                    mb="1"
                    style={{ display: "block" }}
                  >
                    {variable.name}
                  </Text>
                  <TextField.Root
                    id={`var-${variable.name}`}
                    value={variable.value}
                    onChange={(e) => handleVariableChange(index, e.target.value)}
                    placeholder={`Enter value for {{${variable.name}}}`}
                    style={{ width: "100%" }}
                  />
                </Box>
              ))}

              <Button type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Generating…" : "Generate"}
              </Button>
            </Flex>
          </form>
        </Card>
      )}

      {/* Generated content */}
      {generatedContent !== null && (
        <Card>
          <Flex align="center" justify="between" mb="3">
            <Text size="3" weight="bold">
              Generated Content
            </Text>
            <CopyButton text={generatedContent} />
          </Flex>
          <ScrollArea>
            <Box
              p="3"
              style={{
                backgroundColor: "var(--gray-2)",
                borderRadius: "var(--radius-2)",
                border: "1px solid var(--gray-4)",
              }}
            >
              <pre
                style={{
                  fontSize: "0.875rem",
                  color: "var(--gray-12)",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  margin: 0,
                  overflowX: "auto",
                }}
              >
                {generatedContent}
              </pre>
            </Box>
          </ScrollArea>
        </Card>
      )}

      {/* No variables — direct execute */}
      {!hasVars && generatedContent === null && (
        <Card>
          <Flex direction="column" align="center" gap="3">
            <Text size="2" color="gray">
              This prompt has no variables.
            </Text>
            <Button
              disabled={loading}
              onClick={async () => {
                setLoading(true)
                try {
                  const res = await fetch(`/api/prompts/${promptId}/executions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ variables: [] }),
                  })

                  if (!res.ok) throw new Error("Failed to execute")

                  const data = (await res.json()) as {
                    execution?: { generatedContent: string }
                  }
                  if (data.execution?.generatedContent) {
                    setGeneratedContent(data.execution.generatedContent)
                    dispatchEvent(
                      new CustomEvent("executionCreated", { detail: { promptId } })
                    )
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "An error occurred")
                } finally {
                  setLoading(false)
                }
              }}
            >
              {loading ? "Generating…" : "Generate Content"}
            </Button>
          </Flex>
        </Card>
      )}
    </Flex>
  )
}
