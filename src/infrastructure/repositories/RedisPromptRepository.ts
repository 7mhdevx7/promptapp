import type { Redis } from "@upstash/redis"
import type {
  PromptRepository,
  SearchFilters,
} from "@/src/domain/repositories/PromptRepository"
import type { Prompt } from "@/src/domain/entities/Prompt"
import type { PromptVersion } from "@/src/domain/entities/PromptVersion"
import type { Tag } from "@/src/domain/entities/Tag"

function parseJson<T>(data: unknown): T {
  if (typeof data === "string") return JSON.parse(data) as T
  return data as T
}

export class RedisPromptRepository implements PromptRepository {
  constructor(private readonly redis: Redis) {}

  async savePrompt(prompt: Prompt): Promise<void> {
    await this.redis.set(`prompt:${prompt.id}`, JSON.stringify(prompt))
    await this.redis.lpush("prompt:list", prompt.id)
  }

  async updatePrompt(prompt: Prompt): Promise<void> {
    await this.redis.set(`prompt:${prompt.id}`, JSON.stringify(prompt))
  }

  async getPromptById(id: string): Promise<Prompt | null> {
    const raw = await this.redis.get<string>(`prompt:${id}`)
    if (!raw) return null
    return parseJson<Prompt>(raw)
  }

  async searchPrompts(filters: SearchFilters): Promise<Prompt[]> {
    const ids = await this.redis.lrange("prompt:list", 0, -1)
    if (ids.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const id of ids) {
      pipeline.get(`prompt:${id}`)
    }
    const results = await pipeline.exec()

    const prompts: Prompt[] = []
    for (const result of results) {
      if (!result) continue
      prompts.push(parseJson<Prompt>(result))
    }

    return prompts.filter((p) => {
      if (filters.status !== undefined && p.status !== filters.status) return false
      if (filters.groupId !== undefined && p.groupId !== filters.groupId) return false
      if (filters.q !== undefined && filters.q.length > 0) {
        const q = filters.q.toLowerCase()
        const nameMatch = p.name.toLowerCase().includes(q)
        const descMatch = p.description?.toLowerCase().includes(q) ?? false
        if (!nameMatch && !descMatch) return false
      }
      return true
    })
  }

  async saveVersion(version: PromptVersion): Promise<void> {
    await this.redis.set(`prompt_version:${version.id}`, JSON.stringify(version))
    await this.redis.lpush(`prompt:${version.promptId}:versions`, version.id)
  }

  async getVersions(promptId: string): Promise<PromptVersion[]> {
    const ids = await this.redis.lrange(`prompt:${promptId}:versions`, 0, -1)
    if (ids.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const id of ids) {
      pipeline.get(`prompt_version:${id}`)
    }
    const results = await pipeline.exec()

    const versions: PromptVersion[] = []
    for (const result of results) {
      if (!result) continue
      versions.push(parseJson<PromptVersion>(result))
    }

    return versions
  }

  async assignTags(promptId: string, tagIds: string[]): Promise<void> {
    // Remove existing tags
    await this.redis.del(`prompt:${promptId}:tags`)

    // Add new tags
    if (tagIds.length > 0) {
      await this.redis.lpush(`prompt:${promptId}:tags`, ...tagIds)
    }

    // Update prompt to reflect tag IDs
    const prompt = await this.getPromptById(promptId)
    if (prompt) {
      await this.updatePrompt({
        ...prompt,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      })
    }
  }

  async getPromptTags(promptId: string): Promise<Tag[]> {
    const tagIds = await this.redis.lrange(`prompt:${promptId}:tags`, 0, -1)
    if (tagIds.length === 0) return []

    const pipeline = this.redis.pipeline()
    for (const id of tagIds) {
      pipeline.get(`tag:${id}`)
    }
    const results = await pipeline.exec()

    const tags: Tag[] = []
    for (const result of results) {
      if (!result) continue
      tags.push(parseJson<Tag>(result))
    }

    return tags
  }

  async removeTag(promptId: string, tagId: string): Promise<void> {
    const tagIds = await this.redis.lrange(`prompt:${promptId}:tags`, 0, -1)
    const updated = tagIds.filter((id) => id !== tagId)

    await this.redis.del(`prompt:${promptId}:tags`)
    if (updated.length > 0) {
      await this.redis.lpush(`prompt:${promptId}:tags`, ...updated)
    }

    // Update prompt
    const prompt = await this.getPromptById(promptId)
    if (prompt) {
      await this.updatePrompt({
        ...prompt,
        tagIds: updated.length > 0 ? updated : undefined,
      })
    }
  }
}
