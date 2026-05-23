/**
 * Lab orchestrator — provisions and tears down lab sessions.
 *
 * provisionLab(reservationId):
 *   Called when a scheduled reservation's start_time arrives.
 *   1. Generates one unique username + password for the entire reservation
 *   2. Writes a single row to radcheck — FreeRADIUS accepts it on all 11 devices
 *   3. Stores encrypted credentials in lab_credentials (same u/p for every device)
 *   4. Sets reservation state → 'ready'
 *
 * teardownLab(reservationId):
 *   Called 5 minutes after a lab ends.
 *   1. Deletes the RADIUS user — instantly revokes access on every device
 *   2. Resets each device config via SSH (routes, VRFs, etc. — not passwords)
 *   3. Rebuilds Muse from the clean snapshot via OpenStack
 *   4. Clears credentials and marks teardown_done
 */

import { db }                        from '../db/index.js'
import { encrypt, decrypt, generatePassword, generateUsername } from './lab-crypto.js'
import { runDeviceCommands }         from './device-ssh.js'
import { rebuildMuseFromSnapshot }   from './openstack-ops.js'

const TEARDOWN_DELAY_MIN = 5

// ── Internal helpers ──────────────────────────────────────────────────────────

async function applyCommands(device, host, rawCmds, label) {
  if (!host || !rawCmds) {
    console.warn(`[lab] No host/cmds for ${device.device_key} — skipping ${label}`)
    return { skipped: true }
  }
  try {
    const out = await runDeviceCommands(
      host,
      device.ssh_port,
      device.ssh_user,
      rawCmds,
      device.shell_mode,
    )
    console.log(`[lab] ${label} on ${device.device_key}: ok`)
    return { ok: true, out }
  } catch (err) {
    console.error(`[lab] ${label} on ${device.device_key} FAILED:`, err.message)
    return { ok: false, error: err.message }
  }
}

// ── Provision ─────────────────────────────────────────────────────────────────
export async function provisionLab(reservationId) {
  console.log(`[lab] Provisioning ${reservationId}…`)

  // Mark as booting so the UI shows progress
  await db.query(`UPDATE reservations SET state = 'booting' WHERE id = $1`, [reservationId])

  const { rows: devices } = await db.query(
    `SELECT * FROM lab_devices WHERE active = true ORDER BY id`
  )

  // One username + password covers all 11 devices
  const username = generateUsername()
  const password = generatePassword()

  // Register in FreeRADIUS — one row, all devices authenticate against it
  await db.query(
    `INSERT INTO radcheck (username, attribute, op, value)
     VALUES ($1, 'Cleartext-Password', ':=', $2)`,
    [username, password]
  )
  console.log(`[lab] RADIUS user '${username}' created for ${reservationId}`)

  // Store credential per device (same u/p) so the frontend can display per-device info
  for (const device of devices) {
    await db.query(
      `INSERT INTO lab_credentials (reservation_id, device_key, username, password_enc)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (reservation_id, device_key) DO UPDATE
         SET password_enc = EXCLUDED.password_enc,
             username     = EXCLUDED.username,
             provisioned_at = now()`,
      [reservationId, device.device_key, username, encrypt(password)]
    )
  }

  // Mark ready
  await db.query(`UPDATE reservations SET state = 'ready' WHERE id = $1`, [reservationId])
  console.log(`[lab] ${reservationId} provisioned via RADIUS (user: ${username}, devices: ${devices.length})`)

  return { username, devicesCount: devices.length }
}

// ── Teardown ──────────────────────────────────────────────────────────────────
export async function teardownLab(reservationId) {
  console.log(`[lab] Tearing down ${reservationId}…`)

  // Get the RADIUS username before we clear credentials
  const { rows: creds } = await db.query(
    `SELECT username FROM lab_credentials WHERE reservation_id = $1 LIMIT 1`,
    [reservationId]
  )
  const radiusUsername = creds[0]?.username

  // Delete RADIUS entry — revokes access on all devices simultaneously
  if (radiusUsername) {
    await db.query(`DELETE FROM radcheck WHERE username = $1`, [radiusUsername])
    console.log(`[lab] RADIUS user '${radiusUsername}' removed`)
  } else {
    console.warn(`[lab] No RADIUS username found for ${reservationId} — skipping radcheck cleanup`)
  }

  // SSH config reset (routes, VRFs, etc.) — still runs when device IPs are set
  const { rows: devices } = await db.query(
    `SELECT * FROM lab_devices WHERE active = true ORDER BY id`
  )
  for (const device of devices) {
    await applyCommands(device, device.host, device.reset_cmds, 'config reset')
  }

  // Rebuild Muse from clean snapshot
  try {
    await rebuildMuseFromSnapshot()
  } catch (err) {
    console.error('[lab] Muse rebuild failed:', err.message)
  }

  // Clear credentials + mark done
  await db.query(`DELETE FROM lab_credentials WHERE reservation_id = $1`, [reservationId])
  await db.query(
    `UPDATE reservations SET teardown_done = true, state = 'destroyed' WHERE id = $1`,
    [reservationId]
  )

  console.log(`[lab] Teardown complete for ${reservationId}`)
}

// ── Schedule teardown 5 min after lab ends ────────────────────────────────────
export async function scheduleTeardown(reservationId) {
  const teardownAt = new Date(Date.now() + TEARDOWN_DELAY_MIN * 60_000)
  await db.query(
    `UPDATE reservations SET teardown_after = $1, teardown_done = false WHERE id = $2`,
    [teardownAt.toISOString(), reservationId]
  )
  console.log(`[lab] Teardown for ${reservationId} scheduled at ${teardownAt.toISOString()}`)
}

// ── Expose credentials for the API (decrypted on read) ────────────────────────
export async function getLabCredentials(reservationId) {
  const { rows } = await db.query(
    `SELECT lc.device_key, lc.username, lc.password_enc, lc.provisioned_at,
            ld.display_name, ld.device_class, ld.host, ld.ssh_port, ld.web_url
     FROM   lab_credentials lc
     JOIN   lab_devices ld ON ld.device_key = lc.device_key
     WHERE  lc.reservation_id = $1
     ORDER BY ld.id`,
    [reservationId]
  )

  return rows.map((r) => ({
    deviceKey:     r.device_key,
    displayName:   r.display_name,
    deviceClass:   r.device_class,
    host:          r.host,
    sshPort:       r.ssh_port,
    webUrl:        r.web_url ?? null,
    username:      r.username,
    password:      decrypt(r.password_enc),
    provisionedAt: r.provisioned_at,
  }))
}
