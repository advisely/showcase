import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const Minimap = () => {
  const cards = useStore(state => state.cards);
  const panX = useStore(state => state.panX);
  const panY = useStore(state => state.panY);
  const zoomLevel = useStore(state => state.zoomLevel);
  const setPan = useStore(state => state.setPan);
  const saveToStorage = useStore(state => state.saveToStorage);

  const [isDragging, setIsDragging] = useState(false);
  const minimapRef = useRef(null);

  // Minimap dimensions
  const minimapWidth = 200;
  const minimapHeight = 150;
  const scale = 0.1; // Scale down the playfield

  // Calculate viewport bounds
  const viewportWidth = window.innerWidth / zoomLevel;
  const viewportHeight = (window.innerHeight - 100) / zoomLevel;

  const updatePanFromMinimap = (e) => {
    if (!minimapRef.current) return;

    const rect = minimapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert minimap coordinates to playfield coordinates
    const targetX = (x / scale) - (viewportWidth / 2);
    const targetY = (y / scale) - (viewportHeight / 2);

    setPan(-targetX, -targetY);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updatePanFromMinimap(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updatePanFromMinimap(e);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      saveToStorage();
    }
  };

  return (
    <motion.div
      ref={minimapRef}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: minimapWidth,
        height: minimapHeight,
        background: 'rgba(30, 30, 30, 0.95)',
        border: '2px solid #444',
        borderRadius: '8px',
        overflow: 'hidden',
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Playfield background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: '#2c3e50',
          opacity: 0.3
        }}
      />

      {/* Cards as dots */}
      {cards.map(card => (
        <div
          key={card.id}
          style={{
            position: 'absolute',
            left: (card.position?.x || 0) * scale,
            top: (card.position?.y || 0) * scale,
            width: (card.size?.width || 200) * scale,
            height: (card.size?.height || 200) * scale,
            background: '#667eea',
            borderRadius: '2px',
            border: '1px solid #fff',
            transition: 'all 0.2s'
          }}
        />
      ))}

      {/* Viewport indicator */}
      <div
        style={{
          position: 'absolute',
          left: (-panX) * scale,
          top: (-panY) * scale,
          width: viewportWidth * scale,
          height: viewportHeight * scale,
          border: '2px solid #4ade80',
          background: 'rgba(74, 222, 128, 0.1)',
          pointerEvents: 'none'
        }}
      />

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          fontSize: '10px',
          color: '#888',
          pointerEvents: 'none',
          textTransform: 'uppercase',
          fontWeight: 'bold'
        }}
      >
        Map
      </div>

      {/* Card count */}
      <div
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          fontSize: '10px',
          color: '#888',
          pointerEvents: 'none'
        }}
      >
        {cards.length} cards
      </div>
    </motion.div>
  );
};

export default Minimap;
