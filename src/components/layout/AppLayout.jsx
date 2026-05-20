import { Outlet, Link } from 'react-router-dom'
import NavBar from './NavBar'
import useCookieConsent from '../../hooks/useCookieConsent'
import styles from './AppLayout.module.css'

function Footer() {
  const { reset } = useCookieConsent()
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} Ribbon Communications</span>
      <Link to="/privacy" className={styles.footerLink}>Privacy &amp; Cookies</Link>
      <button className={styles.footerBtn} onClick={reset}>Cookie Preferences</button>
    </footer>
  )
}

export default function AppLayout() {
  return (
    <div className={styles.app}>
      <NavBar />
      <div className={styles.content}>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
