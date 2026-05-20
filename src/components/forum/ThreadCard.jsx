import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Tag from '../ui/Tag'
import styles from './ThreadCard.module.css'

export default function ThreadCard({ thread, onClick }) {
  return (
    <div
      className={[styles.card, thread.pinned ? styles.pinned : ''].join(' ')}
      onClick={onClick}
    >
      <Avatar initials={thread.initials} color={thread.color} size={36} />
      <div className={styles.body}>
        <div className={styles.meta}>
          {thread.pinned && <span className={styles.pinLabel}>📌 Pinned</span>}
          <Badge role={thread.role} />
          {thread.tags.slice(0, 3).map((t) => <Tag key={t} label={t} />)}
        </div>
        <div className={styles.title}>{thread.title}</div>
        <div className={styles.byline}>
          by <strong>{thread.author}</strong> · {thread.lastActivity}
        </div>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statVal}>{thread.replyCount}</div>
          <div className={styles.statLbl}>Replies</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{thread.viewCount}</div>
          <div className={styles.statLbl}>Views</div>
        </div>
      </div>
    </div>
  )
}
