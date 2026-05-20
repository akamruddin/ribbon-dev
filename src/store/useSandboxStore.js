import { create } from 'zustand'
import {
  getAvailability,
  getMyReservations,
  createReservation,
  extendReservation,
  cancelReservation,
  endReservation,
} from '../api/sandbox'
import useAuthStore from './useAuthStore'

// Pad a number to 2 digits
const pad = (n) => String(n).padStart(2, '0')

// Format ISO date to YYYY-MM-DD in local time
function toLocalDateStr(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const useSandboxStore = create((set, get) => ({
  // ── Booking panel state ──────────────────────────────────────────────────
  selectedDate:    toLocalDateStr(),      // YYYY-MM-DD, user-selected calendar day
  slots:           [],                    // availability slots for selectedDate
  slotsLoading:    false,
  slotsError:      null,

  // ── User reservations ────────────────────────────────────────────────────
  myReservations:  [],
  reservationsLoading: false,

  // ── Booking flow ─────────────────────────────────────────────────────────
  pendingSlot:     null,                  // slot the user clicked but hasn't confirmed
  bookingLoading:  false,
  bookingError:    null,
  lastBooked:      null,                  // result of last successful booking

  // ── Active session (legacy state kept for BootingView/ReadyView) ─────────
  sessionState:    'idle',               // idle | booting | ready | ended
  sessionId:       null,
  timeRemaining:   null,
  activeStage:     0,
  selectedNode:    null,
  showIdleBar:     false,

  // ── Calendar helpers ─────────────────────────────────────────────────────
  setSelectedDate: (dateStr) => {
    set({ selectedDate: dateStr, slots: [], slotsError: null })
    get().loadAvailability(dateStr)
  },

  // ── API actions ──────────────────────────────────────────────────────────
  loadAvailability: async (dateStr) => {
    set({ slotsLoading: true, slotsError: null })
    try {
      // Always use the browser's detected timezone for the query — it must match
      // the calendar, which is also rendered in browser-local time.
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const { slots } = await getAvailability(dateStr ?? get().selectedDate, tz)
      set({ slots, slotsLoading: false })
    } catch (err) {
      set({ slotsLoading: false, slotsError: err?.response?.data?.error ?? 'Failed to load availability' })
    }
  },

  loadMyReservations: async () => {
    set({ reservationsLoading: true })
    try {
      const { reservations } = await getMyReservations()
      set({ myReservations: reservations, reservationsLoading: false })
    } catch {
      set({ reservationsLoading: false })
    }
  },

  selectSlot: (slot) => set({ pendingSlot: slot, bookingError: null }),
  clearPendingSlot: () => set({ pendingSlot: null, bookingError: null }),

  confirmBooking: async () => {
    const { pendingSlot } = get()
    if (!pendingSlot) return
    set({ bookingLoading: true, bookingError: null })
    try {
      const result = await createReservation(pendingSlot.start, pendingSlot.onDemand)
      set({ bookingLoading: false, pendingSlot: null, lastBooked: result })
      await get().loadMyReservations()
      // Reload slots so availability refreshes
      await get().loadAvailability(get().selectedDate)
    } catch (err) {
      set({
        bookingLoading: false,
        bookingError: err?.response?.data?.error ?? 'Booking failed. Try again.',
      })
    }
  },

  extendReservation: async (id) => {
    try {
      await extendReservation(id)
      await get().loadMyReservations()
    } catch (err) {
      throw err
    }
  },

  cancelReservation: async (id) => {
    try {
      await cancelReservation(id)
      await get().loadMyReservations()
      await get().loadAvailability(get().selectedDate)
    } catch (err) {
      throw err
    }
  },

  endReservation: async (id) => {
    try {
      await endReservation(id)
      await get().loadMyReservations()
      await get().loadAvailability(get().selectedDate)
    } catch (err) {
      throw err
    }
  },

  dismissLastBooked: () => set({ lastBooked: null }),

  // ── Legacy session view helpers (BootingView / ReadyView) ────────────────
  selectNode:        (id)  => set((s) => ({ selectedNode: s.selectedNode === id ? null : id })),
  showIdleWarning:   ()    => set({ showIdleBar: true }),
  dismissIdleWarning: ()   => set({ showIdleBar: false }),
}))

export default useSandboxStore
