import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Airplane } from './Airplane'

import { FLIGHT_SECONDS } from '../lib/timing'

const X = new THREE.Vector3(1, 0, 0)
const smooth = (t: number) => t * t * (3 - 2 * t)

function cloudTexture() {
  const S = 256
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 14; i++) {
    const x = S * (0.25 + rnd() * 0.5)
    const y = S * (0.4 + rnd() * 0.25)
    const r = S * (0.12 + rnd() * 0.16)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, S, S)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function glowTexture() {
  const S = 256
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(255,240,200,1)')
  g.addColorStop(0.2, 'rgba(255,207,90,0.65)')
  g.addColorStop(1, 'rgba(255,180,60,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

type Cloud = { x: number; y: number; z: number; s: number; speed: number; o: number }

/** Một vệt khói sau động cơ, dài theo thời gian (không phụ thuộc FPS) */
function Contrail({ source, offset }: { source: React.RefObject<THREE.Group | null>; offset: [number, number, number] }) {
  const MAX = 64
  const LIFE = 0.5 // giây
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3))
    const m = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    const l = new THREE.Line(g, m)
    l.frustumCulled = false
    return l
  }, [])
  const local = useMemo(() => new THREE.Vector3(...offset), [offset])
  const pts = useRef<{ p: THREE.Vector3; t: number }[]>([])

  useFrame(({ clock }) => {
    const src = source.current
    if (!src) return
    src.updateMatrixWorld() // vị trí vừa đặt trong frame này, chưa render
    const now = clock.elapsedTime
    const list = pts.current
    list.push({ p: src.localToWorld(local.clone()), t: now })
    while (list.length > MAX || (list.length && now - list[0].t > LIFE)) list.shift()
    const pos = line.geometry.attributes.position.array as Float32Array
    const col = line.geometry.attributes.color.array as Float32Array
    list.forEach(({ p, t }, i) => {
      pos.set([p.x, p.y, p.z], i * 3)
      const k = (1 - (now - t) / LIFE) ** 1.5 * 0.8
      col.set([k, k, k], i * 3)
    })
    line.geometry.setDrawRange(0, list.length)
    line.geometry.attributes.position.needsUpdate = true
    line.geometry.attributes.color.needsUpdate = true
  })
  return <primitive object={line} />
}

/** Cảnh 5 (3D): máy bay Graduation Air bay chéo màn hình giữa mây, về phía ánh sáng "Tương lai" */
export function FlightScene() {
  const { viewport, camera } = useThree()
  const W = viewport.width
  const narrow = W < 3
  const plane = useRef<THREE.Group>(null)
  const glow = useRef<THREE.Sprite>(null)
  const start = useRef<number | null>(null)
  const cloudRefs = useRef<(THREE.Sprite | null)[]>([])

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        // từ sát camera phía dưới bên trái, lượn lên xa dần về phía ánh sáng
        new THREE.Vector3(-W * 0.42, -1.3, 1.7),
        new THREE.Vector3(-W * 0.05, -0.45, 0.4),
        new THREE.Vector3(W * 0.22, 0.25, -1.6),
        new THREE.Vector3(W * 0.4, 1.0, -6),
      ]),
    [W],
  )
  const tex = useMemo(() => ({ cloud: cloudTexture(), glow: glowTexture() }), [])
  const clouds = useMemo<Cloud[]>(() => {
    let seed = 11
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: 34 }, (_, i) => {
      const front = i < 4 // vài đám mây sát camera tạo cảm giác tốc độ
      const z = front ? 2 + rnd() * 1 : -8 + rnd() * 7
      return {
        x: (rnd() - 0.5) * (W + 8),
        y: front ? -2 + rnd() * 1.4 : -2.6 + rnd() * 4.2,
        z,
        s: front ? 2.6 + rnd() * 1.6 : 1.4 + rnd() * 2.4,
        speed: front ? 5 : 0.9 + (z + 6) * 0.35,
        o: front ? 0.1 : 0.1 + rnd() * 0.2,
      }
    })
  }, [W])

  const q = useMemo(() => new THREE.Quaternion(), [])
  const roll = useMemo(() => new THREE.Quaternion(), [])

  useEffect(() => {
    const z = camera.position.z
    return () => {
      camera.position.set(0, 0, z)
      camera.lookAt(0, 0, 0)
    }
  }, [camera])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    if (start.current === null) start.current = state.clock.elapsedTime
    const t = Math.min(1, (state.clock.elapsedTime - start.current) / FLIGHT_SECONDS)
    const e = 0.15 * t + 0.85 * smooth(t)

    const p = plane.current!
    const pos = curve.getPointAt(e)
    const tan = curve.getTangentAt(e)
    p.position.copy(pos)
    q.setFromUnitVectors(X, tan)
    roll.setFromAxisAngle(X, -0.45 + Math.sin(t * Math.PI) * 0.3) // nghiêng cánh khi lượn
    p.quaternion.copy(q).multiply(roll)

    // camera bám nhẹ theo máy bay
    camera.position.x += (pos.x * 0.18 - camera.position.x) * 0.05
    camera.position.y += (pos.y * 0.12 - camera.position.y) * 0.05
    camera.lookAt(pos.x * 0.1, pos.y * 0.1, 0)

    clouds.forEach((c, i) => {
      const s = cloudRefs.current[i]
      if (!s) return
      c.x -= c.speed * dt
      if (c.x < -W / 2 - 5) c.x = W / 2 + 5
      s.position.set(c.x, c.y, c.z)
    })

    // ánh sáng "Tương lai" sáng dần khi máy bay tới gần
    const g = glow.current!
    g.material.opacity = 0.25 + smooth(t) * 0.75
    const k = 3 + smooth(t) * 2.5
    g.scale.set(k, k, 1)
  })

  const end = curve.getPointAt(1)
  const begin = curve.getPointAt(0)

  return (
    <group>
      <sprite ref={glow} position={[end.x - 0.4, end.y - 0.1, end.z - 1]}>
        <spriteMaterial map={tex.glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {clouds.map((c, i) => (
        <sprite key={i} ref={(el) => void (cloudRefs.current[i] = el)} position={[c.x, c.y, c.z]} scale={[c.s * 1.8, c.s, 1]}>
          <spriteMaterial map={tex.cloud} transparent opacity={c.o} depthWrite={false} color="#cfd9ff" />
        </sprite>
      ))}
      {/* đặt sẵn ở điểm đầu: vệt khói có thể đọc vị trí trước khi useFrame của cảnh chạy */}
      <group ref={plane} position={begin} scale={narrow ? 0.7 : 1.15}>
        <Airplane />
      </group>
      <Contrail source={plane} offset={[-0.2, -0.1, 0.32]} />
      <Contrail source={plane} offset={[-0.2, -0.1, -0.32]} />
    </group>
  )
}
