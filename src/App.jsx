import React, { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IceCreamScene from './IceCreamScene.jsx'
import Controls from './Controls.jsx'
import ButterflyCursor from './ButterflyCursor.jsx'
import AmbientBackground from './AmbientBackground.jsx'

const SMILE_MESSAGES = [
  "You're sweeter than strawberry syrup! 🍓",
  "Your smile is the cherry on top of my day! 🍒",
  "You make life a double scoop kind of day! 🍦",
  "Sprinkle some joy — you deserve it! ✨",
  "You're the sweetest scoop in the shop! 💗",
  "Warning: extreme cuteness detected! 🦋",
  "May your day be as smooth as soft serve! 🌸",
  "You're cooler than a mint chip breeze! 💜",
  "Sending you a waffle cone full of hugs! 🧇",
  "You're absolutely sundae-perfect! 🌟",
]

const MAX_SCOOPS = 5

export default function App() {
  const [scoops, setScoops] = useState([])
  const [vessel, setVessel] = useState('cone')
  const [cherry, setCherry] = useState(true)
  const [toast, setToast] = useState(null)

  const addScoop = useCallback((flavor) => {
    setScoops((prev) => {
      if (prev.length >= MAX_SCOOPS) return prev
      return [...prev, { ...flavor, id: `${flavor.name}-${Date.now()}-${Math.random()}` }]
    })
  }, [])

  const removeLastScoop = useCallback(() => {
    setScoops((prev) => prev.slice(0, -1))
  }, [])

  const resetAll = useCallback(() => {
    setScoops([])
    setCherry(true)
  }, [])

  const showSmile = useCallback(() => {
    const msg = SMILE_MESSAGES[Math.floor(Math.random() * SMILE_MESSAGES.length)]
    setToast({ id: Date.now(), msg })
    setTimeout(() => setToast(null), 2800)
  }, [])

  return (
    <div className="app-root">
      <AmbientBackground />
      <ButterflyCursor />

      <div className="canvas-stage">
        <IceCreamScene scoops={scoops} vessel={vessel} cherry={cherry} />
        <div className="canvas-fade" />
        <div className="title-banner">
          <h1>Dream Ice Cream Builder</h1>
          <p>Spin, build &amp; sprinkle some magic ✨</p>
        </div>
      </div>

      <Controls
        scoops={scoops}
        vessel={vessel}
        cherry={cherry}
        maxScoops={MAX_SCOOPS}
        onAddScoop={addScoop}
        onRemoveLast={removeLastScoop}
        onSetVessel={setVessel}
        onToggleCherry={() => setCherry((c) => !c)}
        onReset={resetAll}
      />

      <motion.button
        className="smile-fab"
        onClick={showSmile}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
        aria-label="Make me smile"
      >
        <span className="smile-fab-icon">🍒</span>
        <span className="smile-fab-text">Make Me Smile</span>
      </motion.button>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            initial={{ opacity: 0, y: 40, scale: 0.85, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 30, scale: 0.9, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <span className="toast-emoji">🌸</span>
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}