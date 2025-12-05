import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, pointerWithin, rectIntersection } from '@dnd-kit/core';
import throttle from 'lodash.throttle';
import useStore from '../store/useStore';
import Card from './Card';
import GroupContainer from './GroupContainer';
import LayoutGuides from './LayoutGuides';
import TextField from './TextField';
import GroupsPanel from './GroupsPanel';
import GroupSettingsModal from './GroupSettingsModal';

/**
 * Custom collision detection that respects visual z-index for overlapping droppables.
 * When multiple groups overlap, this ensures the drop targets the visually topmost group.
 */
const zIndexAwareCollisionDetection = (args) => {
  const { droppableContainers } = args;

  // First, find droppables where pointer is within bounds (most accurate for overlapping)
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    // If multiple droppables contain the pointer, sort by z-index (descending)
    // Groups pass their zIndex in the data prop
    const sorted = [...pointerCollisions].sort((a, b) => {
      // droppableContainers is an array, find by id
      const aContainer = droppableContainers.find(c => c.id === a.id);
      const bContainer = droppableContainers.find(c => c.id === b.id);
      const aZIndex = aContainer?.data?.current?.zIndex || 0;
      const bZIndex = bContainer?.data?.current?.zIndex || 0;
      return bZIndex - aZIndex; // Higher z-index first
    });

    // Return only the topmost droppable to prevent dropping on obscured groups
    return [sorted[0]];
  }

  // Fallback to rect intersection for cases where pointer isn't directly over a droppable
  return rectIntersection(args);
};

const Playfield = () => {
  const playfieldRef = useRef(null);
  const containerRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0 }); // Stable ref to prevent effect re-runs
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const cards = useStore(state => state.cards);
  const textFields = useStore(state => state.textFields);
  const groups = useStore(state => state.groups);
  const selectedGroupId = useStore(state => state.selectedGroupId);
  const background = useStore(state => state.background);
  const zoomLevel = useStore(state => state.zoomLevel);
  const panX = useStore(state => state.panX);
  const panY = useStore(state => state.panY);
  const interactionMode = useStore(state => state.interactionMode);
  const updateCard = useStore(state => state.updateCard);
  const updateTextField = useStore(state => state.updateTextField);
  const moveGroupWithCards = useStore(state => state.moveGroupWithCards);
  const assignCardToGroup = useStore(state => state.assignCardToGroup);
  const toggleGroupExpanded = useStore(state => state.toggleGroupExpanded);
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
          // Assign card to group - this sets groupId and positions card inside group
          // Exit early to avoid conflicting position update
          assignCardToGroup(card.id, overGroup.id);
          saveToStorage();
          return;
        }
      }

      // Only update position for cards NOT being dropped on a group
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

  // Handle click on empty playfield space to collapse expanded groups
  const handlePlayfieldClick = (e) => {
    // Only handle clicks directly on the playfield (empty space)
    if (e.target !== playfieldRef.current) return;

    // Find any expanded group and collapse it
    const expandedGroup = groups.find(g => g.expanded);
    if (expandedGroup) {
      toggleGroupExpanded(expandedGroup.id);
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
  // Selected group gets highest z-index among expanded groups
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  // Calculate z-index for a group:
  // - Collapsed groups: 1-99 (based on order)
  // - Expanded groups: 100-149 (based on order)
  // - Selected expanded group: 150 (always on top of other expanded groups)
  const getGroupZIndex = (group, index) => {
    const isSelected = group.id === selectedGroupId;
    if (group.expanded) {
      return isSelected ? 150 : 100 + index;
    }
    return index + 1;
  };

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
      onClick={handlePlayfieldClick}
      onDragStart={(e) => e.preventDefault()}
    >
      <LayoutGuides />
      {/* Render groups first (behind cards) */}
      {/* Expanded groups get zIndex boost (100+), selected expanded group gets 150 */}
      {sortedGroups.map((group, index) => (
        <GroupContainer
          key={group.id}
          group={group}
          zIndex={getGroupZIndex(group, index)}
        />
      ))}
      {/* Cards render above groups - only visible/expanded cards */}
      {/* Cards from expanded groups get higher zIndex (200+) to appear above expanded group containers */}
      {/* AnimatePresence enables exit animations when cards hide during group collapse */}
      <AnimatePresence mode="popLayout">
        {visibleCards.map((card, index) => (
          <Card key={card.id} card={card} zIndex={200 + index} />
        ))}
      </AnimatePresence>
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
          collisionDetection={zIndexAwareCollisionDetection}
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
