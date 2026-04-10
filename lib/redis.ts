import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null

export async function getRedis() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL })
    client.on('error', () => { client = null })
    await client.connect()
  }
  return client
}

export const GOLLUM_KEY = 'gollum:completions'
