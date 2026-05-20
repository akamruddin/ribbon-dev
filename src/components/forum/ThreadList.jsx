import { Search } from 'lucide-react'
import useForumStore from '../../store/useForumStore'
import { CATEGORY_MAP } from '../../data/categories'
import ThreadCard from './ThreadCard'
import PillButton from '../ui/PillButton'
import styles from './ThreadList.module.css'

export default function ThreadList() {
  const { threads, activeCategory, searchQuery, setSearchQuery, selectThread, openNewThread } = useForumStore()

  const visible = threads.filter(
    (t) =>
      (activeCategory === 'all' || t.category === activeCategory) &&
      (!searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  // pinned threads always first
  const sorted = [...visible].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <div className={styles.heading}>{CATEGORY_MAP[activeCategory] ?? 'All Discussions'}</div>
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search size={13} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search discussions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <PillButton variant="solid" size="xs" onClick={openNewThread}>+ New Thread</PillButton>
        </div>
      </div>
      <div className={styles.list}>
        {sorted.length > 0
          ? sorted.map((t) => (
              <ThreadCard key={t.id} thread={t} onClick={() => selectThread(t)} />
            ))
          : (
            <div className={styles.empty}>
              No discussions found{searchQuery ? ` for "${searchQuery}"` : ''}.
            </div>
          )
        }
      </div>
    </div>
  )
}
