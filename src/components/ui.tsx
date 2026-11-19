import gsap from 'gsap'
import { useCallback, type ReactNode, type RefObject } from 'react'
import { sfx } from '../lib/audio'
import { invite } from '../lib/invite'
import { chars } from '../lib/motion'

/** Tách chữ thành <span class="ch"> theo từng ký tự, không bẻ dòng giữa một từ */
export function Split({ text, className = '' }: { text: string; className?: string }) {
  const words = text.normalize('NFC').split(' ')
  return (
    <span className={className} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {chars(w).map((c, ci) => (
            <span key={ci} className="ch inline-block will-change-transform">
              {c}
            </span>
          ))}
          {wi < words.length - 1 && <span className="ch inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}

/** Hiệu ứng rời cảnh rồi mới gọi cảnh tiếp theo */
export function useExit(ref: RefObject<HTMLElement | null>) {
  return useCallback(
    (then: () => void, vars: gsap.TweenVars = {}) => {
      if (!ref.current) return then()
      gsap.to(ref.current, { autoAlpha: 0, y: -24, duration: 0.5, ease: 'power2.in', ...vars, onComplete: then })
    },
    [ref],
  )
}

type ButtonProps = { children: ReactNode; onClick?: () => void; className?: string; arrow?: boolean; ghost?: boolean; type?: 'button' | 'submit'; disabled?: boolean }

/** Nút chính (giấy ngà, khung kép) hoặc nút phụ (ghost). `arrow` thêm mũi tên mảnh ở cuối. */
export function GoldButton({ children, onClick, className = '', arrow = false, ghost = false, type = 'button', disabled }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={() => {
        sfx('tap')
        onClick?.()
      }}
      className={`${ghost ? 'btn-ghost' : 'btn-gold'} ${className}`}
    >
      {children}
      {arrow && <span className="btn-arrow" aria-hidden />}
    </button>
  )
}

/** Mã vạch giả, cố định theo chuỗi đầu vào */
export function Barcode({ seed, className = '' }: { seed: string; className?: string }) {
  const bars = Array.from({ length: 42 }, (_, i) => {
    const d = seed.charCodeAt(i % seed.length) + i * 7
    return { w: 1 + (d % 3), gap: 1 + ((d >> 2) % 3) }
  })
  return (
    <div className={`flex h-full items-stretch ${className}`} aria-hidden>
      {bars.map((b, i) => (
        <i key={i} className="block bg-current" style={{ width: `${b.w}px`, marginRight: `${b.gap}px` }} />
      ))}
    </div>
  )
}

export const PlaneIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
  </svg>
)

/** Tên người nhận: xưng hô viết tay + tên serif ánh vàng */
export function GuestName({ stack = false, className = '' }: { stack?: boolean; className?: string }) {
  const g = invite.guest
  return (
    <span className={`inline-flex ${stack ? 'flex-col items-center gap-1' : 'flex-wrap items-baseline justify-center gap-x-[0.3em]'} ${className}`}>
      {g?.honorific && (
        <span className={`guest-hon ${stack ? 'text-[0.5em]' : 'text-[0.62em]'}`}>
          <Split text={g.honorific} />
        </span>
      )}
      <span className="guest-name">
        <Split text={g ? g.name : 'Bạn'} />
      </span>
    </span>
  )
}

export const EnvelopeIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
)

export const CapIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 3 1 8.5 12 14l9-4.5V16h2V8.5L12 3zm-6.5 9.3V16c0 1.9 2.9 3.5 6.5 3.5s6.5-1.6 6.5-3.5v-3.7L12 15.6l-6.5-3.3z" />
  </svg>
)
