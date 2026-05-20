import useSandboxStore from '../../store/useSandboxStore'
import styles from './BookingConfirmModal.module.css'

function fmt(iso) {
  return new Date(iso).toLocaleString([], {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

export default function BookingConfirmModal() {
  const {
    pendingSlot, clearPendingSlot,
    confirmBooking, bookingLoading, bookingError,
    lastBooked, dismissLastBooked,
  } = useSandboxStore()

  // Success state
  if (lastBooked) {
    return (
      <div className={styles.overlay} onMouseDown={e => { if (e.target === e.currentTarget) dismissLastBooked() }}>
        <div className={styles.modal}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Reservation confirmed</h2>
          <div className={styles.detailCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLbl}>Reservation ID</span>
              <span className={styles.detailVal} style={{ fontWeight: 700 }}>{lastBooked.reservationId}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLbl}>Environment</span>
              <span className={styles.detailVal} style={{ color: 'var(--rbbn-purple)', fontWeight: 600 }}>{lastBooked.environmentName}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLbl}>Starts</span>
              <span className={styles.detailVal}>{fmt(lastBooked.startTime)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLbl}>Ends</span>
              <span className={styles.detailVal}>{fmt(lastBooked.endTime)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLbl}>Extensions</span>
              <span className={styles.detailVal}>Up to 3 × +1h if available</span>
            </div>
          </div>
          <p className={styles.successNote}>
            Your environment will begin provisioning automatically at the scheduled start time.
          </p>
          <button className={styles.doneBtn} onClick={dismissLastBooked}>Done</button>
        </div>
      </div>
    )
  }

  if (!pendingSlot) return null

  return (
    <div className={styles.overlay} onMouseDown={e => { if (e.target === e.currentTarget) clearPendingSlot() }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Confirm reservation</h2>
          <button className={styles.close} onClick={clearPendingSlot} aria-label="Close">✕</button>
        </div>

        <div className={styles.detailCard}>
          {pendingSlot.onDemand && (
            <div className={styles.detailRow}>
              <span className={styles.detailLbl}>Type</span>
              <span className={styles.detailVal} style={{ color: '#00a050', fontWeight: 600 }}>On-demand · starts now</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailLbl}>Date & start</span>
            <span className={styles.detailVal}>{pendingSlot.onDemand ? 'Now' : fmt(pendingSlot.start)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLbl}>End</span>
            <span className={styles.detailVal}>{fmt(pendingSlot.end)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLbl}>Duration</span>
            <span className={styles.detailVal}>
              {pendingSlot.onDemand ? 'Remaining slot time' : '4 hours'} · extend ×3 (+1h each)
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLbl}>Available</span>
            <span className={styles.detailVal} style={{ color: '#00a050', fontWeight: 600 }}>
              {pendingSlot.available} of {pendingSlot.total} environments free
            </span>
          </div>
        </div>

        <div className={styles.envInfo}>
          <div className={styles.envChips}>
            <span className={styles.chip}>5× Neptune rNOS</span>
            <span className={styles.chip}>5× Apollo Optical</span>
            <span className={styles.chip}>Muse</span>
          </div>
          <p className={styles.envNote}>Clean state · isolated per session · ~5 min to ready</p>
        </div>

        {bookingError && <p className={styles.error}>{bookingError}</p>}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={clearPendingSlot} disabled={bookingLoading}>
            Back
          </button>
          <button className={styles.confirmBtn} onClick={confirmBooking} disabled={bookingLoading}>
            {bookingLoading ? 'Booking…' : 'Confirm reservation →'}
          </button>
        </div>
      </div>
    </div>
  )
}
