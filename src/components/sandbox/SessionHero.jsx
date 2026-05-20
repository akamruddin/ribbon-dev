import useSandboxStore from '../../store/useSandboxStore'
import StatusChip from '../ui/StatusChip'
import PillButton from '../ui/PillButton'
import styles from './SessionHero.module.css'

function formatTime(seconds) {
  if (seconds == null) return '—:—:—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export default function SessionHero() {
  const { sessionId, sessionState, timeRemaining, toggleSessionState, showIdleWarning } = useSandboxStore()
  const isReady = sessionState === 'ready'

  return (
    <div className={styles.hero}>
      <div className={styles.left}>
        <span className={styles.sessionId}>{sessionId}</span>
        <StatusChip status={sessionState} />
      </div>

      <div className={styles.center}>
        <div className={styles.timer}>{formatTime(timeRemaining)}</div>
        <div className={styles.timerLabel}>{isReady ? 'remaining' : 'provisioning'}</div>
      </div>

      <div className={styles.right}>
        <span className={styles.mockLabel}>Mockup toggle</span>
        <PillButton
          variant="outline"
          size="xs"
          onClick={toggleSessionState}
          style={{ borderColor: 'rgba(220,93,247,0.45)', color: 'var(--rbbn-purple3)' }}
        >
          {isReady ? 'View as Booting ↗' : 'View as Ready ↗'}
        </PillButton>
        {isReady ? (
          <div className={styles.actions}>
            <button className={styles.ghostBtn}>Extend Session</button>
            <PillButton variant="danger" size="xs" onClick={showIdleWarning}>End Session</PillButton>
          </div>
        ) : (
          <div className={styles.actions}>
            <button className={styles.ghostBtn}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
