import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'

/** Cảnh 2 (phần DOM): gợi ý chạm, cả màn hình là vùng chạm */
export function EnvelopeHint({ onTap, hidden }: { onTap: () => void; hidden: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hint', { autoAlpha: 0, y: 20, duration: 0.8, delay: 1.2 })
    }, root)
    return () => ctx.revert()
  }, [])
  useLayoutEffect(() => {
    if (hidden) gsap.to(root.current, { autoAlpha: 0, duration: 0.3 })
  }, [hidden])

  return (
    <div ref={root} className="absolute inset-0">
      <button type="button" aria-label="Mở phong bì" className="absolute inset-0 cursor-pointer" onClick={onTap} disabled={hidden} />
      <div className="hint pointer-events-none absolute inset-x-0 bottom-[12svh] flex flex-col items-center gap-3 text-center">
        <span className="ring-pulse relative grid size-12 place-items-center rounded-full border border-gold/70 text-gold">✦</span>
        <p className="text-sm tracking-[0.2em] text-white/80 uppercase">Chạm vào con dấu để mở</p>
      </div>
    </div>
  )
}
