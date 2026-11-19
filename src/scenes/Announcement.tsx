import gsap from 'gsap'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Cover } from '../components/Cover'
import { GoldButton } from '../components/ui'
import { WishForm } from '../components/WishForm'
import { audio, sfx } from '../lib/audio'
import { dateLabel, event, hostName, invite, studentId } from '../lib/invite'
import { useTilt } from '../lib/motion'

/** Bảng trượt từ dưới lên chứa form gửi lời chúc */
function WishSheet({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    gsap.fromTo(panel.current, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' })
  }, [])

  const close = () => {
    gsap.to(backdrop.current, { opacity: 0, duration: 0.25 })
    gsap.to(panel.current, { yPercent: 100, duration: 0.35, ease: 'power2.in', onComplete: onClose })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="fixed inset-0 z-30">
      <div ref={backdrop} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={close} />
      <div
        ref={panel}
        role="dialog"
        aria-modal
        aria-label="Gửi lời chúc"
        className="sheet absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[1.4rem] px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-white/25" />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-condensed text-xs tracking-[0.3em] text-gold uppercase">Gửi lời chúc</p>
            <p className="mt-1 font-name text-2xl leading-tight text-[#f4ead2] italic">Tới tân khoa {hostName ?? ''}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Đóng"
            className="grid size-8 shrink-0 place-items-center rounded-full border border-white/20 text-white/70 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="mt-5">
          <WishForm onSent={onSent} />
        </div>
      </div>
    </div>
  )
}

/**
 * Trang chính (không có path khách): chỉ thông báo đã tốt nghiệp.
 * Không có tên người nhận, không có lời mời, không có số điện thoại.
 */
export function Announcement({ onBurst }: { onBurst: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const tilt = useTilt<HTMLDivElement>(10)
  const [sheet, setSheet] = useState(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.2 })
        .from('.a-eyebrow', { autoAlpha: 0, y: -12, duration: 0.6 })
        .fromTo('.mag', { rotateX: 70, y: '-70svh', opacity: 0 }, { rotateX: 0, y: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.2)' }, 0.1)
        .from('.mast .ch', { y: -60, opacity: 0, rotateX: -90, stagger: 0.06, duration: 0.5, ease: 'back.out(2)' }, 0.9)
        .from('.cl-l > *', { x: -30, opacity: 0, stagger: 0.1, duration: 0.5 }, 1.5)
        .from('.cl-r > *', { x: 30, opacity: 0, stagger: 0.1, duration: 0.5 }, 1.5)
        .fromTo('.year', { strokeDashoffset: 600 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut' }, 1.5)
        .from('.sticker', { scale: 0, rotate: -120, duration: 0.6, ease: 'back.out(2.5)' }, 2.0)
        .call(onBurst, [], 2.2)
        .from('.m-bottom > *', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, 2.3)
        .from('.a-foot > *', { autoAlpha: 0, y: 14, stagger: 0.12, duration: 0.5 }, 2.7)
    }, root)
    return () => ctx.revert()
  }, [onBurst])

  const congratulate = () => {
    audio.start()
    if (invite.wish) return setSheet(true)
    sfx('confetti')
    onBurst()
  }

  return (
    <div ref={root} className="scene flex-col gap-4 px-5">
      <p className="a-eyebrow font-condensed text-[11px] tracking-[0.32em] whitespace-nowrap text-gold uppercase">
        Thông báo tốt nghiệp · Class of {event.classOf}
      </p>

      <div className="[perspective:1600px]">
        <div ref={tilt} className="tilt">
          <div className="mag relative">
            <Cover>
              <span className="m-tag">THÔNG BÁO TỐT NGHIỆP</span>
              <p className="m-head">
                Chính thức <em>tốt nghiệp</em> —<br />
                hành trình mới bắt đầu.
              </p>
              <p className="m-invite">
                <span>Lễ tốt nghiệp</span>
                <b className="gold-text">
                  {event.weekday}, {dateLabel}
                </b>
              </p>
            </Cover>
          </div>
        </div>
      </div>

      <div className="a-foot flex flex-col items-center gap-4 text-center">
        <p className="max-w-xs font-name text-lg leading-snug text-white/85 italic">
          Cảm ơn gia đình, thầy cô và bạn bè đã đồng hành cùng mình suốt những năm tháng đại học.
        </p>
        {hostName && (
          <p className="-mt-1 font-condensed text-[11px] tracking-[0.28em] text-white/55 uppercase">
            {hostName}
            {studentId && ` · MSSV ${studentId}`}
          </p>
        )}
        <GoldButton onClick={congratulate} arrow>
          {invite.wish ? 'Gửi lời chúc' : 'Chúc mừng tân khoa'}
        </GoldButton>
      </div>

      {sheet && <WishSheet onClose={() => setSheet(false)} onSent={onBurst} />}
    </div>
  )
}
