import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'
import { Barcode, GoldButton, PlaneIcon, Split, useExit } from '../components/ui'
import { event, eventDay, guestName, hostName, photoUrl, studentId } from '../lib/invite'
import { sfx } from '../lib/audio'
import { useTilt } from '../lib/motion'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** Cảnh 4: vé Graduation Air */
export function Ticket({ onBoard }: { onBoard: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const tilt = useTilt<HTMLDivElement>(14)
  const exit = useExit(root)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .from('.flash', { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
        .fromTo('.flipper', { rotateY: -180, scale: 0.55, y: 60 }, { rotateY: 0, scale: 1, y: 0, duration: 1.3, ease: 'power3.out' }, 0)
        .from('.reveal', { opacity: 0, y: 10, stagger: 0.08, duration: 0.4 }, 1.0)
        .call(() => sfx('whoosh'), [], 0)
        .from('.pname .ch', { opacity: 0, stagger: { each: 0.06, onStart: () => sfx('tick') }, duration: 0.01 }, 1.4)
        .call(() => sfx('stamp'), [], 2.53)
        .fromTo('.stamp', { scale: 2.4, opacity: 0, rotate: 8 }, { scale: 1, opacity: 1, rotate: -12, duration: 0.35, ease: 'power4.in' }, 2.2)
        .to('.flipper', { x: 4, duration: 0.05, repeat: 5, yoyo: true }, 2.55)
        .from('.next', { autoAlpha: 0, y: 20, duration: 0.5 }, 2.8)
    }, root)
    return () => ctx.revert()
  }, [])

  const board = () => {
    sfx('whoosh')
    gsap.to('.flipper', { x: '-60vw', rotateZ: -8, scale: 0.7, duration: 0.7, ease: 'power3.in' })
    exit(onBoard, { delay: 0.25, y: 0 })
  }

  return (
    <div ref={root} className="scene flex-col gap-5">
      <div className="flash pointer-events-none fixed inset-0 z-30 bg-[#fff6dc] opacity-0" />
      <div className="[perspective:1400px]">
        <div ref={tilt} className="tilt">
          <div className="flipper relative">
            <TicketBack />
            <div className="ticket face">
              <div className="t-head">
                <span className="t-brand">
                  <PlaneIcon className="t-plane" /> GRADUATION AIR
                </span>
                <span className="t-kind">
                  THẺ LÊN TÀU · <b>VÉ MỜI</b>
                  <br />
                  LỄ TỐT NGHIỆP {event.classOf}
                </span>
              </div>
              <div className="t-photo">
                <img src={photoUrl} alt="Ảnh tân khoa" />
                <div className="t-seal">
                  <small>CLASS OF</small>
                  <b>{event.classOf}</b>
                  <small>✦ CLEARED ✦</small>
                </div>
                <span className="t-chip">✓ ĐÃ CHECK-IN TƯƠNG LAI</span>
                <div className="stamp">ĐÃ CHECK-IN ✓</div>
              </div>
              <div className="t-route reveal">
                <div>
                  <div className="t-code">SV</div>
                  <div className="t-city">SINH VIÊN</div>
                </div>
                <div className="t-path">
                  <PlaneIcon className="t-path-plane" />
                </div>
                <div className="text-right">
                  <div className="t-code text-green">TK</div>
                  <div className="t-city">TÂN KHOA</div>
                </div>
              </div>
              <div className="t-pax reveal">
                <div className="t-lbl">
                  HÀNH KHÁCH ĐƯỢC MỜI · <span className="text-green">GHẾ VIP</span>
                </div>
                <div className="t-name pname">
                  <Split text={guestName} />
                  <span className="caret" />
                </div>
              </div>
              <div className="t-grid reveal">
                <div>
                  <div className="t-lbl">NGÀY BAY</div>
                  <div className="t-val">
                    {String(eventDay.day).padStart(2, '0')} {MONTHS[eventDay.month - 1]} {eventDay.year}
                  </div>
                </div>
                <div>
                  <div className="t-lbl">KHỞI HÀNH</div>
                  <div className="t-val">{event.time ?? event.weekday.toUpperCase()}</div>
                </div>
                <div>
                  <div className="t-lbl">HẠ CÁNH</div>
                  <div className="t-val">{event.endTime ?? '—'}</div>
                </div>
                {hostName && (
                  <div className="col-span-3">
                    <div className="t-lbl">CHUYẾN BAY CỦA TÂN KHOA</div>
                    <div className="t-venue">
                      {hostName}
                      {studentId && <span className="t-sid"> · MSSV {studentId}</span>}
                    </div>
                  </div>
                )}
                <div className="col-span-3">
                  <div className="t-lbl">CỔNG KHỞI HÀNH · ĐỊA ĐIỂM</div>
                  <div className="t-venue">
                    {event.venue.name} – {event.venue.short}
                  </div>
                </div>
              </div>
              <div className="t-perf">
                <i />
                <i />
              </div>
              <div className="t-stub reveal">
                <p className="t-msg">Sự có mặt của bạn là món quà ý nghĩa nhất.</p>
                <div className="t-bc">
                  <Barcode seed={guestName + event.date} className="text-[#141a33]" />
                </div>
              </div>
              <div className="foil" />
            </div>
          </div>
        </div>
      </div>
      <div className="next flex flex-col items-center gap-3">
        <GoldButton onClick={board} arrow>
          <PlaneIcon /> Lên máy bay
        </GoldButton>
        <p className="text-xs text-white/50">Nghiêng điện thoại để thấy ánh hologram</p>
      </div>
    </div>
  )
}

function TicketBack() {
  return (
    <div className="ticket face back">
      <div className="grid h-full place-items-center bg-[repeating-linear-gradient(45deg,#13235e_0_14px,#162a70_14px_28px)]">
        <div className="text-center text-gold">
          <PlaneIcon className="mx-auto size-16" />
          <div className="mt-3 font-condensed text-3xl font-bold tracking-widest">GRADUATION AIR</div>
        </div>
      </div>
    </div>
  )
}
