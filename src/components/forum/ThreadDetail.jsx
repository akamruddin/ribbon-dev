import { useState } from 'react'
import useForumStore from '../../store/useForumStore'
import useAuthStore from '../../store/useAuthStore'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Tag from '../ui/Tag'
import ReplyBox from './ReplyBox'
import styles from './ThreadDetail.module.css'

function isMod(user) {
  return user && ['moderator', 'staff'].includes(user.role)
}

function ModButton({ label, danger, onClick }) {
  return (
    <button
      className={[styles.modBtn, danger ? styles.modBtnDanger : styles.modBtnWarn].join(' ')}
      onClick={onClick}
      title={label}
    >
      {label}
    </button>
  )
}

export default function ThreadDetail() {
  const { selectedThread: t, threadLoading, clearThread, deleteThread, deleteReply, banUser, pinThread } = useForumStore()
  const { user } = useAuthStore()
  const mod = isMod(user)
  const [actionError, setActionError] = useState(null)

  if (threadLoading && !t) {
    return <div className={styles.loading}>Loading thread…</div>
  }
  if (!t) return null

  const replies = t.replies ?? []

  async function handlePin() {
    try {
      await pinThread(t.id, !t.pinned)
      setActionError(null)
    } catch (e) {
      setActionError(e?.response?.data?.error ?? 'Pin action failed')
    }
  }

  async function handleDeleteThread() {
    if (!confirm(`Delete thread "${t.title}"? This cannot be undone.`)) return
    try { await deleteThread(t.id) }
    catch (e) { setActionError(e?.response?.data?.error ?? 'Delete failed') }
  }

  async function handleDeleteReply(replyId) {
    if (!confirm('Delete this reply?')) return
    try { await deleteReply(replyId) }
    catch (e) { setActionError(e?.response?.data?.error ?? 'Delete failed') }
  }

  async function handleBan(userId, username) {
    if (!confirm(`Ban user @${username}? They will no longer be able to post.`)) return
    try {
      await banUser(userId)
      setActionError(null)
    } catch (e) {
      setActionError(e?.response?.data?.error ?? 'Ban failed')
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <button className={styles.back} onClick={clearThread}>← Back to Forum</button>
        {mod && (
          <div className={styles.topbarMod}>
            <ModButton
              label={t.pinned ? '📌 Unpin' : '📌 Pin'}
              onClick={handlePin}
            />
            <ModButton label="Delete Thread" danger onClick={handleDeleteThread} />
          </div>
        )}
      </div>

      {actionError && (
        <div className={styles.actionError}>{actionError}</div>
      )}

      {t.pinned && <div className={styles.pinnedBadge}>📌 Pinned</div>}
      <h1 className={styles.title}>{t.title}</h1>
      <div className={styles.titleMeta}>
        <Badge role={t.role} />
        {(t.tags ?? []).map((tag) => <Tag key={tag} label={tag} />)}
        <span className={styles.byline}>
          by <strong>{t.author}</strong> · {t.lastActivity}
        </span>
      </div>

      <div className={styles.post}>
        <div className={styles.postHeader}>
          <Avatar initials={t.initials} color={t.color} size={38} />
          <div>
            <div className={styles.postAuthor}>{t.author}</div>
            <div className={styles.postTime}>{t.lastActivity}</div>
          </div>
          <Badge role={t.role} />
          {mod && user?.username !== t.author && (
            <ModButton
              label={`Ban @${t.author}`}
              danger
              onClick={() => handleBan(t.author_id, t.author)}
            />
          )}
        </div>
        <pre className={styles.postBody}>{t.body}</pre>
      </div>

      {replies.length > 0 && (
        <div className={styles.repliesLabel}>
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </div>
      )}

      {replies.map((r) => (
        <div key={r.id} className={styles.reply}>
          <div className={styles.replyHeader}>
            <Avatar initials={r.initials} color={r.color} size={26} />
            <Badge role={r.role} />
            <span className={styles.replyByline}>
              <strong>{r.author}</strong> · {r.time ?? r.created_at}
            </span>
            {mod && (
              <div className={styles.replyMod}>
                <ModButton label="Delete" danger onClick={() => handleDeleteReply(r.id)} />
                {user?.username !== r.author && (
                  <ModButton label={`Ban @${r.author}`} danger onClick={() => handleBan(r.author_id, r.author)} />
                )}
              </div>
            )}
          </div>
          <div className={styles.replyBody}>{r.body}</div>
        </div>
      ))}

      <ReplyBox onCancel={clearThread} />
    </div>
  )
}
