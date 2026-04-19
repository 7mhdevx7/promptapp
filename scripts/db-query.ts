import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: "https://becoming-drum-58918.upstash.io",
  token: "AeYmAAIncDI2MGMxYzM4ODUzMGU0MmY4OWMxYmMzZGE5MzQxZDA0NXAyNTg5MTg",
})

async function main() {
  // Scan for all user:email:* keys (one per registered user)
  const keys: string[] = []
  let cursor = 0
  do {
    const [next, batch] = await redis.scan(cursor, { match: "user:email:*", count: 100 })
    cursor = Number(next)
    keys.push(...(batch as string[]))
  } while (cursor !== 0)

  console.log(`\nUsuarios registrados: ${keys.length}`)

  for (const key of keys) {
    const userId = await redis.get<string>(key)
    const user = await redis.get<Record<string, unknown>>(`user:${userId}`)
    console.log(`\n── ${user?.email} (${user?.createdAt})`)

    const promptIds = await redis.lrange(`user:${userId}:prompt:list`, 0, -1)
    if (promptIds.length === 0) {
      console.log("  Sin prompts")
      continue
    }

    const pipeline = redis.pipeline()
    for (const id of promptIds) pipeline.get(`prompt:${id}`)
    const results = await pipeline.exec()

    for (const raw of results) {
      if (!raw) continue
      const p = (typeof raw === "string" ? JSON.parse(raw) : raw) as Record<string, unknown>
      console.log(`  [${p.status}] ${p.name}  (creado: ${p.createdAt})`)
      if (p.description) console.log(`    ${p.description}`)
    }
  }
}

main().catch(console.error)
