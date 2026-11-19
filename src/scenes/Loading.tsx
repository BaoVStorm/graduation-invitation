import gsap from 'gsap'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { PlaneIcon } from '../components/ui'
import { guestName, invite, photoUrl } from '../lib/invite'

const FONTS = [
  '900 64px "Playfair Display"',
  '700 64px "Playfair Display"',
  'italic 700 32px "Playfair Display"',
  '64px "Great Vibes"',
  '500 32px Oswald',
  '700 32px Oswald',
  '400 16px "Be Vietnam Pro"',
  '700 16px "Be Vietnam Pro"',
]
const SAMPLE = 'ăâđêôơưàảãáạằẳẵắặầẩẫấậèẻẽéẹềểễếệìỉĩíịòỏõóọồổỗốộờởỡớợùủũúụừửữứựỳỷỹýỵ ĐƯ'

async function preload(extra: Promise<unknown>[]) {
  const fonts = FONTS.map((f) => document.fonts.load(f, guestName + SAMPLE).catch(() => null))
  const img = new Image()
  img.src = photoUrl
  const photo = img.decode().catch(() => null)
  const minimum = new Promise((r) => setTimeout(r, 1800))
  await Promise.all([...fonts, photo, minimum, ...extra])
}

/** Cảnh 0 */
export function Loading({ onDone, extra }: { onDone: () => void; extra: Promise<unknown>[] }) {
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const plane = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(root.current, { autoAlpha: 0, duration: 0.6 })
      gsap.to([bar.current], { scaleX: 0.85, duration: 1.8, ease: 'power1.inOut' })
      gsap.to(plane.current, { left: '85%', duration: 1.8, ease: 'power1.inOut' })
    }, root)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    let alive = true
    preload(extra).then(() => {
      if (!alive) return
      gsap
        .timeline({ onComplete: () => alive && onDone() })
        .to(bar.current, { scaleX: 1, duration: 0.3 })
        .to(plane.current, { left: '100%', duration: 0.3 }, '<')
        .to(root.current, { autoAlpha: 0, y: -30, duration: 0.5, ease: 'power2.in' })
    })
    return () => {
      alive = false
    }
  }, [onDone, extra])

  return (
    <div ref={root} className="scene flex-col gap-6">
      <div className="relative h-px w-56 bg-white/15">
        <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-gold" />
        <div ref={plane} className="absolute -top-3 left-0 -translate-x-1/2 text-gold">
          <PlaneIcon className="size-6 rotate-90" />
        </div>
      </div>
      <p className="text-sm tracking-wide text-white/70">
        {invite.guest ? `Đang in vé mời cho ${guestName}…` : 'Đang chuẩn bị thư mời…'}
      </p>
    </div>
  )
}
