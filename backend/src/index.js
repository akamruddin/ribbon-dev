import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { runMigrations } from './db/migrate.js'
import { seedIfEmpty }   from './db/seed.js'
import { connectRedis }  from './db/redis.js'
import authRoutes    from './routes/auth.js'
import forumRoutes   from './routes/forum.js'
import sandboxRoutes from './routes/sandbox.js'
import adminRoutes   from './routes/admin.js'
import { startReminderJob } from './jobs/reminders.js'

// Warn loudly if JWT secrets are still at default values
const DEFAULT_SECRETS = ['change-me-before-production', 'change-me-refresh-before-production']
if (!process.env.JWT_SECRET || DEFAULT_SECRETS.includes(process.env.JWT_SECRET)) {
  const msg = 'WARNING: JWT_SECRET is set to default placeholder — generate a strong secret before deploying to production'
  if (process.env.NODE_ENV === 'production') throw new Error(msg)
  else console.warn(`\n⚠  ${msg}\n`)
}
if (!process.env.JWT_REFRESH_SECRET || DEFAULT_SECRETS.includes(process.env.JWT_REFRESH_SECRET)) {
  const msg = 'WARNING: JWT_REFRESH_SECRET is set to default placeholder — generate a strong secret before deploying to production'
  if (process.env.NODE_ENV === 'production') throw new Error(msg)
  else console.warn(`\n⚠  ${msg}\n`)
}

const app  = express()
const PORT = process.env.PORT ?? 8000

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '256kb' }))  // cap request body size

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

app.use('/api/auth',    authRoutes)
app.use('/api/forum',   forumRoutes)
app.use('/api/sandbox', sandboxRoutes)
app.use('/api/admin',   adminRoutes)

async function start() {
  await connectRedis()
  console.log('Running migrations…')
  await runMigrations()
  await seedIfEmpty()
  app.listen(PORT, () => {
    console.log(`ribbon-dev backend :${PORT}`)
    startReminderJob()
  })
}

start().catch((err) => {
  console.error('Startup failed:', err.message)
  process.exit(1)
})
