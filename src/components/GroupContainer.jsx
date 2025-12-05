import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import useStore from '../store/useStore';
import { darkShadows, borderRadius } from '../lib/theme';
import { springTransition } from '../lib/animations';

// Animation helpers - create transitions based on speed multiplier
const getExpandCollapseTransition = (speed = 1) => ({
  type: 'spring',
  stiffness: 400 * speed,
  damping: 30,
  mass: 0.8 / speed,
});

const getThumbnailGridVariants = (speed = 1) => ({
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25 / speed,
      staggerChildren: 0.03 / speed,
      delayChildren: 0.05 / speed,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 / speed }
  }
});

const getThumbnailCardVariants = (speed = 1) => ({
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 500 * speed, damping: 25 }
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.1 / speed } }
});

const getExpandedHintVariants = (speed = 1) => ({
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 / speed, delay: 0.1 / speed }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 / speed } }
});

/**
 * GroupContainer - A draggable, resizable container for organizing cards
 * Can represent Parts, Chapters, Sections, or any user-defined grouping
 */
const GroupContainer = ({ group, zIndex = 1 }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const nameInputRef = useRef(null);

  const updateGroup = useStore(state => state.updateGroup);
  const deleteGroup = useStore(state => state.deleteGroup);
  const selectedGroupId = useStore(state => state.selectedGroupId);
  const setSelectedGroupId = useStore(state => state.setSelectedGroupId);
  const setEditingGroupId = useStore(state => state.setEditingGroupId);
  const setGroupSettingsModalOpen = useStore(state => state.setGroupSettingsModalOpen);
  const arrangeCardsInGroup = useStore(state => state.arrangeCardsInGroup);
  const toggleGroupExpanded = useStore(state => state.toggleGroupExpanded);
  const saveToStorage = useStore(state => state.saveToStorage);
  const zoomLevel = useStore(state => state.zoomLevel);
  const groupSettings = useStore(state => state.groupSettings);
  const cards = useStore(state => state.cards);

  // Use useMemo to compute filtered cards - properly triggers re-render when cards array changes
  // This ensures the component updates when cards are added/removed from the group
  const groupCards = useMemo(
    () => cards.filter(c => c.groupId === group.id),
    [cards, group.id]
  );
  const cardCount = groupCards.length;

  const isSelected = selectedGroupId === group.id;
  const isExpanded = group.expanded ?? false;

  // Draggable setup for moving the group
  // Use different ID than droppable to prevent dnd-kit confusion
  const dragId = `drag-${group.id}`;
  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: { type: 'group', groupId: group.id },
  });

  // Droppable setup for receiving cards
  // Use the original group.id so cards can be dropped onto it
  // Pass zIndex in data for z-index aware collision detection
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: group.id,
    data: { type: 'group-drop', groupId: group.id, zIndex },
  });

  // Combine refs for both draggable and droppable
  const setNodeRef = (node) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  // Base position (canvas coordinates)
  const baseX = group.position?.x || 0;
  const baseY = group.position?.y || 0;

  // Drag offset needs to be scaled down to canvas coordinates for proper cursor tracking
  // When parent is scaled by zoomLevel, moving X screen pixels requires X/zoomLevel canvas pixels
  const dragOffsetX = (transform?.x || 0) / zoomLevel;
  const dragOffsetY = (transform?.y || 0) / zoomLevel;

  const x = baseX + dragOffsetX;
  const y = baseY + dragOffsetY;

  // Style based on group settings
  const { style } = group;
  // Use 20% opacity for semi-transparent blurry background
  const bgOpacity = style.backgroundOpacity ?? 0.2;
  const bgColor = style.backgroundColor || `${style.color}${Math.round(bgOpacity * 255).toString(16).padStart(2, '0')}`;

  // Handle resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - resizeStart.x) / zoomLevel;
      const deltaY = (e.clientY - resizeStart.y) / zoomLevel;

      const newWidth = Math.max(200, resizeStart.width + deltaX);
      const newHeight = Math.max(150, resizeStart.height + deltaY);

      updateGroup(group.id, {
        size: { width: newWidth, height: newHeight }
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      saveToStorage();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, zoomLevel, group.id, updateGroup, saveToStorage]);

  // Focus input when editing name
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Auto-resize group to fit all cards (prevents overflow)
  useEffect(() => {
    if (cardCount === 0 || isResizing) return;

    const headerHeight = group.style?.showHeader ? 50 : 10;
    const padding = 12;
    const gap = groupSettings?.thumbnailGap || 8;
    const thumbnailSize = groupSettings?.thumbnailSize || 60;

    if (!isExpanded) {
      // Thumbnail view: calculate grid dimensions
      // Calculate how many columns fit in current width
      const availableWidth = group.size.width - padding * 2;
      const cols = Math.max(1, Math.floor((availableWidth + gap) / (thumbnailSize + gap)));
      const rows = Math.ceil(cardCount / cols);

      // Calculate required height for all rows
      // Use aspect ratio of 2/3 for portrait thumbnails (most common)
      const thumbnailHeight = thumbnailSize * 1.5;
      const requiredHeight = headerHeight + padding * 2 + rows * thumbnailHeight + (rows - 1) * gap;

      // Only resize if current height is insufficient
      if (group.size.height < requiredHeight) {
        updateGroup(group.id, {
          size: { width: group.size.width, height: requiredHeight }
        });
      }
    } else {
      // Expanded view: calculate based on expanded card sizes
      const expandedCardMaxWidth = groupSettings?.expandedCardMaxWidth || 250;
      const expandedCardSpacing = groupSettings?.expandedCardSpacing || 20;
      const expandedPadding = 20;

      const availableWidth = group.size.width - expandedPadding * 2;
      const cols = Math.max(1, Math.floor((availableWidth + expandedCardSpacing) / (expandedCardMaxWidth + expandedCardSpacing)));
      const rows = Math.ceil(cardCount / cols);

      const cardHeight = expandedCardMaxWidth * 0.67;
      const requiredHeight = headerHeight + expandedPadding * 2 + rows * cardHeight + (rows - 1) * expandedCardSpacing;

      if (group.size.height < requiredHeight) {
        updateGroup(group.id, {
          size: { width: group.size.width, height: requiredHeight }
        });
      }
    }
  }, [cardCount, isExpanded, group.size.width, groupSettings, group.style?.showHeader, isResizing]);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: group.size.width,
      height: group.size.height,
    });
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    // If clicking on the body area (not header), expand the group
    // Header clicks are handled by the header's own drag listeners
    setSelectedGroupId(isSelected ? null : group.id);
  };

  // Single click on group body to toggle expand/collapse
  const handleBodyClick = (e) => {
    e.stopPropagation();
    toggleGroupExpanded(group.id);
    saveToStorage();
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    setEditName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (editName.trim() && editName !== group.name) {
      updateGroup(group.id, { name: editName.trim() });
      saveToStorage();
    } else {
      setEditName(group.name);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditName(group.name);
      setIsEditingName(false);
    }
  };

  const handleOpenSettings = (e) => {
    e.stopPropagation();
    setEditingGroupId(group.id);
    setGroupSettingsModalOpen(true);
  };

  const handleToggleCollapse = (e) => {
    e.stopPropagation();
    updateGroup(group.id, { collapsed: !group.collapsed });
    saveToStorage();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (cardCount > 0) {
      if (!confirm(`Delete "${group.name}"? ${cardCount} cards will become ungrouped.`)) {
        return;
      }
    }
    deleteGroup(group.id);
    saveToStorage();
  };

  const handleArrangeCards = (layout) => {
    arrangeCardsInGroup(group.id, layout);
    saveToStorage();
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    toggleGroupExpanded(group.id);
    saveToStorage();
  };

  // Double-click on group body to expand/collapse
  const handleBodyDoubleClick = (e) => {
    e.stopPropagation();
    if (!isEditingName) {
      toggleGroupExpanded(group.id);
      saveToStorage();
    }
  };

  // Border style based on settings
  const getBorderStyle = () => {
    if (!style.showBoundary) return 'none';
    switch (style.boundaryStyle) {
      case 'solid': return `2px solid ${style.color}`;
      case 'dashed': return `2px dashed ${style.color}`;
      case 'dotted': return `2px dotted ${style.color}`;
      default: return 'none';
    }
  };

  if (group.collapsed) {
    // Collapsed view - just show header
    return (
      <motion.div
        ref={setNodeRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springTransition}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 200,
          height: 40,
          backgroundColor: style.color,
          borderRadius: borderRadius.md,
          boxShadow: darkShadows.md,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: zIndex + (isDragging ? 1000 : 0),
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
        }}
        {...attributes}
        {...listeners}
        onClick={handleSelect}
      >
        <span style={{ color: 'white', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {group.name}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
          {cardCount}
        </span>
        <button
          onClick={handleToggleCollapse}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 4,
            padding: '2px 6px',
            cursor: 'pointer',
            color: 'white',
            fontSize: 14,
          }}
        >
          +
        </button>
      </motion.div>
    );
  }

  // Visual feedback for drop target
  const dropHighlight = isOver ? `0 0 0 4px ${style.color}, 0 0 20px ${style.color}66` : '';
  const combinedShadow = isSelected
    ? `0 0 0 3px ${style.color}`
    : isOver
      ? dropHighlight
      : darkShadows.sm;

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: isOver ? 1.02 : 1,
        boxShadow: combinedShadow,
        width: group.size.width,
        height: group.size.height,
      }}
      transition={getExpandCollapseTransition(groupSettings?.animationSpeed || 1)}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        backgroundColor: isOver ? `${style.color}22` : bgColor,
        backdropFilter: `blur(${groupSettings?.backgroundBlur || 12}px)`,
        WebkitBackdropFilter: `blur(${groupSettings?.backgroundBlur || 12}px)`,
        border: isOver ? `3px solid ${style.color}` : getBorderStyle(),
        borderRadius: borderRadius.lg,
        zIndex: zIndex + (isDragging ? 1000 : 0),
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
      onClick={handleSelect}
    >
      {/* Header */}
      {style.showHeader && (
        <div
          {...attributes}
          {...listeners}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: style.color,
            borderTopLeftRadius: borderRadius.lg - 2,
            borderTopRightRadius: borderRadius.lg - 2,
            cursor: isDragging ? 'grabbing' : 'grab',
            gap: 8,
          }}
        >
          {/* Color indicator */}
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.3)',
              border: '2px solid rgba(255,255,255,0.5)',
            }}
          />

          {/* Name */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                outline: 'none',
              }}
            />
          ) : (
            <span
              onDoubleClick={handleDoubleClick}
              style={{
                flex: 1,
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {group.name}
            </span>
          )}

          {/* Card count */}
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4 }}>
            <motion.button
              onClick={handleToggleExpand}
              title={isExpanded ? "Show thumbnails" : "Expand cards"}
              style={headerButtonStyle}
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300 * (groupSettings?.animationSpeed || 1), damping: 20 }}
            >
              {isExpanded ? '⊟' : '⊞'}
            </motion.button>
            <button
              onClick={handleOpenSettings}
              title="Settings"
              style={headerButtonStyle}
            >
              ⚙️
            </button>
            <button
              onClick={handleToggleCollapse}
              title="Collapse"
              style={headerButtonStyle}
            >
              −
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              style={headerButtonStyle}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Animated content area */}
      <AnimatePresence mode="wait">
        {/* Thumbnail grid when not expanded */}
        {!isExpanded && cardCount > 0 && (
          <motion.div
            key="thumbnail-grid"
            variants={getThumbnailGridVariants(groupSettings?.animationSpeed || 1)}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBodyClick}
            onDoubleClick={handleBodyDoubleClick}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${groupSettings?.thumbnailSize || 60}px, 1fr))`,
              gap: groupSettings?.thumbnailGap || 8,
              padding: 12,
              paddingTop: style.showHeader ? 12 : 40,
              cursor: 'pointer',
            }}
          >
            {groupCards.map((card) => (
              <motion.div
                key={card.id}
                variants={getThumbnailCardVariants(groupSettings?.animationSpeed || 1)}
                style={{
                  width: '100%',
                  aspectRatio: card.orientation === 'landscape' ? '3/2' : '2/3',
                  borderRadius: borderRadius.sm,
                  overflow: 'hidden',
                  backgroundColor: '#1a1a1a',
                  boxShadow: darkShadows.sm,
                }}
                whileHover={{ scale: 1.05, boxShadow: darkShadows.md }}
                transition={{ type: 'spring', stiffness: 400 * (groupSettings?.animationSpeed || 1), damping: 25 }}
              >
                {card.mediaType === 'video' ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#2a2a2a',
                    color: '#888',
                    fontSize: 20,
                  }}>
                    ▶
                  </div>
                ) : (
                  <img
                    src={card.mediaSrc}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Hint text when expanded (cards shown separately on canvas) */}
        {isExpanded && cardCount > 0 && (
          <motion.div
            key="expanded-hint"
            variants={getExpandedHintVariants(groupSettings?.animationSpeed || 1)}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleBodyClick}
            onDoubleClick={handleBodyDoubleClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: style.showHeader ? 'calc(100% - 40px)' : '100%',
              color: '#666',
              fontSize: 12,
              cursor: 'pointer',
              gap: 8,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 24, opacity: 0.5 }}
            >
              ↔
            </motion.div>
            Click to collapse • {cardCount} cards expanded on canvas
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick layout buttons (visible when selected) */}
      {isSelected && cardCount > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: -36,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 4,
            backgroundColor: '#2a2a2a',
            padding: '4px 8px',
            borderRadius: borderRadius.md,
            boxShadow: darkShadows.md,
          }}
        >
          <button onClick={() => handleArrangeCards('grid')} style={layoutButtonStyle} title="Grid">⊞</button>
          <button onClick={() => handleArrangeCards('line')} style={layoutButtonStyle} title="Line">═</button>
          <button onClick={() => handleArrangeCards('circle')} style={layoutButtonStyle} title="Circle">○</button>
        </div>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 20,
          height: 20,
          cursor: 'se-resize',
          background: `linear-gradient(135deg, transparent 50%, ${style.color} 50%)`,
          borderBottomRightRadius: borderRadius.lg - 2,
          opacity: isSelected ? 1 : 0.5,
        }}
      />

      {/* Drop zone indicator */}
      {!style.showHeader && (
        <div
          {...attributes}
          {...listeners}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        />
      )}
    </motion.div>
  );
};

const headerButtonStyle = {
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  borderRadius: 4,
  padding: '2px 6px',
  cursor: 'pointer',
  color: 'white',
  fontSize: 14,
  transition: 'background 0.2s',
};

const layoutButtonStyle = {
  background: '#3a3a3a',
  border: 'none',
  borderRadius: 4,
  padding: '4px 8px',
  cursor: 'pointer',
  color: '#e0e0e0',
  fontSize: 14,
  transition: 'background 0.2s',
};

export default GroupContainer;
