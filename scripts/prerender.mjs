// Chạy sau `vite build`: tạo một trang HTML riêng cho từng mã khách.
//   dist/index.html        → bản mời chung (không có secret)
//   dist/404.html          → mã sai hoặc chưa cấu hình → cũng là bản mời chung
//   dist/<code>/index.html → trang riêng, có tên khách, lời nhắn, liên hệ

import fs from 'node:fs'
import path from 'node:path'
import { loadSecrets, metaFor, payloadFor, readEvent, renderPage } from './invite-data.mjs'

const dist = path.resolve('dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const event = readEvent()
const secrets = loadSecrets()

const site = process.env.SITE_URL ? process.env.SITE_URL.replace(/\/?$/, '/') : ''
const image = site ? `${site}images/og.jpg` : undefined

function write(rel, html) {
  const file = path.join(dist, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
}

const generic = renderPage(template, { payload: payloadFor(secrets, null), ...metaFor(null, event), url: site || undefined, image })
write('index.html', generic)
write('404.html', generic)

for (const guest of secrets.guests) {
  write(
    path.join(guest.code, 'index.html'),
    renderPage(template, {
      payload: payloadFor(secrets, guest),
      ...metaFor(guest, event),
      url: site ? `${site}${guest.code}/` : undefined,
      image,
    }),
  )
}

// Chỉ in trạng thái, KHÔNG in giá trị secret ra log CI
const flag = (v) => (v ? 'đã cấu hình' : 'CHƯA cấu hình')
console.log(`[prerender] ${secrets.guests.length} trang khách + trang chung`)
console.log(`[prerender] SECRET_PHONE: ${flag(secrets.phone)} · SECRET_HOST_NAME: ${flag(secrets.hostName)} · SECRET_GUESTS_JSON: ${flag(secrets.guests.length)}`)
if (!site) console.log('[prerender] SITE_URL trống → bỏ qua og:url / og:image')
