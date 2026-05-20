import { Router } from 'express'
import { db } from '../db/index.js'
import { requireAuth } from '../middleware/auth.js'
import { sendMail } from '../services/email.js'
import { generateICS } from '../services/ics.js'

const router = Router()

const BLOCK_HOURS      = 4     // session length in hours
const BLOCK_MINS       = BLOCK_HOURS * 60           // 240 min
const BUFFER_MIN       = 30
const CYCLE_MINS       = BLOCK_MINS + BUFFER_MIN    // 270 min — session + buffer
const EXT_HOURS        = 1     // each extension adds 1 hour
const MAX_ADVANCE_DAYS = 14
const MAX_EXTENSIONS   = 3
const MAX_ENVIRONMENTS = 10

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'

// Minimal HTML escaping for user-supplied strings inserted into email templates
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function genId() {
  return `RES-${Math.floor(1000 + Math.random() * 9000)}`
}

// Returns all slot start-minutes from midnight for a single day.
// Slots are BLOCK_MINS long with BUFFER_MIN gap between them.
// e.g. BLOCK=240, BUFFER=30 → 0, 270, 540, 810, 1080 (5 slots)
function dailySlotMinutes() {
  const starts = []
  for (let m = 0; m + BLOCK_MINS <= 24 * 60; m += CYCLE_MINS) starts.push(m)
  return starts
}

// Returns the end of the slot the given UTC timestamp falls within,
// or null if the timestamp is in a buffer gap or after the last slot.
function currentSlotEnd(d) {
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes()
  for (const start of dailySlotMinutes()) {
    const end = start + BLOCK_MINS
    if (mins >= start && mins < end) {
      return new Date(Date.UTC(
        d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
        Math.floor(end / 60), end % 60
      ))
    }
  }
  return null  // in a buffer zone or past last slot
}

// Find an environment free during [start, end] (plus buffer on both sides).
// If the pool is fully booked, auto-provisions a new environment up to MAX_ENVIRONMENTS.
async function findAvailableEnvironment(start, end) {
  const bufMs  = BUFFER_MIN * 60_000
  const bStart = new Date(new Date(start).getTime() - bufMs).toISOString()
  const bEnd   = new Date(new Date(end).getTime()   + bufMs).toISOString()

  const { rows } = await db.query(`
    SELECT e.id, e.name
    FROM   sandbox_environments e
    WHERE  e.status = 'available'
    AND    e.id NOT IN (
      SELECT DISTINCT environment_id
      FROM   reservations
      WHERE  state NOT IN ('cancelled','destroyed')
        AND  environment_id IS NOT NULL
        AND  start_time < $2
        AND  end_time   > $1
    )
    ORDER BY e.id
    LIMIT 1
  `, [bStart, bEnd])

  if (rows[0]) return rows[0]

  // Scale up if under limit
  const { rows: cnt } = await db.query(
    `SELECT COUNT(*)::int AS n FROM sandbox_environments WHERE status != 'decommissioned'`
  )
  if (cnt[0].n >= MAX_ENVIRONMENTS) return null

  const nextNum = cnt[0].n + 1
  const name = `ENV-${String(nextNum).padStart(3, '0')}`
  const { rows: newEnv } = await db.query(
    'INSERT INTO sandbox_environments (name) VALUES ($1) RETURNING id, name',
    [name]
  )
  return newEnv[0]
}

