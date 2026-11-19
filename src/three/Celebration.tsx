import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const GRAVITY = -7.5
const CAPS = 7
const CONFETTI = 320
const COLORS = ['#ffcf33', '#ffe08a', '#1e9a52', '#ffffff', '#2a46b8', '#ff6b6b']

type Body = { p: THREE.Vector3; v: THREE.Vector3; r: THREE.Euler; w: THREE.Vector3; delay: number }

function GradCap() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.72, 0.035, 0.72]} />
        <meshStandardMaterial color="#13235e" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.18, 32]} />
        <meshStandardMaterial color="#0f1a4a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#ffcf33" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.2, 0.025, 0.2]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.56, 0.012, 0.02]} />
        <meshStandardMaterial color="#ffcf33" />
      </mesh>
      <mesh position={[0.39, -0.1, 0.39]}>
        <cylinderGeometry args={[0.025, 0.04, 0.24, 8]} />
        <meshStandardMaterial color="#ffcf33" roughness={0.7} />
      </mesh>
    </group>
  )
}

/** Cảnh 8: tung mũ + pháo giấy 3D */
export function Celebration() {
  const { viewport } = useThree()
  const spread = Math.min(viewport.width, 6)
  const capRefs = useRef<(THREE.Group | null)[]>([])
  const confetti = useRef<THREE.InstancedMesh>(null)
  const start = useRef(0)

  const caps = useMemo<Body[]>(
    () =>
      Array.from({ length: CAPS }, (_, i) => ({
        p: new THREE.Vector3(((i / (CAPS - 1)) * 2 - 1) * spread * 0.38, -3.2, -0.5 - Math.random() * 1.5),
        v: new THREE.Vector3((Math.random() - 0.5) * 1.2, 7.2 + Math.random() * 1.6, 0),
        r: new THREE.Euler(Math.random(), Math.random() * 6, Math.random()),
        w: new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6),
        delay: i * 0.09,
      })),
    [spread],
  )

  const pieces = useMemo<Body[]>(
    () =>
      Array.from({ length: CONFETTI }, (_, i) => {
        const wave = i < CONFETTI / 2 ? 0 : 1.1
        const a = Math.random() * Math.PI * 2
        const sp = 2 + Math.random() * 4.5
        return {
          p: new THREE.Vector3((Math.random() - 0.5) * 0.6, -1.6, (Math.random() - 0.5) * 0.6),
          v: new THREE.Vector3(Math.cos(a) * sp * 0.6, 4.5 + Math.random() * 5, Math.sin(a) * sp * 0.3),
          r: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
          w: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
          delay: wave + Math.random() * 0.15,
        }
      }),
    [],
  )

  useLayoutEffect(() => {
    const m = confetti.current!
    const c = new THREE.Color()
    for (let i = 0; i < CONFETTI; i++) m.setColorAt(i, c.set(COLORS[i % COLORS.length]))
    m.instanceColor!.needsUpdate = true
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30)
    if (!start.current) start.current = state.clock.elapsedTime
    const t = state.clock.elapsedTime - start.current

    caps.forEach((b, i) => {
      const g = capRefs.current[i]
      if (!g) return
      if (t < b.delay) return void (g.visible = false)
      g.visible = true
      b.v.y += GRAVITY * dt * 0.55
      b.p.addScaledVector(b.v, dt)
      b.r.x += b.w.x * dt
      b.r.y += b.w.y * dt
      b.r.z += b.w.z * dt
      g.position.copy(b.p)
      g.rotation.copy(b.r)
    })

    const m = confetti.current!
    pieces.forEach((b, i) => {
      if (t < b.delay) {
        dummy.scale.setScalar(0)
      } else {
        b.v.y += GRAVITY * dt * 0.35
        b.v.multiplyScalar(1 - 1.6 * dt) // lực cản không khí: rơi lả tả
        b.v.y = Math.max(b.v.y, -1.1)
        b.p.addScaledVector(b.v, dt)
        b.p.x += Math.sin(t * 3 + i) * 0.004
        b.r.x += b.w.x * dt
        b.r.y += b.w.y * dt
        dummy.scale.setScalar(1)
      }
      dummy.position.copy(b.p)
      dummy.rotation.copy(b.r)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {caps.map((_, i) => (
        <group key={i} ref={(el) => void (capRefs.current[i] = el)} scale={spread < 3 ? 0.62 : 1}>
          <GradCap />
        </group>
      ))}
      <instancedMesh ref={confetti} args={[undefined, undefined, CONFETTI]}>
        <planeGeometry args={[0.07, 0.12]} />
        <meshStandardMaterial side={THREE.DoubleSide} roughness={0.5} metalness={0.2} />
      </instancedMesh>
    </group>
  )
}
