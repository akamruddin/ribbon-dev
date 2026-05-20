import nodemailer from 'nodemailer'

let transporter = null
let transporterReady = false

async function getTransporter() {
  if (transporterReady) return transporter
  transporterReady = true

  if (process.env.SMTP_HOST && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    console.log(`[email] SMTP configured → ${process.env.SMTP_HOST} as ${process.env.SMTP_USER}`)
    return transporter
  }

  if (process.env.SMTP_HOST && !process.env.SMTP_PASS) {
    console.warn('[email] SMTP_HOST is set but SMTP_PASS is missing — set SMTP_PASS in .env to enable real delivery')
    transporter = null
    return transporter
  }

  try {
    const acct = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: acct.user, pass: acct.pass },
    })
    console.log(`[email] Dev mode — Ethereal inbox: ${acct.user}`)
    console.log(`[email] View sent mail at https://ethereal.email (sign in with those credentials)`)
  } catch {
    console.log('[email] No SMTP configured and Ethereal unavailable — emails logged to console only')
    transporter = null
  }
  return transporter
}

export async function sendMail({ to, subject, html, attachments = [] }) {
  const t = await getTransporter()
  if (!t) {
    console.log(`[email] (no-op) To: ${to} | Subject: ${subject}`)
    return
  }
  try {
    const info = await t.sendMail({
      from: process.env.EMAIL_FROM ?? 'Ribbon DevCloud <noreply@ribbondev.com>',
      to,
      subject,
      html,
      attachments,
    })
    const preview = nodemailer.getTestMessageUrl(info)
    if (preview) console.log(`[email] Preview: ${preview}`)
  } catch (err) {
    console.error('[email] Send failed:', err.message)
  }
}
