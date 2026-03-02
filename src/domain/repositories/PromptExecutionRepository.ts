import type { PromptExecution } from "../entities/PromptExecution"

export interface PromptExecutionRepository {
  saveExecution(execution: PromptExecution): Promise<void>
  getExecutionById(id: string): Promise<PromptExecution | null>
  getExecutionsByPromptId(promptId: string, limit?: number): Promise<PromptExecution[]>
  deleteExecution(id: string): Promise<void>
}
