import event from '../config/event.json'

export type Memory = { src: string; caption: string; w: number; h: number }
export type Guest = { honorific: string; name: string; message?: string; self?: string; memories?: Memory[] }
export type InviteData = {
  guest: Guest | null
  contact: { phone: string } | null
  /** endpoint gửi lời chúc (từ SECRET_WISH_EMAIL) */
  wish: { endpoint: string } | null
}

const EMPTY: InviteData = { guest: null, contact: null, wish: null }

/** Dữ liệu được prerender nhúng vào HTML của từng trang khách. */
export function readInvite(): InviteData {
  const text = document.getElementById('invite-data')?.textContent
  if (!text) return EMPTY
  try {
    return { ...EMPTY, ...JSON.parse(text) }
  } catch {
    return EMPTY
  }
}

export const invite = readInvite()
/** Ảnh kỷ niệm của khách này (rỗng nếu không có) */
export const memories: Memory[] = invite.guest?.memories ?? []

/** "Anh Minh" — dùng cho tiêu đề, phong bì, vé */
export const guestName = (invite.guest ? [invite.guest.honorific, invite.guest.name].filter(Boolean).join(' ') : 'Bạn').normalize('NFC')
/** Cách gọi ngắn trong câu văn: "anh", "bạn", "cô"… */
export const guestPronoun = (invite.guest?.honorific || 'bạn').toLowerCase()
export const hostName: string | null = event.host?.name || null
export const studentId: string | null = event.host?.studentId || null
/** Cách chủ nhân tự xưng với khách này: "mình" (mặc định), "em", "con"… */
export const guestSelf = invite.guest?.self || 'mình'

const digits = (phone: string) => phone.replace(/[^\d+]/g, '')
export const telHref = (phone: string) => `tel:${digits(phone)}`
export const zaloHref = (phone: string) => `https://zalo.me/${digits(phone).replace(/^\+84/, '0')}`
export const formatPhone = (phone: string) => digits(phone).replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3')

export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.mapsQuery)}`
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`
export const photoUrl = asset(event.photo)

const [Y, M, D] = event.date.split('-').map(Number)
export const eventDay = { year: Y, month: M, day: D }
export const dateLabel = `${String(D).padStart(2, '0')}.${String(M).padStart(2, '0')}.${Y}`

const atVN = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(Date.UTC(Y, M - 1, D, h - 7, m))
}
/** Thời điểm bắt đầu / kết thúc theo giờ Việt Nam (UTC+7) */
export const eventStart = () => atVN(event.time || '07:00')
export const eventEnd = () => atVN(event.endTime || event.time || '10:00')
/** "10:00 – 12:00" */
export const timeLabel = event.time ? (event.endTime ? `${event.time} – ${event.endTime}` : event.time) : null
/** "10:00 – 12:00 sáng" */
export const timeLabelLong = timeLabel ? `${timeLabel} ${Number(event.time.split(':')[0]) < 12 ? 'sáng' : 'chiều'}` : null

export { event }
