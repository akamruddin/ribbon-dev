import useSandboxStore from '../../store/useSandboxStore'
import useAuthStore from '../../store/useAuthStore'
import styles from './SlotGrid.module.css'

function formatTime(isoStr, tz) {
  return new Date(isoStr).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: tz || undefined,
  })
}

function availColor(available, total) {
  if (available === 0) return '#d0202e'
  if (available <= Math.ceil(total * 0.4)) return '#dc8200'
  return '#00a050'
}

function availLabel(available, total) {
  if (available === 0) return 'Full'
  if (available === 1) return '1 slot left'
  return `${available} of ${total} available`
}

function formatRemaining(slotEnd) {
  const ms = new Date(slotEnd) - new Date()
  if (ms <= 0) return '0m'
  const totalMins = Math.floor(ms / 60_000)
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function SlotGrid() {
  const { slots, slotsLoading, slotsError, selectSlot } = useSandboxStore()
  const { user } = useAuthStore()
  // Use profile timezone if explicitly set; fall back to the browser's detected timezone.
  // (DB default is 'UTC', which most users never changed — don't use that as a display tz.)
  const profileTz = user?.timezone
  const tz = (profileTz && profileTz !== 'UTC')
    ? profileTz
    : Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

  if (slotsLoading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <span className={styles.label}>Available time slots</span>
        </div>
        <div className={styles.loading}>Loading slots…</div>
      </div>
    )
  }

  if (slotsError) {
    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <span className={styles.label}>Available time slots</span>
        </div>
        <div className={styles.empty}>{slotsError}</div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.label}>Available time slots</span>
        <span className={styles.sub}>
          4-hour blocks · {tz.replace(/_/g, ' ')}
        </span>
      </div>

      {slots.length === 0 ? (
        <div className={styles.empty}>No slots available for this date.</div>
      ) : (
        <div className={styles.grid}>
          {slots.map((slot, idx) => {
            const full      = slot.available === 0
            const color     = availColor(slot.available, slot.total)
            const isNow     = slot.onDemand
            const remaining = isNow ? formatRemaining(slot.end) : null

            return (
              <div key={slot.start}>
                {/* 30-min buffer separator between consecutive slots */}
                {idx > 0 && (
                  <div className={styles.buffer}>
                    <span className={styles.bufferLine} />
                    <span className={styles.bufferLabel}>30 min buffer</span>
                    <span className={styles.bufferLine} />
                  </div>
                )}

                <div className={[
                  styles.slot,
                  full  ? styles.slotFull : '',
                  isNow ? styles.slotNow  : '',
                ].join(' ')}>

                  <div className={styles.slotTime}>
                    <div className={styles.timeRow}>
                      <span className={styles.timeRange}>
                        {formatTime(slot.start, tz)} – {formatTime(slot.end, tz)}
                      </span>
                      {isNow && (
                        <span className={styles.nowBadge}>
                          <span className={styles.nowDot} /> Live · {remaining} left
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.slotMid}>
                    <div className={styles.availBar}>
                      <div
                        className={styles.availFill}
                        style={{
                          width: `${(slot.available / slot.total) * 100}%`,
                          background: color,
                        }}
                      />
                    </div>
                    <span className={styles.availText} style={{ color }}>
                      {availLabel(slot.available, slot.total)}
                    </span>
                  </div>

                  <button
                    className={[styles.bookBtn, full ? styles.bookBtnDisabled : ''].join(' ')}
                    disabled={full}
                    onClick={() => selectSlot({ ...slot, onDemand: isNow })}
                  >
                    {full ? 'Unavailable' : isNow ? 'Book Now →' : 'Book →'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className={styles.hint}>
        Extensions add 1 hour each (up to 3×). On-demand books the remaining time in the current slot.
      </p>
    </div>
  )
}
