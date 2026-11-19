import * as THREE from 'three'

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Nền giấy kem có hạt và sợi */
function paper(ctx: CanvasRenderingContext2D, w: number, h: number, base = '#f4ecd9') {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)
  const g = ctx.createRadialGradient(w * 0.4, h * 0.35, 0, w / 2, h / 2, Math.max(w, h) * 0.75)
  g.addColorStop(0, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(150,120,70,0.18)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  let s = 42
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < (w * h) / 60; i++) {
    ctx.fillStyle = `rgba(${rnd() > 0.5 ? '120,95,55' : '255,255,255'},${rnd() * 0.08})`
    ctx.fillRect(rnd() * w, rnd() * h, 1.5, 1.5)
  }
  ctx.strokeStyle = 'rgba(140,110,60,0.05)'
  for (let i = 0; i < 60; i++) {
    ctx.beginPath()
    const x = rnd() * w
    const y = rnd() * h
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + rnd() * 40, y + rnd() * 10, x + rnd() * 80, y + rnd() * 20)
    ctx.stroke()
  }
}

function fitText(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, maxW: number, start: number) {
  let px = start
  ctx.font = font(px)
  while (ctx.measureText(text).width > maxW && px > 20) {
    px -= 4
    ctx.font = font(px)
  }
  return px
}

export function paperTexture(base?: string) {
  const [c, ctx] = canvas(512, 512)
  paper(ctx, 512, 512, base)
  return toTexture(c)
}

/** Mặt trước phong bì (túi chữ V) có tên khách. UV phủ toàn bộ phong bì. */
export function pocketTexture(name: string) {
  const W = 1536
  const H = 1024
  const [c, ctx] = canvas(W, H)
  paper(ctx, W, H)
  // viền vàng mảnh
  ctx.strokeStyle = 'rgba(196,154,60,0.55)'
  ctx.lineWidth = 3
  ctx.strokeRect(36, 36, W - 72, H - 72)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  // "Gửi" viết tay + tên khách trên cùng một dòng, nằm dưới con dấu
  const px = fitText(ctx, name, (p) => `900 ${p}px "Playfair Display"`, W * 0.66, 120)
  const nameW = ctx.measureText(name).width
  ctx.font = `${Math.round(px * 0.9)}px "Great Vibes"`
  const hiW = ctx.measureText('Gửi ').width
  const x0 = W / 2 - (nameW + hiW) / 2
  ctx.textAlign = 'left'
  ctx.fillStyle = '#b8892f'
  ctx.fillText('Gửi ', x0, H * 0.83)
  ctx.fillStyle = '#13235e'
  ctx.font = `900 ${px}px "Playfair Display"`
  ctx.fillText(name, x0 + hiW, H * 0.83)
  // dòng nhỏ
  ctx.textAlign = 'center'
  ctx.fillStyle = '#1e9a52'
  ctx.font = '500 34px Oswald'
  ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '10px'
  ctx.fillText('THƯ MỜI LỄ TỐT NGHIỆP · 2026', W / 2, H * 0.92)
  return toTexture(c)
}

/** Tấm vé bên trong phong bì: phần nhô lên khi mở thư */
export function letterTexture() {
  const W = 1024
  const H = 640
  const [c, ctx] = canvas(W, H)
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#1b2f7e')
  g.addColorStop(1, '#0f1f5c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(255,207,51,0.6)'
  ctx.lineWidth = 4
  ctx.strokeRect(24, 24, W - 48, H - 48)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffcf33'
  ctx.font = '700 84px Oswald'
  ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '6px'
  ctx.fillText('✈ GRADUATION AIR', W / 2, 150)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '500 34px Oswald'
  ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '12px'
  ctx.fillText('BOARDING PASS · VÉ MỜI · 2026', W / 2, 220)
  return toTexture(c)
}

/** Mặt sáp niêm phong */
export function sealTexture() {
  const S = 512
  const [c, ctx] = canvas(S, S)
  const g = ctx.createRadialGradient(S * 0.42, S * 0.38, S * 0.05, S / 2, S / 2, S / 2)
  g.addColorStop(0, '#d8383c')
  g.addColorStop(0.7, '#a3161d')
  g.addColorStop(1, '#6e0b10')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  ctx.strokeStyle = 'rgba(255,215,120,0.75)'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(S / 2, S / 2, S * 0.36, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(S / 2, S / 2, S * 0.31, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#ffd979'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 118px "Playfair Display"'
  ctx.fillText('2026', S / 2, S / 2 + 6)
  ctx.font = '500 30px Oswald'
  ctx.fillText('✦ CLASS OF ✦', S / 2, S / 2 - 88)
  return toTexture(c)
}

/** Chấm sáng mềm cho hạt bụi vàng */
export function dotTexture() {
  const S = 64
  const [c, ctx] = canvas(S, S)
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,230,150,0.9)')
  g.addColorStop(1, 'rgba(255,200,80,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  return toTexture(c)
}
