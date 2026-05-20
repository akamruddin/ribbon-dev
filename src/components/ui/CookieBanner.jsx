import { Link } from 'react-router-dom'
import PillButton from './PillButton'
import useCookieConsent from '../../hooks/useCookieConsent'
import styles from './CookieBanner.module.css'

export default function CookieBanner() {
  const { hasConsented, acceptAll, essentialOnly } = useCookieConsent()

  if (hasConsented) return null

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <div className={styles.text}>
        <strong>We use essential storage to keep you signed in.</strong>{' '}
        No tracking or advertising. Two JWT tokens are stored in your browser (access — 15 min,
        refresh — 7 days) solely to authenticate your session.{' '}
        <Link to="/privacy" className={styles.link}>Cookie &amp; Privacy Policy</Link>
      </div>
      <div className={styles.actions}>
        <PillButton variant="outline" size="sm" onClick={essentialOnly}>
          Essential only
        </PillButton>
        <PillButton variant="solid" size="sm" onClick={acceptAll}>
          Accept
        </PillButton>
      </div>
    </div>
  )
}
