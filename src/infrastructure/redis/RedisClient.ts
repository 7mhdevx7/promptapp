import { Redis } from "@upstash/redis"

let instance: Redis | null = null

export function getRedisClient(): Redis {
  if (instance !== null) {
    return instance
  }

  const url = process.env["UPSTASH_REDIS_REST_URL"]
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"]

  console.log("[RedisClient] URL loaded:", url ? "YES" : "NO")
  console.log("[RedisClient] TOKEN loaded:", token ? "YES" : "NO")

  if (!url || !token) {
    console.error(`
╔════════════════════════════════════════════════════════════╗
║ ❌ ERROR: Variables de entorno no configuradas             ║
╠════════════════════════════════════════════════════════════╣
║ UPSTASH_REDIS_REST_URL:   ${url ? "✅" : "❌ NO ENCONTRADA"}
║ UPSTASH_REDIS_REST_TOKEN: ${token ? "✅" : "❌ NO ENCONTRADA"}
╠════════════════════════════════════════════════════════════╣
║ SOLUCIÓN RÁPIDA:                                           ║
║ 1. Verifica que .env.local existe en la raíz              ║
║ 2. Cierra el servidor (Ctrl+C)                            ║
║ 3. npm run dev                                             ║
╚════════════════════════════════════════════════════════════╝
    `)
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables"
    )
  }

  console.log("[RedisClient] Connecting to Redis...")
  instance = new Redis({ url, token })
  return instance
}

// Export as a lazy-loaded instance with proper generic support
export const redis = {
  get<T = unknown>(key: string) {
    return getRedisClient().get<T>(key)
  },
  set(key: string, value: string | number | object) {
    return getRedisClient().set(key, value)
  },
  lpush(key: string, ...values: Array<string | object>) {
    return getRedisClient().lpush(key, ...values)
  },
  lrange(key: string, start: number, stop: number) {
    return getRedisClient().lrange(key, start, stop)
  },
  pipeline() {
    return getRedisClient().pipeline()
  },
  del(key: string) {
    return getRedisClient().del(key)
  },
  exists(key: string) {
    return getRedisClient().exists(key)
  },
} as unknown as Redis
