import gsap from 'gsap'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { GoldButton, GuestName, useExit } from '../components/ui'
import { sfx } from '../lib/audio'
import { dateLabel, event, eventStart } from '../lib/invite'

function remaining() {
  const ms = Math.max(0, eventStart().getTime() - Date.now())
  const s = Math.floor(ms / 1000)
  return { done: ms === 0, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

function Unit({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)
  useEffect(() => {
    if (prev.current !== value && ref.current) gsap.fromTo(ref.current, { yPercent: -60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35 })
    prev.current = value
  }, [value])
  return (
    <div className="cd-unit">
      <span ref={ref} className="cd-num">
        {String(value).padStart(2, '0')}
      </span>
      <span className="cd-lbl">{label}</span>
    </div>
  )
}

/** Cảnh 8: chữ + đồng hồ đếm ngược (mũ và confetti nằm ở lớp 3D) */
export function Celebrate({ onNext }: { onNext: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const exit = useExit(root)
  const [t, setT] = useState(remaining)

  useEffect(() => {
    sfx('whoosh')
    const burst1 = setTimeout(() => sfx('confetti'), 150)
    const burst2 = setTimeout(() => sfx('confetti'), 1250)
    const id = setInterval(() => setT(remaining()), 1000)
    const auto = setTimeout(() => exit(onNext), 7000)
    return () => {
      clearInterval(id)
      clearTimeout(auto)
      clearTimeout(burst1)
      clearTimeout(burst2)
    }
  }, [exit, onNext])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.5 })
        .from('.c-title .ch', { opacity: 0, scale: 2.4, stagger: 0.04, duration: 0.5, ease: 'back.out(2)' })
        .from('.c-sub', { opacity: 0, y: 12, duration: 0.5 }, '-=0.1')
        .from('.cd-unit', { opacity: 0, y: 24, rotateX: -80, stagger: 0.1, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.2')
        .from('.c-next', { autoAlpha: 0, y: 16, duration: 0.5 }, '+=0.3')
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="scene pointer-events-none flex-col px-6 text-center">
      <h2 className="c-title flex flex-col items-center">
        <span className="font-display text-2xl italic text-white/85">Hẹn gặp</span>
        <span className="mt-1 text-6xl sm:text-7xl">
          <GuestName />
        </span>
      </h2>
      <p className="c-sub mt-3 text-white/80">
        tại {event.title} · {event.weekday}, {dateLabel}
      </p>
      {t.done ? (
        <p className="mt-8 font-display text-2xl italic">Cảm ơn vì đã đến chung vui! 💛</p>
      ) : (
        <div className="mt-8 flex gap-3 [perspective:600px]">
          <Unit value={t.d} label="Ngày" />
          <Unit value={t.h} label="Giờ" />
          <Unit value={t.m} label="Phút" />
          <Unit value={t.s} label="Giây" />
        </div>
      )}
      <GoldButton onClick={() => exit(onNext)} className="c-next pointer-events-auto mt-10" arrow>
        Thông tin buổi lễ
      </GoldButton>
    </div>
  )
}
