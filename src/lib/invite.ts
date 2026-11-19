import event from '../config/event.json'

export type Guest = { honorific: string; name: string; message?: string; self?: string }
export type InviteData = {
  guest: Guest | null
  contact: { phone: string } | null
}

const EMPTY: InviteData = { guest: null, contact: null }

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

/** "Anh Minh" — dùng cho tiêu đề, phong bì, vé */
export const guestName = (invite.guest ? [invite.guest.honorific, invite.guest.name].filter(Boolean).join(' ') : 'Bạn').normalize('NFC')
/** Cách gọi ngắn trong câu văn: "anh", "bạn", "cô"… */
export const guestPronoun = (invite.guest?.honorific || 'bạn').toLowerCase()
export const hostName: string | null = event.host?.name || null
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

/** Thời điểm bắt đầu theo giờ Việt Nam (UTC+7). Chưa có giờ thì lấy 07:00. */
export function eventStart(): Date {
  const [h, m] = (event.time ?? '07:00').split(':').map(Number)
  return new Date(Date.UTC(Y, M - 1, D, h - 7, m))
}

export { event }
