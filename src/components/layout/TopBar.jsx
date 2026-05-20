import styles from './TopBar.module.css'

export default function TopBar() {
  return (
    <div className={styles.topbar}>
      <a className={styles.link}>Blog</a>
      <a className={styles.link}>Investors</a>
      <a className={styles.link}>Careers</a>
    </div>
  )
}
