import type { PromptRepository } from "@/src/domain/repositories/PromptRepository"
import type { Prompt } from "@/src/domain/entities/Prompt"
import type { PromptVersion } from "@/src/domain/entities/PromptVersion"

export interface PromptWithVersions {
  prompt: Prompt
  versions: PromptVersion[]
}

export class GetPromptUseCase {
  constructor(private readonly promptRepo: PromptRepository) {}

  async execute(promptId: string): Promise<PromptWithVersions | null> {
    const prompt = await this.promptRepo.getPromptById(promptId)
    if (prompt === null) {
      return null
    }

    const versions = await this.promptRepo.getVersions(promptId)
    const sorted = versions.sort((a, b) => b.versionNumber - a.versionNumber)

    return { prompt, versions: sorted }
  }
}
