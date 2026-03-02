import { Select as RadixSelect, Text, Box } from "@radix-ui/themes"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  id?: string
  disabled?: boolean
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  value,
  onValueChange,
  id,
  disabled,
}: SelectProps) {
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
      <RadixSelect.Root
        {...(value !== undefined && { value })}
        {...(onValueChange !== undefined && { onValueChange })}
        {...(disabled !== undefined && { disabled })}
      >
        <RadixSelect.Trigger
          {...(placeholder !== undefined && { placeholder })}
          {...(error !== undefined && { color: "red" as const })}
          style={{ width: "100%" }}
        />
        <RadixSelect.Content>
          {options.map((opt) => (
            <RadixSelect.Item key={opt.value} value={opt.value}>
              {opt.label}
            </RadixSelect.Item>
          ))}
        </RadixSelect.Content>
      </RadixSelect.Root>
      {error !== undefined && (
        <Text size="1" color="red" mt="1" style={{ display: "block" }}>
          {error}
        </Text>
      )}
    </Box>
  )
}
