import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * Máy bay chở khách "Graduation Air", dựng hoàn toàn bằng code (không cần file model).
 * Mũi máy bay hướng +X, cánh phải hướng +Z (phía camera), dài khoảng 1.65 đơn vị.
 */

// Biên dạng thân: [bán kính, vị trí dọc thân] từ đuôi (-0.84) tới mũi (0.81)
const PROFILE: [number, number][] = [
  [0.0, -0.84],
  [0.022, -0.83],
  [0.05, -0.77],
  [0.078, -0.65],
  [0.1, -0.5],
  [0.116, -0.3],
  [0.122, -0.1],
  [0.122, 0.36],
  [0.117, 0.5],
  [0.104, 0.61],
  [0.08, 0.7],
  [0.05, 0.765],
  [0.02, 0.8],
  [0.0, 0.812],
]

/** bán kính thân tại vị trí x (nội suy tuyến tính) */
function radiusAt(x: number) {
  for (let i = 1; i < PROFILE.length; i++) {
    const [r0, y0] = PROFILE[i - 1]
    const [r1, y1] = PROFILE[i]
    if (x <= y1) return r0 + ((x - y0) / (y1 - y0)) * (r1 - r0)
  }
  return 0
}

/** Lathe quanh trục Y rồi xoay để mũi hướng +X. phi = 0 là sườn +Z, phi > 0 đi xuống bụng. */
function lathe(phiStart = 0, phiLength = Math.PI * 2, scale = 1, segments = 64) {
  const pts = PROFILE.map(([r, y]) => new THREE.Vector2(r * scale, y))
  const g = new THREE.LatheGeometry(pts, segments, phiStart, phiLength)
  g.rotateZ(-Math.PI / 2)
  return g
}

/** Mặt phẳng có độ dày (cánh, đuôi). points theo (dọc thân, sải cánh). */
function slab(points: [number, number][], thickness: number) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.35,
    bevelSize: thickness * 0.35,
    bevelSegments: 2,
  })
  g.translate(0, 0, -thickness / 2)
  return g
}

function finTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#13235e'
  ctx.fillRect(0, 0, 512, 512)
  // dải vàng chéo
  ctx.fillStyle = '#d9a83a'
  ctx.beginPath()
  ctx.moveTo(0, 360)
  ctx.lineTo(512, 250)
  ctx.lineTo(512, 290)
  ctx.lineTo(0, 400)
  ctx.fill()
  // biểu tượng mũ tốt nghiệp
  ctx.save()
  ctx.translate(215, 250)
  ctx.scale(0.9, 0.9)
  ctx.fillStyle = '#ffd56b'
  ctx.beginPath()
  ctx.moveTo(-70, 0)
  ctx.lineTo(0, -34)
  ctx.lineTo(70, 0)
  ctx.lineTo(0, 34)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(-38, 14, 76, 34)
  ctx.fillRect(56, 2, 6, 54)
  ctx.restore()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const FIN: [number, number][] = [
  [-0.56, 0.06],
  [-0.8, 0.06],
  [-0.87, 0.44],
  [-0.77, 0.44],
]

