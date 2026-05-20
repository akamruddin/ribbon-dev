import { Router } from 'express'
import { db } from '../db/index.js'
import { requireAuth, requireMod } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth, requireMod)

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const [
      sandboxOverview,
      sandboxByDay,
      sandboxBySlot,
      sandboxByUser,
      sandboxByEnv,
      poolSize,
      forumOverview,
      forumByUser,
      forumByCategory,
      forumRecentActivity,
      userList,
    ] = await Promise.all([

      // ── Sandbox: overview totals ────────────────────────────────────────────
      db.query(`
        SELECT
          COUNT(*)                                                           AS total_sessions,
          COUNT(*) FILTER (WHERE state NOT IN ('cancelled','destroyed'))     AS valid_sessions,
          COUNT(*) FILTER (WHERE state = 'completed')                        AS completed,
          COUNT(*) FILTER (WHERE state = 'cancelled')                        AS cancelled,
          COUNT(*) FILTER (
            WHERE state NOT IN ('cancelled','destroyed','completed')
              AND start_time <= now() AND end_time > now()
          )                                                                  AS active_now,
          COALESCE(SUM(extension_count) FILTER (WHERE state != 'cancelled'), 0)::int
                                                                             AS total_extensions,
          COALESCE(ROUND(SUM(
            EXTRACT(EPOCH FROM (COALESCE(actual_end_time, end_time) - start_time)) / 3600
          ) FILTER (WHERE state NOT IN ('cancelled'))::numeric, 1), 0)      AS total_hours,
          -- last 7 days
          COUNT(*) FILTER (
            WHERE start_time >= now() - interval '7 days'
              AND state NOT IN ('cancelled')
          )                                                                  AS sessions_7d,
          COALESCE(SUM(extension_count) FILTER (
            WHERE start_time >= now() - interval '7 days'
              AND state != 'cancelled'
          ), 0)::int                                                         AS extensions_7d,
          -- last 30 days
          COUNT(*) FILTER (
            WHERE start_time >= now() - interval '30 days'
              AND state NOT IN ('cancelled')
          )                                                                  AS sessions_30d,
          -- previous 30 days (for growth rate)
          COUNT(*) FILTER (
            WHERE start_time >= now() - interval '60 days'
              AND start_time <  now() - interval '30 days'
              AND state NOT IN ('cancelled')
          )                                                                  AS sessions_prev_30d,
          -- peak concurrent: max simultaneous active sessions ever
          (
            SELECT COALESCE(MAX(concurrent), 0) FROM (
              SELECT COUNT(*) AS concurrent
              FROM reservations
              WHERE state NOT IN ('cancelled','destroyed')
              GROUP BY date_trunc('hour', start_time)
            ) t
          )                                                                  AS peak_concurrent
        FROM reservations
      `),

      // ── Sandbox: sessions by day (last 60 days) ─────────────────────────────
      db.query(`
        SELECT
          DATE(start_time AT TIME ZONE 'UTC')                    AS day,
          COUNT(*) FILTER (WHERE state != 'cancelled')::int      AS sessions,
          COALESCE(SUM(extension_count) FILTER (WHERE state != 'cancelled'), 0)::int AS extensions,
          COALESCE(ROUND(SUM(
            EXTRACT(EPOCH FROM (COALESCE(actual_end_time, end_time) - start_time)) / 3600
          ) FILTER (WHERE state != 'cancelled')::numeric, 1), 0) AS hours
        FROM reservations
        WHERE start_time >= now() - interval '60 days'
        GROUP BY DATE(start_time AT TIME ZONE 'UTC')
        ORDER BY day
      `),

      // ── Sandbox: slot × day-of-week heatmap (0=Sun … 6=Sat) ───────────────
      db.query(`
        SELECT
          EXTRACT(DOW FROM start_time AT TIME ZONE 'UTC')::int AS dow,
          CASE
            WHEN (EXTRACT(HOUR FROM start_time AT TIME ZONE 'UTC') * 60
                + EXTRACT(MINUTE FROM start_time AT TIME ZONE 'UTC')) < 270  THEN 0
            WHEN (EXTRACT(HOUR FROM start_time AT TIME ZONE 'UTC') * 60
                + EXTRACT(MINUTE FROM start_time AT TIME ZONE 'UTC')) < 540  THEN 1
            WHEN (EXTRACT(HOUR FROM start_time AT TIME ZONE 'UTC') * 60
                + EXTRACT(MINUTE FROM start_time AT TIME ZONE 'UTC')) < 810  THEN 2
            WHEN (EXTRACT(HOUR FROM start_time AT TIME ZONE 'UTC') * 60
                + EXTRACT(MINUTE FROM start_time AT TIME ZONE 'UTC')) < 1080 THEN 3
            ELSE 4
          END AS slot_idx,
          COUNT(*)::int AS sessions
        FROM reservations
        WHERE state NOT IN ('cancelled')
        GROUP BY dow, slot_idx
        ORDER BY dow, slot_idx
      `),

      // ── Sandbox: top users ──────────────────────────────────────────────────
      db.query(`
        SELECT
          u.id, u.username, u.email, u.company, u.role,
          COUNT(r.id)::int                                         AS sessions,
          COALESCE(SUM(r.extension_count), 0)::int                AS extensions,
          COALESCE(ROUND(SUM(
            EXTRACT(EPOCH FROM (COALESCE(r.actual_end_time, r.end_time) - r.start_time)) / 3600
          )::numeric, 1), 0)                                       AS hours,
          COUNT(r.id) FILTER (WHERE r.state = 'cancelled')::int   AS cancellations,
          MAX(r.start_time)                                        AS last_session
        FROM users u
        LEFT JOIN reservations r ON r.user_id = u.id
        GROUP BY u.id, u.username, u.email, u.company, u.role
        HAVING COUNT(r.id) FILTER (WHERE r.state != 'cancelled') > 0
        ORDER BY sessions DESC, hours DESC
        LIMIT 30
      `),

      // ── Sandbox: per-environment ────────────────────────────────────────────
      db.query(`
        SELECT
          e.id, e.name, e.status,
          COUNT(r.id) FILTER (WHERE r.state NOT IN ('cancelled'))::int AS sessions,
          COALESCE(SUM(r.extension_count) FILTER (WHERE r.state NOT IN ('cancelled')), 0)::int AS extensions,
          COALESCE(ROUND(SUM(
            EXTRACT(EPOCH FROM (COALESCE(r.actual_end_time, r.end_time) - r.start_time)) / 3600
          ) FILTER (WHERE r.state NOT IN ('cancelled'))::numeric, 1), 0) AS hours,
          MAX(r.start_time) FILTER (WHERE r.state NOT IN ('cancelled')) AS last_used
        FROM sandbox_environments e
        LEFT JOIN reservations r ON r.environment_id = e.id
        GROUP BY e.id, e.name, e.status
        ORDER BY e.name
      `),

      // ── Pool size ────────────────────────────────────────────────────────────
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE status = 'available')::int AS active,
          COUNT(*)::int                                      AS total
        FROM sandbox_environments
        WHERE status != 'decommissioned'
      `),

      // ── Forum: overview ──────────────────────────────────────────────────────
      db.query(`
        SELECT
          (SELECT COUNT(*)::int FROM threads)                          AS total_threads,
          (SELECT COUNT(*)::int FROM replies)                          AS total_replies,
          (SELECT COUNT(*)::int FROM users)                            AS total_users,
          (SELECT COUNT(*)::int FROM threads WHERE created_at >= now() - interval '7 days')
                                                                       AS threads_7d,
          (SELECT COUNT(*)::int FROM replies  WHERE created_at >= now() - interval '7 days')
                                                                       AS replies_7d,
          (SELECT COUNT(DISTINCT author_id)::int FROM threads WHERE created_at >= now() - interval '30 days')
                                                                       AS active_authors_30d
      `),

      // ── Forum: contributions per user ────────────────────────────────────────
      db.query(`
        SELECT
          u.id, u.username, u.email, u.company, u.role,
          COUNT(DISTINCT t.id)::int                                    AS threads,
          COUNT(DISTINCT r.id)::int                                    AS replies,
          (COUNT(DISTINCT t.id) * 3 + COUNT(DISTINCT r.id))::int      AS engagement,
          MAX(GREATEST(t.created_at, r.created_at))                   AS last_post,
          (SELECT COUNT(*)::int FROM threads t2
           WHERE t2.author_id = u.id
             AND t2.created_at >= now() - interval '30 days')         AS threads_30d,
          (SELECT COUNT(*)::int FROM replies r2
           WHERE r2.author_id = u.id
             AND r2.created_at >= now() - interval '30 days')         AS replies_30d
        FROM users u
        LEFT JOIN threads t ON t.author_id = u.id
        LEFT JOIN replies r ON r.author_id = u.id
        GROUP BY u.id, u.username, u.email, u.company, u.role
        ORDER BY engagement DESC, u.username
        LIMIT 30
      `),

      // ── Forum: by category ───────────────────────────────────────────────────
      db.query(`
        SELECT
          t.category_slug   AS category,
          COUNT(*)::int     AS threads,
          SUM(t.reply_count)::int AS replies,
          SUM(t.view_count)::int  AS views,
          MAX(t.last_activity)    AS last_activity
        FROM threads t
        GROUP BY t.category_slug
        ORDER BY threads DESC
      `),

      // ── Forum: recent activity (last 20 posts) ───────────────────────────────
      db.query(`
        (SELECT 'thread' AS type, t.title, u.username, t.created_at AS ts, t.category_slug AS category
         FROM threads t JOIN users u ON u.id = t.author_id
         ORDER BY t.created_at DESC LIMIT 10)
        UNION ALL
        (SELECT 'reply', t.title, u.username, r.created_at, t.category_slug
         FROM replies r
         JOIN threads t ON t.id = r.thread_id
         JOIN users  u ON u.id = r.author_id
         ORDER BY r.created_at DESC LIMIT 10)
        ORDER BY ts DESC
        LIMIT 20
      `),

      // ── All users (for user management table) ────────────────────────────────
      db.query(`
        SELECT id, username, email, company, role, timezone, created_at, banned_at
        FROM users ORDER BY created_at DESC
      `),
    ])

    // ── Capacity forecast ──────────────────────────────────────────────────────
    const pool        = poolSize.rows[0].active
    const slotsPerDay = 5  // 5 time slots per day
    const capacityPerDay = pool * slotsPerDay

    const s = sandboxOverview.rows[0]
    const sessions7d    = Number(s.sessions_7d)
    const sessions30d   = Number(s.sessions_30d)
    const sessionsPrev  = Number(s.sessions_prev_30d)

    const avg7d  = sessions7d / 7
    const avg30d = sessions30d / 30
    const avgPrev = sessionsPrev / 30

    // Growth rate: month-over-month
    const growthRate = avgPrev > 0 ? ((avg30d - avgPrev) / avgPrev) : 0

    // Current utilization (7-day avg sessions per day as % of capacity)
    const utilization7d = capacityPerDay > 0 ? avg7d / capacityPerDay : 0

    // At current trajectory, when will 80% capacity be hit?
    const targetUtil = 0.8 * capacityPerDay
    let daysToCapacity = null
    let recommendedPoolSize = pool
    if (growthRate > 0 && avg7d > 0) {
      // avg * (1+r)^d = target  →  d = log(target/avg) / log(1+r)
      const dailyRate = Math.pow(1 + growthRate, 1 / 30) - 1  // monthly → daily
      if (dailyRate > 0) {
        daysToCapacity = Math.ceil(Math.log(targetUtil / avg7d) / Math.log(1 + dailyRate))
        if (daysToCapacity < 0) daysToCapacity = 0
      }
    }

    // Recommend adding environments if avg utilization > 70% or in <30 days to capacity
    if (utilization7d > 0.7 || (daysToCapacity !== null && daysToCapacity < 30)) {
      recommendedPoolSize = Math.ceil(pool * (avg7d / (targetUtil * 0.75)))
    }

    res.json({
      sandbox: {
        overview: {
          ...s,
          total_sessions:   Number(s.total_sessions),
          valid_sessions:   Number(s.valid_sessions),
          completed:        Number(s.completed),
          cancelled:        Number(s.cancelled),
          active_now:       Number(s.active_now),
          total_extensions: Number(s.total_extensions),
          total_hours:      Number(s.total_hours),
          sessions_7d:      sessions7d,
          extensions_7d:    Number(s.extensions_7d),
          sessions_30d:     sessions30d,
          peak_concurrent:  Number(s.peak_concurrent),
        },
        byDay:  sandboxByDay.rows,
        bySlot: sandboxBySlot.rows,
        byUser: sandboxByUser.rows,
        byEnv:  sandboxByEnv.rows,
        pool: {
          active: pool,
          total:  Number(poolSize.rows[0].total),
          max:    10,
        },
        forecast: {
          avg7d:              Math.round(avg7d * 10) / 10,
          avg30d:             Math.round(avg30d * 10) / 10,
          growthRate:         Math.round(growthRate * 1000) / 10,  // percentage
          utilization7d:      Math.round(utilization7d * 1000) / 10,  // percentage
          capacityPerDay,
          daysToCapacity,
          recommendedPoolSize,
        },
      },
      forum: {
        overview:       forumOverview.rows[0],
        byUser:         forumByUser.rows,
        byCategory:     forumByCategory.rows,
        recentActivity: forumRecentActivity.rows,
      },
      users: userList.rows,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[admin]', err)
    res.status(500).json({ error: 'Failed to load dashboard data' })
  }
})

export default router
