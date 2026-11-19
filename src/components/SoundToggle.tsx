import { useSyncExternalStore } from 'react'
import { audio } from '../lib/audio'

const subscribe = (fn: () => void) => audio.subscribe(fn)
const snapshot = () => `${audio.started}-${audio.muted}`

/** Nút bật/tắt âm thanh trên thanh điều hướng */
export function SoundToggle() {
  useSyncExternalStore(subscribe, snapshot)
  const on = audio.started && !audio.muted
  return (
    <button
      type="button"
      onClick={() => (audio.started ? audio.toggle() : audio.start())}
      aria-label={on ? 'Tắt âm thanh' : 'Bật âm thanh'}
      aria-pressed={on}
      className="pointer-events-auto grid size-8 place-items-center rounded-full border border-white/20 text-white/70 transition hover:border-gold hover:text-gold"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <path d="m16 9 5 6m0-6-5 6" />
        )}
      </svg>
    </button>
  )
}
