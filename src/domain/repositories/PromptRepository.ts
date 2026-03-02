import type { Prompt } from "../entities/Prompt"
import type { PromptVersion } from "../entities/PromptVersion"
import type { Tag } from "../entities/Tag"

export interface SearchFilters {
  q?: string | undefined
  groupId?: string | undefined
  status?: string | undefined
}

export interface PromptRepository {
  savePrompt(prompt: Prompt): Promise<void>
  updatePrompt(prompt: Prompt): Promise<void>
  getPromptById(id: string): Promise<Prompt | null>
  searchPrompts(filters: SearchFilters): Promise<Prompt[]>
  saveVersion(version: PromptVersion): Promise<void>
  getVersions(promptId: string): Promise<PromptVersion[]>
  assignTags(promptId: string, tagIds: string[]): Promise<void>
  getPromptTags(promptId: string): Promise<Tag[]>
  removeTag(promptId: string, tagId: string): Promise<void>
}
