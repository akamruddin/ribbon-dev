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
import { startReminderJob }      from './jobs/reminders.js'
import { startLabLifecycleJob }  from './jobs/lab-lifecycle.js'

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

// Trust the single reverse-proxy (Nginx) in front of us so that
// express-rate-limit can read the real client IP from X-Forwarded-For.
app.set('trust proxy', 1)

app.use(helmet())
// Build the allowed-origins set from CORS_ORIGIN (comma-separated) plus the
// APP_URL so that the deployed server address is always permitted automatically.
const allowedOrigins = new Set([
  ...(process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map(s => s.trim()),
  ...(process.env.APP_URL ? [process.env.APP_URL.trim()] : []),
  'http://localhost',
  'http://localhost:5173',
])
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl / server-to-server) or any listed origin
    if (!origin || allowedOrigins.has(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))
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
    startLabLifecycleJob()
  })
}

start().catch((err) => {
  console.error('Startup failed:', err.message)
  process.exit(1)
})
