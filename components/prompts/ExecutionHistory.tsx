"use client"

import { useState, useEffect, useCallback } from "react"
import type { PromptExecution } from "@/src/domain/entities/PromptExecution"
import { formatDate } from "@/src/interfaces/web/lib/time"
import CopyButton from "@/components/ui/CopyButton"
import { Box, Flex, Text, Card, ScrollArea } from "@radix-ui/themes"

interface ExecutionHistoryProps {
  promptId: string
  initialExecutions: PromptExecution[]
}

export default function ExecutionHistory({
  promptId,
  initialExecutions,
}: ExecutionHistoryProps) {
  const [executions, setExecutions] = useState<PromptExecution[]>(initialExecutions)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const onExecutionCreated = useCallback(async () => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/executions`)
      if (!res.ok) return
      const data = (await res.json()) as { executions?: PromptExecution[] }
      if (data.executions) {
        setExecutions(data.executions)
      }
    } catch {
      // Silent fail
    }
  }, [promptId])

  useEffect(() => {
    function handleExecutionCreated(event: Event) {
      if (event instanceof CustomEvent && event.detail?.promptId === promptId) {
        void onExecutionCreated()
      }
    }

    window.addEventListener("executionCreated", handleExecutionCreated)
    return () => window.removeEventListener("executionCreated", handleExecutionCreated)
  }, [promptId, onExecutionCreated])

  if (executions.length === 0) {
    return (
      <Card id="execution-history">
        <Flex align="center" justify="center" py="6">
          <Text size="2" color="gray">
            No execution history yet.
          </Text>
        </Flex>
      </Card>
    )
  }

  return (
    <Card id="execution-history" style={{ overflow: "hidden" }}>
      <Box pb="3" style={{ borderBottom: "1px solid var(--gray-4)" }}>
        <Text weight="medium" size="2">
          Execution history{" "}
          <Text color="gray" weight="regular">
            ({executions.length})
          </Text>
        </Text>
      </Box>
      <Box>
        {executions.map((execution, index) => {
          const isExpanded = expandedId === execution.id
          const preview = execution.generatedContent.substring(0, 100)
          const hasMore = execution.generatedContent.length > 100

          return (
            <Box
              key={execution.id}
              style={index > 0 ? { borderTop: "1px solid var(--gray-4)" } : {}}
            >
              <Flex
                align="start"
                justify="between"
                gap="3"
                p="4"
                onClick={() => setExpandedId(isExpanded ? null : execution.id)}
                style={{
                  cursor: "pointer",
                  transition: "background-color 0.15s",
                }}
                className="hover:bg-[var(--gray-2)]"
              >
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Flex align="center" gap="2" mb="1">
                    <Text size="1" weight="medium" color="gray">
                      v{execution.promptVersionNumber}
                    </Text>
                    <Text size="1" color="gray">
                      {formatDate(execution.createdAt)}
                    </Text>
                  </Flex>
                  <Text
                    as="p"
                    size="2"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {preview}
                    {hasMore && "…"}
                  </Text>
                </Box>
                <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                  <Text
                    color="gray"
                    size="2"
                    style={{
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}
                  >
                    ▼
                  </Text>
                  <span onClick={(e) => e.stopPropagation()}>
                    <CopyButton text={execution.generatedContent} />
                  </span>
                </Flex>
              </Flex>

              {isExpanded && (
                <Box px="4" pb="4" style={{ borderTop: "1px solid var(--gray-3)" }}>
                  <Box mt="3" mb="3">
                    <Text
                      size="1"
                      weight="bold"
                      color="gray"
                      mb="2"
                      style={{ display: "block" }}
                    >
                      Variables:
                    </Text>
                    <Flex direction="column" gap="1">
                      {execution.variables.map((variable) => (
                        <Text key={variable.name} size="1" color="gray">
                          <Text weight="medium">{variable.name}:</Text> {variable.value}
                        </Text>
                      ))}
                    </Flex>
                  </Box>
                  <Box>
                    <Text
                      size="1"
                      weight="bold"
                      color="gray"
                      mb="2"
                      style={{ display: "block" }}
                    >
                      Generated Content:
                    </Text>
                    <ScrollArea style={{ maxHeight: "12rem" }}>
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
                            color: "var(--gray-12)",
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                            margin: 0,
                            overflowX: "auto",
                          }}
                        >
                          {execution.generatedContent}
                        </pre>
                      </Box>
                    </ScrollArea>
                  </Box>
                </Box>
              )}
            </Box>
          )
        })}
      </Box>
    </Card>
  )
}

export function createExecutionCallback(promptId: string) {
  return async function onExecutionCreated() {
    try {
      const res = await fetch(`/api/prompts/${promptId}/executions`)
      if (!res.ok) return
      const data = (await res.json()) as { executions?: PromptExecution[] }
      if (data.executions) {
        dispatchEvent(
          new CustomEvent("executionCreated", {
            detail: { promptId, executions: data.executions },
          })
        )
      }
    } catch {
      // Silent fail
    }
  }
}
