/**
 * Extracts variable names from template content
 * Syntax: {{variableName}}
 *
 * Examples:
 *   "Hello {{name}}" -> ["name"]
 *   "{{name}} from {{company}}" -> ["name", "company"]
 *   "Name {{name}} appears {{name}} twice" -> ["name"] (deduplicated)
 */
export function extractVariables(templateContent: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables = new Set<string>()

  let match: RegExpExecArray | null
  while ((match = regex.exec(templateContent)) !== null) {
    variables.add(match[1]!)
  }

  return Array.from(variables)
}

/**
 * Validates variable name format
 */
export function isValidVariableName(name: string): boolean {
  return /^\w+$/.test(name)
}

/**
 * Checks if content has any variables
 */
export function hasVariables(content: string): boolean {
  return /\{\{\w+\}\}/.test(content)
}
