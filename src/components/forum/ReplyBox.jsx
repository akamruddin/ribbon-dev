import { useState } from 'react'
import PillButton from '../ui/PillButton'
import useForumStore from '../../store/useForumStore'
import styles from './ReplyBox.module.css'

export default function ReplyBox({ onCancel }) {
  const { selectedThread, submitReply } = useForumStore()
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!body.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await submitReply(selectedThread.id, body.trim())
      setBody('')
    } catch (e) {
      setError(e?.response?.data?.error ?? 'Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.box}>
      <div className={styles.label}>Post a reply</div>
      {error && <div className={styles.error}>{error}</div>}
      <textarea
        className={styles.textarea}
        placeholder="Share your answer or follow-up…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <PillButton variant="solid" size="xs" onClick={handleSubmit} disabled={submitting || !body.trim()}>
          {submitting ? 'Posting…' : 'Post Reply'}
        </PillButton>
      </div>
    </div>
  )
}
