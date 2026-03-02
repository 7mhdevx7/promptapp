import type { PromptRepository } from "@/src/domain/repositories/PromptRepository"
import type { UpdatePromptDTO } from "../dto/UpdatePromptDTO"
import type { Prompt } from "@/src/domain/entities/Prompt"
import type { PromptVersion } from "@/src/domain/entities/PromptVersion"
import { PromptName } from "@/src/domain/value-objects/PromptName"
import { PromptContent } from "@/src/domain/value-objects/PromptContent"

export class UpdatePromptUseCase {
  constructor(private readonly promptRepo: PromptRepository) {}

  async execute(promptId: string, dto: UpdatePromptDTO, userId: string): Promise<Prompt> {
    const existing = await this.promptRepo.getPromptById(promptId)
    if (existing === null) {
      throw new Error("Prompt not found")
    }

    if (dto.name !== undefined) {
      PromptName.create(dto.name)
    }

    const now = new Date().toISOString()

    let latestVersionNumber = existing.latestVersionNumber

    if (dto.content !== undefined) {
      const content = PromptContent.create(dto.content)

      const versions = await this.promptRepo.getVersions(promptId)
      const latestVersion = versions.sort((a, b) => b.versionNumber - a.versionNumber)[0]

      const contentChanged =
        latestVersion === undefined || content.value !== latestVersion.content

      if (contentChanged) {
        latestVersionNumber = existing.latestVersionNumber + 1

        const newVersion: PromptVersion = {
          id: crypto.randomUUID(),
          promptId,
          versionNumber: latestVersionNumber,
          content: content.value,
          createdAt: now,
          createdBy: userId,
          ...(dto.changelog !== undefined && { changelog: dto.changelog }),
        }

        await this.promptRepo.saveVersion(newVersion)
      }
    }

    const updated: Prompt = {
      ...existing,
      name: dto.name ?? existing.name,
      status: dto.status ?? existing.status,
      updatedAt: now,
      latestVersionNumber,
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.groupId !== undefined && { groupId: dto.groupId }),
      ...(dto.tagIds !== undefined && {
        tagIds: dto.tagIds.length > 0 ? dto.tagIds : undefined,
      }),
    }

    await this.promptRepo.updatePrompt(updated)

    if (dto.tagIds !== undefined) {
      await this.promptRepo.assignTags(promptId, dto.tagIds)
    }

    return updated
  }
}
