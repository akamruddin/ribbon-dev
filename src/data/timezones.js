// Curated IANA timezone list for the profile selector
export const TIMEZONES = [
  { value: 'UTC',                    label: 'UTC / GMT',                  region: 'Universal' },
  // Americas
  { value: 'America/New_York',       label: 'Eastern Time (ET)',          region: 'Americas' },
  { value: 'America/Chicago',        label: 'Central Time (CT)',          region: 'Americas' },
  { value: 'America/Denver',         label: 'Mountain Time (MT)',         region: 'Americas' },
  { value: 'America/Phoenix',        label: 'Arizona (MST, no DST)',      region: 'Americas' },
  { value: 'America/Los_Angeles',    label: 'Pacific Time (PT)',          region: 'Americas' },
  { value: 'America/Anchorage',      label: 'Alaska Time (AKT)',          region: 'Americas' },
  { value: 'Pacific/Honolulu',       label: 'Hawaii (HST)',               region: 'Americas' },
  { value: 'America/Toronto',        label: 'Toronto (ET)',               region: 'Americas' },
  { value: 'America/Vancouver',      label: 'Vancouver (PT)',             region: 'Americas' },
  { value: 'America/Mexico_City',    label: 'Mexico City (CST)',          region: 'Americas' },
  { value: 'America/Sao_Paulo',      label: 'São Paulo (BRT)',            region: 'Americas' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)', region: 'Americas' },
  // Europe
  { value: 'Europe/London',          label: 'London (GMT/BST)',           region: 'Europe' },
  { value: 'Europe/Dublin',          label: 'Dublin (IST)',               region: 'Europe' },
  { value: 'Europe/Lisbon',          label: 'Lisbon (WET/WEST)',          region: 'Europe' },
  { value: 'Europe/Paris',           label: 'Paris / Amsterdam (CET)',    region: 'Europe' },
  { value: 'Europe/Berlin',          label: 'Berlin / Rome (CET)',        region: 'Europe' },
  { value: 'Europe/Stockholm',       label: 'Stockholm (CET)',            region: 'Europe' },
  { value: 'Europe/Helsinki',        label: 'Helsinki (EET)',             region: 'Europe' },
  { value: 'Europe/Athens',          label: 'Athens (EET)',               region: 'Europe' },
  { value: 'Europe/Istanbul',        label: 'Istanbul (TRT)',             region: 'Europe' },
  { value: 'Europe/Moscow',          label: 'Moscow (MSK)',               region: 'Europe' },
  // Middle East & Africa
  { value: 'Asia/Dubai',             label: 'Dubai / Abu Dhabi (GST)',    region: 'Middle East' },
  { value: 'Asia/Riyadh',            label: 'Riyadh (AST)',              region: 'Middle East' },
  { value: 'Asia/Beirut',            label: 'Beirut (EET)',              region: 'Middle East' },
  { value: 'Africa/Cairo',           label: 'Cairo (EET)',               region: 'Africa' },
  { value: 'Africa/Nairobi',         label: 'Nairobi (EAT)',             region: 'Africa' },
  { value: 'Africa/Johannesburg',    label: 'Johannesburg (SAST)',       region: 'Africa' },
  // Asia
  { value: 'Asia/Karachi',           label: 'Karachi (PKT)',             region: 'Asia' },
  { value: 'Asia/Kolkata',           label: 'India (IST)',               region: 'Asia' },
  { value: 'Asia/Dhaka',             label: 'Dhaka (BST)',               region: 'Asia' },
  { value: 'Asia/Bangkok',           label: 'Bangkok / Jakarta (ICT)',   region: 'Asia' },
  { value: 'Asia/Singapore',         label: 'Singapore / KL (SGT)',      region: 'Asia' },
  { value: 'Asia/Shanghai',          label: 'China (CST)',               region: 'Asia' },
  { value: 'Asia/Hong_Kong',         label: 'Hong Kong (HKT)',           region: 'Asia' },
  { value: 'Asia/Seoul',             label: 'Seoul (KST)',               region: 'Asia' },
  { value: 'Asia/Tokyo',             label: 'Tokyo (JST)',               region: 'Asia' },
  // Oceania
  { value: 'Australia/Perth',        label: 'Perth (AWST)',              region: 'Oceania' },
  { value: 'Australia/Sydney',       label: 'Sydney / Melbourne (AEDT)', region: 'Oceania' },
  { value: 'Pacific/Auckland',       label: 'Auckland (NZDT)',           region: 'Oceania' },
]

// Group timezones by region for <optgroup> rendering
export const TIMEZONES_BY_REGION = TIMEZONES.reduce((acc, tz) => {
  ;(acc[tz.region] ??= []).push(tz)
  return acc
}, {})

// Returns the IANA offset string for a timezone, e.g. "UTC−5"
export function tzOffset(tzName) {
  try {
    const f = new Intl.DateTimeFormat('en', {
      timeZone: tzName,
      timeZoneName: 'shortOffset',
    })
    const parts = f.formatToParts(new Date())
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? tzName
  } catch {
    return tzName
  }
}
