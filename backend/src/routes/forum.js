import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { db } from '../db/index.js'
import { redis } from '../db/redis.js'
import { requireAuth, requireMod } from '../middleware/auth.js'

const router = Router()

const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 20,
  message: { error: 'Too many posts — slow down and try again in 10 minutes' },
  standardHeaders: true, legacyHeaders: false,
})

// Shared query to join thread with author and tags
const THREAD_SELECT = `
  SELECT
    t.id, t.category_slug AS category, t.title, t.body,
    t.pinned, t.reply_count, t.view_count,
    t.last_activity, t.created_at,
    t.author_id,
    u.username AS author, u.role, u.initials, u.color,
    COALESCE(
      json_agg(DISTINCT tt.tag) FILTER (WHERE tt.tag IS NOT NULL), '[]'
    ) AS tags
  FROM threads t
  JOIN users u ON u.id = t.author_id
  LEFT JOIN thread_tags tt ON tt.thread_id = t.id
`

// GET /api/forum/threads?category=all&q=
router.get('/threads', async (req, res) => {
  const { category = 'all', q = '' } = req.query
  try {
    const params = []
    let where = 'WHERE 1=1'

    if (category && category !== 'all') {
      params.push(category)
      where += ` AND t.category_slug = $${params.length}`
    }
    if (q) {
      if (q.length > 200) return res.status(400).json({ error: 'Search term must be ≤200 characters' })
      params.push(`%${q}%`)
      where += ` AND t.title ILIKE $${params.length}`
    }

    const { rows } = await db.query(
      `${THREAD_SELECT} ${where}
       GROUP BY t.id, u.username, u.role, u.initials, u.color
       ORDER BY t.pinned DESC, t.last_activity DESC`,
      params
    )

    // Count per category for sidebar badges
    const counts = await db.query(`
      SELECT category_slug AS category, COUNT(*)::int AS count
      FROM threads GROUP BY category_slug
    `)
    const total = await db.query('SELECT COUNT(*)::int AS count FROM threads')

    res.json({
      threads: rows,
      counts: counts.rows,
      total: total.rows[0].count,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch threads' })
  }
})

// GET /api/forum/threads/:id
router.get('/threads/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid thread id' })

  try {
    // Increment view count
    await db.query('UPDATE threads SET view_count = view_count + 1 WHERE id = $1', [id])

    const { rows } = await db.query(
      `${THREAD_SELECT} WHERE t.id = $1
       GROUP BY t.id, u.username, u.role, u.initials, u.color`,
      [id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Thread not found' })

    const { rows: replies } = await db.query(
      `SELECT r.id, r.body, r.created_at,
              r.author_id,
              u.username AS author, u.role, u.initials, u.color
       FROM replies r
       JOIN users u ON u.id = r.author_id
       WHERE r.thread_id = $1
       ORDER BY r.created_at ASC`,
      [id]
    )

    res.json({ thread: { ...rows[0], replies } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch thread' })
  }
})

// POST /api/forum/threads  (auth required)
router.post('/threads', requireAuth, postLimiter, async (req, res) => {
  const { category, title, body, tags = [] } = req.body ?? {}
  if (!category || !title || !body)
    return res.status(400).json({ error: 'category, title, and body are required' })
  if (typeof title !== 'string' || title.length > 300)
    return res.status(400).json({ error: 'title must be ≤300 characters' })
  if (typeof body !== 'string' || body.length > 50_000)
    return res.status(400).json({ error: 'body must be ≤50 000 characters' })
  if (!Array.isArray(tags) || tags.some(t => typeof t !== 'string' || t.length > 50))
    return res.status(400).json({ error: 'each tag must be a string ≤50 characters' })

  try {
    const { rows: user } = await db.query('SELECT banned_at FROM users WHERE id = $1', [req.user.sub])
    if (user[0]?.banned_at) return res.status(403).json({ error: 'Your account has been suspended' })
    const { rows } = await db.query(
      `INSERT INTO threads (category_slug, title, body, author_id)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [category, title.trim(), body.trim(), req.user.sub]
    )
    const threadId = rows[0].id
    const validTags = tags.slice(0, 5).map(t => t.trim()).filter(Boolean)
    if (validTags.length > 0) {
      const placeholders = validTags.map((_, i) => `($1,$${i + 2})`).join(',')
      await db.query(
        `INSERT INTO thread_tags (thread_id, tag) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
        [threadId, ...validTags]
      )
    }
    res.status(201).json({ threadId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create thread' })
  }
})

// POST /api/forum/threads/:id/replies  (auth required)
router.post('/threads/:id/replies', requireAuth, postLimiter, async (req, res) => {
  const threadId = parseInt(req.params.id)
  if (isNaN(threadId)) return res.status(400).json({ error: 'Invalid thread id' })

  const { body } = req.body ?? {}
  if (!body?.trim()) return res.status(400).json({ error: 'body is required' })
  if (typeof body !== 'string' || body.length > 20_000)
    return res.status(400).json({ error: 'Reply body must be ≤20 000 characters' })

  try {
    const { rows: banCheck } = await db.query('SELECT banned_at FROM users WHERE id = $1', [req.user.sub])
    if (banCheck[0]?.banned_at) return res.status(403).json({ error: 'Your account has been suspended' })
    const { rows: exists } = await db.query('SELECT id FROM threads WHERE id = $1', [threadId])
    if (!exists[0]) return res.status(404).json({ error: 'Thread not found' })

    const { rows } = await db.query(
      `INSERT INTO replies (thread_id, author_id, body) VALUES ($1,$2,$3)
       RETURNING id, body, created_at`,
      [threadId, req.user.sub, body.trim()]
    )
    await db.query(
      `UPDATE threads
       SET reply_count = reply_count + 1, last_activity = now()
       WHERE id = $1`,
      [threadId]
    )

    const { rows: author } = await db.query(
      'SELECT username, role, initials, color FROM users WHERE id = $1',
      [req.user.sub]
    )

    res.status(201).json({ reply: { ...rows[0], ...author[0] } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to post reply' })
  }
})

// DELETE /api/forum/threads/:id  (mod only)
router.delete('/threads/:id', requireAuth, requireMod, async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid thread id' })
  const { rows } = await db.query('SELECT id FROM threads WHERE id = $1', [id])
  if (!rows[0]) return res.status(404).json({ error: 'Thread not found' })
  await db.query('DELETE FROM threads WHERE id = $1', [id])
  res.json({ message: 'Thread deleted' })
})

// PATCH /api/forum/threads/:id/pin  (mod only)
router.patch('/threads/:id/pin', requireAuth, requireMod, async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid thread id' })
  const { pinned } = req.body ?? {}
  if (typeof pinned !== 'boolean') return res.status(400).json({ error: 'pinned must be a boolean' })
  const { rows } = await db.query('SELECT id FROM threads WHERE id = $1', [id])
  if (!rows[0]) return res.status(404).json({ error: 'Thread not found' })
  await db.query('UPDATE threads SET pinned = $1 WHERE id = $2', [pinned, id])
  res.json({ pinned })
})

// DELETE /api/forum/replies/:id  (mod only)
router.delete('/replies/:id', requireAuth, requireMod, async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid reply id' })
  const { rows } = await db.query('SELECT thread_id FROM replies WHERE id = $1', [id])
  if (!rows[0]) return res.status(404).json({ error: 'Reply not found' })
  await db.query('DELETE FROM replies WHERE id = $1', [id])
  await db.query(
    'UPDATE threads SET reply_count = GREATEST(0, reply_count - 1) WHERE id = $1',
    [rows[0].thread_id]
  )
  res.json({ message: 'Reply deleted' })
})

// POST /api/forum/users/:id/ban  (mod only)
router.post('/users/:id/ban', requireAuth, requireMod, async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' })
  if (id === req.user.sub) return res.status(400).json({ error: 'Cannot ban yourself' })
  const { rows } = await db.query('SELECT role FROM users WHERE id = $1', [id])
  if (!rows[0]) return res.status(404).json({ error: 'User not found' })
  if (['moderator', 'staff'].includes(rows[0].role))
    return res.status(400).json({ error: 'Cannot ban a moderator or staff member' })
  await db.query('UPDATE users SET banned_at = now() WHERE id = $1', [id])
  // Revoke all active refresh tokens for this user so they're kicked immediately
  const keys = []
  for await (const key of redis.scanIterator({ MATCH: 'rt:*', COUNT: 100 })) {
    const val = await redis.get(key)
    if (val === String(id)) keys.push(key)
  }
  if (keys.length) await redis.del(keys)
  res.json({ message: 'User banned' })
})

// POST /api/forum/users/:id/unban  (mod only)
router.post('/users/:id/unban', requireAuth, requireMod, async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user id' })
  await db.query('UPDATE users SET banned_at = NULL WHERE id = $1', [id])
  res.json({ message: 'User unbanned' })
})

// GET /api/forum/stats
router.get('/stats', async (req, res) => {
  try {
    const [members, threads] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS count FROM users'),
      db.query('SELECT COUNT(*)::int AS count FROM threads'),
    ])
    res.json({ members: members.rows[0].count, threads: threads.rows[0].count })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
