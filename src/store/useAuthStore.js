import { create } from 'zustand'
import client from '../api/client'

const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  initializing: true,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await client.post('/api/auth/login', { email, password })
      localStorage.setItem('access_token',  data.access)
      localStorage.setItem('refresh_token', data.refresh)
      set({ user: data.user, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error ?? 'Login failed', loading: false })
      return false
    }
  },

  register: async (email, username, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await client.post('/api/auth/register', { email, username, password })
      localStorage.setItem('access_token',  data.access)
      localStorage.setItem('refresh_token', data.refresh)
      set({ user: data.user, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.error ?? 'Registration failed', loading: false })
      return false
    }
  },

  logout: async () => {
    const refresh = localStorage.getItem('refresh_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null })
    // Tell the server to revoke the token — fire-and-forget, don't block the UI
    if (refresh) {
      client.post('/api/auth/logout', { refresh }).catch(() => {})
    }
  },

  loadMe: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { set({ initializing: false }); return }
    try {
      const { data } = await client.get('/api/auth/me')
      set({ user: data.user, initializing: false })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ initializing: false })
    }
  },

  updateProfile: async (fields) => {
    const { data } = await client.patch('/api/auth/profile', fields)
    set({ user: data.user })
    return data.user
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
