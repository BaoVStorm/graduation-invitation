import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { sfx } from '../lib/audio'
import { pointer } from '../lib/motion'
import { letterTexture, paperTexture, pocketTexture, sealTexture } from './textures'

const W = 2.4
const H = 1.6
const FLAP = H * 0.56

/** ShapeGeometry có UV phủ theo khung phong bì W×H (thay vì toạ độ thô) */
function shapeGeometry(points: [number, number][]) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)))
  const geo = new THREE.ShapeGeometry(shape)
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + W / 2) / W, (pos.getY(i) + H / 2) / H)
  uv.needsUpdate = true
  return geo
}

type Props = {
  name: string
  open: boolean
  onTap: () => void
  onOpened: () => void
}

export function Envelope({ name, open, onTap, onOpened }: Props) {
  const root = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  const flap = useRef<THREE.Group>(null)
  const seal = useRef<THREE.Group>(null)
  const letter = useRef<THREE.Mesh>(null)
  const flash = useRef<THREE.PointLight>(null)
  const opening = useRef(false)
  const { camera, viewport } = useThree()

  const tex = useMemo(
    () => ({
      back: paperTexture('#e8dcc0'),
      flap: paperTexture('#efe4cb'),
      pocket: pocketTexture(name),
      letter: letterTexture(),
      seal: sealTexture(),
    }),
    [name],
  )
  const geo = useMemo(
    () => ({
      pocket: shapeGeometry([
        [-W / 2, -H / 2],
        [W / 2, -H / 2],
        [W / 2, H / 2],
        [0, H * 0.02],
        [-W / 2, H / 2],
      ]),
      flap: new THREE.ShapeGeometry(
        new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, -FLAP)]),
      ),
    }),
    [],
  )
  const sealMats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: '#8f1218', roughness: 0.35, metalness: 0.1 })
    const top = new THREE.MeshStandardMaterial({ map: tex.seal, roughness: 0.35, metalness: 0.15 })
    return [side, top, side]
  }, [tex.seal])

  const scale = Math.min(1, (viewport.width * 0.86) / W)

  // Bay vào từ dưới
  useLayoutEffect(() => {
    const r = root.current!
    gsap.fromTo(r.position, { y: -4 }, { y: 0, duration: 1.4, ease: 'power3.out' })
    sfx('slide')
    gsap.fromTo(r.rotation, { z: 0.6, x: 0.9 }, { z: 0, x: 0, duration: 1.6, ease: 'power3.out' })
  }, [])

  // Kịch bản mở thư (UI-SCRIPT cảnh 3)
  useEffect(() => {
    if (!open || opening.current) return
    opening.current = true
    const startZ = camera.position.z
    const tl = gsap.timeline({ onComplete: onOpened })
    tl.call(() => sfx('crack'), [], 0.12)
      .call(() => sfx('paper'), [], 0.45)
      .call(() => sfx('slide'), [], 1.2)
      .call(() => sfx('whoosh'), [], 1.85)
      .to(seal.current!.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.15, ease: 'power2.out' }, 0)
      .to(flash.current!, { intensity: 14, duration: 0.15 }, 0)
      .to(flash.current!, { intensity: 0, duration: 0.6 }, 0.15)
      .to(seal.current!.scale, { x: 0, y: 0, z: 0, duration: 0.35, ease: 'back.in(2)' }, 0.15)
      .to(seal.current!.rotation, { z: 2.5, duration: 0.35 }, 0.15)
      .to(seal.current!.position, { y: '-=0.6', z: '+=0.6', duration: 0.35 }, 0.15)
      .to(flap.current!.rotation, { x: -Math.PI, duration: 0.8, ease: 'power2.inOut' }, 0.4)
      // khi nắp dựng đứng, đưa ra sau tấm vé để không che
      .set(flap.current!.position, { z: -0.012 }, 0.8)
      .to(letter.current!.position, { y: H * 0.78, duration: 0.9, ease: 'power2.out' }, 1.2)
      .to(root.current!.position, { y: -H * 0.45, duration: 0.8, ease: 'power2.inOut' }, 1.9)
      .to(camera.position, { z: 2.3, duration: 0.7, ease: 'power3.in' }, 1.9)
    return () => {
      tl.kill()
      camera.position.z = startZ
    }
  }, [open, camera, onOpened])

  useFrame((state) => {
    const t = tilt.current!
    const k = opening.current ? 0.02 : 0.06
    t.rotation.y += (pointer.x * 0.38 - t.rotation.y) * k
    t.rotation.x += (pointer.y * 0.28 - t.rotation.x) * k
    if (!opening.current) t.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.06
  })

  return (
    <group ref={root} scale={scale}>
      <pointLight ref={flash} position={[0, 0, 0.8]} color="#ffd56b" intensity={0} distance={6} />
      <group
        ref={tilt}
        onClick={(e) => {
          e.stopPropagation()
          onTap()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      >
        {/* mặt sau (lòng phong bì) */}
        <mesh>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial map={tex.back} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
        {/* tấm vé bên trong */}
        <mesh ref={letter} position={[0, 0, 0.006]}>
          <planeGeometry args={[W * 0.9, H * 0.86]} />
          <meshStandardMaterial map={tex.letter} roughness={0.6} />
        </mesh>
        {/* túi chữ V có tên khách */}
        <mesh geometry={geo.pocket} position={[0, 0, 0.012]}>
          <meshStandardMaterial map={tex.pocket} roughness={0.92} />
        </mesh>
        {/* nắp, xoay quanh mép trên */}
        <group ref={flap} position={[0, H / 2, 0.018]}>
          <mesh geometry={geo.flap}>
            <meshStandardMaterial map={tex.flap} roughness={0.92} side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* sáp niêm phong */}
        <group ref={seal} position={[0, H / 2 - FLAP + 0.03, 0.05]}>
          <mesh rotation={[Math.PI / 2, Math.PI / 2, 0]} material={sealMats}>
            <cylinderGeometry args={[0.2, 0.215, 0.055, 48]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
