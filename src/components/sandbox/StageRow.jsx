import styles from './StageRow.module.css'

export default function StageRow({ stage, index, activeStage }) {
  const state = index < activeStage ? 'done' : index === activeStage ? 'active' : 'pending'
  const labels = { done: 'Complete', active: 'In progress', pending: 'Pending' }
  const dots   = { done: '✓', active: '●', pending: '' }

  return (
    <div className={`${styles.row} ${styles[state]}`}>
      <div className={`${styles.dot} ${styles[state]}`}>{dots[state]}</div>
      <div className={`${styles.label} ${styles[state]}`}>{stage.label}</div>
      <span className={styles.estimate}>{stage.estimate}</span>
      <span className={`${styles.status} ${styles[state]}`}>{labels[state]}</span>
    </div>
  )
}
