import gsap from 'gsap'
import { useCallback, type ReactNode, type RefObject } from 'react'
import { sfx } from '../lib/audio'
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

export function GoldButton({ children, onClick, className = '' }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        sfx('tap')
        onClick()
      }}
      className={`btn-gold ${className}`}
    >
      {children}
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
