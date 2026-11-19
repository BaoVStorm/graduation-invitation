import { useEffect, useRef } from 'react'

/** Vị trí con trỏ / độ nghiêng điện thoại dùng chung, trong khoảng -1..1 */
export const pointer = { x: 0, y: 0 }

const clamp = (v: number) => Math.max(-1, Math.min(1, v))
let listening = false

function listen() {
  if (listening || typeof window === 'undefined') return
  listening = true
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = clamp((e.clientX / window.innerWidth) * 2 - 1)
      pointer.y = clamp((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
  window.addEventListener(
    'deviceorientation',
    (e) => {
      if (e.gamma == null || e.beta == null) return
      pointer.x = clamp(e.gamma / 25)
      pointer.y = clamp((e.beta - 40) / 25)
    },
    { passive: true },
  )
}
listen()

/** iOS cần người dùng chạm mới cho đọc con quay hồi chuyển */
export async function requestMotionPermission() {
  const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined
  try {
    await D?.requestPermission?.()
  } catch {
    /* người dùng từ chối: vẫn dùng chạm / con trỏ */
  }
}

/** Gắn CSS vars --rx --ry (độ nghiêng) và --mx --my (vị trí ánh foil) vào phần tử */
export function useTilt<T extends HTMLElement>(max = 12) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let cx = 0
    let cy = 0
    const loop = () => {
      cx += (pointer.x - cx) * 0.08
      cy += (pointer.y - cy) * 0.08
      el.style.setProperty('--rx', `${(-cy * max).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${(cx * max).toFixed(2)}deg`)
      el.style.setProperty('--mx', `${((cx + 1) * 50).toFixed(1)}%`)
      el.style.setProperty('--my', `${((cy + 1) * 50).toFixed(1)}%`)
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [max])
  return ref
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Tách chữ thành ký tự (giữ nguyên ký tự tiếng Việt dựng sẵn) */
export const chars = (s: string) => Array.from(s.normalize('NFC'))
