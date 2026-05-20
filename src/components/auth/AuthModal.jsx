import { useState } from 'react'
import useAuthStore from '../../store/useAuthStore'
import PillButton from '../ui/PillButton'
import styles from './AuthModal.module.css'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login')   // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, register, loading, error, clearError } = useAuthStore()

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    const ok = mode === 'login'
      ? await login(email, password)
      : await register(email, username, password)
    if (ok) onClose()
  }

  function switchMode(m) { clearError(); setMode(m) }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.tabs}>
            <button className={[styles.tab, mode === 'login' ? styles.activeTab : ''].join(' ')} onClick={() => switchMode('login')}>Sign In</button>
            <button className={[styles.tab, mode === 'register' ? styles.activeTab : ''].join(' ')} onClick={() => switchMode('register')}>Create Account</button>
          </div>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.logoRow}>
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.logo}>
              <circle cx="18" cy="18" r="16" stroke="#7D00B9" strokeWidth="1.8" fill="none"/>
              <path d="M18 4C24 4,30 8.5,30 18C30 27.5,24 32,18 32" stroke="#7D00B9" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              <path d="M18 4C12 4,6 8.5,6 18C6 27.5,12 32,18 32" stroke="#C0059E" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3.5" fill="#7D00B9"/>
              <circle cx="18" cy="4.5" r="2.2" fill="#DC5DF7"/>
              <circle cx="30" cy="18" r="2.2" fill="#7D00B9"/>
              <circle cx="18" cy="31.5" r="2.2" fill="#C0059E"/>
              <circle cx="6" cy="18" r="2.2" fill="#D91791"/>
            </svg>
            <span className={styles.logoText}>ribbon <em>developer</em></span>
          </div>

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
            style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </PillButton>
        </form>
      </div>
    </div>
  )
}
