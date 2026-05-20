import { useState } from 'react'
import { DEVICES } from '../../data/devices'
import useSandboxStore from '../../store/useSandboxStore'
import ConsoleModal from './ConsoleModal'
import styles from './DeviceTable.module.css'

const CLS_COLOR = { neptune: 'var(--rbbn-purple)', apollo: '#0070A8', muse: 'var(--rbbn-pink)' }

export default function DeviceTable() {
  const { selectedNode, selectNode } = useSandboxStore()
  const [modalDevice, setModalDevice] = useState(null)

  return (
    <>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {DEVICES.map((d) => (
              <tr
                key={d.id}
                className={selectedNode === d.id ? styles.hl : ''}
                onClick={() => selectNode(d.id)}
              >
                <td>
                  <span className={styles.name} style={{ color: CLS_COLOR[d.cls] }}>
                    {d.id}
                  </span>
                </td>
                <td>{d.type}</td>
                <td>
                  <div className={styles.running}>
                    <div className={styles.runDot} />Running
                  </div>
                </td>
                <td>
                  <button
                    className={`${styles.accBtn} ${d.access === 'ui' ? styles.ui : styles.ssh}`}
                    onClick={(e) => { e.stopPropagation(); setModalDevice(d.id) }}
                  >
                    {d.access === 'ui' ? 'Open UI' : 'SSH'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalDevice && <ConsoleModal deviceId={modalDevice} onClose={() => setModalDevice(null)} />}
    </>
  )
}
