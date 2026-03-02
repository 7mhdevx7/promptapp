import type { PromptRepository } from "@/src/domain/repositories/PromptRepository"
import type { CreatePromptDTO } from "../dto/CreatePromptDTO"
import type { Prompt } from "@/src/domain/entities/Prompt"
import type { PromptVersion } from "@/src/domain/entities/PromptVersion"
import { PromptName } from "@/src/domain/value-objects/PromptName"
import { PromptContent } from "@/src/domain/value-objects/PromptContent"

export class CreatePromptUseCase {
  constructor(private readonly promptRepo: PromptRepository) {}

  async execute(dto: CreatePromptDTO, userId: string): Promise<Prompt> {
    const name = PromptName.create(dto.name)
    const content = PromptContent.create(dto.content)

    const now = new Date().toISOString()
    const promptId = crypto.randomUUID()
    const versionId = crypto.randomUUID()

    const version: PromptVersion = {
      id: versionId,
      promptId,
      versionNumber: 1,
      content: content.value,
      createdAt: now,
      createdBy: userId,
    }

    const prompt: Prompt = {
      id: promptId,
      name: name.value,
      status: dto.status,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      latestVersionNumber: 1,
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.groupId !== undefined && { groupId: dto.groupId }),
      ...(dto.tagIds !== undefined && dto.tagIds.length > 0 && { tagIds: dto.tagIds }),
    }

    await this.promptRepo.savePrompt(prompt)
    await this.promptRepo.saveVersion(version)

    if (dto.tagIds !== undefined && dto.tagIds.length > 0) {
      await this.promptRepo.assignTags(promptId, dto.tagIds)
    }

    return prompt
  }
}
