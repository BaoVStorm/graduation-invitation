import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { EnvelopeIcon, GuestName, Split, useExit } from '../components/ui'
import { audio, sfx } from '../lib/audio'
import { requestMotionPermission } from '../lib/motion'

/** Cảnh 1: lời dẫn → tên khách → nút Mở thư */
export function Intro({ onOpen }: { onOpen: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const exit = useExit(root)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.3 })
        .from('.l1 .ch', { opacity: 0, y: 8, stagger: 0.028, duration: 0.5, ease: 'power2.out' })
        .from('.l2 .ch', { opacity: 0, y: 8, stagger: 0.022, duration: 0.5, ease: 'power2.out' }, 1.6)
        .to('.lead', { opacity: 0, y: -14, filter: 'blur(6px)', duration: 0.6 }, 3.6)
        .from('.for', { opacity: 0, letterSpacing: '0.9em', duration: 0.9, ease: 'power2.out' }, 3.9)
        .from('.who .ch', { opacity: 0, y: 30, rotateX: -90, stagger: 0.045, duration: 0.7, ease: 'back.out(2)' }, 4.1)
        .from('.glow', { opacity: 0, scale: 0.6, duration: 1.2 }, 4.1)
        .from('.cta', { autoAlpha: 0, scale: 0.6, duration: 0.6, ease: 'back.out(2.5)' }, '-=0.3')
    }, root)
    return () => ctx.revert()
  }, [])

  const open = () => {
    void requestMotionPermission()
    audio.start()
    sfx('tap')
    sfx('whoosh')
    exit(onOpen, { scale: 1.08, filter: 'blur(8px)' })
  }

  return (
    <div ref={root} className="scene flex-col px-8 text-center">
      <div className="grid place-items-center">
        <div className="lead col-start-1 row-start-1 space-y-3 font-display text-2xl italic leading-snug text-white/90 sm:text-3xl">
          <p className="l1">
            <Split text="Có những chặng đường rất dài…" />
          </p>
          <p className="l2 text-gold-soft">
            <Split text="…và có những khoảnh khắc chỉ đến một lần." />
          </p>
        </div>
        <div className="col-start-1 row-start-1 flex flex-col items-center">
          <p className="for text-xs font-semibold tracking-[0.42em] text-white/70 uppercase">Một lá thư dành riêng cho</p>
          <div className="relative mt-4">
            <div className="glow absolute inset-0 -z-10 rounded-full bg-gold/25 blur-3xl" />
            <h1 className="who text-6xl [perspective:600px] sm:text-7xl">
              <GuestName stack />
            </h1>
          </div>
          <button type="button" onClick={open} className="cta seal-btn mt-10" aria-label="Mở thư">
            <span className="seal-btn__wax">
              <EnvelopeIcon />
            </span>
            <span className="seal-btn__label">Mở thư</span>
            <span className="seal-btn__hint">Chạm vào con dấu</span>
          </button>
        </div>
      </div>
    </div>
  )
}