async function sendBookingEmail({ userEmail, username, reservationId, envName, startTime, endTime }) {
  const startStr = new Date(startTime).toLocaleString('en-US', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
  }) + ' UTC'
  const endStr = new Date(endTime).toLocaleString('en-US', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC',
  }) + ' UTC'
  const manageUrl = `${APP_URL}/sandbox`

  const ics = generateICS({
    uid:          reservationId,
    summary:      `Ribbon Sandbox: ${envName}`,
    description:  `Reservation ${reservationId}\nEnvironment: ${envName}\nManage: ${manageUrl}`,
    start:        new Date(startTime),
    end:          new Date(endTime),
    attendeeEmail: userEmail,
  })

  await sendMail({
    to:      userEmail,
    subject: `Sandbox booked: ${envName} — ${startStr}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#222">
        <div style="background:#7d00b9;padding:20px 28px;border-radius:8px 8px 0 0">
          <span style="color:#fff;font-size:18px;font-weight:700">Ribbon DevCloud</span>
        </div>
        <div style="background:#fff;padding:28px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
          <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a1a">Sandbox reserved</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#444">
            Hi ${esc(username)}, your sandbox session has been confirmed.
          </p>
          <table style="border-collapse:collapse;width:100%;font-size:14px;margin-bottom:20px">
            <tr><td style="padding:8px 0;color:#666;width:130px">Reservation</td><td><strong>${esc(reservationId)}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#666">Environment</td><td><strong>${esc(envName)}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#666">Start</td><td>${esc(startStr)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">End</td><td>${esc(endStr)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Extensions</td><td>Up to ${MAX_EXTENSIONS} × 1 hour available</td></tr>
          </table>
          <a href="${manageUrl}"
             style="display:inline-block;padding:12px 24px;background:#7d00b9;color:#fff;
                    text-decoration:none;border-radius:6px;font-size:14px;font-weight:700">
            Manage Reservation →
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px">
            A calendar invite is attached. Import it to add this session to your calendar.
          </p>
        </div>
      </div>
    `,
    attachments: [{
      filename:    'sandbox-invite.ics',
      content:     ics,
      contentType: 'text/calendar; method=REQUEST',
    }],
  })
}

// Returns the UTC Date object for midnight at the start of dateStr in timezone tz.
// Uses the UTC offset at noon UTC (avoiding DST-transition ambiguity at midnight).
function localMidnightUTC(dateStr, tz) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const noonUTC   = new Date(Date.UTC(y, m - 1, d, 12))
  const parts     = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(noonUTC)
  const p = {}
  parts.forEach(({ type, value }) => { p[type] = Number(value) })
  const localNoonMs = Date.UTC(p.year, p.month - 1, p.day, p.hour === 24 ? 0 : p.hour, p.minute, p.second)
  const offsetMs    = localNoonMs - noonUTC.getTime()  // positive = east of UTC
  return new Date(Date.UTC(y, m - 1, d) - offsetMs)
}

// ─── GET /api/sandbox/availability?date=YYYY-MM-DD[&tz=Continent/City] ────────
router.get('/availability', async (req, res) => {
  const { date } = req.query
  let   tz       = req.query.tz || 'UTC'
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'date param required (YYYY-MM-DD)' })

  // Validate timezone; silently fall back to UTC on invalid input
  try { Intl.DateTimeFormat(undefined, { timeZone: tz }) } catch { tz = 'UTC' }

  try {
    const { rows: envRows } = await db.query(
      `SELECT COUNT(*)::int AS n FROM sandbox_environments WHERE status = 'available'`
    )
    const total   = envRows[0].n
    const now     = new Date()
    const maxDate = new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 3600_000)

    // Compute the local calendar day [dayStart, dayEnd) as UTC timestamps.
    // This ensures that "May 20" always shows slots that START on May 20 in the
    // user's timezone, regardless of UTC offset.
    const dayStart = localMidnightUTC(date, tz)
    const dayEnd   = new Date(dayStart.getTime() + 24 * 3600_000)

    // Build the list of valid slot windows for this local day first (no DB calls yet).
    const slotWindows = []
    const baseUTC = new Date(Date.UTC(
      dayStart.getUTCFullYear(), dayStart.getUTCMonth(), dayStart.getUTCDate()
    ))
    for (let di = -1; di <= 2; di++) {
      const d  = new Date(baseUTC.getTime() + di * 24 * 3600_000)
      const cy = d.getUTCFullYear(), cm = d.getUTCMonth(), cd = d.getUTCDate()
      for (const startMin of dailySlotMinutes()) {
        const slotStart = new Date(Date.UTC(cy, cm, cd, Math.floor(startMin / 60), startMin % 60))
        const slotEnd   = new Date(slotStart.getTime() + BLOCK_MINS * 60_000)
        if (slotStart <  dayStart) continue
        if (slotStart >= dayEnd)   continue
        if (slotEnd   <= now)      continue
        if (slotStart >  maxDate)  continue
        slotWindows.push({ slotStart, slotEnd })
      }
    }

    if (slotWindows.length === 0) return res.json({ slots: [], date })

    // Single query: fetch all reservations that overlap the entire day window.
    // Then compute per-slot counts in JavaScript — eliminates the N+1 pattern.
    const windowStart = slotWindows[0].slotStart
    const windowEnd   = slotWindows[slotWindows.length - 1].slotEnd
    const { rows: bookings } = await db.query(`
      SELECT environment_id,
             start_time AT TIME ZONE 'UTC' AS start_time,
             end_time   AT TIME ZONE 'UTC' AS end_time
      FROM   reservations
      WHERE  state NOT IN ('cancelled','destroyed')
        AND  environment_id IS NOT NULL
        AND  start_time < $2
        AND  end_time   > $1
    `, [windowStart.toISOString(), windowEnd.toISOString()])

    const slots = slotWindows.map(({ slotStart, slotEnd }) => {
      const bookedEnvs = new Set(
        bookings
          .filter(b => new Date(b.start_time) < slotEnd && new Date(b.end_time) > slotStart)
          .map(b => b.environment_id)
      )
      return {
        start:     slotStart.toISOString(),
        end:       slotEnd.toISOString(),
        available: Math.max(0, total - bookedEnvs.size),
        total,
        onDemand:  slotStart <= now && now < slotEnd,
      }
    })

    slots.sort((a, b) => new Date(a.start) - new Date(b.start))
    res.json({ slots, date })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
})

