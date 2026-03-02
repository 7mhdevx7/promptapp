export type PromptStatus = "draft" | "active" | "archived"

export interface Prompt {
  id: string
  name: string
  description?: string | undefined
  groupId?: string | undefined
  status: PromptStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  latestVersionNumber: number
  tagIds?: string[] | undefined
}
