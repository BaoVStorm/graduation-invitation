import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { Cover } from '../components/Cover'
import { CameraIcon, CapIcon, GoldButton, useExit } from '../components/ui'
import { dateLabel, event, guestName, guestPronoun, guestSelf, hostName, invite, memories, studentId, timeLabelLong } from '../lib/invite'
import { sfx } from '../lib/audio'
import { useTilt } from '../lib/motion'

/** Cảnh 6 (bìa tạp chí) + cảnh 7 (thư ngỏ) dùng chung một cuốn tạp chí */
export function Magazine({ stage, onOpen, onDone }: { stage: 'magazine' | 'letter'; onOpen: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const tilt = useTilt<HTMLDivElement>(10)
  const exit = useExit(root)

  // Cảnh 6: tạp chí rơi xuống, masthead rơi từng chữ
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo('.mag', { rotateX: 70, y: '-70svh', opacity: 0 }, { rotateX: 0, y: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.2)' })
        .call(() => sfx('drop'), [], 0.95)
        .call(() => sfx('chime'), [], 1.0)
        .call(() => sfx('pop'), [], 2.0)
        .from('.mast .ch', { y: -60, opacity: 0, rotateX: -90, stagger: 0.06, duration: 0.5, ease: 'back.out(2)' }, 0.8)
        .from('.cl-l > *', { x: -30, opacity: 0, stagger: 0.1, duration: 0.5 }, 1.4)
        .from('.cl-r > *', { x: 30, opacity: 0, stagger: 0.1, duration: 0.5 }, 1.4)
        .fromTo('.year', { strokeDashoffset: 600 }, { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut' }, 1.4)
        .from('.sticker', { scale: 0, rotate: -120, duration: 0.6, ease: 'back.out(2.5)' }, 1.9)
        .from('.m-bottom > *', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, 2.2)
        .from('.m-next', { autoAlpha: 0, y: 16, duration: 0.5 }, 2.6)
    }, root)
    return () => ctx.revert()
  }, [])

  // Cảnh 7: lật bìa, hiện thư ngỏ
  useLayoutEffect(() => {
    if (stage !== 'letter') return
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .call(() => sfx('paper'), [], 0.1)
        .call(() => sfx('scribble'), [], 2.4)
        .to('.cover', { rotateY: -118, duration: 1.2, ease: 'power2.inOut' }, 0)
        .to('.cover', { opacity: 0, duration: 0.35 }, 0.9)
        .fromTo('.page-shade', { opacity: 0.6 }, { opacity: 0, duration: 1.2 }, 0)
        .from('.letter > *', { opacity: 0, y: 14, filter: 'blur(4px)', stagger: 0.35, duration: 0.6 }, 1.0)
        .fromTo('.sign text', { strokeDashoffset: 900, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, 2.4)
        .to('.sign text', { fillOpacity: 1, duration: 0.5 }, 3.6)
        .from('.l-next', { autoAlpha: 0, y: 16, duration: 0.5 }, 3.8)
    }, root)
    return () => ctx.revert()
  }, [stage])

  const message =
    invite.guest?.message ??
    `Cảm ơn ${guestPronoun} vì đã là một phần trong hành trình của ${guestSelf}.`
  // đoạn thư riêng (ví dụ thư gửi gia đình) thay cho đoạn chung
  const custom = invite.guest?.letter
    ?.split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  // thư dài thì thu nhỏ chữ cho vừa trang (tối thiểu 72%)
  const page = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = page.current
    if (!el) return
    const fit = () => {
      let s = 1
      el.style.setProperty('--ls', '1')
      const letter = el.querySelector<HTMLElement>('.letter')!
      while (letter.scrollHeight > el.clientHeight && s > 0.72) {
        s -= 0.04
        el.style.setProperty('--ls', s.toFixed(2))
      }
    }
    fit()
    void document.fonts.ready.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  return (
    <div ref={root} className="scene flex-col gap-5">
      <div className="[perspective:1600px]">
        <div ref={tilt} className="tilt">
          <div className="mag relative">
            {/* trang trong: thư ngỏ */}
            <div ref={page} className="page">
              <div className="page-shade" />
              <div className="letter">
                <p className="l-hi">Gửi {guestName},</p>
                <p className="l-msg">“{message}”</p>
                {custom?.length ? (
                  custom.map((p, i) => (
                    <p key={i} className="l-body">
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="l-body">
                    Sau những năm tháng miệt mài cùng sách vở, đồ án và những đêm thức trắng, {guestSelf} sắp chính thức trở
                    thành tân khoa. Ngày vui ấy sẽ trọn vẹn hơn rất nhiều nếu có {guestPronoun} ở đó.
                  </p>
                )}
                <p className="l-body">
                  Hẹn {guestPronoun} vào{' '}
                  <b>
                    {timeLabelLong ? `${timeLabelLong}, ` : ''}
                    {event.weekday}, {dateLabel}
                  </b>{' '}
                  tại {event.venue.name}.
                </p>
                <svg className="sign" viewBox="0 0 400 90" aria-label={hostName ?? 'Tân khoa'}>
                  <text x="0" y="66">
                    {hostName ?? 'Tân khoa 2026'}
                  </text>
                </svg>
                {studentId && (
                  <p className="l-sid">
                    Tân khoa · MSSV {studentId} · Class of {event.classOf}
                  </p>
                )}
              </div>
            </div>

            {/* bìa tạp chí */}
            <Cover>
              <span className="m-tag">THƯ MỜI LỄ TỐT NGHIỆP</span>
              <p className="m-head">
                Ngày ấy <em>đã đến</em> —<br />và mình muốn có bạn.
              </p>
              <p className="m-invite">
                <span>Trân trọng kính mời</span> <b className="gold-text">{guestName}</b>
              </p>
            </Cover>
          </div>
        </div>
      </div>

      {stage === 'magazine' ? (
        <GoldButton onClick={onOpen} className="m-next" arrow>
          Mở số đặc biệt
        </GoldButton>
      ) : (
        <GoldButton onClick={() => exit(onDone, { scale: 0.9 })} className="l-next">
          {memories.length ? (
            <>
              <CameraIcon /> Xem kỷ niệm
            </>
          ) : (
            <>
              <CapIcon /> Tung mũ ăn mừng
            </>
          )}
        </GoldButton>
      )}
    </div>
  )
}
