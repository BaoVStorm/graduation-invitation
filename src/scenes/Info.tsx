import gsap from 'gsap'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { WishForm } from '../components/WishForm'
import { downloadIcs, googleCalendarUrl } from '../lib/calendar'
import { dateLabel, event, formatPhone, guestName, hostName, invite, mapsHref, photoUrl, telHref, zaloHref } from '../lib/invite'

function Card({ no, title, children }: { no: string; title: string; children: ReactNode }) {
  return (
    <section className="info-card">
      <div className="flex items-baseline gap-3 border-b border-white/10 pb-3 font-condensed text-xs tracking-[0.28em] text-[#f4ead2]/70 uppercase">
        <span className="text-gold">{no}</span>
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

/** Cảnh 9: thông tin rõ ràng, khách mở lại nhiều lần */
export function Info({ onReplay }: { onReplay: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.i-head > *', { opacity: 0, y: 16, stagger: 0.1, duration: 0.6 })
      gsap.from('.info-card, .i-foot', { opacity: 0, y: 30, stagger: 0.09, duration: 0.6, delay: 0.3, ease: 'power2.out' })
    }, root)
    return () => ctx.revert()
  }, [])

  const details = `Thư mời gửi ${guestName}${hostName ? ` từ ${hostName}` : ''}. ${location.href}`

  return (
    <div ref={root} className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pt-20 pb-12">
        <header className="i-head flex flex-col items-center text-center">
          <img src={photoUrl} alt="Ảnh tân khoa" className="size-28 rounded-full border-2 border-gold object-cover object-[50%_18%] shadow-xl" />
          <p className="mt-5 text-sm tracking-wide text-white/70">Hẹn gặp {guestName} tại</p>
          <h1 className="mt-1 font-display text-4xl leading-tight font-black text-gold">
            {event.title} {event.classOf}
          </h1>
          {hostName && <p className="mt-2 font-script text-3xl text-white/90">của {hostName}</p>}
        </header>

        <div className="mt-8 space-y-4">
          <Card no="01" title="Thời gian">
            <p className="font-display text-2xl font-bold">
              {event.weekday}, {dateLabel}
            </p>
            <p className="mt-1 text-white/70">{event.time ? `Bắt đầu lúc ${event.time}` : 'Giờ cụ thể sẽ báo sau'}</p>
          </Card>

          <Card no="02" title="Địa điểm">
            <p className="font-display text-xl leading-snug font-bold">
              {event.venue.name}
              <br />
              {event.venue.short}
            </p>
            <a href={mapsHref} target="_blank" rel="noreferrer" className="btn-ghost mt-4">
              Mở Google Maps
            </a>
          </Card>

          <Card no="03" title="Lưu vào lịch">
            <div className="flex flex-wrap gap-2">
              <a href={googleCalendarUrl(details)} target="_blank" rel="noreferrer" className="btn-ghost">
                Google Calendar
              </a>
              <button type="button" onClick={() => downloadIcs(details)} className="btn-ghost">
                Apple / Outlook (.ics)
              </button>
            </div>
          </Card>

          {invite.contact && (
            <Card no="04" title="Liên hệ">
              <p className="font-condensed text-2xl tracking-wide">{formatPhone(invite.contact.phone)}</p>
              <div className="mt-4 flex gap-2">
                <a href={telHref(invite.contact.phone)} className="btn-gold">
                  Gọi điện
                </a>
                <a href={zaloHref(invite.contact.phone)} target="_blank" rel="noreferrer" className="btn-ghost">
                  Nhắn Zalo
                </a>
              </div>
            </Card>
          )}

          {invite.wish && (
            <Card no={invite.contact ? '05' : '04'} title="Gửi lời chúc">
              <WishForm defaultName={invite.guest?.name ?? ''} />
            </Card>
          )}
        </div>

        <footer className="i-foot mt-10 text-center">
          <p className="font-display text-xl italic text-white/85">“Sự có mặt của bạn là món quà ý nghĩa nhất.”</p>
          <button type="button" onClick={onReplay} className="mt-6 text-sm tracking-widest text-gold uppercase underline-offset-4 hover:underline">
            Xem lại từ đầu
          </button>
        </footer>
      </div>
    </div>
  )
}
