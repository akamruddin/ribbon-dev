import { BOOT_STAGES } from '../../data/bootStages'
import useSandboxStore from '../../store/useSandboxStore'
import StageRow from './StageRow'
import styles from './BootingView.module.css'

const STAGE_NOTES = [
  'Allocating EC2 resources — est. 30 seconds',
  'Building GNS3 topology — est. 45 seconds',
  'Booting Neptune and Apollo devices — est. 2–3 minutes remaining',
  'Launching Muse orchestrator (EC2) — est. 1 minute',
  'Running health checks and exposing console links',
]

export default function BootingView() {
  const { sessionId, activeStage } = useSandboxStore()
  const pct = Math.round((activeStage / BOOT_STAGES.length) * 100)

  return (
    <div className={styles.view}>
      <div className={styles.card}>
        <div className={styles.chrome}>
          <div className={styles.dots}>
            <div className={styles.dot} style={{ background: '#FF5F57' }} />
            <div className={styles.dot} style={{ background: '#FEBC2E' }} />
            <div className={styles.dot} style={{ background: '#28C840' }} />
          </div>
          <div className={styles.url}>
            developer.ribboncommunications.com / sandbox / {sessionId}
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.eyebrow}>Ribbon Developer Sandbox</div>
          <h2 className={styles.title}>Building your environment</h2>
          <p className={styles.sub}>5 Neptune · 5 Apollo · 1 Muse · clean state guaranteed</p>

          {BOOT_STAGES.map((s, i) => (
            <StageRow key={i} stage={s} index={i} activeStage={activeStage} />
          ))}

          <div className={styles.progress}>
            <div className={styles.progressHead}>
              <span>{activeStage} of {BOOT_STAGES.length} stages complete</span>
              <span className={styles.pct}>{pct}%</span>
            </div>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${pct}%` }} />
            </div>
            <p className={styles.note}>{STAGE_NOTES[activeStage]}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
