import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import throttle from 'lodash.throttle';
import useStore from '../store/useStore';
import Card from './Card';
import GroupContainer from './GroupContainer';
import LayoutGuides from './LayoutGuides';
import TextField from './TextField';
import GroupsPanel from './GroupsPanel';
import GroupSettingsModal from './GroupSettingsModal';

const Playfield = () => {
  const playfieldRef = useRef(null);
  const containerRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0 }); // Stable ref to prevent effect re-runs
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const cards = useStore(state => state.cards);
  const textFields = useStore(state => state.textFields);
  const groups = useStore(state => state.groups);
  const background = useStore(state => state.background);
  const zoomLevel = useStore(state => state.zoomLevel);
  const panX = useStore(state => state.panX);
  const panY = useStore(state => state.panY);
  const interactionMode = useStore(state => state.interactionMode);
  const updateCard = useStore(state => state.updateCard);
  const updateTextField = useStore(state => state.updateTextField);
  const moveGroupWithCards = useStore(state => state.moveGroupWithCards);
  const assignCardToGroup = useStore(state => state.assignCardToGroup);
  const setPan = useStore(state => state.setPan);
  const setZoom = useStore(state => state.setZoom);
  const saveToStorage = useStore(state => state.saveToStorage);

  // Use MouseSensor for reliable long-distance dragging (doesn't lose pointer like PointerSensor)
  // Also add TouchSensor for mobile support
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const isDndEnabled = interactionMode === 'cursor';

  // Handle card, text field, and group drag
  const handleDragEnd = (event) => {
    const { active, delta, over } = event;

    // Skip if no movement
    if (delta.x === 0 && delta.y === 0) return;

    const deltaX = delta.x / zoomLevel;
    const deltaY = delta.y / zoomLevel;

    // Check if dragging a group (drag ID format: "drag-group-X")
    // Also check the data.type and data.groupId for reliability
    const activeData = active.data?.current;
    let groupId = null;

    if (activeData?.type === 'group' && activeData?.groupId) {
      groupId = activeData.groupId;
    } else if (typeof active.id === 'string' && active.id.startsWith('drag-group-')) {
      groupId = active.id.replace('drag-', '');
    }

    if (groupId) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        // Use atomic update to move group and all its cards together
        moveGroupWithCards(group.id, deltaX, deltaY);
        saveToStorage();
        return;
      }
    }

    // Check if dragging a card
    const card = cards.find(c => c.id === active.id);
    if (card) {
      // Check if dropping onto a group
      if (over) {
        const overGroup = groups.find(g => g.id === over.id);
        if (overGroup && card.groupId !== overGroup.id) {
          assignCardToGroup(card.id, overGroup.id);
        }
      }

      updateCard(card.id, {
        position: {
          x: (card.position?.x || 0) + deltaX,
          y: (card.position?.y || 0) + deltaY
        }
      });

      saveToStorage();
      return;
    }

    // Check if dragging a text field
    const textField = textFields.find(t => t.id === active.id);
    if (textField) {
      updateTextField(textField.id, {
        position: {
          x: (textField.position?.x || 0) + deltaX,
          y: (textField.position?.y || 0) + deltaY
        }
      });

      saveToStorage();
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

  // Handle mousedown on container in hand mode (backup handler)
  const handleContainerMouseDown = (e) => {
    if (interactionMode === 'hand') {
      e.preventDefault();
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

  // Handle mouse wheel zoom
  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e) => {
      e.preventDefault();

      // Calculate zoom delta (negative deltaY = zoom in, positive = zoom out)
      const zoomDelta = -e.deltaY * 0.001; // Adjust sensitivity
      const newZoom = zoomLevel + zoomDelta;

      setZoom(newZoom);
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoomLevel, setZoom]);

  // Enhanced event prevention in hand mode - capture phase
  useEffect(() => {
    if (interactionMode !== 'hand' || !playfieldRef.current) return;

    const preventDefaults = (e) => {
      // Only prevent defaults (not propagation) to allow panning handlers to fire
      const playfieldContainer = playfieldRef.current?.closest('.playfield-container');
      if (playfieldContainer?.contains(e.target)) {
        e.preventDefault();
        // NOTE: Do NOT stopPropagation - we need events to reach panning handlers
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

  // Sync panStart state to ref for stable event handler references
  useEffect(() => {
    panStartRef.current = panStart;
  }, [panStart]);

  useEffect(() => {
    if (!isPanning) return;

    let rafId = null;
    let lastMouseEvent = null;

    const handleMouseMove = (e) => {
      e.preventDefault();
      lastMouseEvent = e;

      // Throttle updates using requestAnimationFrame for smooth 60fps panning
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          if (lastMouseEvent) {
            // Use ref to get current panStart values (stable reference)
            const newPanX = lastMouseEvent.clientX - panStartRef.current.x;
            const newPanY = lastMouseEvent.clientY - panStartRef.current.y;
            setPan(newPanX, newPanY);
          }
          rafId = null;
        });
      }
    };

    const handleMouseUp = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      setIsPanning(false);
      saveToStorage();
    };

    // Use passive: false to allow preventDefault
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, setPan, saveToStorage]); // Removed panStart.x/y - using ref instead

  // Use CSS custom properties for background to fix initial render timing issues
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    if (background.mode === 'gradient') {
      container.style.setProperty('--bg-image', `linear-gradient(${background.gradientAngle || 135}deg, ${background.color || '#2c3e50'}, ${background.gradientColor || '#34495e'})`);
      container.style.setProperty('--bg-size', '100% 100%');
      container.style.setProperty('--bg-position', 'center');
      container.style.setProperty('--bg-color', 'transparent');
      container.style.setProperty('--bg-repeat', 'no-repeat');
    } else if (background.mode === 'image' && background.image) {
      container.style.setProperty('--bg-image', `url(${background.image})`);
      container.style.setProperty('--bg-size', '100% 100%');
      container.style.setProperty('--bg-position', 'center');
      container.style.setProperty('--bg-color', background.color || '#2c3e50');
      container.style.setProperty('--bg-repeat', 'no-repeat');
    } else {
      container.style.setProperty('--bg-image', 'none');
      container.style.setProperty('--bg-size', 'auto');
      container.style.setProperty('--bg-position', 'center');
      container.style.setProperty('--bg-color', background.color || '#2c3e50');
      container.style.setProperty('--bg-repeat', 'no-repeat');
    }
  }, [background]);

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
    height: '100%',
    minHeight: '100%'
  };

  // Sort groups by order for consistent z-index layering
  // Expanded groups get higher z-index to appear on top
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  // Filter cards: hide cards that are in non-expanded groups (they show as thumbnails inside the group)
  const visibleCards = cards.filter(card => {
    if (!card.groupId) return true; // Ungrouped cards are always visible
    const cardGroup = groups.find(g => g.id === card.groupId);
    if (!cardGroup) return true; // Show if group not found (orphaned card)
    return cardGroup.expanded === true; // Only show if explicitly expanded
  });

  const playfieldContent = (
    <div
      ref={playfieldRef}
      className="playfield"
      style={playfieldStyle}
      onMouseDown={handleMouseDown}
      onDragStart={(e) => e.preventDefault()}
    >
      <LayoutGuides />
      {/* Render groups first (behind cards) */}
      {/* Expanded groups get zIndex boost (100+) to appear above collapsed groups */}
      {sortedGroups.map((group, index) => (
        <GroupContainer
          key={group.id}
          group={group}
          zIndex={group.expanded ? 100 + index : index + 1}
        />
      ))}
      {/* Cards render above groups - only visible/expanded cards */}
      {/* Cards from expanded groups get higher zIndex (200+) to appear above expanded group containers */}
      {visibleCards.map((card, index) => (
        <Card key={card.id} card={card} zIndex={200 + index} />
      ))}
      {/* Text fields above cards */}
      {textFields.map((textField, index) => (
        <TextField key={textField.id} textField={textField} zIndex={300 + index} />
      ))}
    </div>
  );

  // Background is now handled via CSS custom properties
  return (
    <>
    <GroupsPanel />
    <GroupSettingsModal />
    <div
      ref={containerRef}
      className={`playfield-container${interactionMode === 'hand' ? ' hand-mode' : ''}`}
      onMouseDown={interactionMode === 'hand' ? handleContainerMouseDown : undefined}
    >
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
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          autoScroll={false}
        >
          {playfieldContent}
        </DndContext>
      ) : (
        playfieldContent
      )}
    </div>
    </>
  );
};

export default Playfield;
