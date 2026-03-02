export interface PromptExecution {
  id: string
  promptId: string
  promptVersionNumber: number
  templateContent: string
  variables: ExecutionVariable[]
  generatedContent: string
  createdAt: string
  createdBy: string
}

export interface ExecutionVariable {
  name: string
  value: string
}
