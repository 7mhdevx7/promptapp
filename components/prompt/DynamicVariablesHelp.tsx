"use client"

import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Box, Flex, Text, Code, Popover, IconButton } from "@radix-ui/themes"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text
        as="p"
        size="1"
        weight="bold"
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "var(--gray-9)",
        }}
        mb="2"
      >
        {title}
      </Text>
      {children}
    </Box>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <Box
      px="2"
      py="1"
      style={{
        backgroundColor: "var(--gray-3)",
        borderRadius: "var(--radius-2)",
        border: "1px solid var(--gray-5)",
      }}
    >
      <pre
        style={{
          margin: 0,
          fontSize: "0.75rem",
          fontFamily: "monospace",
          color: "var(--gray-12)",
          whiteSpace: "pre",
        }}
      >
        {children}
      </pre>
    </Box>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap="1">
      <Text size="1" color="gray" weight="medium">
        {label}
      </Text>
      {children}
    </Flex>
  )
}

export default function DynamicVariablesHelp() {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton
          type="button"
          variant="ghost"
          color="gray"
          size="1"
          style={{ cursor: "pointer" }}
          aria-label="Ayuda sobre variables dinámicas"
        >
          <InfoCircledIcon width="15" height="15" />
        </IconButton>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        style={{ width: "320px", padding: 0 }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <Box
          px="4"
          py="3"
          style={{
            borderBottom: "1px solid var(--gray-4)",
            backgroundColor: "var(--gray-2)",
          }}
        >
          <Flex align="center" gap="2">
            <InfoCircledIcon style={{ color: "var(--indigo-9)", flexShrink: 0 }} />
            <Text size="2" weight="bold">
              Variables dinámicas en el prompt
            </Text>
          </Flex>
        </Box>

        {/* Body */}
        <Flex direction="column" gap="0">
          {/* Section 1 — Concept */}
          <Box px="4" py="3" style={{ borderBottom: "1px solid var(--gray-3)" }}>
            <Section title="Concepto">
              <Text as="p" size="1" color="gray" mb="2">
                Puedes insertar variables dinámicas usando llaves dobles. Esto creará
                automáticamente un campo editable.
              </Text>
              <CodeBlock>{"{{nombre}}"}</CodeBlock>
            </Section>
          </Box>

          {/* Section 2 — Input */}
          <Box px="4" py="3" style={{ borderBottom: "1px solid var(--gray-3)" }}>
            <Section title="Campo por defecto (input)">
              <Flex direction="column" gap="2">
                <Row label="Sintaxis:">
                  <Code size="1" style={{ fontFamily: "monospace" }}>
                    {"{{nombre}}"}
                  </Code>
                </Row>
                <Row label="Resultado:">
                  <Text size="1" color="gray">
                    Se crea un campo de texto simple{" "}
                    <Text size="1" color="indigo" weight="medium">
                      (input)
                    </Text>
                    .
                  </Text>
                </Row>
              </Flex>
            </Section>
          </Box>

          {/* Section 3 — Textarea */}
          <Box px="4" py="3" style={{ borderBottom: "1px solid var(--gray-3)" }}>
            <Section title="Campo multilínea (textarea)">
              <Flex direction="column" gap="2">
                <Row label="Sintaxis:">
                  <Code size="1" style={{ fontFamily: "monospace" }}>
                    {"{{descripcion:textarea}}"}
                  </Code>
                </Row>
                <Row label="Resultado:">
                  <Text size="1" color="gray">
                    Se crea un campo multilínea{" "}
                    <Text size="1" color="indigo" weight="medium">
                      (textarea)
                    </Text>
                    .
                  </Text>
                </Row>
              </Flex>
            </Section>
          </Box>

          {/* Section 4 — Full example */}
          <Box px="4" py="3" style={{ borderBottom: "1px solid var(--gray-3)" }}>
            <Section title="Ejemplo completo">
              <Flex direction="column" gap="2">
                <Row label="Template:">
                  <CodeBlock>{`Crear API para {{entidad}}\nDescripción:\n{{descripcion:textarea}}`}</CodeBlock>
                </Row>
                <Row label="Resultado:">
                  <Flex direction="column" gap="1">
                    <Flex align="center" gap="1">
                      <Box
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          backgroundColor: "var(--indigo-9)",
                          flexShrink: 0,
                        }}
                      />
                      <Text size="1" color="gray">
                        Campo de texto para{" "}
                        <Code size="1" style={{ fontFamily: "monospace" }}>
                          entidad
                        </Code>
                      </Text>
                    </Flex>
                    <Flex align="center" gap="1">
                      <Box
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          backgroundColor: "var(--indigo-9)",
                          flexShrink: 0,
                        }}
                      />
                      <Text size="1" color="gray">
                        Campo multilínea para{" "}
                        <Code size="1" style={{ fontFamily: "monospace" }}>
                          descripcion
                        </Code>
                      </Text>
                    </Flex>
                  </Flex>
                </Row>
              </Flex>
            </Section>
          </Box>

          {/* Section 5 — Note */}
          <Box
            px="4"
            py="3"
            style={{
              backgroundColor: "var(--amber-2)",
              borderTop: "1px solid var(--amber-4)",
            }}
          >
            <Section title="Nota importante">
              <Text as="p" size="1" color="gray">
                Si no especificas el tipo, el campo será{" "}
                <Text size="1" weight="medium" color="amber">
                  input
                </Text>{" "}
                por defecto.
              </Text>
            </Section>
          </Box>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
