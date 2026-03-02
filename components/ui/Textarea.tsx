import { TextArea, Text, Box } from "@radix-ui/themes"
import type { ComponentPropsWithoutRef } from "react"

interface TextareaProps extends ComponentPropsWithoutRef<typeof TextArea> {
  label?: string
  error?: string
}

export default function Textarea({ label, error, id, ...props }: TextareaProps) {
  return (
    <Box style={{ width: "100%" }}>
      {label !== undefined && (
        <Text
          as="label"
          htmlFor={id}
          size="2"
          weight="medium"
          mb="1"
          style={{ display: "block" }}
        >
          {label}
        </Text>
      )}
      <TextArea
        id={id}
        color={error !== undefined ? "red" : undefined}
        style={{ width: "100%" }}
        {...props}
      />
      {error !== undefined && (
        <Text size="1" color="red" mt="1" style={{ display: "block" }}>
          {error}
        </Text>
      )}
    </Box>
  )
}
