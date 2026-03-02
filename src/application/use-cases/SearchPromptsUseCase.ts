import type { PromptRepository } from "@/src/domain/repositories/PromptRepository"
import type { SearchPromptDTO } from "../dto/SearchPromptDTO"
import type { Prompt } from "@/src/domain/entities/Prompt"

export class SearchPromptsUseCase {
  constructor(private readonly promptRepo: PromptRepository) {}

  async execute(dto: SearchPromptDTO): Promise<Prompt[]> {
    return this.promptRepo.searchPrompts({
      q: dto.q,
      groupId: dto.groupId,
      status: dto.status,
    })
  }
}
