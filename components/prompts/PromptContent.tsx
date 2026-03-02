"use client"

import { formatDate } from "@/src/interfaces/web/lib/time"
import type { PromptVersion } from "@/src/domain/entities/PromptVersion"
import CopyButton from "@/components/ui/CopyButton"
import { Box, Flex, Text, Card, ScrollArea } from "@radix-ui/themes"

interface PromptContentProps {
  version: PromptVersion
}

export default function PromptContent({ version }: PromptContentProps) {
  return (
    <Card mb="5">
      <Flex
        align="center"
        justify="between"
        pb="3"
        style={{ borderBottom: "1px solid var(--gray-4)" }}
      >
        <Text weight="medium" size="2">
          Current content{" "}
          <Text color="gray" weight="regular">
            v{version.versionNumber}
          </Text>
        </Text>
        <Flex align="center" gap="3">
          <CopyButton text={version.content} />
          <Text size="1" color="gray">
            {formatDate(version.createdAt)}
          </Text>
        </Flex>
      </Flex>
      <ScrollArea>
        <Box pt="3">
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
            {version.content}
          </pre>
        </Box>
      </ScrollArea>
    </Card>
  )
}
