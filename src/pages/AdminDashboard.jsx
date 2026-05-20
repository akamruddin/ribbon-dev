import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import client from '../api/client'
import styles from './AdminDashboard.module.css'

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n, decimals = 0) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: decimals })
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function timeAgo(iso) {
  if (!iso) return '—'
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60)   return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400)return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

const SLOT_LABELS = ['00:00', '04:30', '09:00', '13:30', '18:00']
const DOW_LABELS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Small reusable pieces ─────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent, warn }) {
  return (
    <div className={styles.kpi} style={accent ? { borderTopColor: accent } : {}}>
      <div className={styles.kpiVal} style={warn ? { color: '#c0392b' } : {}}>{value ?? '—'}</div>
      <div className={styles.kpiLabel}>{label}</div>
      {sub && <div className={styles.kpiSub}>{sub}</div>}
    </div>
  )
}

function SectionHeader({ title, sub }) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.sectionTitle}>{title}</span>
      {sub && <span className={styles.sectionSub}>{sub}</span>}
    </div>
  )
}

function RoleBadge({ role }) {
  const map = {
    moderator: ['#7d00b9', 'rgba(125,0,185,0.1)'],
    staff:     ['#b86c00', 'rgba(220,130,0,0.1)'],
    partner:   ['#0059b3', 'rgba(0,112,230,0.1)'],
    member:    ['#666',    '#f0f0f0'],
  }
  const [color, bg] = map[role] ?? ['#666', '#f0f0f0']
  return (
    <span className={styles.roleBadge} style={{ color, background: bg }}>
      {role}
    </span>
  )
}

