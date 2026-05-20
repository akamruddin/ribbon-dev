import { useState, useEffect, useRef } from 'react'
import { CATEGORIES } from '../../data/categories'
import useForumStore from '../../store/useForumStore'
import PillButton from '../ui/PillButton'
import styles from './NewThreadModal.module.css'

const POSTABLE = CATEGORIES.filter(c => c.id !== 'all')

export default function NewThreadModal() {
  const { newThreadOpen, closeNewThread, submitThread, activeCategory } = useForumStore()
  const [category, setCategory] = useState(activeCategory !== 'all' ? activeCategory : POSTABLE[0].id)
  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState(null)
  const titleRef = useRef(null)

  useEffect(() => {
    if (newThreadOpen) {
      setCategory(activeCategory !== 'all' ? activeCategory : POSTABLE[0].id)
      setTitle('')
      setBody('')
      setError(null)
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [newThreadOpen, activeCategory])

  if (!newThreadOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await submitThread({ category, title: title.trim(), body: body.trim() })
    } catch (err) {
      setError(err?.response?.data?.error ?? 'Failed to post thread. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={e => { if (e.target === e.currentTarget) closeNewThread() }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="New thread">
        <div className={styles.header}>
          <h2 className={styles.title}>New Thread</h2>
          <button className={styles.close} onClick={closeNewThread} aria-label="Close">✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Category
            <select
              className={styles.select}
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              {POSTABLE.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Title
            <input
              ref={titleRef}
              className={styles.input}
              type="text"
              placeholder="A clear, specific title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              required
            />
          </label>

          <label className={styles.label}>
            Body
            <textarea
              className={styles.textarea}
              placeholder="Describe your question or topic in detail…"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <PillButton variant="ghost" size="sm" type="button" onClick={closeNewThread}>
              Cancel
            </PillButton>
            <PillButton
              variant="solid"
              size="sm"
              type="submit"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Posting…' : 'Post Thread'}
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
