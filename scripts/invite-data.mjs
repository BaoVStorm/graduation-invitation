// Nạp dữ liệu cá nhân từ biến môi trường (GitHub Secrets) và render vào HTML.
// Dùng chung cho dev server (vite.config.ts) và bước prerender sau khi build.
//
// Quy tắc bảo mật: dữ liệu secret KHÔNG bao giờ được import vào bundle JS.
// Nó chỉ được nhúng vào HTML của đúng trang khách có mã hợp lệ.

import fs from 'node:fs'
import path from 'node:path'

export const SECRET_KEYS = ['SECRET_PHONE', 'SECRET_HOST_NAME', 'SECRET_GUESTS_JSON']

const CODE_RE = /^[a-z0-9][a-z0-9-]{2,31}$/
// Tên thư mục đã dùng trong dist/, không được làm mã khách
const RESERVED = new Set(['assets', 'images', 'index', '404'])

const clean = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null)

export function readEvent(root = process.cwd()) {
  return JSON.parse(fs.readFileSync(path.join(root, 'src', 'config', 'event.json'), 'utf8'))
}

export function loadSecrets(env = process.env, root = process.cwd()) {
  let raw = clean(env.SECRET_GUESTS_JSON)
  if (!raw) {
    const local = path.join(root, 'data', 'guests.json')
    if (fs.existsSync(local)) raw = fs.readFileSync(local, 'utf8')
  }
  return {
    phone: clean(env.SECRET_PHONE),
    hostName: clean(env.SECRET_HOST_NAME),
    guests: raw ? parseGuests(raw) : [],
  }
}

export function parseGuests(raw) {
  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    throw new Error(`SECRET_GUESTS_JSON không phải JSON hợp lệ: ${e.message}`)
  }
  const list = Array.isArray(data) ? data : data?.guests
  if (!Array.isArray(list)) throw new Error('SECRET_GUESTS_JSON phải là mảng hoặc { "guests": [...] }')

  const seen = new Set()
  return list.map((g, i) => {
    const code = String(g?.code ?? '').trim().toLowerCase()
    if (!CODE_RE.test(code)) throw new Error(`Khách #${i + 1}: mã "${g?.code ?? ''}" không hợp lệ (3–32 ký tự a-z, 0-9, dấu -)`)
    if (RESERVED.has(code)) throw new Error(`Khách #${i + 1}: mã "${code}" trùng tên thư mục hệ thống`)
    if (seen.has(code)) throw new Error(`Mã "${code}" bị trùng`)
    seen.add(code)
    const name = String(g?.name ?? '').trim()
    if (!name) throw new Error(`Khách "${code}": thiếu "name"`)
    const message = String(g?.message ?? '').trim()
    return { code, name, honorific: String(g?.honorific ?? '').trim(), ...(message && { message }) }
  })
}

/** Dữ liệu nhúng vào trang. Trang chung (guest = null) không chứa bất kỳ secret nào. */
export function payloadFor(secrets, guest) {
  if (!guest) return { guest: null, host: null, contact: null }
  const { code, ...info } = guest
  return {
    guest: info,
    host: secrets.hostName ? { name: secrets.hostName } : null,
    contact: secrets.phone ? { phone: secrets.phone } : null,
  }
}

export function metaFor(guest, event) {
  const who = guest ? [guest.honorific, guest.name].filter(Boolean).join(' ') : null
  return {
    title: who ? `Thư mời tốt nghiệp · Gửi ${who}` : `Thư mời ${event.title} ${event.classOf}`,
    description: `${event.weekday}, ${formatDate(event.date)} · ${event.venue.name} – ${event.venue.short}`,
  }
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export function renderPage(template, { payload, title, description, url, image }) {
  const json = JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(new RegExp('[' + String.fromCharCode(0x2028, 0x2029) + ']', 'g'), (c) => '\\u' + c.charCodeAt(0).toString(16))
  const meta = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="noindex, nofollow" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="vi_VN" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    url && `<meta property="og:url" content="${esc(url)}" />`,
    image && `<meta property="og:image" content="${esc(image)}" />`,
    image && `<meta property="og:image:width" content="1200" />`,
    image && `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ]
    .filter(Boolean)
    .join('\n    ')

  if (!template.includes('<!--app-meta-->') || !template.includes('<!--app-data-->')) {
    throw new Error('index.html thiếu placeholder <!--app-meta--> hoặc <!--app-data-->')
  }
  return template
    .replace('<!--app-meta-->', meta)
    .replace('<!--app-data-->', `<script id="invite-data" type="application/json">${json}</script>`)
}

/** Lấy mã khách từ URL, ví dụ "/graduation-invitation-3d/a7k2/?x=1" → "a7k2" */
export function codeFromUrl(url, base = '/') {
  let p = decodeURIComponent(String(url).split(/[?#]/)[0])
  if (base !== '/' && p.startsWith(base)) p = p.slice(base.length)
  return p.replace(/^\/+/, '').split('/')[0].toLowerCase() || null
}
