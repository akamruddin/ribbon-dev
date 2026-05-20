import { useEffect, useState } from 'react'
import useAuthStore from '../../store/useAuthStore'
import client from '../../api/client'
import styles from './SandboxStats.module.css'

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={styles.card} style={accent ? { borderTopColor: accent } : {}}>
      <div className={styles.cardVal}>{value ?? '—'}</div>
      <div className={styles.cardLabel}>{label}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  )
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className={styles.bar}>
      <div className={styles.barFill} style={{ width: `${pct}%`, background: color || 'var(--rbbn-purple)' }} />
    </div>
  )
}

export default function SandboxStats() {
  const { user } = useAuthStore()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    client.get('/api/sandbox/stats')
      .then(({ data }) => { setStats(data); setLoading(false) })
      .catch((e) => { setError(e?.response?.data?.error ?? 'Failed to load stats'); setLoading(false) })
  }, [])

  if (loading) return <div className={styles.wrap}><div className={styles.empty}>Loading statistics…</div></div>
  if (error)   return <div className={styles.wrap}><div className={styles.empty}>{error}</div></div>
  if (!stats)  return null

  const { overview, byDay, byUser, byEnv } = stats
  const maxSessions = Math.max(...byUser.map((u) => u.sessions), 1)
  const maxDaySessions = Math.max(...byDay.map((d) => d.sessions), 1)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.heading}>Session Statistics</span>
        <span className={styles.updated}>
          Updated {new Date(stats.generatedAt).toLocaleTimeString([], { timeStyle: 'short' })}
        </span>
      </div>

      {/* Overview cards */}
      <div className={styles.cards}>
        <StatCard label="Total sessions"    value={overview.total_sessions}     accent="#7d00b9" />
        <StatCard label="Active now"        value={overview.active_now}         accent="#00a050" />
        <StatCard label="Total extensions"  value={overview.total_extensions}   accent="#dc8200" />
        <StatCard label="Hours booked"      value={`${overview.total_hours}h`}  accent="#0070e6" />
        <StatCard label="Completed"         value={overview.completed_sessions} />
        <StatCard label="Cancelled"         value={overview.cancelled_sessions} />
      </div>

      <div className={styles.tables}>
        {/* Activity over last 30 days */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Sessions — last 30 days</div>
          {byDay.length === 0
            ? <div className={styles.empty}>No sessions in this period.</div>
            : (
              <div className={styles.dayList}>
                {byDay.map((d) => (
                  <div key={d.day} className={styles.dayRow}>
                    <span className={styles.dayLabel}>
                      {new Date(d.day + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <Bar value={d.sessions} max={maxDaySessions} color="var(--rbbn-purple)" />
                    <span className={styles.dayCount}>{d.sessions}</span>
                    {d.extensions > 0 && (
                      <span className={styles.dayExt}>+{d.extensions} ext</span>
                    )}
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Per-user table */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Top users</div>
          {byUser.length === 0
            ? <div className={styles.empty}>No data yet.</div>
            : (
              <div className={styles.table}>
                <div className={styles.thead}>
                  <span>User</span>
                  <span>Sessions</span>
                  <span>Ext.</span>
                  <span>Hours</span>
                  <span className={styles.barCol}>Usage</span>
                </div>
                {byUser.map((u) => (
                  <div key={u.id} className={styles.trow}>
                    <span className={styles.userCell}>
                      <strong>{u.username}</strong>
                      {u.company && <span className={styles.company}>{u.company}</span>}
                    </span>
                    <span>{u.sessions}</span>
                    <span>{u.extensions}</span>
                    <span>{u.hours}h</span>
                    <span className={styles.barCol}>
                      <Bar value={u.sessions} max={maxSessions} />
                    </span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* Per-environment */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Environment utilization</div>
        <div className={styles.envGrid}>
          {byEnv.map((e) => (
            <div key={e.name} className={styles.envCard}>
              <div className={styles.envName}>{e.name}</div>
              <div className={styles.envStats}>
                <span>{e.sessions} sessions</span>
                <span>{e.extensions} ext</span>
                <span>{e.hours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className={styles.footer}>
        Statistics update in real time. Charts coming soon — this data is available via <code>/api/sandbox/stats</code> for integration with Grafana or similar.
      </p>
    </div>
  )
}
