import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { PlaneIcon } from '../components/ui'

const CLOUDS = Array.from({ length: 12 }, (_, i) => ({
  top: (i * 37) % 90,
  size: 120 + ((i * 53) % 160),
  layer: i % 3,
}))

/** Cảnh 5: chuyến bay SV → TK (tự chạy 3.2s) */
export function Flight({ onArrive }: { onArrive: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const plane = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const p = path.current!
    const len = p.getTotalLength()
    const progress = { t: 0 }
    const ctx = gsap.context(() => {
      gsap.set(p, { attr: { 'stroke-dasharray': '6 8' } })
      gsap.set('.mask-line', { attr: { 'stroke-dasharray': len, 'stroke-dashoffset': len } })
      gsap.from(root.current, { autoAlpha: 0, duration: 0.4 })
      document.querySelectorAll<HTMLElement>('.cloud').forEach((c) => {
        const layer = Number(c.dataset.layer)
        gsap.fromTo(c, { x: '110vw' }, { x: '-60vw', duration: 3.4 - layer * 0.8, ease: 'none', delay: -Math.random() * 2 })
      })
      gsap
        .timeline({ onComplete: onArrive })
        .to('.mask-line', { attr: { 'stroke-dashoffset': 0 }, duration: 2.2, ease: 'power1.inOut' }, 0.2)
        .to(
          progress,
          {
            t: 1,
            duration: 2.2,
            ease: 'power1.inOut',
            onUpdate: () => {
              const a = p.getPointAtLength(progress.t * len)
              const b = p.getPointAtLength(Math.min(len, progress.t * len + 1))
              const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
              const svg = p.ownerSVGElement!.getBoundingClientRect()
              const sx = svg.width / 400
              const sy = svg.height / 300
              gsap.set(plane.current, { x: a.x * sx, y: a.y * sy, rotate: angle + 90 })
            },
          },
          0.2,
        )
        .from('.from', { autoAlpha: 0, y: 10, duration: 0.4 }, 0)
        .from('.to', { autoAlpha: 0, y: 10, duration: 0.4 }, 1.8)
        .to('.going', { autoAlpha: 0, duration: 0.3 }, 1.6)
        .from('.future', { autoAlpha: 0, scale: 0.8, duration: 0.6, ease: 'back.out(2)' }, 1.9)
        .to(root.current, { autoAlpha: 0, scale: 1.15, duration: 0.6, ease: 'power2.in' }, 2.7)
    }, root)
    return () => ctx.revert()
  }, [onArrive])

  return (
    <div ref={root} className="scene overflow-hidden bg-[radial-gradient(ellipse_at_50%_120%,#2a46b8_0%,transparent_60%)]">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          data-layer={c.layer}
          className="cloud pointer-events-none absolute rounded-full bg-white blur-2xl"
          style={{ top: `${c.top}%`, width: c.size * (1 + c.layer * 0.5), height: c.size * 0.45, opacity: 0.06 + c.layer * 0.05 }}
        />
      ))}
      <div className="relative aspect-[4/3] w-[min(92vw,560px)]">
        <svg viewBox="0 0 400 300" className="absolute inset-0 size-full overflow-visible">
          <path ref={path} d="M40 250 C 120 240, 140 90, 230 110 S 330 60, 360 40" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <path
            className="mask-line"
            d="M40 250 C 120 240, 140 90, 230 110 S 330 60, 360 40"
            fill="none"
            stroke="#ffcf33"
            strokeWidth="2.5"
          />
          <circle cx="40" cy="250" r="6" fill="#ffcf33" />
          <circle cx="360" cy="40" r="6" fill="#1e9a52" />
        </svg>
        <div ref={plane} className="absolute top-0 left-0 -mt-4 -ml-4 text-gold drop-shadow-[0_0_12px_rgba(255,207,51,.8)]">
          <PlaneIcon className="size-8" />
        </div>
        <div className="from absolute bottom-[2%] left-[2%] font-condensed text-lg font-bold tracking-widest">SINH VIÊN</div>
        <div className="to absolute top-[-4%] right-[0%] font-condensed text-lg font-bold tracking-widest text-green">TÂN KHOA</div>
        <div className="absolute inset-x-0 top-[46%] grid place-items-center text-center">
          <p className="going col-start-1 row-start-1 font-display text-2xl italic text-white/80">Đang bay đến…</p>
          <p className="future col-start-1 row-start-1 font-display text-5xl font-black text-gold">Tương lai ✦</p>
        </div>
      </div>
    </div>
  )
}
