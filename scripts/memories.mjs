// Xử lý ảnh kỷ niệm cho khách đặc biệt (chạy ở máy).
//
//   1. Bỏ ảnh gốc vào  memories-src/<path khách>/   (ví dụ memories-src/thanhvinh/)
//      Tên file có thể chứa chú thích:  "01 - Đêm chạy đồ án.jpg"  → chú thích "Đêm chạy đồ án"
//   2. npm run memories
//   3. Sửa chú thích (nếu muốn) trong data/memories.json, rồi commit + push.
//
// Ảnh được xoay đúng chiều, thu về tối đa 1400px, nén WebP và XOÁ metadata (GPS, máy chụp).
// Ảnh gốc trong memories-src/ không được commit (đã gitignore).
// Khách không có thư mục trong memories-src/ thì giữ nguyên dữ liệu cũ, không bị xoá.

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { GUESTS_FILE, parseGuests } from './invite-data.mjs'

const SRC = 'memories-src'
const OUT = path.join('public', 'memories')
const MANIFEST = path.join('data', 'memories.json')
const EXT = /\.(jpe?g|png|webp|heic|heif|avif|tiff?)$/i
const MAX_PER_GUEST = 12

const c = { gold: (s) => `\x1b[33m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, red: (s) => `\x1b[31m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m` }

/** "01 - Đêm chạy đồ án.jpg" → "Đêm chạy đồ án"; "IMG_2041.jpg" → "" */
function captionFromName(file) {
  const base = path.parse(file).name.normalize('NFC')
  const text = base.replace(/^\d+\s*[-_.)]*\s*/, '').trim()
  if (!text || /^(img|dsc|pxl|photo|image|screenshot)[\s_-]*\d*/i.test(text) || /^[\d_\s-]+$/.test(text)) return ''
  return text.replace(/[_]+/g, ' ')
}

const naturalSort = (a, b) => a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' })

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}
const guests = fs.existsSync(GUESTS_FILE) ? parseGuests(fs.readFileSync(GUESTS_FILE, 'utf8')) : []
const codes = new Set(guests.map((g) => g.code))

if (!fs.existsSync(SRC)) {
  fs.mkdirSync(SRC, { recursive: true })
  console.log(c.dim(`Đã tạo thư mục ${SRC}/. Tạo thư mục con theo path khách (ví dụ ${SRC}/thanhvinh/) rồi bỏ ảnh vào.`))
}

const dirs = fs
  .readdirSync(SRC, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name.toLowerCase())

let total = 0
for (const code of dirs) {
  if (!codes.has(code)) {
    console.log(c.red(`✗ ${SRC}/${code}/: không có khách nào dùng path "${code}" trong ${GUESTS_FILE}, bỏ qua`))
    continue
  }
  const files = fs
    .readdirSync(path.join(SRC, code))
    .filter((f) => EXT.test(f))
    .sort(naturalSort)
  if (files.length > MAX_PER_GUEST) console.log(c.gold(`! ${code}: có ${files.length} ảnh, chỉ lấy ${MAX_PER_GUEST} ảnh đầu`))

  const outDir = path.join(OUT, code)
  fs.rmSync(outDir, { recursive: true, force: true })
  const old = new Map((manifest[code] ?? []).map((m) => [m.from, m.caption]))

  if (!files.length) {
    delete manifest[code]
    console.log(c.dim(`- ${code}: thư mục trống → đã xoá ảnh kỷ niệm`))
    continue
  }
  fs.mkdirSync(outDir, { recursive: true })

  const list = []
  for (const [i, file] of files.slice(0, MAX_PER_GUEST).entries()) {
    const name = `${String(i + 1).padStart(2, '0')}.webp`
    const info = await sharp(path.join(SRC, code, file))
      .rotate() // theo hướng EXIF
      .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(outDir, name))
    list.push({
      src: `memories/${code}/${name}`,
      from: file,
      caption: old.get(file) ?? captionFromName(file),
      w: info.width,
      h: info.height,
    })
  }
  manifest[code] = list
  total += list.length
  const kb = list.reduce((s, m) => s + fs.statSync(path.join('public', m.src)).size, 0) / 1024
  console.log(c.green(`✓ ${code}: ${list.length} ảnh (${Math.round(kb)} KB)`))
  list.forEach((m) => console.log(c.dim(`    ${m.src}  ←  ${m.from}${m.caption ? `  "${m.caption}"` : ''}`)))
}

// sắp xếp theo thứ tự khách cho dễ đọc
const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]))
fs.writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n')
console.log(`\n${total ? c.green(`Đã xử lý ${total} ảnh.`) : c.dim('Không có ảnh mới.')} Chú thích sửa trong ${MANIFEST}.`)
console.log(c.dim('Nhớ commit: git add public/memories data/memories.json && git commit -m "Ảnh kỷ niệm" && git push'))
