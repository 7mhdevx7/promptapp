export interface PromptVersion {
  id: string
  promptId: string
  versionNumber: number
  content: string
  changelog?: string | undefined
  createdAt: string
  createdBy: string
}
