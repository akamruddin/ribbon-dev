import { useLocation, Link } from 'react-router-dom'
import styles from './PlaceholderPage.module.css'

export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const name = pathname.replace('/', '').replace('-', ' ')

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>Coming in Phase 1</div>
      <h2 className={styles.title}>{name || 'Page'}</h2>
      <p className={styles.copy}>This section is under construction.</p>
      <Link to="/forum" className={styles.back}>← Back to Forum</Link>
    </div>
  )
}
