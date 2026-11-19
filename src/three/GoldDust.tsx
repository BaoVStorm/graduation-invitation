import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { pointer } from '../lib/motion'
import { dotTexture } from './textures'

const COUNT = 900

/** Bụi vàng lơ lửng làm nền cho toàn bộ trải nghiệm */
export function GoldDust() {
  const group = useRef<THREE.Group>(null)
  const points = useRef<THREE.Points>(null)
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const speeds = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = -Math.random() * 9 + 1.5
      speeds[i] = 0.05 + Math.random() * 0.18
    }
    return { positions, speeds }
  }, [])
  const map = useMemo(() => dotTexture(), [])

  useFrame((state, dt) => {
    const attr = points.current!.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * dt
      arr[i * 3] += Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.0015
      if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -5
    }
    attr.needsUpdate = true
    const g = group.current!
    g.rotation.y += (pointer.x * 0.12 - g.rotation.y) * 0.03
    g.rotation.x += (pointer.y * 0.08 - g.rotation.x) * 0.03
  })

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={map}
          size={0.09}
          sizeAttenuation
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#ffd76a"
          opacity={0.9}
        />
      </points>
    </group>
  )
}