// ─── GET /api/sandbox/reservations/my ────────────────────────────────────────
router.get('/reservations/my', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT r.id, r.state, r.start_time, r.end_time,
             r.extension_count, r.current_stage, r.created_at,
             e.name AS environment_name
      FROM   reservations r
      LEFT JOIN sandbox_environments e ON e.id = r.environment_id
      WHERE  r.user_id = $1 AND r.state NOT IN ('destroyed','cancelled')
      ORDER  BY r.start_time ASC
      LIMIT  20
    `, [req.user.sub])
    res.json({ reservations: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reservations' })
  }
})

// ─── GET /api/sandbox/environments ───────────────────────────────────────────
router.get('/environments', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, status, created_at FROM sandbox_environments ORDER BY id'
    )
    res.json({ environments: rows, maxEnvironments: MAX_ENVIRONMENTS })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch environments' })
  }
})

// ─── POST /api/sandbox/reservations ──────────────────────────────────────────
router.post('/reservations', requireAuth, async (req, res) => {
  const { start_time, on_demand } = req.body ?? {}

  let startDate, endDate

  if (on_demand) {
    startDate = new Date()
    endDate   = currentSlotEnd(startDate)
    if (!endDate) {
      return res.status(400).json({ error: 'No active slot right now — you are in a 30-minute buffer window. Book the next available slot.' })
    }
    const minsLeft = Math.floor((endDate - startDate) / 60_000)
    if (minsLeft < 15) {
      return res.status(400).json({ error: 'Less than 15 minutes remaining in this slot — book the next slot instead.' })
    }
  } else {
    if (!start_time) return res.status(400).json({ error: 'start_time is required' })
    startDate = new Date(start_time)
    if (isNaN(startDate.getTime()))
      return res.status(400).json({ error: 'Invalid start_time' })

    const now     = new Date()
    const maxDate = new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 3600_000)

    if (startDate < now)
      return res.status(400).json({ error: 'start_time must be in the future' })
    if (startDate > maxDate)
      return res.status(400).json({ error: `Cannot book more than ${MAX_ADVANCE_DAYS} days in advance` })

    endDate = new Date(startDate.getTime() + BLOCK_HOURS * 3600_000)
  }

  try {
    // ── Per-user booking limits ───────────────────────────────────────────────
    // 1. At most one active/upcoming session at a time
    const { rows: activeRows } = await db.query(`
      SELECT id FROM reservations
      WHERE  user_id = $1
        AND  state NOT IN ('cancelled', 'destroyed', 'completed')
        AND  end_time > now()
      LIMIT 1
    `, [req.user.sub])
    if (activeRows.length > 0) {
      return res.status(409).json({
        error: `You already have an active or upcoming reservation (${activeRows[0].id}). ` +
               `Cancel or complete it before booking another.`,
      })
    }

    // 2. At most 2 sessions on the same calendar day (UTC)
    const dayStart = new Date(Date.UTC(
      startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()
    ))
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600_000)

    const { rows: dayRows } = await db.query(`
      SELECT COUNT(*)::int AS n FROM reservations
      WHERE  user_id = $1
        AND  state NOT IN ('cancelled', 'destroyed')
        AND  start_time >= $2
        AND  start_time <  $3
    `, [req.user.sub, dayStart.toISOString(), dayEnd.toISOString()])

    if (dayRows[0].n >= 2) {
      return res.status(409).json({
        error: 'You have already booked 2 sessions on this day. Maximum 2 sessions per user per day.',
      })
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Look up user email for the confirmation
    const { rows: userRows } = await db.query(
      'SELECT email, username FROM users WHERE id = $1',
      [req.user.sub]
    )
    const userEmail = userRows[0]?.email
    const username  = userRows[0]?.username ?? 'there'

    const env = await findAvailableEnvironment(startDate.toISOString(), endDate.toISOString())
    if (!env)
      return res.status(409).json({ error: 'No environments available for this time slot — try a different time' })

    let id = genId()
    if ((await db.query('SELECT id FROM reservations WHERE id = $1', [id])).rows[0])
      id = genId()

    const initialState = on_demand ? 'active' : 'scheduled'

    await db.query(
      `INSERT INTO reservations (id, user_id, environment_id, start_time, end_time, state, current_stage)
       VALUES ($1, $2, $3, $4, $5, $6, 0)`,
      [id, req.user.sub, env.id, startDate.toISOString(), endDate.toISOString(), initialState]
    )

    // Send calendar invite (non-blocking — don't fail the booking if email fails)
    if (userEmail) {
      sendBookingEmail({
        userEmail,
        username,
        reservationId: id,
        envName:  env.name,
        startTime: startDate.toISOString(),
        endTime:   endDate.toISOString(),
      }).catch((err) => console.error('[email] Booking email failed:', err.message))
    }

    res.status(201).json({
      reservationId:       id,
      environmentName:     env.name,
      startTime:           startDate.toISOString(),
      endTime:             endDate.toISOString(),
      extensionsRemaining: MAX_EXTENSIONS,
      onDemand:            !!on_demand,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create reservation' })
  }
})

// ─── GET /api/sandbox/reservations/:id ───────────────────────────────────────
router.get('/reservations/:id', requireAuth, async (req, res) => {
  const { rows } = await db.query(`
    SELECT r.*, e.name AS environment_name
    FROM   reservations r
    LEFT JOIN sandbox_environments e ON e.id = r.environment_id
    WHERE  r.id = $1
  `, [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Reservation not found' })

  const r   = rows[0]
  const now = Date.now()
  const endMs = r.end_time ? new Date(r.end_time).getTime() : null
  const timeRemainingSeconds = endMs ? Math.max(0, Math.floor((endMs - now) / 1000)) : null

  res.json({
    id:                  r.id,
    state:               r.state,
    currentStage:        r.current_stage,
    timeRemainingSeconds,
    startTime:           r.start_time,
    endTime:             r.end_time,
    extensionCount:      r.extension_count,
    extensionsRemaining: MAX_EXTENSIONS - r.extension_count,
    environmentName:     r.environment_name,
  })
})

// ─── POST /api/sandbox/reservations/:id/extend ───────────────────────────────
router.post('/reservations/:id/extend', requireAuth, async (req, res) => {
  const { rows } = await db.query(`
    SELECT r.*, e.id AS env_id
    FROM   reservations r
    LEFT JOIN sandbox_environments e ON e.id = r.environment_id
    WHERE  r.id = $1
  `, [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Reservation not found' })

  const r = rows[0]
  if (r.user_id !== req.user.sub && req.user.role !== 'staff')
    return res.status(403).json({ error: 'Not your reservation' })
  if (!['scheduled', 'active', 'booting', 'ready'].includes(r.state))
    return res.status(400).json({ error: 'Reservation cannot be extended in its current state' })
  if (r.extension_count >= MAX_EXTENSIONS)
    return res.status(400).json({ error: `Maximum ${MAX_EXTENSIONS} extensions already used` })

  const currentEnd = new Date(r.end_time)
  const newEnd     = new Date(currentEnd.getTime() + EXT_HOURS * 3600_000)
  const bufMs      = BUFFER_MIN * 60_000

  const { rows: conflicts } = await db.query(`
    SELECT id FROM reservations
    WHERE  environment_id = $1
      AND  id != $2
      AND  state NOT IN ('cancelled','destroyed')
      AND  start_time < $4
      AND  end_time   > $3
  `, [
    r.environment_id,
    req.params.id,
    new Date(currentEnd.getTime() - bufMs).toISOString(),
    new Date(newEnd.getTime()     + bufMs).toISOString(),
  ])

  if (conflicts.length > 0)
    return res.status(409).json({ error: 'Extension conflicts with another booking on this environment' })

  await db.query(
    `UPDATE reservations
     SET end_time = $1, extension_count = extension_count + 1, reminder_sent = FALSE
     WHERE id = $2`,
    [newEnd.toISOString(), req.params.id]
  )

  const newCount = r.extension_count + 1
  res.json({
    newEndTime:          newEnd.toISOString(),
    extensionCount:      newCount,
    extensionsRemaining: MAX_EXTENSIONS - newCount,
  })
})

// ─── POST /api/sandbox/reservations/:id/end  (active session → completed) ────
router.post('/reservations/:id/end', requireAuth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT r.*, u.email, u.username, u.timezone, e.name AS env_name
     FROM reservations r
     JOIN users u ON u.id = r.user_id
     JOIN sandbox_environments e ON e.id = r.environment_id
     WHERE r.id = $1`,
    [req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Reservation not found' })
  const r = rows[0]
  if (r.user_id !== req.user.sub && req.user.role !== 'staff')
    return res.status(403).json({ error: 'Not your reservation' })
  if (['cancelled', 'destroyed', 'completed'].includes(r.state))
    return res.status(400).json({ error: 'Session is already ended' })

  const now = new Date()
  await db.query(
    `UPDATE reservations
     SET state = 'completed', actual_end_time = $1, summary_sent = TRUE, ended_at = $1
     WHERE id = $2`,
    [now.toISOString(), req.params.id]
  )

  // Send summary (non-blocking)
  const { sendMail } = await import('../services/email.js')
  const tz           = r.timezone || 'UTC'
  const fmtTime = (d) => new Date(d).toLocaleString('en-US', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' })
  const durationMins = Math.max(0, Math.round((now - new Date(r.start_time)) / 60_000))
  const fmtDur = (m) => { const h = Math.floor(m/60), mn = m%60; return h ? (mn ? `${h}h ${mn}m` : `${h}h`) : `${mn}m` }

  sendMail({
    to: r.email,
    subject: `Session summary: ${r.env_name} — ${new Date(r.start_time).toLocaleDateString('en-US', { timeZone: tz, dateStyle: 'medium' })}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#7d00b9;padding:20px 28px;border-radius:8px 8px 0 0"><span style="color:#fff;font-size:18px;font-weight:700">Ribbon DevCloud</span></div>
      <div style="background:#fff;padding:28px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="margin:0 0 16px">Session ended</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:6px 0;color:#666;width:130px">Reservation</td><td><b>${r.id}</b></td></tr>
          <tr><td style="padding:6px 0;color:#666">Environment</td><td>${r.env_name}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Started</td><td>${fmtTime(r.start_time)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Ended</td><td>${fmtTime(now)} (${tz})</td></tr>
          <tr><td style="padding:6px 0;color:#666">Duration</td><td>${fmtDur(durationMins)}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Extensions</td><td>${r.extension_count} of 3 used</td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px">Ribbon DevCloud · Automated notification.</p>
      </div></div>`,
  }).catch((e) => console.error('[email] Summary failed:', e.message))

  res.json({ message: 'Session ended', endedAt: now.toISOString() })
})

// ─── DELETE /api/sandbox/reservations/:id ────────────────────────────────────
router.delete('/reservations/:id', requireAuth, async (req, res) => {
  const { rows } = await db.query(
    'SELECT user_id, start_time, state FROM reservations WHERE id = $1',
    [req.params.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Reservation not found' })
  if (rows[0].user_id !== req.user.sub && req.user.role !== 'staff')
    return res.status(403).json({ error: 'Not your reservation' })

  await db.query(
    `UPDATE reservations SET state = 'cancelled', ended_at = now() WHERE id = $1`,
    [req.params.id]
  )
  res.json({ message: 'Reservation cancelled' })
})

// ─── GET /api/sandbox/stats ───────────────────────────────────────────────────
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [overview, byDay, byUser, byEnv] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*)                                                    AS total_sessions,
          COUNT(*) FILTER (WHERE state = 'completed')                AS completed_sessions,
          COUNT(*) FILTER (WHERE state = 'cancelled')                AS cancelled_sessions,
          COUNT(*) FILTER (
            WHERE state NOT IN ('cancelled','destroyed','completed')
              AND start_time <= now() AND end_time > now()
          )                                                          AS active_now,
          COALESCE(SUM(extension_count),0)                          AS total_extensions,
          COALESCE(ROUND(SUM(
            EXTRACT(EPOCH FROM (
              COALESCE(actual_end_time, end_time) - start_time
            )) / 3600
          )::numeric, 1), 0)                                        AS total_hours
        FROM reservations
        WHERE state != 'queued'
      `),
      db.query(`
        SELECT DATE(start_time AT TIME ZONE 'UTC') AS day,
               COUNT(*)::int                       AS sessions,
               COALESCE(SUM(extension_count),0)::int AS extensions
        FROM   reservations
        WHERE  start_time >= now() - interval '30 days'
          AND  state NOT IN ('cancelled')
        GROUP  BY DATE(start_time AT TIME ZONE 'UTC')
        ORDER  BY day
      `),
      db.query(`
        SELECT u.id, u.username, u.email, u.company,
               COUNT(r.id)::int                       AS sessions,
               COALESCE(SUM(r.extension_count),0)::int AS extensions,
               COALESCE(ROUND(SUM(
                 EXTRACT(EPOCH FROM (
                   COALESCE(r.actual_end_time, r.end_time) - r.start_time
                 )) / 3600
               )::numeric, 1), 0)                      AS hours
        FROM   reservations r
        JOIN   users u ON u.id = r.user_id
        WHERE  r.state NOT IN ('cancelled')
        GROUP  BY u.id, u.username, u.email, u.company
        ORDER  BY sessions DESC, extensions DESC
        LIMIT  20
      `),
      db.query(`
        SELECT e.name,
               COUNT(r.id)::int                       AS sessions,
               COALESCE(SUM(r.extension_count),0)::int AS extensions,
               COALESCE(ROUND(SUM(
                 EXTRACT(EPOCH FROM (
                   COALESCE(r.actual_end_time, r.end_time) - r.start_time
                 )) / 3600
               )::numeric, 1), 0)                      AS hours
        FROM   sandbox_environments e
        LEFT JOIN reservations r ON r.environment_id = e.id
          AND r.state NOT IN ('cancelled')
        GROUP  BY e.id, e.name
        ORDER  BY e.name
      `),
    ])

    res.json({
      overview:  overview.rows[0],
      byDay:     byDay.rows,
      byUser:    byUser.rows,
      byEnv:     byEnv.rows,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
