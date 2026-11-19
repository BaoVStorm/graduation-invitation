import { Canvas } from '@react-three/fiber'
import type { Phase } from '../App'
import { Celebration } from './Celebration'
import { Envelope } from './Envelope'
import { GoldDust } from './GoldDust'

type Props = {
  phase: Phase
  name: string
  /** tăng lên mỗi lần muốn bắn pháo giấy ở trang chính */
  burst: number
  onEnvelopeTap: () => void
  onEnvelopeOpened: () => void
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
      <GoldDust />
      {showEnvelope && <Envelope name={name} open={phase === 'opening'} onTap={onEnvelopeTap} onOpened={onEnvelopeOpened} />}
      {phase === 'celebrate' && <Celebration />}
      {phase === 'announce' && burst > 0 && <Celebration key={burst} />}
    </Canvas>
  )
}
