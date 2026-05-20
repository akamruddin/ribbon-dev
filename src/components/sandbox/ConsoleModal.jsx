import { DEVICES } from '../../data/devices'
import styles from './ConsoleModal.module.css'

export default function ConsoleModal({ deviceId, onClose }) {
  if (!deviceId) return null
  const d = DEVICES.find((x) => x.id === deviceId)
  if (!d) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.title}>{d.id} — Console Access</span>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>

        {d.access === 'ui' ? (
          <>
            <div className={styles.lbl}>Muse UI URL</div>
            <pre className={styles.cblock}>
              <span className={styles.cv}>https://</span>
              <span className={styles.cw}>muse.sandbox-{d.ip.replace(/\./g, '-')}.ribbon.dev:{d.httpsPort}</span>
            </pre>
            <div className={styles.lbl}>Credentials</div>
            <pre className={styles.cblock}>
              <span className={styles.cgy}>user  </span><span className={styles.cw}>developer</span>{'\n'}
              <span className={styles.cgy}>pass  </span><span className={styles.cv}>shown at session READY</span>
            </pre>
          </>
        ) : (
          <>
            <div className={styles.lbl}>SSH Command</div>
            <pre className={styles.cblock}>
              <span className={styles.cp}>$ </span>
              <span className={styles.cg}>ssh</span>
              <span className={styles.cw}> developer@{d.ip}</span>
              <span className={styles.cgy}> -p {d.sshPort}</span>
            </pre>
            <div className={styles.lbl}>YANG API Endpoints</div>
            <pre className={styles.cblock}>
              <span className={styles.cgy}>NETCONF  </span><span className={styles.cw}>{d.ip}:830</span>{'\n'}
              <span className={styles.cgy}>RESTCONF </span><span className={styles.cw}>{d.ip}:443</span>{'\n'}
              <span className={styles.cgy}>gRPC     </span><span className={styles.cw}>{d.ip}:57400</span>
            </pre>
          </>
        )}

        <button className={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
