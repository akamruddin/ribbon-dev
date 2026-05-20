import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
})

client.on('error', (err) => console.error('[redis] Client error:', err.message))
client.on('connect', () => console.log('[redis] Connected'))

export async function connectRedis() {
  await client.connect()
}

export { client as redis }
