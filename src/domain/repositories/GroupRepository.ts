import type { PromptGroup } from "../entities/PromptGroup"

export interface GroupRepository {
  saveGroup(group: PromptGroup): Promise<void>
  getGroups(): Promise<PromptGroup[]>
  getGroupById(id: string): Promise<PromptGroup | null>
}
