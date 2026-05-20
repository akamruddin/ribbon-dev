import { useState } from 'react'
import useSandboxStore from '../../store/useSandboxStore'
import styles from './MyReservations.module.css'

const MAX_EXTENSIONS = 3

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function statusColor(state) {
  const map = {
    scheduled: '#0070e6',
    booting:   '#dc8200',
    ready:     '#00a050',
    cancelled: '#888',
    destroyed: '#888',
  }
  return map[state] ?? '#888'
}

function ReservationCard({ res, highlight }) {
  const { extendReservation, cancelReservation, endReservation } = useSandboxStore()
  const [extending, setExtending] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState(null)

  const now = new Date()
  const start = new Date(res.start_time)
  const end   = new Date(res.end_time)
  const isTerminal = ['completed', 'cancelled', 'destroyed'].includes(res.state)
  const isActive   = !isTerminal && ((start <= now && end > now) || res.state === 'active')
  const isUpcoming = !isTerminal && start > now
  const extLeft = MAX_EXTENSIONS - (res.extension_count ?? 0)

  async function handleExtend() {
    setExtending(true); setError(null)
    try { await extendReservation(res.id) }
    catch (e) { setError(e?.response?.data?.error ?? 'Extension failed') }
    finally { setExtending(false) }
  }

  async function handleCancel() {
    const msg = isActive
      ? `End your active session on ${res.environment_name}? A summary email will be sent.`
      : `Cancel reservation ${res.id}?`
    if (!confirm(msg)) return
    setCancelling(true); setError(null)
    try {
      if (isActive) await endReservation(res.id)
      else await cancelReservation(res.id)
    } catch (e) { setError(e?.response?.data?.error ?? 'Action failed'); setCancelling(false) }
  }

  return (
    <div className={[styles.card, isActive ? styles.cardActive : '', highlight ? styles.cardHighlight : ''].join(' ')}>
      <div className={styles.cardTop}>
        <div className={styles.cardId}>
          {res.id}
          {isActive && <span className={styles.activePip} />}
        </div>
        <span className={styles.cardStatus} style={{ color: statusColor(res.state) }}>
          {res.state}
        </span>
      </div>

      <div className={styles.cardEnv}>
        {res.environment_name ?? '—'}
      </div>

      <div className={styles.cardTimes}>
        <div className={styles.timeRow}>
          <span className={styles.timeLbl}>Start</span>
          <span className={styles.timeVal}>{formatDateTime(res.start_time)}</span>
        </div>
        <div className={styles.timeRow}>
          <span className={styles.timeLbl}>End</span>
          <span className={styles.timeVal}>{formatDateTime(res.end_time)}</span>
        </div>
      </div>

      <div className={styles.extRow}>
        <span className={styles.extLbl}>
          Extensions: {res.extension_count ?? 0} / {MAX_EXTENSIONS} used
        </span>
        <div className={styles.extPips}>
          {Array.from({ length: MAX_EXTENSIONS }).map((_, i) => (
            <span
              key={i}
              className={[styles.extPip, i < (res.extension_count ?? 0) ? styles.extPipUsed : ''].join(' ')}
            />
          ))}
        </div>
      </div>

      {error && <p className={styles.cardError}>{error}</p>}

      {(isActive || isUpcoming) && (
        <div className={styles.cardActions}>
          {extLeft > 0 && (
            <button
              className={styles.extendBtn}
              onClick={handleExtend}
              disabled={extending}
            >
              {extending ? 'Extending…' : `Extend +1h (${extLeft} left)`}
            </button>
          )}
          <button
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling…' : isActive ? 'End session' : 'Cancel'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function MyReservations({ highlightId }) {
  const { myReservations, reservationsLoading, loadMyReservations } = useSandboxStore()

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.label}>My Reservations</span>
        <button className={styles.refreshBtn} onClick={loadMyReservations}>
          ↺ Refresh
        </button>
      </div>

      {reservationsLoading && <div className={styles.empty}>Loading…</div>}

      {!reservationsLoading && myReservations.length === 0 && (
        <div className={styles.empty}>No upcoming reservations.</div>
      )}

      <div className={styles.list}>
        {myReservations.map((r) => (
          <ReservationCard key={r.id} res={r} highlight={r.id === highlightId} />
        ))}
      </div>
    </div>
  )
}
