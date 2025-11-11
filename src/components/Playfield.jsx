import { useRef, useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import throttle from 'lodash.throttle';
import useStore from '../store/useStore';
import Card from './Card';

const Playfield = () => {
  const playfieldRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const cards = useStore(state => state.cards);
  const background = useStore(state => state.background);
  const zoomLevel = useStore(state => state.zoomLevel);
  const panX = useStore(state => state.panX);
  const panY = useStore(state => state.panY);
  const updateCard = useStore(state => state.updateCard);
  const setPan = useStore(state => state.setPan);
  const saveToStorage = useStore(state => state.saveToStorage);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    })
  );

  // Handle card drag
  const handleDragEnd = (event) => {
    const { active, delta } = event;

    if (delta.x !== 0 || delta.y !== 0) {
      const card = cards.find(c => c.id === active.id);

      if (card) {
        const newX = (card.position?.x || 0) + delta.x;
        const newY = (card.position?.y || 0) + delta.y;

        updateCard(card.id, {
          position: { x: newX, y: newY }
        });

        saveToStorage();
      }
    }
  };

  // Handle playfield panning
  const handleMouseDown = (e) => {
    if (e.target === playfieldRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  const handleMouseMove = throttle((e) => {
    if (isPanning) {
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;
      setPan(newPanX, newPanY);
    }
  }, 16); // 60fps

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      saveToStorage();
    }
  };

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart]);

  const playfieldStyle = {
    background: background.image
      ? `url(${background.image})`
      : background.color || '#2c3e50',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
    transformOrigin: 'center center',
    cursor: isPanning ? 'grabbing' : 'grab'
  };

  return (
    <div className="playfield-container">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <motion.div
          ref={playfieldRef}
          className="playfield"
          style={playfieldStyle}
          onMouseDown={handleMouseDown}
          animate={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {cards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </motion.div>
      </DndContext>
    </div>
  );
};

export default Playfield;
