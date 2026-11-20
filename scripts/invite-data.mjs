// Nạp dữ liệu khách + secret và render vào HTML.
// Dùng chung cho dev server (vite.config.ts) và bước prerender sau khi build.
//
// - Danh sách khách: data/guests.json (commit trong repo, chủ nhân tự cấu hình).
// - Secret duy nhất: SECRET_PHONE (GitHub Secret). Không bao giờ vào bundle JS,
//   chỉ được nhúng vào HTML của trang khách có mã hợp lệ.

import fs from 'node:fs'
import path from 'node:path'

export const SECRET_KEYS = ['SECRET_PHONE', 'SECRET_WISH_EMAIL']

const CODE_RE = /^[a-z0-9][a-z0-9_-]{2,31}$/
// Tên thư mục đã dùng trong dist/, không được làm mã khách
const RESERVED = new Set(['assets', 'images', 'audio', 'memories', 'index', '404'])

const clean = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null)

export const GUESTS_FILE = path.join('data', 'guests.json')
export const MEMORIES_FILE = path.join('data', 'memories.json')

/** Ảnh kỷ niệm theo path khách (tạo bằng npm run memories) */
function readMemories(root) {
  const file = path.join(root, MEMORIES_FILE)
  if (!fs.existsSync(file)) return {}
  const data = JSON.parse(fs.readFileSync(file, 'utf8'))
  for (const [code, list] of Object.entries(data)) {
    for (const m of list) {
      if (!fs.existsSync(path.join(root, 'public', m.src))) throw new Error(`${MEMORIES_FILE}: thiếu file public/${m.src} (khách "${code}"). Chạy lại npm run memories.`)
    }
  }
  return data
}

export function readEvent(root = process.cwd()) {
  return JSON.parse(fs.readFileSync(path.join(root, 'src', 'config', 'event.json'), 'utf8'))
}

export function loadSecrets(env = process.env, root = process.cwd()) {
  const file = path.join(root, GUESTS_FILE)
  return {
    phone: clean(env.SECRET_PHONE),
    wishEndpoint: wishEndpoint(clean(env.SECRET_WISH_EMAIL)),
    guests: fs.existsSync(file) ? parseGuests(fs.readFileSync(file, 'utf8')) : [],
    memories: readMemories(root),
  }
}

export function parseGuests(raw) {
  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    throw new Error(`${GUESTS_FILE} không phải JSON hợp lệ: ${e.message}`)
  }
  const list = Array.isArray(data) ? data : data?.guests
  if (!Array.isArray(list)) throw new Error(`${GUESTS_FILE} phải là mảng hoặc { "guests": [...] }`)

  const seen = new Set()
  return list.map((g, i) => {
    const code = String(g?.code ?? '').trim().toLowerCase()
    if (!CODE_RE.test(code)) throw new Error(`Khách #${i + 1}: mã "${g?.code ?? ''}" không hợp lệ (3–32 ký tự a-z, 0-9, dấu - hoặc _)`)
    if (RESERVED.has(code)) throw new Error(`Khách #${i + 1}: mã "${code}" trùng tên thư mục hệ thống`)
    if (seen.has(code)) throw new Error(`Mã "${code}" bị trùng`)
    seen.add(code)
    const name = String(g?.name ?? '').trim()
    if (!name) throw new Error(`Khách "${code}": thiếu "name"`)
    const opt = (k) => String(g?.[k] ?? '').trim()
    const [message, self, you, letter] = [opt('message'), opt('self'), opt('you'), opt('letter')]
    return {
      code,
      name,
      honorific: opt('honorific'),
      ...(message && { message }),
      ...(self && { self }),
      ...(you && { you }), // cách gọi khách trong câu văn, ví dụ "cả nhà"
      ...(letter && { letter }), // đoạn thư riêng thay cho đoạn chung (đoạn cách nhau bằng dòng trống)
    }
  })
}

/**
 * SECRET_WISH_EMAIL nhận email (gửi qua FormSubmit) hoặc một URL endpoint đầy đủ
 * (ví dụ alias ngẫu nhiên của FormSubmit, hoặc dịch vụ khác nhận JSON POST).
 */
function wishEndpoint(v) {
  if (!v) return null
  if (/^https?:\/\//.test(v)) return v
  if (!/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(v)) throw new Error('SECRET_WISH_EMAIL không phải email hoặc URL hợp lệ')
  return `https://formsubmit.co/ajax/${v}`
}

/** Dữ liệu nhúng vào trang. Trang chung (guest = null) không chứa số điện thoại. */
export function payloadFor(secrets, guest) {
  const wish = secrets.wishEndpoint ? { endpoint: secrets.wishEndpoint } : null
  if (!guest) return { guest: null, contact: null, wish }
  const { code, ...info } = guest
  const memories = (secrets.memories?.[code] ?? []).map(({ src, caption, w, h }) => ({ src, caption, w, h }))
  return { guest: { ...info, ...(memories.length && { memories }) }, contact: secrets.phone ? { phone: secrets.phone } : null, wish }
}

export function metaFor(guest, event) {
  const who = guest ? [guest.honorific, guest.name].filter(Boolean).join(' ') : null
  return {
    title: who
      ? `Thư mời tốt nghiệp · Gửi ${who}`
      : `${event.host?.name ? `${event.host.name} đã` : 'Chính thức'} tốt nghiệp! 🎓 Class of ${event.classOf}`,
    description: who
      ? `${event.weekday}, ${formatDate(event.date)} · ${event.venue.name} – ${event.venue.short}`
      : `${event.venue.name} – ${event.venue.short} · Lễ tốt nghiệp ${formatDate(event.date)}`,
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
    `<meta property="og:site_name" content="Lễ Tốt Nghiệp 2026" />`,
    image && `<meta property="og:image" content="${esc(image)}" />`,
    image && `<meta property="og:image:secure_url" content="${esc(image)}" />`,
    image && `<meta property="og:image:type" content="image/jpeg" />`,
    image && `<meta property="og:image:width" content="1200" />`,
    image && `<meta property="og:image:height" content="630" />`,
    image && `<meta property="og:image:alt" content="Ảnh tốt nghiệp của tân khoa" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    image && `<meta name="twitter:image" content="${esc(image)}" />`,
    image && `<link rel="image_src" href="${esc(image)}" />`,
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

/** Lấy mã khách từ URL, ví dụ "/graduation-invitation/a7k2/?x=1" → "a7k2" */
export function codeFromUrl(url, base = '/') {
  let p = decodeURIComponent(String(url).split(/[?#]/)[0])
  if (base !== '/' && p.startsWith(base)) p = p.slice(base.length)
  return p.replace(/^\/+/, '').split('/')[0].toLowerCase() || null
}
