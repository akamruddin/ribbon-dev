function fmt(d) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function fold(line) {
  // RFC 5545: lines longer than 75 octets must be folded
  const out = []
  while (line.length > 75) {
    out.push(line.slice(0, 75))
    line = ' ' + line.slice(75)
  }
  out.push(line)
  return out.join('\r\n')
}

export function generateICS({ uid, summary, description, start, end, attendeeEmail }) {
  const organizer = process.env.EMAIL_FROM_ADDR ?? 'noreply@ribbondev.com'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ribbon DevCloud//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}@ribbondev.com`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    fold(`SUMMARY:${summary}`),
    fold(`DESCRIPTION:${(description ?? '').replace(/\n/g, '\\n')}`),
    `ORGANIZER:MAILTO:${organizer}`,
    `ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT:MAILTO:${attendeeEmail}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}