export function Airplane({ strobe = true }: { strobe?: boolean }) {
  const windows = useRef<THREE.InstancedMesh>(null)
  const cockpit = useRef<THREE.InstancedMesh>(null)
  const strobeRef = useRef<THREE.MeshStandardMaterial>(null)

  const geo = useMemo(() => {
    const wing = slab(
      [
        [0.14, 0],
        [-0.2, 0],
        [-0.43, 0.84],
        [-0.33, 0.84],
      ],
      0.022,
    )
    wing.rotateX(Math.PI / 2) // sải cánh: y → +z
    const stab = slab(
      [
        [-0.6, 0],
        [-0.79, 0],
        [-0.88, 0.3],
        [-0.81, 0.3],
      ],
      0.014,
    )
    stab.rotateX(Math.PI / 2)
    const fin = slab(FIN, 0.02)
    // UV mặt bên của đuôi = toạ độ thô → chuẩn hoá về 0..1 để dán texture
    const uv = fin.attributes.uv
    const pos = fin.attributes.position
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + 0.87) / 0.31, (pos.getY(i) - 0.06) / 0.38)
    uv.needsUpdate = true
    return {
      body: lathe(),
      belly: lathe(Math.PI / 2 - 0.75, 1.5, 1.006),
      lineR: lathe(0.32, 0.05, 1.008),
      lineL: lathe(Math.PI - 0.37, 0.05, 1.008),
      wing,
      stab,
      fin,
    }
  }, [])

  const mats = useMemo(
    () => ({
      white: new THREE.MeshStandardMaterial({ color: '#f5f2ea', roughness: 0.28, metalness: 0.15 }),
      navy: new THREE.MeshStandardMaterial({ color: '#13235e', roughness: 0.35, metalness: 0.25 }),
      gold: new THREE.MeshStandardMaterial({ color: '#d9a83a', roughness: 0.25, metalness: 0.85 }),
      glass: new THREE.MeshStandardMaterial({ color: '#0b1230', roughness: 0.08, metalness: 0.6 }),
      metal: new THREE.MeshStandardMaterial({ color: '#b9bcc6', roughness: 0.3, metalness: 0.9 }),
      dark: new THREE.MeshStandardMaterial({ color: '#141821', roughness: 0.6, metalness: 0.4 }),
      fin: new THREE.MeshStandardMaterial({ map: finTexture(), roughness: 0.35, metalness: 0.2 }),
    }),
    [],
  )

  // cửa sổ khách: 2 hàng dọc hai bên sườn, bám theo bề mặt thân
  useLayoutEffect(() => {
    const d = new THREE.Object3D()
    const n = new THREE.Vector3()
    let i = 0
    for (const phi of [-0.24, Math.PI + 0.24]) {
      for (let x = -0.46; x <= 0.5; x += 0.042) {
        const r = radiusAt(x) + 0.001
        n.set(0, -Math.sin(phi), Math.cos(phi))
        d.position.set(x, n.y * r, n.z * r)
        d.lookAt(d.position.clone().add(n))
        d.scale.set(0.0095, 0.0135, 0.004)
        d.updateMatrix()
        windows.current!.setMatrixAt(i++, d.matrix)
      }
    }
    windows.current!.count = i
    windows.current!.instanceMatrix.needsUpdate = true

    // kính buồng lái
    let k = 0
    for (const phi of [-Math.PI / 2 - 0.62, -Math.PI / 2 - 0.22, -Math.PI / 2 + 0.22, -Math.PI / 2 + 0.62]) {
      const x = 0.7
      const r = radiusAt(x) + 0.002
      n.set(0.45, -Math.sin(phi), Math.cos(phi)).normalize()
      d.position.set(x, -Math.sin(phi) * r, Math.cos(phi) * r)
      d.lookAt(d.position.clone().add(n))
      d.scale.set(0.022, 0.013, 0.004)
      d.updateMatrix()
      cockpit.current!.setMatrixAt(k++, d.matrix)
    }
    cockpit.current!.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(({ clock }) => {
    if (strobeRef.current) strobeRef.current.emissiveIntensity = strobe && clock.elapsedTime % 1.1 < 0.08 ? 6 : 0
  })

  const engine = (z: number) => (
    <group position={[0.06, -0.1, z]}>
      {/* trụ treo */}
      <mesh position={[-0.02, 0.05, 0]} material={mats.white}>
        <boxGeometry args={[0.14, 0.05, 0.016]} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} material={mats.white}>
        <cylinderGeometry args={[0.05, 0.043, 0.22, 32]} />
      </mesh>
      {/* viền vàng cửa hút gió */}
      <mesh position={[0.11, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.gold}>
        <torusGeometry args={[0.046, 0.007, 12, 32]} />
      </mesh>
      <mesh position={[0.108, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.dark}>
        <circleGeometry args={[0.042, 32]} />
      </mesh>
      <mesh position={[-0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.metal}>
        <coneGeometry args={[0.03, 0.05, 24]} />
      </mesh>
    </group>
  )

  return (
    <group>
      <mesh geometry={geo.body} material={mats.white} />
      <mesh geometry={geo.belly} material={mats.navy} />
      <mesh geometry={geo.lineR} material={mats.gold} />
      <mesh geometry={geo.lineL} material={mats.gold} />
      <instancedMesh ref={windows} args={[undefined, undefined, 60]} material={mats.glass}>
        <sphereGeometry args={[1, 10, 8]} />
      </instancedMesh>
      <instancedMesh ref={cockpit} args={[undefined, undefined, 4]} material={mats.glass}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      {/* cánh (thấp, hơi vểnh lên) */}
      <mesh geometry={geo.wing} material={mats.white} position={[0, -0.055, 0.06]} rotation={[-0.07, 0, 0]} />
      <mesh geometry={geo.wing} material={mats.white} position={[0, -0.055, -0.06]} rotation={[0.07, 0, 0]} scale={[1, 1, -1]} />
      {/* winglet */}
      <mesh position={[-0.4, 0.055, 0.905]} rotation={[-0.2, 0, -0.35]} material={mats.navy}>
        <boxGeometry args={[0.08, 0.1, 0.01]} />
      </mesh>
      <mesh position={[-0.4, 0.055, -0.905]} rotation={[0.2, 0, -0.35]} material={mats.navy}>
        <boxGeometry args={[0.08, 0.1, 0.01]} />
      </mesh>
      {engine(0.32)}
      {engine(-0.32)}

      {/* đuôi ngang + đuôi đứng */}
      <mesh geometry={geo.stab} material={mats.white} position={[0, 0.02, 0.04]} />
      <mesh geometry={geo.stab} material={mats.white} position={[0, 0.02, -0.04]} scale={[1, 1, -1]} />
      <mesh geometry={geo.fin} material={mats.fin} />

      {/* đèn hàng hải: đỏ cánh trái, xanh cánh phải, chớp trắng ở đuôi */}
      <mesh position={[-0.36, -0.01, -0.86]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff2020" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-0.36, -0.01, 0.86]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshStandardMaterial color="#3bff7a" emissive="#20ff60" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-0.84, 0.02, 0]}>
        <sphereGeometry args={[0.01, 12, 12]} />
        <meshStandardMaterial ref={strobeRef} color="#ffffff" emissive="#ffffff" emissiveIntensity={0} />
      </mesh>
    </group>
  )
}
