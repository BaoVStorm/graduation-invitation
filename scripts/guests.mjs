// Quản lý danh sách khách mời (data/guests.json) ngay trên máy.
//
//   npm run guests          → menu: thêm / sửa / xoá / xem danh sách
//   npm run guests -- list  → chỉ in danh sách và đường dẫn
//
// Mỗi khách là một path riêng: https://<site>/<path>/
// Sau khi sửa xong: git add data/guests.json && git commit && git push → trang tự cập nhật.

import fs from 'node:fs'
import readline from 'node:readline'
import { stdin, stdout } from 'node:process'
import { GUESTS_FILE, parseGuests } from './invite-data.mjs'

const SITE = (process.env.SITE_URL || 'https://baovstorm.github.io/graduation-invitation/').replace(/\/?$/, '/')
const HONORIFICS = ['Bạn', 'Anh', 'Chị', 'Em', 'Thầy', 'Cô', 'Chú', 'Bác']
const c = { gold: (s) => `\x1b[33m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, red: (s) => `\x1b[31m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m` }

// ---------- dữ liệu ----------
function load() {
  if (!fs.existsSync(GUESTS_FILE)) return []
  const data = JSON.parse(fs.readFileSync(GUESTS_FILE, 'utf8'))
  return Array.isArray(data) ? data : (data.guests ?? [])
}
function save(list) {
  parseGuests(JSON.stringify(list)) // kiểm tra toàn bộ trước khi ghi
  const clean = list.map(({ code, honorific, name, self, message, ...rest }) => ({
    code,
    honorific,
    name,
    ...(self && self !== 'mình' && { self }),
    ...(message && { message }),
    ...rest, // giữ các trường nâng cao (you, letter) nếu có
  }))
  fs.writeFileSync(GUESTS_FILE, JSON.stringify({ guests: clean }, null, 2) + '\n')
}

/** "Thành Vinh" → "thanhvinh" */
function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

/** path gõ tay: bỏ dấu, chữ thường, giữ a-z 0-9 - _ */
const cleanPath = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')

const url = (code) => `${SITE}${code}`
const who = (g) => [g.honorific, g.name].filter(Boolean).join(' ')

function checkPath(code, list, except) {
  if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(code)) return 'Path chỉ gồm a-z, 0-9, dấu "-" hoặc "_" và dài 3–32 ký tự'
  if (['assets', 'images', 'audio', 'memories', 'index', '404'].includes(code)) return `"${code}" là tên hệ thống, chọn tên khác`
  if (list.some((g) => g.code === code && g.code !== except)) return `Path "${code}" đã có người dùng`
  return null
}

// ---------- hiển thị ----------
function printList(list) {
  if (!list.length) return console.log(c.dim('  (chưa có khách nào)'))
  const w = Math.max(...list.map((g) => g.code.length), 4)
  list.forEach((g, i) => {
    console.log(`  ${c.dim(String(i + 1).padStart(2))}. ${c.gold(g.code.padEnd(w))}  ${who(g)}${g.message ? c.dim('  ✉') : ''}`)
    console.log(`      ${c.dim(url(g.code))}`)
  })
  console.log(c.dim(`\n  Tổng: ${list.length} khách`))
}
function preview(g) {
  console.log(`\n  ${c.bold('Xem trước')}`)
  console.log(`  Path      : ${c.gold(g.code)}  →  ${url(g.code)}`)
  console.log(`  Gửi       : ${who(g)}`)
  console.log(`  Tự xưng   : ${g.self || 'mình'}`)
  console.log(`  Lời nhắn  : ${g.message || c.dim('(mặc định)')}`)
}

// ---------- hỏi đáp ----------
// Đọc từng dòng qua hàng đợi: chạy được cả khi gõ tay lẫn khi pipe dữ liệu vào
const rl = readline.createInterface({ input: stdin, output: stdout, terminal: !!stdin.isTTY })
const queue = []
const waiters = []
let closed = false
rl.on('line', (l) => (waiters.length ? waiters.shift()(l) : queue.push(l)))
rl.on('close', () => {
  closed = true
  while (waiters.length) waiters.shift()(null)
})
class Eof extends Error {}
function question(q) {
  stdout.write(q)
  if (queue.length) {
    const l = queue.shift()
    if (!stdin.isTTY) stdout.write(`${l}\n`)
    return Promise.resolve(l)
  }
  if (closed) return Promise.reject(new Eof())
  return new Promise((res, rej) => waiters.push((l) => (l === null ? rej(new Eof()) : res(l))))
}
async function ask(label, def = '', { required = false } = {}) {
  for (;;) {
    const hint = def ? c.dim(` [${def}]`) : ''
    const v = (await question(`  ${label}${hint}: `)).trim()
    if (v) return v
    if (def) return def
    if (!required) return ''
    console.log(c.red('  ✗ Không được để trống'))
  }
}
async function askPath(def, list, except) {
  for (;;) {
    const code = cleanPath(await ask('Path (đường dẫn)', def, { required: true })) || def
    const err = checkPath(code, list, except)
    if (!err) return code
    console.log(c.red(`  ✗ ${err}`))
  }
}
const yes = async (q) => /^(y|c|có|yes)?$/i.test((await question(`  ${q} ${c.dim('[Y/n]')}: `)).trim())

async function pick(list, verb) {
  if (!list.length) return console.log(c.dim('  (chưa có khách nào)')), null
  printList(list)
  const v = (await question(`\n  Chọn số thứ tự hoặc path để ${verb}: `)).trim().toLowerCase()
  const g = list[Number(v) - 1] ?? list.find((x) => x.code === v)
  if (!g) console.log(c.red('  ✗ Không tìm thấy'))
  return g ?? null
}

async function add(list) {
  console.log(`\n  ${c.bold('Thêm khách')}  ${c.dim(`Xưng hô gợi ý: ${HONORIFICS.join(', ')}`)}`)
  const name = await ask('Tên khách (vd: Thành Vinh)', '', { required: true })
  const honorific = await ask('Xưng hô', 'Bạn')
  const code = await askPath(slugify(name), list)
  const self = await ask('Bạn tự xưng là', honorific === 'Thầy' || honorific === 'Cô' || honorific === 'Anh' || honorific === 'Chị' ? 'em' : 'mình')
  const message = await ask('Lời nhắn riêng (Enter để dùng câu mặc định)')
  const g = { code, honorific, name, self, message }
  preview(g)
  if (!(await yes('Lưu khách này?'))) return console.log(c.dim('  Đã huỷ'))
  list.push(g)
  save(list)
  console.log(c.green(`\n  ✓ Đã thêm. Link gửi khách: ${url(code)}`))
  console.log(c.dim(`  Muốn có ảnh kỷ niệm: bỏ ảnh vào memories-src/${code}/ rồi chạy npm run memories`))
}

async function edit(list) {
  const g = await pick(list, 'sửa')
  if (!g) return
  console.log(c.dim('  Enter để giữ nguyên giá trị cũ'))
  const next = {
    name: await ask('Tên khách', g.name),
    honorific: await ask('Xưng hô', g.honorific),
    code: await askPath(g.code, list, g.code),
    self: await ask('Bạn tự xưng là', g.self || 'mình'),
    message: await ask('Lời nhắn riêng (gõ "-" để xoá)', g.message),
  }
  if (next.message === '-') next.message = ''
  preview(next)
  if (!(await yes('Lưu thay đổi?'))) return console.log(c.dim('  Đã huỷ'))
  Object.assign(g, next)
  save(list)
  console.log(c.green(`\n  ✓ Đã cập nhật. Link: ${url(g.code)}`))
}

async function remove(list) {
  const g = await pick(list, 'xoá')
  if (!g) return
  if (!(await yes(`Xoá ${who(g)} (${g.code})?`))) return console.log(c.dim('  Đã huỷ'))
  list.splice(list.indexOf(g), 1)
  save(list)
  console.log(c.green('  ✓ Đã xoá'))
}

// ---------- main ----------
const list = load()
if (process.argv[2] === 'list') {
  printList(list)
  rl.close()
} else {
  console.log(`\n  ${c.gold('🎓 Quản lý khách mời')}  ${c.dim(GUESTS_FILE)}`)
  for (;;) {
    console.log(`\n  ${c.bold('1')} Thêm khách   ${c.bold('2')} Sửa   ${c.bold('3')} Xoá   ${c.bold('4')} Xem danh sách   ${c.bold('0')} Thoát`)
    let choice
    try {
      choice = (await question('  Chọn: ')).trim()
      if (choice === '1') await add(list)
      else if (choice === '2') await edit(list)
      else if (choice === '3') await remove(list)
      else if (choice === '4') printList(list)
      else if (choice === '0' || choice === '') break
    } catch (e) {
      if (e instanceof Eof) break
      console.log(c.red(`  ✗ ${e.message}`))
    }
  }
  rl.close()
  console.log(c.dim('\n  Nhớ commit + push data/guests.json để cập nhật trang:'))
  console.log(c.dim('  git add data/guests.json && git commit -m "Cập nhật khách mời" && git push\n'))
}
