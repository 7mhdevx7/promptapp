import type { PromptGroup } from "../entities/PromptGroup"

export interface GroupRepository {
  saveGroup(group: PromptGroup, userId: string): Promise<void>
  getGroups(userId: string): Promise<PromptGroup[]>
  getGroupById(id: string): Promise<PromptGroup | null>
}
