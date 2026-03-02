import type { Redis } from "@upstash/redis"
import type { PromptExecutionRepository } from "@/src/domain/repositories/PromptExecutionRepository"
import type { PromptExecution } from "@/src/domain/entities/PromptExecution"

function parseJson<T>(data: unknown): T {
  if (typeof data === "string") return JSON.parse(data) as T
  return data as T
}

export class RedisPromptExecutionRepository implements PromptExecutionRepository {
  constructor(private readonly redis: Redis) {}

  async saveExecution(execution: PromptExecution): Promise<void> {
    await this.redis.set(`execution:${execution.id}`, JSON.stringify(execution))
    await this.redis.lpush(`prompt:${execution.promptId}:executions`, execution.id)
  }

  async getExecutionById(id: string): Promise<PromptExecution | null> {
    const raw = await this.redis.get<string>(`execution:${id}`)
    if (!raw) return null
    return parseJson<PromptExecution>(raw)
  }

  async getExecutionsByPromptId(
    promptId: string,
    limit = 50
  ): Promise<PromptExecution[]> {
    const ids = await this.redis.lrange(`prompt:${promptId}:executions`, 0, limit - 1)
    if (ids.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const id of ids) {
      pipeline.get(`execution:${id}`)
    }
    const results = await pipeline.exec()

    const executions: PromptExecution[] = []
    for (const result of results) {
      if (!result) continue
      executions.push(parseJson<PromptExecution>(result))
    }

    return executions
  }

  async deleteExecution(id: string): Promise<void> {
    const execution = await this.getExecutionById(id)
    if (execution) {
      await this.redis.del(`execution:${id}`)
      // Remove from the prompt's execution list would require lrem
      // For now, we'll leave it - it's a soft delete
    }
  }
}
