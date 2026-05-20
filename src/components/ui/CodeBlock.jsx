import styles from './CodeBlock.module.css'

export default function CodeBlock({ children }) {
  return <pre className={styles.block}>{children}</pre>
}
