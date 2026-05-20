import styles from './Badge.module.css'

const CONFIG = {
  staff:   { label: 'Ribbon Staff', cls: 'staff' },
  partner: { label: 'Partner',      cls: 'partner' },
  member:  { label: 'Member',       cls: 'member' },
}

export default function Badge({ role }) {
  const { label, cls } = CONFIG[role] ?? CONFIG.member
  return <span className={`${styles.badge} ${styles[cls]}`}>{label}</span>
}
