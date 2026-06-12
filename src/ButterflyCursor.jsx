import React, { useEffect, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

let idCounter = 0

const BUTTERFLY_COLORS = ['#ffb6d9', '#e9c8ff', '#fff0c2', '#ffd6e8', '#d8c4ff']

function ButterflySVG({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
      <g>
        <path
          d="M16 16 C8 4, -2 8, 4 18 C8 24, 14 20, 16 16 Z"
          fill={color}
          opacity="0.85"
        />
        <path
          d="M16 16 C24 4, 34 8, 28 18 C24 24, 18 20, 16 16 Z"
          fill={color}
          opacity="0.85"
        />
        <path
          d="M16 16 C10 22, 6 28, 12 30 C16 31, 16 22, 16 16 Z"
          fill={color}
          opacity="0.7"
        />
        <path
          d="M16 16 C22 22, 26 28, 20 30 C16 31, 16 22, 16 16 Z"
          fill={color}
          opacity="0.7"
        />
        <ellipse cx="16" cy="16" rx="1.6" ry="4" fill="#7a5c8e" />
      </g>
    </svg>
  )
}

export default function ButterflyCursor() {
  const [items, setItems] = useState([])
  const lastSpawn = useRef(0)
  const frame = useRef(0)

  const spawn = useCallback((x, y) => {
    const now = performance.now()
    if (now - lastSpawn.current < 60) return
    lastSpawn.current = now

    idCounter += 1
    const id = idCounter
    const isButterfly = idCounter % 3 === 0
    const color = BUTTERFLY_COLORS[idCounter % BUTTERFLY_COLORS.length]

    setItems((prev) => [
      ...prev.slice(-18),
      { id, x, y, isButterfly, color, drift: (Math.random() - 0.5) * 60 },
    ])

    setTimeout(() => {
      setItems((prev) => prev.filter((p) => p.id !== id))
    }, 1100)
  }, [])

  useEffect(() => {
    const handleMove = (e) => {
      cancelAnimationFrame(frame.current)
      let x, y
      if (e.touches && e.touches[0]) {
        x = e.touches[0].clientX
        y = e.touches[0].clientY
      } else {
        x = e.clientX
        y = e.clientY
      }
      frame.current = requestAnimationFrame(() => spawn(x, y))
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
      cancelAnimationFrame(frame.current)
    }
  }, [spawn])

  return (
    <div className="cursor-layer" aria-hidden="true">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="cursor-particle"
            style={{ left: item.x, top: item.y }}
            initial={{ opacity: 0.9, scale: item.isButterfly ? 0.6 : 0.3, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: item.isButterfly ? 1 : 1.4,
              x: item.drift,
              y: -40 - Math.random() * 30,
              rotate: item.isButterfly ? (Math.random() > 0.5 ? 25 : -25) : 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            {item.isButterfly ? (
              <ButterflySVG color={item.color} />
            ) : (
              <div className="glow-dot" style={{ background: item.color }} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}