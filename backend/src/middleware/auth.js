import jwt from 'jsonwebtoken'
import { db } from '../db/index.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })

  const token = header.slice(7)
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireMod(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  if (!['moderator', 'staff'].includes(req.user.role))
    return res.status(403).json({ error: 'Moderator access required' })
  next()
}
