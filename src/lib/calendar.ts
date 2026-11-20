import { event, eventDay, eventEnd, eventStart } from './invite'

const pad = (n: number) => String(n).padStart(2, '0')
const utcStamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
const dayStamp = (y: number, m: number, d: number) => `${y}${pad(m)}${pad(d)}`

const title = `${event.title} ${event.classOf}`
const location = `${event.venue.name} – ${event.venue.short}`

function range() {
  if (event.time) {
    const start = eventStart()
    const end = event.endTime ? eventEnd() : new Date(start.getTime() + 2 * 3600_000)
    return { start: utcStamp(start), end: utcStamp(end), allDay: false }
  }
  const { year, month, day } = eventDay
  const next = new Date(Date.UTC(year, month - 1, day + 1))
  return {
    start: dayStamp(year, month, day),
    end: dayStamp(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()),
    allDay: true,
  }
}

export function googleCalendarUrl(details: string) {
  const r = range()
  const p = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${r.start}/${r.end}`, location, details })
  return `https://calendar.google.com/calendar/render?${p}`
}

export function downloadIcs(details: string) {
  const r = range()
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
  const dt = (k: string, v: string) => (r.allDay ? `${k};VALUE=DATE:${v}` : `${k}:${v}`)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//graduation-invitation//VI',
    'BEGIN:VEVENT',
    `UID:graduation-${eventDay.year}@invite`,
    `DTSTAMP:${utcStamp(new Date())}`,
    dt('DTSTART', r.start),
    dt('DTEND', r.end),
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(details)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT12H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'le-tot-nghiep-2026.ics' })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
