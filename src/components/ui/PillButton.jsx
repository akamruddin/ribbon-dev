import styles from './PillButton.module.css'

export default function PillButton({
  variant = 'solid',
  size,
  children,
  onClick,
  style,
  type = 'button',
  className = '',
  disabled = false,
}) {
  const cls = [
    styles.pill,
    styles[variant],
    size ? styles[size] : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button type={type} className={cls} onClick={onClick} style={style} disabled={disabled}>
      {children}
    </button>
  )
}
