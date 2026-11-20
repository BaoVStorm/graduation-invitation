import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { SoundToggle } from './components/SoundToggle'
import { guestName, invite } from './lib/invite'
import { hasWebGL, prefersReducedMotion } from './lib/motion'
import { Announcement } from './scenes/Announcement'
import { Celebrate } from './scenes/Celebrate'
import { EnvelopeHint } from './scenes/EnvelopeHint'
import { Flight } from './scenes/Flight'
import { Info } from './scenes/Info'
import { Intro } from './scenes/Intro'
import { Loading } from './scenes/Loading'
import { Magazine } from './scenes/Magazine'
import { Ticket } from './scenes/Ticket'

export type Phase = 'loading' | 'announce' | 'intro' | 'envelope' | 'opening' | 'ticket' | 'flight' | 'magazine' | 'letter' | 'celebrate' | 'info'

/** 7 chặng trên thanh tiến trình (xem docs/UI-SCRIPT.md) */
const STEPS: { label: string; phases: Phase[] }[] = [
  { label: 'Thư', phases: ['intro', 'envelope', 'opening'] },
  { label: 'Vé', phases: ['ticket'] },
  { label: 'Bay', phases: ['flight'] },
  { label: 'Tạp chí', phases: ['magazine'] },
  { label: 'Thư ngỏ', phases: ['letter'] },
  { label: 'Ăn mừng', phases: ['celebrate'] },
  { label: 'Thông tin', phases: ['info'] },
]

const webgl = hasWebGL()
/** Có path khách → luồng thư mời 10 cảnh. Trang chính → chỉ thông báo tốt nghiệp. */
const isGuest = !!invite.guest
const loadStage = () => import('./three/Stage')
const Stage = lazy(loadStage)

export default function App() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [run, setRun] = useState(0) // tăng khi "Xem lại từ đầu" để remount các cảnh
  const go = useCallback((p: Phase) => setPhase(p), [])
  const [burst, setBurst] = useState(0) // pháo giấy ở trang chính
  const extra = useMemo(() => (webgl ? [loadStage()] : []), [])

  const afterLoading = useCallback(() => go(!isGuest ? 'announce' : prefersReducedMotion() ? 'info' : 'intro'), [go])
  const fireBurst = useCallback(() => setBurst((b) => b + 1), [])
  const afterIntro = useCallback(() => go(webgl ? 'envelope' : 'ticket'), [go])
  const openEnvelope = useCallback(() => setPhase((p) => (p === 'envelope' ? 'opening' : p)), [])
  const opened = useCallback(() => go('ticket'), [go])
  const replay = useCallback(() => {
    setRun((r) => r + 1)
    go('intro')
  }, [go])

  const stepIndex = STEPS.findIndex((s) => s.phases.includes(phase))
  const canSkip = isGuest && phase !== 'loading' && phase !== 'info'

  return (
    <main className="relative h-svh w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_-10%,#1f3591_0%,#0f1f5c_45%,#070e30_100%)] font-sans text-white">
      {webgl && (
        <Suspense fallback={null}>
          <Stage phase={phase} name={guestName} burst={burst} onEnvelopeTap={openEnvelope} onEnvelopeOpened={opened} />
        </Suspense>
      )}

      <div className="vignette pointer-events-none absolute inset-0 z-[5]" aria-hidden />
      <div className="grain pointer-events-none absolute inset-0 z-40" aria-hidden />

      <div key={run} className="absolute inset-0 z-10">
        {phase === 'loading' && <Loading onDone={afterLoading} extra={extra} />}
        {phase === 'announce' && <Announcement onBurst={fireBurst} />}
        {phase === 'intro' && <Intro onOpen={afterIntro} />}
        {(phase === 'envelope' || phase === 'opening') && <EnvelopeHint onTap={openEnvelope} hidden={phase === 'opening'} />}
        {phase === 'ticket' && <Ticket onBoard={() => go('flight')} />}
        {phase === 'flight' && <Flight onArrive={() => go('magazine')} />}
        {(phase === 'magazine' || phase === 'letter') && (
          <Magazine stage={phase} onOpen={() => go('letter')} onDone={() => go('celebrate')} />
        )}
        {phase === 'celebrate' && <Celebrate onNext={() => go('info')} />}
        {phase === 'info' && <Info onReplay={replay} />}
      </div>

      {phase !== 'loading' && (
        <nav className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-4 bg-gradient-to-b from-[#0a1440] to-transparent px-5 pt-[max(14px,env(safe-area-inset-top))] pb-6">
          <ol className={`flex gap-1.5 ${isGuest ? '' : 'invisible'}`} aria-label="Tiến trình">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                title={s.label}
                className={`h-1 rounded-full transition-all duration-500 ${i === stepIndex ? 'w-6 bg-gold' : i < stepIndex ? 'w-2.5 bg-gold/60' : 'w-2.5 bg-white/20'}`}
              />
            ))}
          </ol>
          <div className="flex items-center gap-4">
            {canSkip && (
              <button type="button" onClick={() => go('info')} className="pointer-events-auto text-xs tracking-[0.2em] text-white/60 uppercase hover:text-white">
                Bỏ qua ›
              </button>
            )}
            <SoundToggle />
          </div>
        </nav>
      )}
    </main>
  )
}
