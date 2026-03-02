"use client"

import { useEffect, useMemo, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { parseDynamicFields } from "@/lib/promptParser"
import { Box, Flex, Text, TextField, TextArea } from "@radix-ui/themes"

interface DynamicPromptFieldsProps {
  template: string
  onChange: (values: Record<string, string>) => void
}

export default function DynamicPromptFields({
  template,
  onChange,
}: DynamicPromptFieldsProps) {
  const fields = parseDynamicFields(template)

  // Stable key that only changes when field names/types change, not on every keystroke
  const fieldKey = useMemo(
    () =>
      parseDynamicFields(template)
        .map((f) => `${f.name}:${f.type}`)
        .join(","),
    [template]
  )

  const { control, watch, reset } = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(fields.map((f) => [f.name, ""])),
  })

  // Reset form values only when the field composition changes
  useEffect(() => {
    const defaults = fieldKey
      .split(",")
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, part) => {
        const name = part.split(":")[0] ?? ""
        return name ? { ...acc, [name]: "" } : acc
      }, {})
    reset(defaults)
  }, [fieldKey, reset])

  // Use a ref so the latest onChange is always called without it being a dep
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const subscription = watch((values) => {
      onChangeRef.current(values as Record<string, string>)
    })
    return () => subscription.unsubscribe()
  }, [watch])

  if (fields.length === 0) return null

  return (
    <Box
      p="3"
      style={{
        backgroundColor: "var(--indigo-2)",
        border: "1px solid var(--indigo-4)",
        borderRadius: "var(--radius-3)",
      }}
    >
      <Text as="p" size="2" weight="medium" color="indigo" mb="3">
        Variables de plantilla
      </Text>
      <Flex direction="column" gap="3">
        {fields.map((field) => (
          <Box key={field.name}>
            <Text
              as="label"
              htmlFor={`dynfield-${field.name}`}
              size="2"
              weight="medium"
              mb="1"
              style={{ display: "block" }}
            >
              {field.name}
            </Text>
            {field.type === "textarea" ? (
              <Controller
                name={field.name}
                control={control}
                render={({ field: rhfField }) => (
                  <TextArea
                    id={`dynfield-${field.name}`}
                    rows={3}
                    placeholder={`Valor para {{${field.name}:textarea}}`}
                    value={rhfField.value}
                    onChange={rhfField.onChange}
                    onBlur={rhfField.onBlur}
                    style={{ width: "100%" }}
                  />
                )}
              />
            ) : (
              <Controller
                name={field.name}
                control={control}
                render={({ field: rhfField }) => (
                  <TextField.Root
                    id={`dynfield-${field.name}`}
                    placeholder={`Valor para {{${field.name}}}`}
                    value={rhfField.value}
                    onChange={rhfField.onChange}
                    onBlur={rhfField.onBlur}
                    style={{ width: "100%" }}
                  />
                )}
              />
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
