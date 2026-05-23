import { create } from 'zustand'
import { getThreads, getThread, postThread, postReply, deleteThread, deleteReply, banUser, pinThread } from '../api/forum'

const useForumStore = create((set, get) => ({
  activeCategory: 'all',
  searchQuery: '',
  selectedThread: null,
  threads: [],
  counts: {},
  total: 0,
  loading: false,
  threadLoading: false,
  newThreadOpen: false,

  setActiveCategory: (id) => {
    set({ activeCategory: id, selectedThread: null })
    get().loadThreads()
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, selectedThread: null })
    get().loadThreads()
  },

  selectThread: (thread) => {
    set({ selectedThread: thread, threadLoading: true })
    get().loadSelectedThread(thread.id)
  },
  clearThread: () => set({ selectedThread: null }),

  loadSelectedThread: async (id) => {
    try {
      const data = await getThread(id)
      const t = data.thread
      const normalized = {
        ...t,
        category:     t.category ?? t.category_slug,
        lastActivity: t.last_activity
          ? new Date(t.last_activity).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
          : t.lastActivity,
        replyCount: t.reply_count ?? t.replyCount,
        viewCount:  t.view_count  ?? t.viewCount,
        replies: (t.replies ?? []).map(r => ({
          ...r,
          time: r.created_at
            ? new Date(r.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
            : r.time,
        })),
      }
      set({ selectedThread: normalized, threadLoading: false })
    } catch {
      set({ threadLoading: false })
    }
  },

  deleteThread: async (id) => {
    await deleteThread(id)
    set({ selectedThread: null })
    await get().loadThreads()
  },

  deleteReply: async (replyId) => {
    await deleteReply(replyId)
    // Remove reply from selected thread locally
    const t = get().selectedThread
    if (t) {
      set({
        selectedThread: {
          ...t,
          replies: t.replies.filter(r => r.id !== replyId),
          replyCount: Math.max(0, (t.replyCount ?? t.replies.length) - 1),
        }
      })
    }
  },

  submitReply: async (threadId, body) => {
    const data = await postReply(threadId, { body })
    const reply = data.reply
    const t = get().selectedThread
    if (t) {
      const normalized = {
        ...reply,
        time: reply.created_at
          ? new Date(reply.created_at).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
          : undefined,
      }
      set({
        selectedThread: {
          ...t,
          replies: [...(t.replies ?? []), normalized],
          replyCount: (t.replyCount ?? 0) + 1,
        }
      })
    }
  },

  banUser: async (userId) => {
    await banUser(userId)
  },

  pinThread: async (id, pinned) => {
    await pinThread(id, pinned)
    // Update the thread in the list
    set({
      threads: get().threads.map(th => th.id === id ? { ...th, pinned } : th),
    })
    // Update the selected thread if it's open
    const t = get().selectedThread
    if (t?.id === id) set({ selectedThread: { ...t, pinned } })
  },

  openNewThread:  () => set({ newThreadOpen: true }),
  closeNewThread: () => set({ newThreadOpen: false }),

  submitThread: async ({ category, title, body, tags }) => {
    await postThread({ category, title, body, tags })
    set({ newThreadOpen: false })
    // reload with 'all' so the new thread is visible regardless of current filter
    set({ activeCategory: 'all', searchQuery: '' })
    await get().loadThreads()
  },

  loadThreads: async () => {
    const { activeCategory, searchQuery } = get()
    set({ loading: true })
    try {
      const data = await getThreads({ category: activeCategory, query: searchQuery })
      // Normalize API shape to match mock shape where needed
      const threads = (data.threads ?? []).map((t) => ({
        ...t,
        category:     t.category ?? t.category_slug,
        lastActivity: t.last_activity
          ? new Date(t.last_activity).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
          : t.lastActivity,
        replyCount: t.reply_count  ?? t.replyCount,
        viewCount:  t.view_count   ?? t.viewCount,
      }))
      // Build a slug→count lookup from the per-category counts array
      const counts = {}
      ;(data.counts ?? []).forEach(({ category, count }) => { counts[category] = count })
      const total = data.total ?? threads.length
      set({ threads, counts, total, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))

export default useForumStore
