import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PillButton from '../ui/PillButton'
import client from '../../api/client'
import styles from './ForumAside.module.css'

const QUICK_LINKS = [
  { label: 'API Reference',        path: '/docs' },
  { label: 'Sandbox Guide',        path: '/sandbox' },
  { label: 'Code Exchange',        path: '/code' },
  { label: 'Ribbon Doc Center ↗',  href: 'https://doc.rbbn.com/spaces/ALLDOC/pages/407996012/Ribbon+Product+Documentation+Home' },
  { label: 'Support',              path: '/support' },
]

export default function ForumAside() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    client.get('/api/forum/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
  }, [])

  return (
    <aside className={styles.aside}>
      <div className={`${styles.card} ${styles.dark}`}>
        <div className={styles.cardLabel}>Ribbon Sandbox</div>
        <div className={styles.cardTitle}>Reserve your environment</div>
        <div className={styles.pills}>
          <span className={styles.pill}>5× Neptune</span>
          <span className={styles.pill}>5× Apollo</span>
          <span className={styles.pill}>Muse</span>
        </div>
        <p className={styles.cardCopy}>Isolated per session. Clean state. On-demand provisioning.</p>
        <PillButton variant="white" size="xs" onClick={() => navigate('/sandbox')} style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          Reserve Now →
        </PillButton>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>Community</div>
        <div className={styles.stat}>
          <span className={styles.statLbl}>Members</span>
          <span className={styles.statVal} style={{ color: 'var(--rbbn-purple)' }}>
            {stats ? stats.members.toLocaleString() : '—'}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLbl}>Threads</span>
          <span className={styles.statVal}>
            {stats ? stats.threads.toLocaleString() : '—'}
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>Quick Links</div>
        {QUICK_LINKS.map((l) =>
          l.href ? (
            <a key={l.label} className={styles.qlink} href={l.href} target="_blank" rel="noreferrer">
              <span>→</span> {l.label}
            </a>
          ) : (
            <a key={l.label} className={styles.qlink} onClick={() => navigate(l.path)}>
              <span>→</span> {l.label}
            </a>
          )
        )}
      </div>
    </aside>
  )
}
