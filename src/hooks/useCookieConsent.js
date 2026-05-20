import { useState, useCallback } from 'react'

const KEY = 'ribbon_consent'
const VERSION = 1

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Re-prompt if schema version changed
    if (parsed.version !== VERSION) return null
    return parsed
  } catch { return null }
}

function write(preferences) {
  const record = { version: VERSION, timestamp: new Date().toISOString(), ...preferences }
  localStorage.setItem(KEY, JSON.stringify(record))
  return record
}

export default function useCookieConsent() {
  const [consent, setConsent] = useState(read)

  const acceptAll = useCallback(() => {
    setConsent(write({ essential: true, analytics: false }))
  }, [])

  // Essential-only: same effect as acceptAll today since we have no analytics,
  // but the flag is here for future use.
  const essentialOnly = useCallback(() => {
    setConsent(write({ essential: true, analytics: false }))
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(KEY)
    setConsent(null)
  }, [])

  return {
    hasConsented: consent !== null,
    analytics: consent?.analytics ?? false,
    acceptAll,
    essentialOnly,
    reset,
  }
}
