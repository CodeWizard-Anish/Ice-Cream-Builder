import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
} from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'

/* -------------------------------------------------------------------------- */
/* Materials / palette helpers                                                  */
/* -------------------------------------------------------------------------- */

const FLAVOR_COLORS = {
  vanilla: '#fff3d6',
  strawberry: '#ffb3c6',
  fudge: '#6b4326',
  mint: '#bdeec8',
  lavender: '#d6c2f2',
}

// 1. UPDATED MATH: Pushes the scoop much deeper into the bowl
const getScoopY = (index, vessel, baseY) => {
  if (vessel === 'cone') return baseY + index * 0.62
  
  // Bowl logic: Drop the first scoop way down!
  if (index === 0) return baseY - 0.45 
  if (index === 1) return baseY + 0.15 
  return baseY + 0.15 + (index - 1) * 0.58
}

const getScoopScale = (index, vessel) => {
  if (vessel === 'cone') {
    // Squeeze the first scoop slightly (0.92) so it fits inside the cone walls
    if (index === 0) return [0.92, 0.82, 0.92] 
    return [1, 0.82, 1]
  }
  
  // Bowl logic remains the same
  if (index === 0) return [1.3, 0.65, 1.3]
  if (index === 1) return [1.1, 0.75, 1.1]
  return [1, 0.82, 1]
}
/* -------------------------------------------------------------------------- */
/* Animated Scoop                                                                */
/* -------------------------------------------------------------------------- */
function Scoop({ flavor, index, baseY, vessel }) {
  const targetY = getScoopY(index, vessel, baseY)
  const targetScale = getScoopScale(index, vessel)

  const { posY, scale } = useSpring({
    from: { posY: targetY + 4, scale: [0.4, 0.4, 0.4] },
    to: { posY: targetY, scale: targetScale },
    // THE FIX: Increased friction from 14 to 18 to stop the deep bounce!
    config: { mass: 1, tension: 180, friction: 18 },
    delay: index * 80,
  })

  const color = FLAVOR_COLORS[flavor.name] || '#ffffff'
  const isChip = flavor.name === 'mint'

  return (
    <animated.group position-y={posY} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.04} envMapIntensity={0.6} />
      </mesh>

      {/* Top swirl highlight */}
      <mesh position={[0.05, 0.18, 0.05]} scale={[0.86, 0.7, 0.86]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.35} transparent opacity={0.55} />
      </mesh>

      {/* Mint chip flecks */}
      {isChip &&
        Array.from({ length: 10 }).map((_, i) => {
          const theta = (i / 10) * Math.PI * 2
          const r = 0.42 + (i % 3) * 0.06
          const y = -0.1 + (i % 4) * 0.12
          return (
            <mesh key={i} position={[Math.cos(theta) * r, y, Math.sin(theta) * r]} rotation={[Math.random(), Math.random(), Math.random()]}>
              <boxGeometry args={[0.045, 0.045, 0.045]} />
              <meshStandardMaterial color="#3a2a1a" roughness={0.4} />
            </mesh>
          )
        })}

      {/* Fudge drip accents */}
      {flavor.name === 'fudge' &&
        Array.from({ length: 4 }).map((_, i) => {
          const theta = (i / 4) * Math.PI * 2 + 0.4
          return (
            <mesh key={i} position={[Math.cos(theta) * 0.55, -0.32, Math.sin(theta) * 0.55]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.08, 0.22, 12]} />
              <meshStandardMaterial color="#3d2412" roughness={0.25} />
            </mesh>
          )
        })}
    </animated.group>
  )
}

/* -------------------------------------------------------------------------- */
/* Cherry                                                                       */
/* -------------------------------------------------------------------------- */

function Cherry({ y }) {
  const { posY, scale } = useSpring({
    from: { posY: y + 3, scale: 0 },
    to: { posY: y, scale: 1 },
    config: { mass: 1, tension: 200, friction: 12 },
    delay: 150,
  })

  return (
    <animated.group position-y={posY} scale={scale}>
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial color="#c41e3a" roughness={0.15} metalness={0.1} clearcoat={1} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0.05, 0.22, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.012, 0.018, 0.32, 8]} />
        <meshStandardMaterial color="#5c3b1e" roughness={0.7} />
      </mesh>
      <mesh position={[0.07, 0.05, 0.1]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#ff9eb0" roughness={0.05} emissive="#ff7a90" emissiveIntensity={0.15} />
      </mesh>
    </animated.group>
  )
}

/* -------------------------------------------------------------------------- */
/* Vessel: Waffle Cone                                                          */
/* -------------------------------------------------------------------------- */

