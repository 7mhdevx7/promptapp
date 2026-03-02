import { z } from "zod"
import type { TagRepository } from "@/src/domain/repositories/TagRepository"
import type { Tag } from "@/src/domain/entities/Tag"

export const CreateTagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(100),
  tagGroupId: z.string().optional(),
})

export type CreateTagDTO = z.infer<typeof CreateTagSchema>

export class CreateTagUseCase {
  constructor(private readonly tagRepo: TagRepository) {}

  async execute(dto: CreateTagDTO, userId: string): Promise<Tag> {
    const tag: Tag = {
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      createdAt: new Date().toISOString(),
      ...(dto.tagGroupId !== undefined && { tagGroupId: dto.tagGroupId }),
    }

    await this.tagRepo.saveTag(tag, userId)

    return tag
  }
}
