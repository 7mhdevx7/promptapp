import type { ExecutionVariable } from "@/src/domain/entities/PromptExecution"

/**
 * Renders template by replacing {{variable}} with values
 * Preserves all content exactly: whitespace, special chars, unicode, etc.
 *
 * Example:
 *   template: "Hello {{name}} from {{company}}"
 *   variables: [{name: "name", value: "John"}, {name: "company", value: "Acme"}]
 *   result: "Hello John from Acme"
 */
export function renderTemplate(
  templateContent: string,
  variables: ExecutionVariable[]
): string {
  let result = templateContent

  // Create a map for O(1) lookup
  const variableMap = new Map(variables.map((v) => [v.name, v.value]))

  // Replace all {{variable}} patterns
  // Using a simple replace loop to ensure exact preservation
  result = result.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    return variableMap.get(variableName) ?? match
  })

  return result
}

/**
 * Validates all required variables have values
 */
export function validateVariablesComplete(
  requiredVariables: string[],
  providedVariables: ExecutionVariable[]
): { valid: boolean; missing: string[] } {
  const providedNames = new Set(providedVariables.map((v) => v.name))
  const missing = requiredVariables.filter((name) => !providedNames.has(name))

  return {
    valid: missing.length === 0,
    missing,
  }
}
