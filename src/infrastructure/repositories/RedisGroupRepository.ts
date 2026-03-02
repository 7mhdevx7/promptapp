import type { Redis } from "@upstash/redis"
import type { GroupRepository } from "@/src/domain/repositories/GroupRepository"
import type { PromptGroup } from "@/src/domain/entities/PromptGroup"

export class RedisGroupRepository implements GroupRepository {
  constructor(private readonly redis: Redis) {}

  async saveGroup(group: PromptGroup): Promise<void> {
    await this.redis.set(`group:${group.id}`, JSON.stringify(group))
    await this.redis.lpush("group:list", group.id)
  }

  async getGroups(): Promise<PromptGroup[]> {
    const ids = await this.redis.lrange("group:list", 0, -1)
    if (ids.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const id of ids) {
      pipeline.get(`group:${id}`)
    }
    const results = await pipeline.exec()

    const groups: PromptGroup[] = []
    for (const result of results) {
      if (result === null) continue
      groups.push(
        JSON.parse(
          typeof result === "string" ? result : JSON.stringify(result)
        ) as PromptGroup
      )
    }

    return groups
  }

  async getGroupById(id: string): Promise<PromptGroup | null> {
    const raw = await this.redis.get<string>(`group:${id}`)
    if (raw === null) return null
    return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)) as PromptGroup
  }
}
