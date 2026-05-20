import useSandboxStore from '../../store/useSandboxStore'
import styles from './BookingCalendar.module.css'

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MAX_DAYS = 14

function pad(n) { return String(n).padStart(2, '0') }

function toDateStr(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default function BookingCalendar() {
  const { selectedDate, setSelectedDate } = useSandboxStore()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const days = Array.from({ length: MAX_DAYS }, (_, i) => {
    const d = new Date(today.getTime() + i * 86_400_000)
    return {
      dateStr: toDateStr(d),
      dayName: DAY_NAMES[d.getDay()],
      dayNum:  d.getDate(),
      month:   MONTH_NAMES[d.getMonth()],
      isToday: i === 0,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    }
  })

  // Split into two rows of 7
  const week1 = days.slice(0, 7)
  const week2 = days.slice(7, 14)

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <span className={styles.label}>Select a date</span>
        <span className={styles.window}>Up to 2 weeks in advance</span>
      </div>

      {[week1, week2].map((week, wi) => (
        <div key={wi} className={styles.week}>
          {week.map((day) => {
            const active = selectedDate === day.dateStr
            return (
              <button
                key={day.dateStr}
                className={[
                  styles.day,
                  active       ? styles.dayActive   : '',
                  day.isToday  ? styles.dayToday    : '',
                  day.isWeekend && !active ? styles.dayWeekend : '',
                ].join(' ')}
                onClick={() => setSelectedDate(day.dateStr)}
              >
                <span className={styles.dayName}>{day.dayName}</span>
                <span className={styles.dayNum}>{day.dayNum}</span>
                {day.isToday && <span className={styles.todayDot} />}
              </button>
            )
          })}
        </div>
      ))}

      <div className={styles.monthRow}>
        <span>{week1[0].month} {week1[0].dayNum} – {week2[6].month} {week2[6].dayNum}, {week2[6].dateStr.slice(0,4)}</span>
      </div>
    </div>
  )
}
