import gsap from 'gsap'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CapIcon, GoldButton, useExit } from '../components/ui'
import { sfx } from '../lib/audio'
import { asset, guestName, guestSelf, memories } from '../lib/invite'
import { useTilt } from '../lib/motion'

// góc nghiêng cố định cho từng tấm (không ngẫu nhiên mỗi lần render)
const tilt = (i: number) => (((i * 47) % 13) - 6) * 1.1

/**
 * Cảnh Kỷ niệm (chỉ có với khách có ảnh): xấp polaroid, chạm hoặc vuốt để lật từng tấm,
 * xem hết thì các tấm xếp lại thành một bức ghép.
 */
export function Memories({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLElement | null)[]>([])
  const tiltRef = useTilt<HTMLDivElement>(8)
  const exit = useExit(root)
  const [top, setTop] = useState(0) // số tấm đã lật
  const [finale, setFinale] = useState(false)
  const busy = useRef(false)
  const drag = useRef<{ x: number; id: number } | null>(null)
  const N = memories.length

  const layout = useMemo(() => {
    const cols = N <= 2 ? N : N <= 4 ? 2 : 3
    const rows = Math.ceil(N / cols)
    return { cols, rows }
  }, [N])

  // vào cảnh: chia ảnh xuống bàn, tấm dưới cùng trước
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      cards.current.forEach((el, i) => el && gsap.set(el, { xPercent: -50, yPercent: -50, rotation: tilt(i), zIndex: N - i }))
      const tl = gsap.timeline({ delay: 0.2 })
      tl.from('.mem-head > *', { autoAlpha: 0, y: 14, stagger: 0.12, duration: 0.6 }, 0)
      ;[...cards.current].reverse().forEach((el, k) => {
        if (!el) return
        tl.from(el, { y: '-=110vh', rotation: `+=${k % 2 ? 30 : -30}`, duration: 0.7, ease: 'power3.out' }, 0.3 + k * 0.16)
        tl.call(() => sfx('paper'), [], 0.55 + k * 0.16)
      })
      tl.from('.mem-hint', { autoAlpha: 0, y: 10, duration: 0.5 }, `>-0.1`)
    }, root)
    return () => ctx.revert()
  }, [N])

  const throwTop = (dir: number) => {
    if (busy.current || finale || top >= N) return
    const el = cards.current[top]
    if (!el) return
    busy.current = true
    sfx('whoosh')
    gsap.to(el, {
      x: dir * window.innerWidth * 0.95,
      y: -60,
      rotation: tilt(top) + dir * 32,
      autoAlpha: 0,
      duration: 0.55,
      ease: 'power2.in',
      onComplete: () => {
        busy.current = false
        const next = top + 1
        setTop(next)
        if (next >= N) showFinale()
      },
    })
  }

  const showFinale = () => {
    setFinale(true)
    sfx('chime')
    const box = stage.current!.getBoundingClientRect()
    const card = cards.current[0]!.getBoundingClientRect()
    const cw = cards.current[0]!.offsetWidth
    const ch = cards.current[0]!.offsetHeight
    const { cols, rows } = layout
    const scale = Math.min(0.62, (box.width * 0.96) / (cols * cw * 1.04), (window.innerHeight * 0.56) / (rows * ch * 1.04))
    void card
    cards.current.forEach((el, i) => {
      if (!el) return
      const col = i % cols
      const row = Math.floor(i / cols)
      const inRow = Math.min(cols, N - row * cols)
      gsap.fromTo(
        el,
        { autoAlpha: 0, x: 0, y: '-=40', scale: 0.3 },
        {
          autoAlpha: 1,
          x: (col - (inRow - 1) / 2) * cw * scale * 1.04,
          y: (row - (rows - 1) / 2) * ch * scale * 1.04,
          scale,
          rotation: tilt(i) * 0.8,
          duration: 0.8,
          delay: 0.1 + i * 0.09,
          ease: 'back.out(1.4)',
        },
      )
    })
    gsap.fromTo('.mem-end', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, delay: 0.5 + N * 0.09, stagger: 0.12 })
  }

  // kéo tấm trên cùng theo tay
  const onDown = (e: React.PointerEvent) => {
    if (finale || busy.current) return
    drag.current = { x: e.clientX, id: e.pointerId }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    const el = cards.current[top]
    if (!d || !el) return
    const dx = e.clientX - d.x
    gsap.set(el, { x: dx, rotation: tilt(top) + dx * 0.06 })
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dx = e.clientX - d.x
    const el = cards.current[top]
    if (Math.abs(dx) > 50) throwTop(Math.sign(dx))
    else if (Math.abs(dx) < 6) throwTop(top % 2 ? -1 : 1) // chạm
    else if (el) gsap.to(el, { x: 0, rotation: tilt(top), duration: 0.35, ease: 'back.out(2)' })
  }

  return (
    <div ref={root} className="absolute inset-0 flex flex-col items-center justify-between px-5 pt-[calc(max(14px,env(safe-area-inset-top))+44px)] pb-[max(28px,env(safe-area-inset-bottom))]">
      <header className="mem-head text-center">
        <p className="font-condensed text-[11px] tracking-[0.34em] text-gold uppercase">Kỷ niệm · {N} tấm ảnh</p>
        <h2 className="mt-2 font-name text-[2rem] leading-[1.1] text-[#f4ead2] italic">
          {finale ? 'Cảm ơn vì tất cả' : 'Những khoảnh khắc'}
          <br />
          <span className="gold-text not-italic">cùng {guestName}</span>
        </h2>
      </header>

      <div className="[perspective:1400px] w-full flex-1">
        <div ref={tiltRef} className="tilt relative h-full w-full">
          <div
            ref={stage}
            className="relative h-full w-full touch-none select-none"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            {memories.map((m, i) => (
              <figure key={m.src} ref={(el) => void (cards.current[i] = el)} className="pol" style={{ transform: `translateZ(${-i * 3}px)` }}>
                <span className="pol-tape" aria-hidden />
                <img src={asset(m.src)} alt={m.caption || `Kỷ niệm ${i + 1}`} width={m.w} height={m.h} draggable={false} />
                <figcaption>{m.caption || ' '}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      {finale ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="mem-end max-w-xs font-name text-lg leading-snug text-white/80 italic">
            Cảm ơn vì đã là một phần thanh xuân của {guestSelf}.
          </p>
          <GoldButton onClick={() => exit(onDone, { scale: 0.92 })} className="mem-end">
            <CapIcon /> Tung mũ ăn mừng
          </GoldButton>
        </div>
      ) : (
        <p className="mem-hint font-condensed text-[11px] tracking-[0.28em] text-white/60 uppercase">
          Chạm hoặc vuốt để xem tiếp · {Math.min(top + 1, N)}/{N}
        </p>
      )}
    </div>
  )
}