function WaffleCone() {
  return (
    <group position={[0, -1.6, 0]}>
      <mesh castShadow receiveShadow rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.72, 1.6, 32, 16, true]} />
        <meshStandardMaterial
          color="#e3a85e"
          roughness={0.85}
          metalness={0}
          side={2}
        />
      </mesh>
      {/* waffle grid lines via thin torus rings */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 0.7 - i * 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72 - i * 0.115, 0.012, 8, 32]} />
          <meshStandardMaterial color="#c98a44" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
/* -------------------------------------------------------------------------- */
/* Vessel: Ceramic Bowl (Replaces the invisible glass)                        */
/* -------------------------------------------------------------------------- */
function GlassBowl() {
  return (
    <group position={[0, -1.2, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.05, 48, 48, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial
          color="#ffffff"       /* Solid white ceramic */
          roughness={0.15}      /* Very glossy */
          metalness={0.1}
          envMapIntensity={1.2} /* Catches the warm lighting beautifully */
        />
      </mesh>
      {/* The base inside the bowl */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 48]} />
        <meshStandardMaterial color="#fdf6e3" roughness={0.4} />
      </mesh>
    </group>
  )
}
/* -------------------------------------------------------------------------- */
/* Sprinkles decoration around top scoop                                       */
/* -------------------------------------------------------------------------- */

function Sprinkles({ topY, count = 3 }) {
  const colors = ['#ff9ec7', '#ffe08a', '#b6f2c2', '#c4b3ff', '#ffffff']
  
  // useMemo re-calculates the scatter pattern accurately when the heights change
  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const theta = (i / count) * Math.PI * 2 + Math.random()
      const r = 0.25 + Math.random() * 0.15
      return {
        pos: [Math.cos(theta) * r, topY - 0.05 + Math.random() * 0.1, Math.sin(theta) * r],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        color: colors[i % colors.length],
      }
    })
  }, [topY, count])

  return (
    <>
      {items.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot}>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 8]} />
          <meshStandardMaterial color={s.color} roughness={0.4} />
        </mesh>
      ))}
    </>
  )
}
/* -------------------------------------------------------------------------- */
/* The full assembled ice cream                                                */
/* -------------------------------------------------------------------------- */

function IceCreamStack({ scoops, vessel, cherry }) {
  const baseY = vessel === 'cone' ? -0.55 : -0.75
  const topScoopIndex = scoops.length - 1

  // Dynamic height calculations
  const topScoopY = scoops.length > 0 ? getScoopY(topScoopIndex, vessel, baseY) : baseY
  const topScaleY = scoops.length > 0 ? getScoopScale(topScoopIndex, vessel)[1] : 0.82
  const topEdgeY = topScoopY + (0.62 * topScaleY)

  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.25}>
      {/* THIS IS THE FIX: We added position to lift the entire group UP! */}
      <group position={[0, 0.6, 0]}>
        {vessel === 'cone' ? <WaffleCone /> : <GlassBowl />}

        {scoops.map((flavor, i) => (
          <Scoop key={flavor.id} flavor={flavor} index={i} baseY={baseY} vessel={vessel} />
        ))}

        {scoops.length > 0 && (
          <Sprinkles topY={topEdgeY} count={6} />
        )}

        {cherry && scoops.length > 0 && (
          <Cherry y={topEdgeY + 0.12} />
        )}

        {scoops.length === 0 && (
          <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
            <mesh position={[0, baseY + 0.9, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color="#ffd9ec" emissive="#ffb3d9" emissiveIntensity={0.6} transparent opacity={0.7} />
            </mesh>
          </Float>
        )}
      </group>
    </Float>
  )
}
/* -------------------------------------------------------------------------- */
/* Scene root                                                                   */
/* -------------------------------------------------------------------------- */

export default function IceCreamScene({ scoops, vessel, cherry }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [2.4, 1.6, 3.6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#fdf3f7']} />
      <fog attach="fog" args={['#fdf3f7', 6, 14]} />

      {/* Lighting: warm Ghibli-style key + soft fills */}
      <ambientLight intensity={0.55} color="#ffe8d6" />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.6}
        color="#ffd9a8"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#cdb8ff" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#fff0c2" distance={8} />

      <Suspense fallback={null}>
        <IceCreamStack scoops={scoops} vessel={vessel} cherry={cherry} />
        <Environment preset="apartment" />
        <ContactShadows
          position={[0, -2.05, 0]}
          opacity={0.45}
          scale={8}
          blur={2.6}
          far={3}
          color="#caa6c9"
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2.4}
        maxDistance={6}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.7}
        autoRotate
        autoRotateSpeed={0.6}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}