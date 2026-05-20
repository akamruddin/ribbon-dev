import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import PillButton from '../ui/PillButton'
import AuthModal from '../auth/AuthModal'
import useAuthStore from '../../store/useAuthStore'
import styles from './NavBar.module.css'

const NAV_LINKS = [
  { to: '/forum',     label: 'Forum' },
  { to: '/sandbox',   label: 'Sandbox' },
  { to: '/docs',      label: 'Docs' },
  { to: '/code',      label: 'Code Exchange' },
  { to: '/solutions', label: 'Solutions' },
]

const SUPPORT_URL = 'https://ribboncommunications.com/services/ribbon-support-portal'

export default function NavBar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <nav className={styles.navbar}>
        <NavLink to="/" className={styles.logo}>
          <img src="/ribbon-logo.svg" alt="Ribbon Communications" className={styles.logoImg} />
        </NavLink>

        <div className={styles.links}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [styles.navlink, isActive ? styles.active : ''].filter(Boolean).join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navlink}
          >
            Support
          </a>
          {user && ['moderator', 'staff'].includes(user.role) && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                [styles.navlink, styles.adminLink, isActive ? styles.active : ''].filter(Boolean).join(' ')
              }
            >
              Admin
            </NavLink>
          )}
        </div>

        <div className={styles.right}>
          <PillButton variant="outline" size="sm" onClick={() => navigate('/sandbox')}>
            Reserve Sandbox
          </PillButton>

          {user ? (
            <div className={styles.userArea}>
              <NavLink
                to="/profile"
                className={styles.avatarLink}
                title="Edit profile"
              >
                <div className={styles.avatar} style={{ background: user.color }}>
                  {user.initials}
                </div>
                <span className={styles.username}>{user.full_name || user.username}</span>
              </NavLink>
              <button className={styles.logoutBtn} onClick={() => logout()}>Sign out</button>
            </div>
          ) : (
            <>
              <PillButton variant="outline" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </PillButton>
              <PillButton variant="solid" size="sm" onClick={() => navigate('/login?mode=register')}>
                Join Community
              </PillButton>
            </>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
