import cron from 'node-cron'
import { db } from '../db/index.js'
import { sendMail } from '../services/email.js'

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'
const MAX_EXTENSIONS = 3

export function startReminderJob() {
  // Every minute: 30-minute end warnings
  cron.schedule('* * * * *', runReminderCheck, { runOnInit: false })

  // Every minute: complete expired sessions + send summary emails
  cron.schedule('* * * * *', runCompletionCheck, { runOnInit: false })

  console.log('[jobs] Reminder and completion jobs started')
}

// ─── 30-minute warning ────────────────────────────────────────────────────────
async function runReminderCheck() {
  try {
    const { rows } = await db.query(`
      SELECT r.id, r.end_time, r.extension_count,
             u.email, u.username, u.timezone,
             e.name AS env_name
      FROM   reservations r
      JOIN   users u ON u.id = r.user_id
      JOIN   sandbox_environments e ON e.id = r.environment_id
      WHERE  r.state NOT IN ('cancelled', 'destroyed', 'completed')
        AND  r.reminder_sent = FALSE
        AND  r.end_time >= now() + interval '29 minutes'
        AND  r.end_time <  now() + interval '31 minutes'
    `)

    if (rows.length === 0) return

    // Batch-mark all as sent before sending emails — prevents duplicate sends
    // if the job fires again before emails finish.
    await db.query(
      'UPDATE reservations SET reminder_sent = TRUE WHERE id = ANY($1)',
      [rows.map(r => r.id)]
    )

    for (const r of rows) {
      const tz  = r.timezone || 'UTC'
      const extensionsLeft = MAX_EXTENSIONS - (r.extension_count ?? 0)
      const extLink  = `${APP_URL}/sandbox?extend=${r.id}`
      const endTime  = fmtTime(r.end_time, tz)

      sendMail({
        to: r.email,
        subject: `Your Ribbon sandbox ends in 30 minutes`,
        html: reminderHtml({ username: r.username, envName: r.env_name, endTime, tz, extensionsLeft, extLink }),
      }).catch(err => console.error(`[reminder] Email failed for ${r.id}:`, err.message))

      console.log(`[reminder] Queued for ${r.email} (${r.id})`)
    }
  } catch (err) {
    console.error('[reminder] Check failed:', err.message)
  }
}

// ─── Session completion sweep ─────────────────────────────────────────────────
async function runCompletionCheck() {
  try {
    const { rows } = await db.query(`
      SELECT r.id, r.start_time, r.end_time, r.extension_count,
             r.actual_end_time, r.created_at,
             u.email, u.username, u.timezone,
             e.name AS env_name
      FROM   reservations r
      JOIN   users u ON u.id = r.user_id
      JOIN   sandbox_environments e ON e.id = r.environment_id
      WHERE  r.end_time < now()
        AND  r.state NOT IN ('cancelled', 'destroyed', 'completed')
        AND  r.summary_sent = FALSE
    `)

    if (rows.length === 0) return

    // Batch-complete all expired sessions in one query
    await db.query(`
      UPDATE reservations
      SET state = 'completed', summary_sent = TRUE,
          actual_end_time = COALESCE(actual_end_time, end_time)
      WHERE id = ANY($1)
    `, [rows.map(r => r.id)])

    for (const r of rows) {
      const tz            = r.timezone || 'UTC'
      const startTime     = fmtTime(r.start_time, tz)
      const endTime       = fmtTime(r.actual_end_time ?? r.end_time, tz)
      const scheduledEnd  = fmtTime(r.end_time, tz)
      const durationMins  = Math.round(
        (new Date(r.actual_end_time ?? r.end_time) - new Date(r.start_time)) / 60_000
      )

      sendMail({
        to: r.email,
        subject: `Session summary: ${esc(r.env_name)} — ${fmtDate(r.start_time, tz)}`,
        html: summaryHtml({
          username:      r.username,
          envName:       r.env_name,
          reservationId: r.id,
          startTime,
          endTime,
          scheduledEnd,
          durationMins,
          extensions:    r.extension_count,
          tz,
        }),
      }).catch(err => console.error(`[completion] Email failed for ${r.id}:`, err.message))

      console.log(`[completion] Completed ${r.id}, summary queued for ${r.email}`)
    }
  } catch (err) {
    console.error('[completion] Check failed:', err.message)
  }
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function fmtTime(iso, tz) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone:  tz,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function fmtDate(iso, tz) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: tz,
    dateStyle: 'medium',
  })
}

function fmtDuration(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

// ─── Email HTML builders ──────────────────────────────────────────────────────
function reminderHtml({ username, envName, endTime, tz, extensionsLeft, extLink }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#222">
      ${emailHeader()}
      <div style="background:#fff;padding:28px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a1a">Session ending in 30 minutes</h2>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#444">
          Hi ${esc(username)},<br><br>
          Your sandbox session on <strong>${esc(envName)}</strong> ends at
          <strong>${esc(endTime)}</strong> (${esc(tz)}).
        </p>
        ${extensionsLeft > 0
          ? `<p style="margin:0 0 16px;font-size:14px;color:#444">
               You have <strong>${extensionsLeft} extension${extensionsLeft !== 1 ? 's' : ''}</strong> remaining (1 hour each).
             </p>
             <a href="${esc(extLink)}" style="${ctaStyle}">Extend My Session →</a>`
          : `<p style="margin:0 0 16px;font-size:14px;color:#444">
               All 3 extensions used. Please save your work before the session ends.
             </p>`}
        ${emailFooter()}
      </div>
    </div>`
}

function summaryHtml({ username, envName, reservationId, startTime, endTime, scheduledEnd, durationMins, extensions, tz }) {
  const earlyEnd = endTime !== scheduledEnd
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#222">
      ${emailHeader()}
      <div style="background:#fff;padding:28px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
        <h2 style="margin:0 0 12px;font-size:20px;color:#1a1a1a">Session complete</h2>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#444">
          Hi ${esc(username)}, here's a summary of your sandbox session.
        </p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;margin-bottom:24px">
          ${row('Reservation', esc(reservationId))}
          ${row('Environment', esc(envName))}
          ${row('Started', startTime + ' (' + tz + ')')}
          ${row('Ended', endTime + (earlyEnd ? ' <span style="color:#dc8200;font-size:12px">(ended early)</span>' : ''))}
          ${row('Duration', fmtDuration(durationMins))}
          ${row('Extensions used', `${extensions} of 3`)}
        </table>
        <a href="${APP_URL}/sandbox" style="${ctaStyle}">Book another session →</a>
        ${emailFooter()}
      </div>
    </div>`
}

function row(label, value) {
  return `<tr>
    <td style="padding:7px 0;color:#666;width:140px;vertical-align:top">${label}</td>
    <td style="padding:7px 0;font-weight:600">${value}</td>
  </tr>`
}

const ctaStyle = `display:inline-block;padding:12px 24px;background:#7d00b9;color:#fff;
  text-decoration:none;border-radius:6px;font-size:14px;font-weight:700`

function emailHeader() {
  return `<div style="background:#7d00b9;padding:20px 28px;border-radius:8px 8px 0 0">
    <span style="color:#fff;font-size:18px;font-weight:700">Ribbon DevCloud</span>
  </div>`
}

function emailFooter() {
  return `<p style="margin:24px 0 0;font-size:12px;color:#999;border-top:1px solid #eee;padding-top:16px">
    Ribbon DevCloud · Automated notification. Do not reply.
  </p>`
}
