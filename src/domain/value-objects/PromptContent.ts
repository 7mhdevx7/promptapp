export class PromptContent {
  private constructor(readonly value: string) {}

  static create(raw: string): PromptContent {
    const trimmed = raw.trim()
    if (trimmed.length === 0) {
      throw new Error("Prompt content cannot be empty")
    }
    return new PromptContent(trimmed)
  }
}
