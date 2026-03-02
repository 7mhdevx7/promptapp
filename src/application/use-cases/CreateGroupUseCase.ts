import { z } from "zod"
import type { GroupRepository } from "@/src/domain/repositories/GroupRepository"
import type { PromptGroup } from "@/src/domain/entities/PromptGroup"

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100),
  description: z.string().optional(),
})

export type CreateGroupDTO = z.infer<typeof CreateGroupSchema>

export class CreateGroupUseCase {
  constructor(private readonly groupRepo: GroupRepository) {}

  async execute(dto: CreateGroupDTO): Promise<PromptGroup> {
    const group: PromptGroup = {
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      createdAt: new Date().toISOString(),
      ...(dto.description !== undefined && { description: dto.description }),
    }

    await this.groupRepo.saveGroup(group)

    return group
  }
}
