import useSandboxStore from '../../store/useSandboxStore'
import styles from './TopologyDiagram.module.css'

const NPT_NODES = ['NPT-1', 'NPT-2', 'NPT-3', 'NPT-4', 'NPT-5']
const APL_NODES = ['APL-1', 'APL-2', 'APL-3', 'APL-4', 'APL-5']
const NPT_X     = [80, 175, 274, 373, 468]
const APL_X     = [80, 175, 274, 373, 468]
const NPT_CX    = [116, 211, 310, 409, 504]
const APL_CX    = [116, 211, 310, 409, 504]

export default function TopologyDiagram({ sessionId }) {
  const { selectedNode, selectNode } = useSandboxStore()

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Session {sessionId} — Live Topology</span>
        <span className={styles.allGood}><span className={styles.gdot} />All 11 Running</span>
      </div>
      <svg className={styles.svg} viewBox="0 0 620 340" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#7D00B9"/>
            <stop offset="100%" stopColor="#C0059E"/>
          </linearGradient>
        </defs>

        {/* Layer labels */}
        <text x="12" y="40"  fontSize="8" fill="#AAA" fontWeight="700" letterSpacing="1.2" fontFamily="Roboto,sans-serif">ORCHESTRATION</text>
        <text x="12" y="160" fontSize="8" fill="#AAA" fontWeight="700" letterSpacing="1.2" fontFamily="Roboto,sans-serif">IP ROUTING</text>
        <text x="12" y="280" fontSize="8" fill="#AAA" fontWeight="700" letterSpacing="1.2" fontFamily="Roboto,sans-serif">OPTICAL</text>

        {/* Muse → NPT dashed lines */}
        {NPT_CX.map((cx) => (
          <line key={cx} x1="310" y1="66" x2={cx} y2="156" stroke="#7D00B9" strokeWidth="1.2" strokeDasharray="5,4" opacity=".4"/>
        ))}

        {/* NPT ring */}
        {[152,247,346,445].map((x1, i) => (
          <line key={i} x1={x1} y1="170" x2={x1+23} y2="170" stroke="#7D00B9" strokeWidth="2.5" opacity=".65"/>
        ))}

        {/* NPT → APL verticals */}
        {NPT_CX.map((cx) => (
          <line key={cx} x1={cx} y1="183" x2={cx} y2="258" stroke="#0070A8" strokeWidth="1.5" opacity=".5"/>
        ))}

        {/* APL ring */}
        {[152,247,346,445].map((x1, i) => (
          <line key={i} x1={x1} y1="275" x2={x1+23} y2="275" stroke="#0070A8" strokeWidth="2.5" opacity=".65"/>
        ))}

        {/* MUSE node */}
        <g onClick={() => selectNode('MUSE')} style={{ cursor: 'pointer' }}>
          <rect
            x="258" y="30" width="104" height="36" rx="18"
            fill="url(#mg)"
            stroke={selectedNode === 'MUSE' ? '#DC5DF7' : 'none'}
            strokeWidth={selectedNode === 'MUSE' ? 3 : 0}
          />
          <text x="310" y="51" textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Roboto,sans-serif" letterSpacing="1.5">MUSE</text>
          <circle cx="356" cy="36" r="5" fill="#14855A" stroke="#fff" strokeWidth="1.5"/>
        </g>

        {/* NPT nodes */}
        {NPT_NODES.map((id, i) => (
          <g key={id} onClick={() => selectNode(id)} style={{ cursor: 'pointer' }}>
            <rect
              x={NPT_X[i]} y="156" width="72" height="28" rx="14"
              fill="#7D00B9"
              stroke={selectedNode === id ? '#DC5DF7' : 'none'}
              strokeWidth={selectedNode === id ? 3 : 0}
            />
            <text x={NPT_CX[i]} y="170" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Roboto,sans-serif">{id}</text>
            <circle cx={NPT_X[i]+68} cy="160" r="4.5" fill="#14855A" stroke="#fff" strokeWidth="1.5"/>
          </g>
        ))}

        {/* APL nodes */}
        {APL_NODES.map((id, i) => (
          <g key={id} onClick={() => selectNode(id)} style={{ cursor: 'pointer' }}>
            <rect
              x={APL_X[i]} y="261" width="72" height="28" rx="14"
              fill="#0070A8"
              stroke={selectedNode === id ? '#DC5DF7' : 'none'}
              strokeWidth={selectedNode === id ? 3 : 0}
            />
            <text x={APL_CX[i]} y="275" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Roboto,sans-serif">{id}</text>
            <circle cx={APL_X[i]+68} cy="265" r="4.5" fill="#14855A" stroke="#fff" strokeWidth="1.5"/>
          </g>
        ))}
      </svg>
      <div className={styles.legend}>
        <div className={styles.legItem}><div className={styles.legDot} style={{ background: '#7D00B9' }}/>Neptune (rNOS)</div>
        <div className={styles.legItem}><div className={styles.legDot} style={{ background: '#0070A8' }}/>Apollo (Optical)</div>
        <div className={styles.legItem}><div className={styles.legDot} style={{ background: 'linear-gradient(135deg,#7D00B9,#C0059E)' }}/>Muse (Orchestrator)</div>
        <div className={styles.legItem} style={{ marginLeft: 'auto' }}><div className={styles.legDot} style={{ background: '#14855A', borderRadius: '50%' }}/>Running</div>
      </div>
    </div>
  )
}
