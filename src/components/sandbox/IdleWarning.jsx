import useSandboxStore from '../../store/useSandboxStore'
import PillButton from '../ui/PillButton'
import styles from './IdleWarning.module.css'

export default function IdleWarning() {
  const { showIdleBar, dismissIdleWarning } = useSandboxStore()
  if (!showIdleBar) return null

  return (
    <div className={styles.bar}>
      <span className={styles.icon}>⚠️</span>
      <span className={styles.text}>
        Your session will expire in <strong>5 minutes</strong> due to inactivity. Extend or save your work.
      </span>
      <PillButton variant="solid" size="xs" onClick={dismissIdleWarning}>Extend Session</PillButton>
      <button className={styles.endBtn}>End Now</button>
    </div>
  )
}
