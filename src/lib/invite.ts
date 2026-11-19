import event from '../config/event.json'

export type Guest = { honorific: string; name: string; message?: string }
export type InviteData = {
  guest: Guest | null
  host: { name: string } | null
  contact: { phone: string } | null
}

const EMPTY: InviteData = { guest: null, host: null, contact: null }

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

export const displayName = (g: Guest | null) => (g ? [g.honorific, g.name].filter(Boolean).join(' ') : 'Bạn')

const digits = (phone: string) => phone.replace(/[^\d+]/g, '')
export const telHref = (phone: string) => `tel:${digits(phone)}`
export const zaloHref = (phone: string) => `https://zalo.me/${digits(phone).replace(/^\+84/, '0')}`
export const formatPhone = (phone: string) => digits(phone).replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3')

export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.mapsQuery)}`
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`
export { event }
