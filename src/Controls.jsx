import React, { useState, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'

const FLAVORS = [
  { name: 'vanilla', label: 'Vanilla', emoji: '🍦', swatch: '#fff3d6' },
  { name: 'strawberry', label: 'Strawberry', emoji: '🍓', swatch: '#ffb3c6' },
  { name: 'fudge', label: 'Rich Fudge', emoji: '🍫', swatch: '#6b4326' },
  { name: 'mint', label: 'Mint Chip', emoji: '🌿', swatch: '#bdeec8' },
  { name: 'lavender', label: 'Lavender', emoji: '💜', swatch: '#d6c2f2' },
]

export default function Controls({
  scoops,
  vessel,
  cherry,
  maxScoops,
  onAddScoop,
  onRemoveLast,
  onSetVessel,
  onToggleCherry,
  onReset,
}) {
  const [isOpen, setIsOpen] = useState(true)
  const isFull = scoops.length >= maxScoops
  
  const dragControls = useDragControls()
  // 1. Create a reference for our invisible "fence"
  const boundaryRef = useRef(null) 

  return (
    <>
      {/* 2. The invisible boundary div that controls where the menu can go */}
      <div ref={boundaryRef} className="drag-boundary" />

      <motion.div 
        className="ui-bottom-sheet"
        layout /* 3. MAGIC FIX: Forces physics to recalculate when opening/closing! */
        drag
        dragControls={dragControls}
        dragListener={false} 
        dragMomentum={false} 
        dragConstraints={boundaryRef} /* 4. Attach constraints to the invisible div */
      >
        {/* The Drag Handle Wrapper */}
        <div 
          className="drag-handle-wrapper"
          onPointerDown={(e) => dragControls.start(e)}
          style={{ touchAction: 'none', pointerEvents: 'auto', cursor: 'grab' }}
        >
          <motion.button
            className="menu-toggle-btn"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
            title="Drag to move, click to open/close!"
          >
            {isOpen ? '👇 Drag or Click to Hide' : '✨ Drag or Click to Build'}
          </motion.button>
        </div>

        {/* The Collapsible Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="ui-panel-inner"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 150, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <section className="panel-section">
                <h2>Choose Your Vessel</h2>
                <div className="vessel-row">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`vessel-btn ${vessel === 'cone' ? 'active' : ''}`}
                    onClick={() => onSetVessel('cone')}
                  >
                    🧇 Waffle Cone
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`vessel-btn ${vessel === 'bowl' ? 'active' : ''}`}
                    onClick={() => onSetVessel('bowl')}
                  >
                    🥣 Ceramic Bowl
                  </motion.button>
                </div>
              </section>

              <section className="panel-section">
                <div className="section-header">
                  <h2>Add Scoops</h2>
                  <span className="scoop-counter">{scoops.length} / {maxScoops}</span>
                </div>
                <div className="flavor-grid">
                  {FLAVORS.map((f) => (
                    <motion.button
                      key={f.name}
                      className="flavor-btn"
                      disabled={isFull}
                      whileTap={{ scale: 0.92 }}
                      whileHover={{ y: -3 }}
                      onClick={() => onAddScoop(f)}
                      style={{ opacity: isFull ? 0.45 : 1, borderColor: f.swatch }}
                    >
                      <span className="flavor-swatch" style={{ background: f.swatch }} />
                      <span className="flavor-emoji">{f.emoji}</span>
                      <span className="flavor-label">{f.label}</span>
                    </motion.button>
                  ))}
                </div>
              </section>

              <section className="panel-section">
                <h2>Finishing Touches</h2>
                <div className="finish-row">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`finish-btn ${cherry ? 'active' : ''}`}
                    onClick={onToggleCherry}
                  >
                    🍒 Cherry
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="finish-btn"
                    disabled={scoops.length === 0}
                    style={{ opacity: scoops.length === 0 ? 0.45 : 1 }}
                    onClick={onRemoveLast}
                  >
                    ↩️ Undo
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="finish-btn finish-btn-reset"
                    onClick={onReset}
                  >
                    🔄 Reset
                  </motion.button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}