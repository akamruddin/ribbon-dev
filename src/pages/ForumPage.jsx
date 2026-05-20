import { useEffect } from 'react'
import useForumStore from '../store/useForumStore'
import ForumHero from '../components/forum/ForumHero'
import ForumSidebar from '../components/forum/ForumSidebar'
import ThreadList from '../components/forum/ThreadList'
import ThreadDetail from '../components/forum/ThreadDetail'
import ForumAside from '../components/forum/ForumAside'
import NewThreadModal from '../components/forum/NewThreadModal'
import styles from './ForumPage.module.css'

export default function ForumPage() {
  const { selectedThread, loadThreads } = useForumStore()

  // Load real threads from API on mount (falls back to mock if backend offline)
  useEffect(() => { loadThreads() }, [])

  return (
    <div className={styles.page}>
      <ForumHero />
      <div className={styles.layout}>
        <ForumSidebar />
        <main className={styles.main}>
          {selectedThread ? <ThreadDetail /> : <ThreadList />}
        </main>
        <ForumAside />
      </div>
      <NewThreadModal />
    </div>
  )
}
