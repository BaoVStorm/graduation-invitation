import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { Phase } from '../App'
import { Celebration } from './Celebration'
import { Envelope } from './Envelope'
import { FlightScene } from './FlightScene'
import { GoldDust } from './GoldDust'

type Props = {
  phase: Phase
  name: string
  /** tăng lên mỗi lần muốn bắn pháo giấy ở trang chính */
  burst: number
  onEnvelopeTap: () => void
  onEnvelopeOpened: () => void
}

/** Ánh sáng môi trường (phản chiếu nhẹ trên thân máy bay, sáp, kim loại) */
function Environment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.45
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

/** Một Canvas WebGL cố định phía sau toàn bộ UI */
export default function Stage({ phase, name, burst, onEnvelopeTap, onEnvelopeOpened }: Props) {
  const showEnvelope = phase === 'envelope' || phase === 'opening'
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={1.05} />
      <directionalLight position={[2.5, 3.5, 5]} intensity={2.1} color="#fff6e2" />
      <directionalLight position={[-4, -1, 2]} intensity={0.45} color="#7f9cff" />
      <Environment />
      <GoldDust />
      {showEnvelope && <Envelope name={name} open={phase === 'opening'} onTap={onEnvelopeTap} onOpened={onEnvelopeOpened} />}
      {phase === 'flight' && <FlightScene />}
      {phase === 'celebrate' && <Celebration />}
      {phase === 'announce' && burst > 0 && <Celebration key={burst} />}
    </Canvas>
  )
}
