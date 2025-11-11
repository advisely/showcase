import { useRef, useState, useEffect } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import throttle from 'lodash.throttle';
import useStore from '../store/useStore';
import Card from './Card';
import SimpleCard from './SimpleCard';
import LayoutGuides from './LayoutGuides';

const Playfield = () => {
  const playfieldRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const cards = useStore(state => state.cards);
  const background = useStore(state => state.background);
  const zoomLevel = useStore(state => state.zoomLevel);
  const panX = useStore(state => state.panX);
  const panY = useStore(state => state.panY);
  const interactionMode = useStore(state => state.interactionMode);
  const updateCard = useStore(state => state.updateCard);
  const setPan = useStore(state => state.setPan);
  const saveToStorage = useStore(state => state.saveToStorage);

  // Only enable drag sensors in cursor mode
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    })
  );

  const isDndEnabled = interactionMode === 'cursor';

  // Handle card drag
  const handleDragEnd = (event) => {
    const { active, delta } = event;

    if (delta.x !== 0 || delta.y !== 0) {
      const card = cards.find(c => c.id === active.id);

      if (card) {
        // Compensate for zoom level when saving final position
        const newX = (card.position?.x || 0) + (delta.x / zoomLevel);
        const newY = (card.position?.y || 0) + (delta.y / zoomLevel);

        updateCard(card.id, {
          position: { x: newX, y: newY }
        });

        saveToStorage();
      }
    }
  };

  // Handle playfield panning
  const handleMouseDown = (e) => {
    // In hand mode, allow panning from anywhere; in cursor mode, only from empty space
    const shouldPan = interactionMode === 'hand' || e.target === playfieldRef.current;

    if (shouldPan) {
      e.preventDefault();
      e.stopPropagation();

      // Prevent any default browser drag behavior
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'none';
      }

      setIsPanning(true);
      setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
    }
  };

  // Prevent text selection during panning
  useEffect(() => {
    const preventSelection = (e) => e.preventDefault();

    if (playfieldRef.current) {
      playfieldRef.current.addEventListener('selectstart', preventSelection);
    }

    return () => {
      if (playfieldRef.current) {
        playfieldRef.current.removeEventListener('selectstart', preventSelection);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPanning) return;

    const handleMouseMove = (e) => {
      e.preventDefault();
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;
      setPan(newPanX, newPanY);
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      saveToStorage();
    };

    // Use passive: false to allow preventDefault
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, panStart.x, panStart.y, setPan, saveToStorage]);

  const playfieldStyle = {
    background: background.image
      ? `url(${background.image})`
      : background.color || '#2c3e50',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
    transformOrigin: 'center center',
    cursor: interactionMode === 'hand'
      ? (isPanning ? 'grabbing' : 'grab')
      : (isPanning ? 'grabbing' : 'default'),
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitUserDrag: 'none'
  };

  const playfieldContent = (
    <div
      ref={playfieldRef}
      className="playfield"
      style={playfieldStyle}
      onMouseDown={handleMouseDown}
      onDragStart={(e) => e.preventDefault()}
    >
      <LayoutGuides />
      {cards.map(card => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );

  return (
    <div className="playfield-container">
      {cards.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(50% + 30px)',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#999',
          fontSize: '20px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
          fontWeight: '500'
        }}>
          Click "Add Media" to get started
        </div>
      )}
      {isDndEnabled ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {playfieldContent}
        </DndContext>
      ) : (
        playfieldContent
      )}
    </div>
  );
};

export default Playfield;
