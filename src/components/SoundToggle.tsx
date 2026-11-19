import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { audio } from '../lib/audio'

const subscribe = (fn: () => void) => audio.subscribe(fn)
const snapshot = () => `${audio.started}-${audio.muted}-${audio.musicVolume}-${audio.sfxVolume}`

function SpeakerIcon({ on, level }: { on: boolean; level: number }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
      {on ? (
        <>
          {level > 0 && <path d="M15.5 8.5a5 5 0 0 1 0 7" />}
          {level > 0.5 && <path d="M18.5 5.5a9 9 0 0 1 0 13" />}
        </>
      ) : (
        <path d="m16 9 5 6m0-6-5 6" />
      )}
    </svg>
  )
}

function Slider({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled: boolean }) {
  const id = useId()
  const pct = Math.round(value * 100)
  return (
    <div className={disabled ? 'opacity-40' : ''}>
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={id} className="tracking-[0.18em] text-white/70 uppercase">
          {label}
        </label>
        <span className="font-condensed text-sm text-gold tabular-nums">{pct}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={pct}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="vol-range mt-2"
        style={{ ['--val' as string]: `${pct}%` }}
      />
    </div>
  )
}

/** Nút loa + bảng chỉnh âm thanh: bật/tắt, âm lượng nhạc nền, âm lượng hiệu ứng */
export function SoundToggle() {
  useSyncExternalStore(subscribe, snapshot)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const on = !audio.muted
  const audible = audio.started && on && (audio.musicVolume > 0 || audio.sfxVolume > 0)

  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <div ref={root} className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => {
          if (!audio.started && on) audio.start()
          setOpen((o) => !o)
        }}
        aria-label="Cài đặt âm thanh"
        aria-expanded={open}
        className={`grid size-8 place-items-center rounded-full border transition ${open ? 'border-gold text-gold' : 'border-white/20 text-white/70 hover:border-gold hover:text-gold'}`}
      >
        <SpeakerIcon on={audible} level={audio.musicVolume} />
      </button>

      {open && (
        <div role="dialog" aria-label="Âm thanh" className="sound-panel absolute top-11 right-0 w-64 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Âm thanh</span>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={on ? 'Tắt âm thanh' : 'Bật âm thanh'}
              onClick={() => audio.setMuted(on)}
              className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-gold' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="mt-4 space-y-4">
            <Slider label="Nhạc nền" value={audio.musicVolume} onChange={(v) => audio.setMusicVolume(v)} disabled={!on} />
            <Slider label="Hiệu ứng" value={audio.sfxVolume} onChange={(v) => audio.setSfxVolume(v)} disabled={!on} />
          </div>
        </div>
      )}
    </div>
  )
}
