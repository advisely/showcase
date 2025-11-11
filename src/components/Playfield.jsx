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

  // Prevent text selection and dragging during panning
  useEffect(() => {
    const preventSelection = (e) => e.preventDefault();
    const preventDrag = (e) => e.preventDefault();

    if (playfieldRef.current) {
      playfieldRef.current.addEventListener('selectstart', preventSelection);
      playfieldRef.current.addEventListener('dragstart', preventDrag);
      playfieldRef.current.addEventListener('dragover', preventDrag);
    }

    return () => {
      if (playfieldRef.current) {
        playfieldRef.current.removeEventListener('selectstart', preventSelection);
        playfieldRef.current.removeEventListener('dragstart', preventDrag);
        playfieldRef.current.removeEventListener('dragover', preventDrag);
      }
    };
  }, []);

  // Enhanced event prevention in hand mode - capture phase
  useEffect(() => {
    if (interactionMode !== 'hand' || !playfieldRef.current) return;

    const preventDefaults = (e) => {
      // Only prevent if inside playfield container
      const playfieldContainer = playfieldRef.current?.closest('.playfield-container');
      if (playfieldContainer?.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Add capture-phase listeners on playfield container to intercept early
    const container = playfieldRef.current.closest('.playfield-container');
    if (container) {
      container.addEventListener('mousedown', preventDefaults, { capture: true, passive: false });
      container.addEventListener('dragstart', preventDefaults, { capture: true, passive: false });
      container.addEventListener('selectstart', preventDefaults, { capture: true, passive: false });
      container.addEventListener('dragover', preventDefaults, { capture: true, passive: false });

      return () => {
        container.removeEventListener('mousedown', preventDefaults, { capture: true });
        container.removeEventListener('dragstart', preventDefaults, { capture: true });
        container.removeEventListener('selectstart', preventDefaults, { capture: true });
        container.removeEventListener('dragover', preventDefaults, { capture: true });
      };
    }
  }, [interactionMode]);

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

  // Calculate background based on mode (use specific properties to avoid React conflicts)
  const getBackgroundStyles = () => {
    if (background.mode === 'gradient') {
      return {
        backgroundImage: `linear-gradient(${background.gradientAngle || 135}deg, ${background.color || '#2c3e50'}, ${background.gradientColor || '#34495e'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else if (background.mode === 'image' && background.image) {
      return {
        backgroundImage: `url(${background.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else {
      return {
        backgroundColor: background.color || '#2c3e50'
      };
    }
  };

  const playfieldStyle = {
    transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
    transformOrigin: 'center center',
    cursor: interactionMode === 'hand'
      ? (isPanning ? 'grabbing' : 'grab')
      : (isPanning ? 'grabbing' : 'default'),
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitUserDrag: 'none',
    position: 'relative',
    width: '100%',
    height: '100%'
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

  // Apply background to the main container
  const containerStyle = {
    ...getBackgroundStyles(),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'visible'
  };

  return (
    <div className="playfield-container" style={containerStyle}>
      {/* Overlay for image backgrounds - above background, below everything else */}
      {background.mode === 'image' && background.image && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `rgba(0, 0, 0, ${background.opacity ?? 0.3})`,
            backdropFilter: background.blur > 0 ? `blur(${background.blur}px)` : 'none',
            WebkitBackdropFilter: background.blur > 0 ? `blur(${background.blur}px)` : 'none',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

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
