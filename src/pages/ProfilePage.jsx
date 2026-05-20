import { useState, useEffect } from 'react'
import useAuthStore from '../store/useAuthStore'
import { TIMEZONES_BY_REGION, tzOffset } from '../data/timezones'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()

  const [form, setForm] = useState({
    full_name: '',
    username:  '',
    company:   '',
    email:     '',
    timezone:  'UTC',
  })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState(null)

  // Populate form from current user when the component mounts or user changes
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? '',
        username:  user.username  ?? '',
        company:   user.company   ?? '',
        email:     user.email     ?? '',
        timezone:  user.timezone  ?? 'UTC',
      })
    }
  }, [user?.id])

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setSuccess(false)
    setError(null)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true); setError(null); setSuccess(false)
    try {
      await updateProfile({
        full_name: form.full_name || undefined,
        username:  form.username  || undefined,
        company:   form.company   || undefined,
        email:     form.email     || undefined,
        timezone:  form.timezone  || undefined,
      })
      setSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.initials ?? '?'
  const color    = user?.color    ?? '#7d00b9'
  const role     = user?.role     ?? 'member'

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.avatarSection}>
          <div className={styles.avatar} style={{ background: color }}>
            {initials}
          </div>
          <div className={styles.avatarMeta}>
            <div className={styles.displayName}>{user?.full_name || user?.username}</div>
            <div className={styles.roleChip} data-role={role}>{role}</div>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSave}>
          <h1 className={styles.heading}>Edit Profile</h1>
          <p className={styles.sub}>Your name and company are visible to other community members.</p>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                name="full_name"
                value={form.full_name}
                onChange={onChange}
                placeholder="Jane Smith"
                maxLength={80}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="jsmith"
                maxLength={30}
                pattern="[a-zA-Z0-9_]{3,30}"
                title="3–30 alphanumeric characters or underscores"
              />
              <span className={styles.hint}>Used in forum posts and mentions</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Company</label>
              <input
                className={styles.input}
                name="company"
                value={form.company}
                onChange={onChange}
                placeholder="Acme Corp"
                maxLength={80}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Work Email</label>
              <input
                className={styles.input}
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="jane@acme.com"
              />
              <span className={styles.hint}>Used for sandbox booking confirmations and reminders</span>
            </div>
          </div>

          <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.label}>Timezone</label>
            <select
              className={styles.input}
              name="timezone"
              value={form.timezone}
              onChange={onChange}
            >
              {Object.entries(TIMEZONES_BY_REGION).map(([region, tzs]) => (
                <optgroup key={region} label={region}>
                  {tzs.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label} — {tzOffset(tz.value)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className={styles.hint}>Slot times and email notifications will use this timezone</span>
          </div>

          {error   && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.successMsg}>Profile saved successfully.</div>}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
