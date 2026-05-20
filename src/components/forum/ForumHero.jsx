import { useNavigate } from 'react-router-dom'
import PillButton from '../ui/PillButton'
import styles from './ForumHero.module.css'

export default function ForumHero() {
  const navigate = useNavigate()
  return (
    <div className={styles.hero}>
      <div className={styles.text}>
        <div className={styles.eyebrow}>Ribbon Developer Community</div>
        <h1 className={styles.title}>Build. Automate. Share.</h1>
        <p className={styles.sub}>
          Peer-to-peer technical help for Neptune, Apollo, Muse, and Acumen.
          Access your on-demand sandbox. Share your code.
        </p>
      </div>
      <div className={styles.right}>
        <div className={styles.teaser}>
          <div className={styles.pills}>
            <span className={styles.pill}>5× Neptune rNOS</span>
            <span className={styles.pill}>5× Apollo Optical</span>
            <span className={styles.pill}>Muse</span>
          </div>
          <p className={styles.teaserCopy}>
            <strong>On-demand sandbox</strong> — isolated per session, clean state guaranteed
          </p>
          <PillButton variant="white" size="xs" onClick={() => navigate('/sandbox')}>
            Reserve Now →
          </PillButton>
        </div>
      </div>
    </div>
  )
}
