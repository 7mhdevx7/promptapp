export type FieldType = "input" | "textarea"

export interface DynamicField {
  name: string
  type: FieldType
}

/**
 * Parses dynamic fields from a prompt template.
 * Syntax:
 *   {{campo}}          → text input
 *   {{campo:textarea}} → textarea
 */
export function parseDynamicFields(template: string): DynamicField[] {
  const regex = /\{\{([^}]+)\}\}/g
  const seen = new Set<string>()
  const fields: DynamicField[] = []

  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    const raw = match[1]!.trim()
    const parts = raw.split(":")
    const name = parts[0]!.trim()
    const typeRaw = parts[1]?.trim()
    const type: FieldType = typeRaw === "textarea" ? "textarea" : "input"

    if (name.length > 0 && !seen.has(name)) {
      seen.add(name)
      fields.push({ name, type })
    }
  }

  return fields
}

/**
 * Replaces all {{field}} and {{field:type}} placeholders in a template
 * with the corresponding values from the provided record.
 * Unresolved fields are left as-is.
 */
export function resolvePrompt(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (original, raw: string) => {
    const name = raw.trim().split(":")[0]!.trim()
    const value = values[name]
    return value !== undefined && value !== "" ? value : original
  })
}
