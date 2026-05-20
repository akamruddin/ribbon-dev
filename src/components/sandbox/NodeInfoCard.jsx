import { DEVICES } from '../../data/devices'
import useSandboxStore from '../../store/useSandboxStore'
import styles from './NodeInfoCard.module.css'

export default function NodeInfoCard() {
  const { selectedNode } = useSandboxStore()
  if (!selectedNode) return null

  const d = DEVICES.find((x) => x.id === selectedNode)
  if (!d) return null

  const fields = d.access === 'ui'
    ? [
        { label: 'IP Address', value: d.ip },
        { label: 'HTTPS Port', value: d.httpsPort },
        { label: 'Status', value: 'Running', green: true },
      ]
    : [
        { label: 'IP Address', value: d.ip },
        { label: 'SSH Port',   value: d.sshPort },
        { label: 'Status',     value: 'Running', green: true },
      ]

  return (
    <div className={styles.card}>
      <div className={styles.title}>{d.id} — {d.type}</div>
      <div className={styles.grid}>
        {fields.map(({ label, value, green }) => (
          <div key={label}>
            <div className={styles.lbl}>{label}</div>
            <div className={styles.val} style={green ? { color: 'var(--rbbn-success)' } : {}}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
