interface MemoryBucket {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryBucket>()
const MAX_MEMORY_ENTRIES = 2000

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAtSeconds: number
}

function pruneMemoryStore(now: number) {
  if (memoryStore.size < MAX_MEMORY_ENTRIES) return
  for (const [key, bucket] of memoryStore.entries()) {
    if (bucket.resetAt <= now) {
      memoryStore.delete(key)
    }
  }
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (upstashUrl && upstashToken) {
    try {
      const windowBucket = Math.floor(Date.now() / (windowSeconds * 1000))
      const redisKey = `rl:${key}:${windowBucket}`
      const res = await fetch(`${upstashUrl.replace(/\/+$/, '')}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', redisKey],
          ['EXPIRE', redisKey, windowSeconds + 5],
        ]),
      })

      if (res.ok) {
        const data = (await res.json()) as Array<{ result?: number }>
        const count = Number(data?.[0]?.result ?? 1)
        const resetAtSeconds = (windowBucket + 1) * windowSeconds
        return {
          allowed: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
          resetAtSeconds,
        }
      }
    } catch {
      // Fall back to in-memory window if Redis is transiently unreachable
    }
  }

  const now = Date.now()
  pruneMemoryStore(now)
  const existing = memoryStore.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000
    memoryStore.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetAtSeconds: Math.ceil(resetAt / 1000),
    }
  }

  existing.count += 1
  return {
    allowed: existing.count <= limit,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetAtSeconds: Math.ceil(existing.resetAt / 1000),
  }
}
