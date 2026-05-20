import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import useSandboxStore from '../store/useSandboxStore'
import BookingCalendar from '../components/sandbox/BookingCalendar'
import SlotGrid from '../components/sandbox/SlotGrid'
import MyReservations from '../components/sandbox/MyReservations'
import BookingConfirmModal from '../components/sandbox/BookingConfirmModal'
import styles from './SandboxPage.module.css'

export default function SandboxPage() {
  const { selectedDate, loadAvailability, loadMyReservations } = useSandboxStore()
  const [searchParams] = useSearchParams()
  const extendId    = searchParams.get('extend')   // reservation ID from reminder email link
  const reservationsRef = useRef(null)

  useEffect(() => {
    loadMyReservations()
    loadAvailability(selectedDate)
  }, [])

  // If ?extend=RES-XXXX is in the URL, scroll to the reservations panel after loading
  useEffect(() => {
    if (!extendId) return
    const timer = setTimeout(() => {
      reservationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 600)
    return () => clearTimeout(timer)
  }, [extendId])

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>Developer Sandbox</div>
          <h1 className={styles.heroTitle}>Reserve your environment</h1>
          <p className={styles.heroSub}>
            Pool of 5 isolated environments — Neptune rNOS, Apollo Optical, and Muse.
            Book a 4-hour block up to 2 weeks ahead. Extend up to 3×1h if the environment is free.
          </p>
          <div className={styles.heroChips}>
            <span className={styles.chip}>5× Neptune rNOS</span>
            <span className={styles.chip}>5× Apollo Optical</span>
            <span className={styles.chip}>Muse Orchestrator</span>
            <span className={styles.chipGhost}>30 min buffer between sessions</span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.left}>
          <BookingCalendar />
          <SlotGrid />
        </div>

        <div className={styles.right} ref={reservationsRef}>
          <MyReservations highlightId={extendId} />
        </div>
      </div>

      <BookingConfirmModal />
    </div>
  )
}
