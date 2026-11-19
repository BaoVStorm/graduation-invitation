import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { Cover } from '../components/Cover'
import { GoldButton } from '../components/ui'
import { audio, sfx } from '../lib/audio'
import { dateLabel, event, hostName } from '../lib/invite'
import { useTilt } from '../lib/motion'

/**
 * Trang chính (không có path khách): chỉ thông báo đã tốt nghiệp.
 * Không có tên người nhận, không có lời mời, không có số điện thoại.
 */
export function Announcement({ onBurst }: { onBurst: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const tilt = useTilt<HTMLDivElement>(10)

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

  const celebrate = () => {
    audio.start()
    sfx('confetti')
    onBurst()
  }

  return (
    <div ref={root} className="scene flex-col gap-4 px-5">
      <p className="a-eyebrow text-[10px] font-semibold tracking-[0.3em] whitespace-nowrap text-gold uppercase">
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
                <span>{hostName ? 'Tân khoa' : 'Lễ tốt nghiệp'}</span>
                <b className="gold-text">{hostName ?? `${event.weekday}, ${dateLabel}`}</b>
              </p>
            </Cover>
          </div>
        </div>
      </div>

      <div className="a-foot flex flex-col items-center gap-3 text-center">
        <p className="max-w-xs font-display text-[15px] leading-snug text-white/80 italic">
          Cảm ơn gia đình, thầy cô và bạn bè đã đồng hành cùng mình suốt những năm tháng đại học.
        </p>
        <GoldButton onClick={celebrate}>🎉 Gửi lời chúc mừng</GoldButton>
      </div>
    </div>
  )
}
