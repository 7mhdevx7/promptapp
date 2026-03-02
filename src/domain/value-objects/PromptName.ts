const MAX_LENGTH = 200

export class PromptName {
  private constructor(readonly value: string) {}

  static create(raw: string): PromptName {
    const trimmed = raw.trim()
    if (trimmed.length === 0) {
      throw new Error("Prompt name cannot be empty")
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new Error(`Prompt name cannot exceed ${MAX_LENGTH} characters`)
    }
    return new PromptName(trimmed)
  }
}
