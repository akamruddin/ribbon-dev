import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import PillButton from '../components/ui/PillButton'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, login, register, loading, error, clearError } = useAuthStore()
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const from = location.state?.from?.pathname || '/forum'

  useEffect(() => { if (user) navigate(from, { replace: true }) }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    const ok = mode === 'login'
      ? await login(email, password)
      : await register(email, username, password)
    if (ok) navigate(from, { replace: true })
  }

  function switchMode(m) { clearError(); setMode(m) }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <img src="/ribbon-logo.svg" alt="Ribbon Communications" className={styles.logo} />
          <div className={styles.logoSub}>Developer Community</div>
        </div>

        <div className={styles.tabs}>
          <button
            className={[styles.tab, mode === 'login' ? styles.activeTab : ''].join(' ')}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            className={[styles.tab, mode === 'register' ? styles.activeTab : ''].join(' ')}
            onClick={() => switchMode('register')}
          >
            Create Account
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          {mode === 'register' && (
            <>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                type="text"
                placeholder="netops_42"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </>
          )}

          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder={mode === 'register' ? 'At least 8 characters' : ''}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'register' ? 8 : 1}
          />

          <PillButton
            variant="solid"
            type="submit"
            style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </PillButton>

          <p className={styles.hint}>
            {mode === 'login'
              ? <>No account? <button type="button" className={styles.switchLink} onClick={() => switchMode('register')}>Create one</button></>
              : <>Have an account? <button type="button" className={styles.switchLink} onClick={() => switchMode('login')}>Sign in</button></>
            }
          </p>
        </form>

        <div className={styles.footer}>
          <button className={styles.guestLink} onClick={() => navigate('/forum')}>
            Browse as guest →
          </button>
        </div>
      </div>
    </div>
  )
}
