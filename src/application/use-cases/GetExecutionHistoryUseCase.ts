import type { PromptExecutionRepository } from "@/src/domain/repositories/PromptExecutionRepository"
import type { PromptExecution } from "@/src/domain/entities/PromptExecution"

export class GetExecutionHistoryUseCase {
  constructor(private readonly executionRepo: PromptExecutionRepository) {}

  async execute(promptId: string, limit = 50): Promise<PromptExecution[]> {
    return this.executionRepo.getExecutionsByPromptId(promptId, limit)
  }
}