function Bar({ value, max, color = 'var(--rbbn-purple)', height = 6 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={styles.barTrack} style={{ height }}>
      <div className={styles.barFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap({ bySlot, maxSessions }) {
  const grid = {}
  bySlot.forEach(({ dow, slot_idx, sessions }) => {
    grid[`${dow}-${slot_idx}`] = sessions
  })
  const max = maxSessions || Math.max(...bySlot.map((r) => r.sessions), 1)

  return (
    <div className={styles.heatmapWrap}>
      {/* column headers */}
      <div className={styles.heatmapGrid}>
        <div className={styles.heatmapCorner} />
        {SLOT_LABELS.map((l) => (
          <div key={l} className={styles.heatmapColLabel}>{l}</div>
        ))}
        {DOW_LABELS.map((dow, d) => (
          <>
            <div key={`row-${d}`} className={styles.heatmapRowLabel}>{dow}</div>
            {SLOT_LABELS.map((_, s) => {
              const n = grid[`${d}-${s}`] ?? 0
              const intensity = max > 0 ? n / max : 0
              const bg = intensity === 0
                ? 'var(--rbbn-border)'
                : `rgba(125, 0, 185, ${0.1 + intensity * 0.85})`
              return (
                <div
                  key={`${d}-${s}`}
                  className={styles.heatCell}
                  style={{ background: bg }}
                  title={`${DOW_LABELS[d]} ${SLOT_LABELS[s]}: ${n} session${n !== 1 ? 's' : ''}`}
                >
                  {n > 0 && <span className={styles.heatVal} style={{ color: intensity > 0.5 ? '#fff' : 'var(--rbbn-nearblack)' }}>{n}</span>}
                </div>
              )
            })}
          </>
        ))}
      </div>
      <div className={styles.heatLegend}>
        <span>Fewer</span>
        <div className={styles.heatGrad} />
        <span>More</span>
      </div>
    </div>
  )
}

// ── Spark bar chart (sessions by day) ─────────────────────────────────────────
function SparkBars({ byDay, days = 30 }) {
  const recent = byDay.slice(-days)
  const max    = Math.max(...recent.map((d) => Number(d.sessions)), 1)
  return (
    <div className={styles.sparkWrap}>
      {recent.map((d) => {
        const pct  = (Number(d.sessions) / max) * 100
        const extPct = (Number(d.extensions) / max) * 100
        const dt   = new Date(d.day + 'T12:00:00Z')
        const label = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        return (
          <div key={d.day} className={styles.sparkCol} title={`${label}: ${d.sessions} session${d.sessions !== 1 ? 's' : ''}, ${d.extensions} ext, ${d.hours}h`}>
            <div className={styles.sparkBars}>
              <div className={styles.sparkExt} style={{ height: `${extPct}%` }} />
              <div className={styles.sparkSess} style={{ height: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Forecast panel ────────────────────────────────────────────────────────────
function Forecast({ forecast, pool }) {
  const { avg7d, avg30d, growthRate, utilization7d, capacityPerDay, daysToCapacity, recommendedPoolSize } = forecast

  const urgency = utilization7d > 70 ? 'high'
                : utilization7d > 40 ? 'medium'
                : 'low'

  const urgencyColor = { high: '#c0392b', medium: '#dc8200', low: '#00a050' }[urgency]

  return (
    <div className={styles.forecast}>
      <div className={styles.forecastGrid}>
        <div className={styles.forecastItem}>
          <div className={styles.forecastVal}>{avg7d}</div>
          <div className={styles.forecastLbl}>Avg sessions/day (7d)</div>
        </div>
        <div className={styles.forecastItem}>
          <div className={styles.forecastVal}>{avg30d}</div>
          <div className={styles.forecastLbl}>Avg sessions/day (30d)</div>
        </div>
        <div className={styles.forecastItem}>
          <div className={styles.forecastVal} style={{ color: growthRate > 0 ? '#dc8200' : '#00a050' }}>
            {growthRate > 0 ? '+' : ''}{growthRate}%
          </div>
          <div className={styles.forecastLbl}>Month-over-month growth</div>
        </div>
        <div className={styles.forecastItem}>
          <div className={styles.forecastVal} style={{ color: urgencyColor }}>{utilization7d}%</div>
          <div className={styles.forecastLbl}>Pool utilization (7d avg)</div>
        </div>
      </div>

      <div className={styles.utilBar}>
        <div className={styles.utilFill} style={{ width: `${Math.min(utilization7d, 100)}%`, background: urgencyColor }} />
        <div className={styles.utilMark} style={{ left: '70%' }} title="70% — consider adding environments" />
        <div className={styles.utilMark} style={{ left: '85%' }} title="85% — critical threshold" />
      </div>
      <div className={styles.utilLegend}>
        <span>0%</span>
        <span style={{ marginLeft: '70%', transform: 'translateX(-50%)' }}>70%</span>
        <span style={{ marginLeft: 'auto' }}>100%</span>
      </div>

      <div className={styles.forecastRecommendation} style={{ borderColor: urgencyColor }}>
        {urgency === 'high' && (
          <>
            <span className={styles.recIcon}>⚠</span>
            <div>
              <strong>Action required:</strong> Pool utilization is above 70%.
              {recommendedPoolSize > pool.active
                ? ` Recommend scaling to ${recommendedPoolSize} environments (currently ${pool.active}).`
                : ` Current pool of ${pool.active} is near capacity.`}
            </div>
          </>
        )}
        {urgency === 'medium' && (
          <>
            <span className={styles.recIcon} style={{ color: '#dc8200' }}>◆</span>
            <div>
              <strong>Monitor:</strong> Utilization is moderate.
              {daysToCapacity != null
                ? ` At current growth, 80% capacity reached in ~${daysToCapacity} days.`
                : ` No capacity pressure at current rate.`}
              {` Current pool: ${pool.active} of ${pool.max} max environments.`}
            </div>
          </>
        )}
        {urgency === 'low' && (
          <>
            <span className={styles.recIcon} style={{ color: '#00a050' }}>✓</span>
            <div>
              <strong>Healthy:</strong> Pool utilization is low.
              {` Current pool of ${pool.active} environments is sufficient.`}
              {daysToCapacity != null ? ` Projected to reach 80% in ~${daysToCapacity} days.` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [tab,     setTab]     = useState('sandbox')

  // Gate: only mods/staff
  if (user && !['moderator', 'staff'].includes(user.role)) {
    return <Navigate to="/forum" replace />
  }

  useEffect(() => {
    client.get('/api/admin/dashboard')
      .then(({ data }) => { setData(data); setLoading(false) })
      .catch((e) => { setError(e?.response?.data?.error ?? 'Failed to load'); setLoading(false) })
  }, [])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingState}>Loading dashboard data…</div>
    </div>
  )
  if (error) return (
    <div className={styles.page}>
      <div className={styles.errorState}>{error}</div>
    </div>
  )

  const { sandbox, forum, users, generatedAt } = data
  const { overview, byDay, bySlot, byUser, byEnv, pool, forecast } = sandbox
  const maxSessions  = Math.max(...byUser.map((u) => Number(u.sessions)), 1)
  const maxHours     = Math.max(...byUser.map((u) => Number(u.hours)), 1)
  const maxEngagement = Math.max(...forum.byUser.map((u) => Number(u.engagement)), 1)

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <div className={styles.pageSub}>
            Moderator view · Last updated {fmtDateTime(generatedAt)}
          </div>
        </div>
        <button className={styles.refreshBtn} onClick={() => window.location.reload()}>
          ↺ Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className={styles.tabs}>
        {[
          { id: 'sandbox', label: 'Sandbox & Capacity' },
          { id: 'forum',   label: 'Forum Activity' },
          { id: 'users',   label: 'Users' },
        ].map(({ id, label }) => (
          <button
            key={id}
            className={[styles.tab, tab === id ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── SANDBOX TAB ──────────────────────────────────────────────────── */}
      {tab === 'sandbox' && (
        <div className={styles.content}>

          {/* KPI row */}
          <div className={styles.kpiRow}>
            <KpiCard label="Active now"        value={overview.active_now}       accent="#00a050" />
            <KpiCard label="Total sessions"    value={overview.valid_sessions}   accent="#7d00b9" />
            <KpiCard label="Sessions (30d)"    value={overview.sessions_30d}     accent="#0070e6" />
            <KpiCard label="Extensions (30d)"  value={fmt(Number(overview.extensions_7d) * (30/7), 0)} accent="#dc8200" />
            <KpiCard label="Hours booked"      value={`${overview.total_hours}h`} accent="#009090" />
            <KpiCard label="Peak concurrent"   value={overview.peak_concurrent}
              sub={`of ${pool.active} environments`}
              warn={overview.peak_concurrent >= pool.active * 0.8} />
          </div>

          {/* Capacity forecast */}
          <div className={styles.card}>
            <SectionHeader title="Capacity Forecast" sub="Projection based on 7-day rolling average vs 30-day trend" />
            <Forecast forecast={forecast} pool={pool} />
          </div>

          {/* Activity chart + heatmap */}
          <div className={styles.twoCol}>
            <div className={styles.card}>
              <SectionHeader title="Sessions — last 60 days" sub="Purple = sessions · Amber overlay = extensions" />
              {byDay.length === 0
                ? <div className={styles.empty}>No sessions recorded yet.</div>
                : <SparkBars byDay={byDay} days={60} />
              }
            </div>

            <div className={styles.card}>
              <SectionHeader title="Slot heatmap" sub="Sessions by time slot and day of week (UTC)" />
              {bySlot.length === 0
                ? <div className={styles.empty}>No sessions recorded yet.</div>
                : <Heatmap bySlot={bySlot} />
              }
            </div>
          </div>

          {/* Environment table */}
          <div className={styles.card}>
            <SectionHeader title="Environment pool" sub={`${pool.active} active · ${pool.max} max`} />
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Environment</th>
                  <th>Status</th>
                  <th>Sessions</th>
                  <th>Extensions</th>
                  <th>Hours used</th>
                  <th>Last used</th>
                </tr>
              </thead>
              <tbody>
                {byEnv.map((e) => (
                  <tr key={e.id}>
                    <td><strong>{e.name}</strong></td>
                    <td>
                      <span className={styles.envStatus} data-status={e.status}>{e.status}</span>
                    </td>
                    <td>{e.sessions}</td>
                    <td>{e.extensions}</td>
                    <td>{e.hours}h</td>
                    <td className={styles.muted}>{fmtDateTime(e.last_used)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top users */}
          <div className={styles.card}>
            <SectionHeader title="Top users — Sandbox" />
            {byUser.length === 0
              ? <div className={styles.empty}>No booking data yet.</div>
              : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Sessions</th>
                      <th>Extensions</th>
                      <th>Hours</th>
                      <th>Cancellations</th>
                      <th>Last session</th>
                      <th>Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byUser.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div><strong>{u.username}</strong></div>
                          {u.company && <div className={styles.muted}>{u.company}</div>}
                        </td>
                        <td><RoleBadge role={u.role} /></td>
                        <td>{u.sessions}</td>
                        <td>{u.extensions}</td>
                        <td>{u.hours}h</td>
                        <td className={u.cancellations > 0 ? styles.warn : ''}>{u.cancellations}</td>
                        <td className={styles.muted}>{timeAgo(u.last_session)}</td>
                        <td style={{ width: 100 }}>
                          <Bar value={u.sessions} max={maxSessions} height={5} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>
      )}

      {/* ── FORUM TAB ────────────────────────────────────────────────────── */}
      {tab === 'forum' && (
        <div className={styles.content}>

          <div className={styles.kpiRow}>
            <KpiCard label="Total threads"     value={forum.overview.total_threads}    accent="#7d00b9" />
            <KpiCard label="Total replies"     value={forum.overview.total_replies}    accent="#0070e6" />
            <KpiCard label="Threads (7d)"      value={forum.overview.threads_7d}       accent="#00a050" />
            <KpiCard label="Replies (7d)"      value={forum.overview.replies_7d}       accent="#dc8200" />
            <KpiCard label="Active authors (30d)" value={forum.overview.active_authors_30d} accent="#009090" />
            <KpiCard label="Registered users"  value={forum.overview.total_users} />
          </div>

          {/* Category breakdown */}
          <div className={styles.card}>
            <SectionHeader title="Threads by category" />
            {forum.byCategory.length === 0
              ? <div className={styles.empty}>No threads yet.</div>
              : (
                <div className={styles.catList}>
                  {forum.byCategory.map((c) => {
                    const maxT = Math.max(...forum.byCategory.map((x) => x.threads), 1)
                    return (
                      <div key={c.category} className={styles.catRow}>
                        <span className={styles.catName}>{c.category}</span>
                        <Bar value={c.threads} max={maxT} />
                        <span className={styles.catCount}>{c.threads} threads</span>
                        <span className={styles.muted}>{c.replies} replies · {c.views} views</span>
                        <span className={styles.muted}>{timeAgo(c.last_activity)}</span>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>

          {/* User contributions */}
          <div className={styles.card}>
            <SectionHeader title="Contributions per user" sub="Engagement = threads × 3 + replies" />
            {forum.byUser.every((u) => u.engagement === 0)
              ? <div className={styles.empty}>No forum activity yet.</div>
              : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Threads</th>
                      <th>Replies</th>
                      <th>30d activity</th>
                      <th>Engagement</th>
                      <th>Last post</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forum.byUser.filter((u) => u.engagement > 0).map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div><strong>{u.username}</strong></div>
                          {u.company && <div className={styles.muted}>{u.company}</div>}
                        </td>
                        <td><RoleBadge role={u.role} /></td>
                        <td>{u.threads}</td>
                        <td>{u.replies}</td>
                        <td className={styles.muted}>
                          {u.threads_30d}T / {u.replies_30d}R
                        </td>
                        <td><strong>{u.engagement}</strong></td>
                        <td className={styles.muted}>{timeAgo(u.last_post)}</td>
                        <td style={{ width: 100 }}>
                          <Bar value={u.engagement} max={maxEngagement} height={5} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>

          {/* Recent activity feed */}
          <div className={styles.card}>
            <SectionHeader title="Recent activity" />
            <div className={styles.activityFeed}>
              {forum.recentActivity.length === 0
                ? <div className={styles.empty}>No activity yet.</div>
                : forum.recentActivity.map((item, i) => (
                  <div key={i} className={styles.activityItem}>
                    <span className={[styles.activityType, item.type === 'thread' ? styles.actTypeThread : styles.actTypeReply].join(' ')}>
                      {item.type === 'thread' ? 'Thread' : 'Reply'}
                    </span>
                    <div className={styles.activityMain}>
                      <span className={styles.activityTitle}>{item.title}</span>
                      <span className={styles.activityMeta}>
                        by <strong>{item.username}</strong> · {item.category} · {timeAgo(item.ts)}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TAB ────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className={styles.content}>
          <div className={styles.kpiRow}>
            <KpiCard label="Total users"       value={users.length}                                            accent="#7d00b9" />
            <KpiCard label="Moderators/Staff"  value={users.filter((u) => ['moderator','staff'].includes(u.role)).length} accent="#dc8200" />
            <KpiCard label="Partners"          value={users.filter((u) => u.role === 'partner').length}        accent="#0070e6" />
            <KpiCard label="Banned"            value={users.filter((u) => u.banned_at).length}                 warn={users.filter((u) => u.banned_at).length > 0} />
          </div>

          <div className={styles.card}>
            <SectionHeader title="All users" />
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Timezone</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.banned_at ? styles.bannedRow : ''}>
                    <td><strong>{u.username}</strong></td>
                    <td className={styles.muted}>{u.email}</td>
                    <td className={styles.muted}>{u.company ?? '—'}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td className={styles.muted}>{u.timezone || 'UTC'}</td>
                    <td className={styles.muted}>{fmtDate(u.created_at)}</td>
                    <td>
                      {u.banned_at
                        ? <span className={styles.bannedBadge}>Banned {fmtDate(u.banned_at)}</span>
                        : <span className={styles.activeBadge}>Active</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
