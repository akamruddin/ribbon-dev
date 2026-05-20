import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import rateLimit from 'express-rate-limit'
import { db } from '../db/index.js'
import { redis } from '../db/redis.js'
import { requireAuth } from '../middleware/auth.js'

const REFRESH_TTL_SEC = 7 * 24 * 3600   // 7 days — matches JWT_REFRESH_EXPIRES_IN

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function storeRefreshToken(userId, token) {
  await redis.set(`rt:${hashToken(token)}`, String(userId), { EX: REFRESH_TTL_SEC })
}

async function rotateRefreshToken(oldToken) {
  // GETDEL: atomically consume old hash and return the stored userId.
  // Returns null if token was already used or revoked.
  return redis.getDel(`rt:${hashToken(oldToken)}`)
}

async function revokeRefreshToken(token) {
  await redis.del(`rt:${hashToken(token)}`)
}

async function revokeAllUserTokens(userId) {
  // Scan for all rt:* keys belonging to this user and delete them.
  // Used when banning a user or "sign out everywhere".
  const keys = []
  for await (const key of redis.scanIterator({ MATCH: 'rt:*', COUNT: 100 })) {
    const val = await redis.get(key)
    if (val === String(userId)) keys.push(key)
  }
  if (keys.length) await redis.del(keys)
}

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: 'Too many login attempts — try again in 15 minutes' },
  standardHeaders: true, legacyHeaders: false,
})
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: { error: 'Too many registrations from this IP — try again later' },
  standardHeaders: true, legacyHeaders: false,
})

function signTokens(userId, role) {
  const payload = { sub: userId, role }
  const access  = jwt.sign(payload, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN ?? '15m' })
  const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET,  { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d' })
  return { access, refresh }
}

// POST /api/auth/register
router.post('/register', registerLimiter, async (req, res) => {
  const { email, username, password } = req.body ?? {}
  if (!email || !username || !password)
    return res.status(400).json({ error: 'email, username, and password are required' })
  if (typeof email !== 'string' || email.length > 255 || !email.includes('@'))
    return res.status(400).json({ error: 'Invalid email address' })
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(username))
    return res.status(400).json({ error: 'Username must be 3–30 alphanumeric characters or underscores' })
  if (typeof password !== 'string' || password.length < 8 || password.length > 128)
    return res.status(400).json({ error: 'Password must be 8–128 characters' })

  try {
    const hash = await bcrypt.hash(password, 10)
    const initials = username.slice(0, 2).toUpperCase()
    const { rows } = await db.query(
      `INSERT INTO users (email, username, password_hash, role, initials)
       VALUES ($1,$2,$3,'member',$4) RETURNING id, email, username, role, initials, color`,
      [email.toLowerCase(), username, hash, initials]
    )
    const user = rows[0]
    const { access, refresh } = signTokens(user.id, user.role)
    await storeRefreshToken(user.id, refresh)
    res.status(201).json({ user, access, refresh })
  } catch (err) {
    if (err.constraint === 'users_email_key')    return res.status(409).json({ error: 'Email already registered' })
    if (err.constraint === 'users_username_key') return res.status(409).json({ error: 'Username already taken' })
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' })
  if (typeof email !== 'string' || email.length > 255)
    return res.status(400).json({ error: 'Invalid email' })
  if (typeof password !== 'string' || password.length > 128)
    return res.status(400).json({ error: 'Invalid password' })

  const { rows } = await db.query(
    'SELECT id, email, username, password_hash, role, initials, color FROM users WHERE email = $1',
    [email.toLowerCase()]
  )
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid email or password' })

  const { password_hash: _, ...safeUser } = user
  const { access, refresh } = signTokens(user.id, user.role)
  await storeRefreshToken(user.id, refresh)
  res.json({ user: safeUser, access, refresh })
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refresh } = req.body ?? {}
  if (!refresh) return res.status(400).json({ error: 'refresh token required' })

  try {
    // Verify JWT signature first — fails fast on tampered/expired tokens
    const payload = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET)

    // Atomically consume the stored hash — returns null if revoked or already rotated
    const storedUserId = await rotateRefreshToken(refresh)
    if (!storedUserId) return res.status(401).json({ error: 'Token revoked or already used' })

    const { access, refresh: newRefresh } = signTokens(payload.sub, payload.role)
    await storeRefreshToken(payload.sub, newRefresh)
    res.json({ access, refresh: newRefresh })
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' })
  }
})

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  const { refresh } = req.body ?? {}
  if (refresh) await revokeRefreshToken(refresh)
  res.json({ ok: true })
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, email, username, full_name, company, timezone, role, initials, color, created_at FROM users WHERE id = $1',
    [req.user.sub]
  )
  if (!rows[0]) return res.status(404).json({ error: 'User not found' })
  res.json({ user: rows[0] })
})

// PATCH /api/auth/profile
router.patch('/profile', requireAuth, async (req, res) => {
  const { full_name, username, company, email, timezone } = req.body ?? {}

  const updates = []
  const vals    = []

  if (full_name !== undefined) {
    if (full_name && full_name.length > 100) return res.status(400).json({ error: 'Name must be ≤100 characters' })
    vals.push(full_name?.trim() || null); updates.push(`full_name = $${vals.length}`)
  }
  if (company !== undefined) {
    if (company && company.length > 100) return res.status(400).json({ error: 'Company must be ≤100 characters' })
    vals.push(company?.trim() || null); updates.push(`company   = $${vals.length}`)
  }
  if (email !== undefined) {
    if (!email?.includes('@') || email.length > 255) return res.status(400).json({ error: 'Invalid email' })
    vals.push(email.toLowerCase().trim()); updates.push(`email = $${vals.length}`)
  }
  if (username !== undefined) {
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username))
      return res.status(400).json({ error: 'Username must be 3–30 alphanumeric characters or underscores' })
    vals.push(username); updates.push(`username = $${vals.length}`)
    // Update initials too
    vals.push(username.slice(0, 2).toUpperCase()); updates.push(`initials = $${vals.length}`)
  }

  if (timezone !== undefined) {
    // Validate IANA timezone by attempting to use it
    try { new Intl.DateTimeFormat('en', { timeZone: timezone }) }
    catch { return res.status(400).json({ error: 'Invalid timezone' }) }
    vals.push(timezone); updates.push(`timezone = $${vals.length}`)
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' })

  vals.push(req.user.sub)
  try {
    const { rows } = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${vals.length}
       RETURNING id, email, username, full_name, company, timezone, role, initials, color, created_at`,
      vals
    )
    res.json({ user: rows[0] })
  } catch (err) {
    if (err.constraint === 'users_email_key')    return res.status(409).json({ error: 'Email already in use' })
    if (err.constraint === 'users_username_key') return res.status(409).json({ error: 'Username already taken' })
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

export default router
