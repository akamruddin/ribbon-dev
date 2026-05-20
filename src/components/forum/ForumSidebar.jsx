import { CATEGORIES } from '../../data/categories'
import useForumStore from '../../store/useForumStore'
import styles from './ForumSidebar.module.css'

const MY_ACTIVITY = [
  { icon: '📝', label: 'My Posts' },
  { icon: '🔖', label: 'Bookmarks' },
  { icon: '👁', label: 'Following' },
]

export default function ForumSidebar() {
  const { activeCategory, setActiveCategory, counts, total } = useForumStore()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.label}>Categories</div>
      {CATEGORIES.map((cat) => {
        const liveCount = cat.id === 'all' ? total : (counts[cat.id] ?? 0)
        return (
        <button
          key={cat.id}
          className={[styles.catBtn, activeCategory === cat.id ? styles.on : ''].join(' ')}
          onClick={() => setActiveCategory(cat.id)}
        >
          <span className={styles.icon}>{cat.icon}</span>
          <span className={styles.catLabel}>{cat.label}</span>
          <span className={[styles.count, activeCategory === cat.id ? styles.countActive : ''].join(' ')}>
            {liveCount}
          </span>
        </button>
        )
      })}

      <div className={styles.divider} />
      <div className={styles.label}>My Activity</div>
      {MY_ACTIVITY.map(({ icon, label }) => (
        <button key={label} className={styles.catBtn}>
          <span className={styles.icon}>{icon}</span>
          <span className={styles.catLabel}>{label}</span>
        </button>
      ))}
    </aside>
  )
}
