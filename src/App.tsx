import { asset, displayName, event, formatPhone, mapsHref, readInvite, telHref, zaloHref } from './lib/invite'

const invite = readInvite()
const [year, month, day] = event.date.split('-')

// Giai đoạn 1: khung dữ liệu + bố cục cơ bản. Trải nghiệm 3D (phong bì, vé, tạp chí) sẽ thay thế phần này.
export default function App() {
  const { guest, host, contact } = invite
  return (
    <main className="min-h-svh bg-navy text-white font-sans">
      <section className="mx-auto flex max-w-md flex-col items-center px-6 py-14 text-center">
        <p className="text-xs font-semibold tracking-[0.35em] text-gold uppercase">Graduation · Class of {event.classOf}</p>
        <h1 className="mt-4 font-script text-6xl leading-tight text-gold">Thư mời</h1>
        <p className="font-display text-2xl font-black tracking-wide uppercase">{event.title}</p>

        <img
          src={asset(event.photo)}
          alt={host ? `Ảnh tốt nghiệp của ${host.name}` : 'Ảnh tốt nghiệp'}
          width={1000}
          height={1500}
          className="mt-8 aspect-[3/4] w-64 rounded-t-full border-2 border-gold object-cover object-top shadow-2xl"
        />

        <p className="mt-8 text-white/70">Trân trọng kính mời</p>
        <p className="mt-1 font-display text-4xl font-black leading-tight text-gold">{displayName(guest)}</p>
        {guest?.message && <p className="mt-4 font-display text-lg italic text-white/85">“{guest.message}”</p>}
        <p className="mt-4 text-white/70">đến chung vui cùng {host ? host.name : 'mình'} trong ngày Lễ Tốt Nghiệp</p>

        <div className="mt-8 flex items-center gap-5">
          <span className="w-24 border-y border-gold py-1 text-sm tracking-[0.25em] uppercase">{event.weekday}</span>
          <span className="font-display text-6xl font-black text-gold">{day}</span>
          <span className="w-24 border-y border-gold py-1 text-sm tracking-[0.25em]">{month} · {year}</span>
        </div>
        {event.time && <p className="mt-3 font-condensed text-2xl">{event.time}</p>}

        <a href={mapsHref} target="_blank" rel="noreferrer" className="mt-6 block font-display text-xl leading-snug underline-offset-4 hover:underline">
          {event.venue.name}
          <br />
          {event.venue.short}
        </a>

        {contact && (
          <div className="mt-8 flex gap-3">
            <a href={telHref(contact.phone)} className="rounded-full bg-gold px-5 py-2.5 font-semibold text-navy">
              Gọi {formatPhone(contact.phone)}
            </a>
            <a href={zaloHref(contact.phone)} target="_blank" rel="noreferrer" className="rounded-full border border-gold px-5 py-2.5 font-semibold text-gold">
              Zalo
            </a>
          </div>
        )}
      </section>
    </main>
  )
}
