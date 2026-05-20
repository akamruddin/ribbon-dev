import styles from './StatusChip.module.css'

export default function StatusChip({ status }) {
  const isReady = status === 'ready'
  return (
    <span className={`${styles.chip} ${isReady ? styles.ready : styles.booting}`}>
      <span>{isReady ? '●' : '⏳'}</span>
      {isReady ? 'Ready' : 'Booting'}
    </span>
  )
}
