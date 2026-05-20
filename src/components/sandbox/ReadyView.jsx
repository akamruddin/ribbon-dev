import useSandboxStore from '../../store/useSandboxStore'
import TopologyDiagram from './TopologyDiagram'
import NodeInfoCard from './NodeInfoCard'
import DeviceTable from './DeviceTable'
import styles from './ReadyView.module.css'

export default function ReadyView() {
  const { sessionId, selectedNode } = useSandboxStore()

  return (
    <div className={styles.view}>
      <div className={styles.topoPanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Network Topology</div>
          <div className={styles.panelActions}>
            <button className={styles.smBtn}>Zoom fit</button>
          </div>
        </div>
        <div className={styles.topoScroll}>
          <TopologyDiagram sessionId={sessionId} />
          {selectedNode && <NodeInfoCard />}
        </div>
      </div>

      <div className={styles.devPanel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Devices</div>
          <div className={styles.allGood}>
            <span className={styles.gdot} />All 11 Running
          </div>
        </div>
        <DeviceTable />
      </div>
    </div>
  )
}
