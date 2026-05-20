import styles from './Avatar.module.css'

export default function Avatar({ initials, color, size = 36 }) {
  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size > 28 ? 12 : 9,
        minWidth: size,
      }}
    >
      {initials}
    </div>
  )
}
