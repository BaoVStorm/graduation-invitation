import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { PlaneIcon } from '../components/ui'
import { sfx } from '../lib/audio'
import { event, eventDay } from '../lib/invite'
import { FLIGHT_SECONDS } from '../lib/timing'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/**
 * Cảnh 5 (lớp DOM): bảng theo dõi chuyến bay như màn hình trên máy bay.
 * Máy bay 3D, mây và vệt khói nằm ở three/FlightScene.tsx.
 */
export function Flight({ onArrive }: { onArrive: () => void }) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ onComplete: onArrive })
        .call(() => sfx('plane'), [], 0.05)
        .fromTo('.veil', { opacity: 1 }, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0)
        .from('.tracker', { autoAlpha: 0, y: -16, duration: 0.7, ease: 'power2.out' }, 0.2)
        .fromTo('.trk-fill', { scaleX: 0 }, { scaleX: 1, duration: FLIGHT_SECONDS, ease: 'power1.inOut' }, 0)
        .fromTo('.trk-plane', { left: '0%' }, { left: '100%', duration: FLIGHT_SECONDS, ease: 'power1.inOut' }, 0)
        .from('.going', { autoAlpha: 0, y: 12, duration: 0.7 }, 0.5)
        .to('.going', { autoAlpha: 0, y: -10, duration: 0.5 }, 2.3)
        .call(() => sfx('chime'), [], 2.6)
        .from('.future', { autoAlpha: 0, scale: 0.85, filter: 'blur(8px)', duration: 0.9, ease: 'power3.out' }, 2.6)
        .to('.trk-status', { color: '#3ddc84', duration: 0.3 }, FLIGHT_SECONDS - 0.4)
        .set('.trk-status-text', { textContent: 'Đã hạ cánh' }, FLIGHT_SECONDS - 0.4)
        // ánh sáng "Tương lai" bừng lên phủ màn hình, tạp chí hiện ra từ trong ánh sáng đó
        .to(['.tracker', '.future'], { autoAlpha: 0, duration: 0.5 }, FLIGHT_SECONDS - 0.3)
        .fromTo('.flare', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 3.2, duration: 0.85, ease: 'power2.in' }, FLIGHT_SECONDS - 0.5)
    }, root)
    return () => ctx.revert()
  }, [onArrive])

  return (
    <div
      ref={root}
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between px-5 pt-[calc(max(14px,env(safe-area-inset-top))+44px)] pb-[12svh]"
    >
      <div className="veil pointer-events-none fixed inset-0 bg-[#0a1440]" />
      <div className="flare pointer-events-none fixed inset-0 z-30 origin-[72%_26%] bg-[radial-gradient(circle_at_72%_26%,#fffaf0_0%,#ffe9b0_22%,rgba(243,208,122,0.95)_42%,rgba(201,162,79,0)_72%)] opacity-0" />
      <div className="tracker w-full max-w-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="font-condensed text-3xl leading-none font-bold">SV</div>
            <div className="trk-sub">Sinh viên</div>
          </div>
          <div className="trk-sub pb-1 text-center">
            GA {event.classOf} · {String(eventDay.day).padStart(2, '0')} {MONTHS[eventDay.month - 1]}
          </div>
          <div className="text-right">
            <div className="font-condensed text-3xl leading-none font-bold text-green">TK</div>
            <div className="trk-sub">Tân khoa</div>
          </div>
        </div>
        <div className="relative mt-4 h-px bg-white/20">
          <div className="trk-fill absolute inset-0 origin-left bg-gold" />
          <div className="trk-plane absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-gold">
            <PlaneIcon className="size-5 rotate-90" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="trk-sub">Khởi hành {event.time}</span>
          <span className="trk-status trk-sub flex items-center gap-1.5 text-gold">
            <i className="inline-block size-1.5 rounded-full bg-current" />
            <span className="trk-status-text">Đang bay</span>
          </span>
          <span className="trk-sub">Hạ cánh {event.endTime}</span>
        </div>
      </div>

      <div className="grid place-items-center text-center">
        <p className="going col-start-1 row-start-1 font-name text-2xl text-white/85 italic">Đang bay đến…</p>
        <p className="future col-start-1 row-start-1 font-name text-6xl leading-none italic">
          <span className="gold-text">Tương lai</span>
        </p>
      </div>
    </div>
  )
}
