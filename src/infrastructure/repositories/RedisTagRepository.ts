import type { Redis } from "@upstash/redis"
import type { TagRepository } from "@/src/domain/repositories/TagRepository"
import type { Tag } from "@/src/domain/entities/Tag"

export class RedisTagRepository implements TagRepository {
  constructor(private readonly redis: Redis) {}

  async saveTag(tag: Tag, userId: string): Promise<void> {
    await this.redis.set(`tag:${tag.id}`, JSON.stringify(tag))
    await this.redis.lpush(`user:${userId}:tag:list`, tag.id)
  }

  async getTags(userId: string): Promise<Tag[]> {
    const ids = await this.redis.lrange(`user:${userId}:tag:list`, 0, -1)
    if (ids.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const id of ids) {
      pipeline.get(`tag:${id}`)
    }
    const results = await pipeline.exec()

    const tags: Tag[] = []
    for (const result of results) {
      if (result === null) continue
      tags.push(
        JSON.parse(typeof result === "string" ? result : JSON.stringify(result)) as Tag
      )
    }

    return tags
  }

  async getTagById(id: string): Promise<Tag | null> {
    const raw = await this.redis.get<string>(`tag:${id}`)
    if (raw === null) return null
    return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)) as Tag
  }
}
