// Thêm khách mới với mã ngẫu nhiên khó đoán.
//   npm run guest:add -- "Anh" "Minh" "Lời nhắn riêng (không bắt buộc)"
// In ra đường dẫn để gửi cho khách.

import crypto from 'node:crypto'
import fs from 'node:fs'
import { GUESTS_FILE, parseGuests } from './invite-data.mjs'

const [honorific = '', name, message] = process.argv.slice(2)
if (!name) {
  console.error('Cách dùng: npm run guest:add -- "<xưng hô>" "<tên>" ["<lời nhắn>"]')
  process.exit(1)
}

const data = fs.existsSync(GUESTS_FILE) ? JSON.parse(fs.readFileSync(GUESTS_FILE, 'utf8')) : { guests: [] }
const list = Array.isArray(data) ? data : (data.guests ??= [])
const taken = new Set(list.map((g) => String(g.code).toLowerCase()))

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789' // bỏ ký tự dễ nhầm: l, o, 0, 1
let code
do {
  code = Array.from(crypto.randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join('')
} while (taken.has(code))

list.push({ code, honorific, name, ...(message && { message }) })
parseGuests(JSON.stringify(list)) // kiểm tra lại toàn bộ danh sách trước khi ghi
fs.writeFileSync(GUESTS_FILE, JSON.stringify(Array.isArray(data) ? list : data, null, 2) + '\n')

const site = (process.env.SITE_URL || 'https://baovstorm.github.io/graduation-invitation-3d/').replace(/\/?$/, '/')
console.log(`Đã thêm ${[honorific, name].filter(Boolean).join(' ')} → ${site}${code}/`)
