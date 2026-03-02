import type { Redis } from "@upstash/redis"
import type { UserRepository } from "@/src/domain/repositories/UserRepository"
import type { User } from "@/src/domain/entities/User"

export class RedisUserRepository implements UserRepository {
  constructor(private readonly redis: Redis) {}

  async saveUser(user: User): Promise<void> {
    await this.redis.set(`user:${user.id}`, JSON.stringify(user))
    await this.redis.set(`user:email:${user.email}`, user.id)
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userId = await this.redis.get<string>(`user:email:${email}`)
    if (!userId) return null
    return this.getUserById(String(userId))
  }

  async getUserById(id: string): Promise<User | null> {
    const raw = await this.redis.get<string>(`user:${id}`)
    if (!raw) return null
    const data = typeof raw === "string" ? JSON.parse(raw) : raw
    return data as User
  }
}
