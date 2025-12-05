import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import useStore from '../store/useStore';

const Card = ({ card, zIndex = 1 }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState(card.size || {
    width: card.orientation === 'landscape' ? 300 : 200,
    height: card.orientation === 'landscape' ? 200 : 300
  });
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });

  const cardRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const updateCard = useStore(state => state.updateCard);
  const deleteCard = useStore(state => state.deleteCard);
  const setMaximizedCard = useStore(state => state.setMaximizedCard);
  const saveToStorage = useStore(state => state.saveToStorage);
  const zoomLevel = useStore(state => state.zoomLevel);
  const interactionMode = useStore(state => state.interactionMode);
  const groups = useStore(state => state.groups);
  const assignCardToGroup = useStore(state => state.assignCardToGroup);
  const removeCardFromGroup = useStore(state => state.removeCardFromGroup);
  const setNotification = useStore(state => state.setNotification);
  const cardAnimationSpeed = useStore(state => state.cardAnimationSpeed);

  // Find the group this card belongs to (if any)
  const cardGroup = card.groupId ? groups.find(g => g.id === card.groupId) : null;
  const groupColor = cardGroup?.style?.color;
  const cardIndicator = cardGroup?.style?.cardIndicator || 'none';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: card,
    disabled: interactionMode === 'hand' // Disable dragging in hand mode
  });

  // Base position (canvas coordinates)
  const baseX = card.position?.x || 0;
  const baseY = card.position?.y || 0;

  // Drag offset needs to be scaled down to canvas coordinates for proper cursor tracking
  // When parent is scaled by zoomLevel, moving X screen pixels requires X/zoomLevel canvas pixels
  const dragOffsetX = (transform?.x || 0) / zoomLevel;
  const dragOffsetY = (transform?.y || 0) / zoomLevel;

  // Apply border style for 'border' indicator
  const borderStyle = cardIndicator === 'border' && groupColor
    ? `3px solid ${groupColor}`
    : undefined;

  const style = {
    position: 'absolute',
    left: (baseX + dragOffsetX) + 'px',
    top: (baseY + dragOffsetY) + 'px',
    width: size.width + 'px',
    height: size.height + 'px',
    cursor: interactionMode === 'hand' ? 'grab' : (isDragging ? 'grabbing' : 'move'),
    zIndex: isDragging ? 1000 : zIndex,
    transition: isDragging ? 'none' : 'left 0.2s, top 0.2s',
    pointerEvents: interactionMode === 'hand' ? 'none' : 'auto',
    border: borderStyle,
  };

  // Handle resize
  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      const newWidth = Math.max(100, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(100, resizeStartRef.current.height + deltaY);

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      updateCard(card.id, { size });
      saveToStorage();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, card.id, size, updateCard, saveToStorage]);

  // Handle click to maximize
  const handleClick = (e) => {
    if (isDragging || isResizing) return;
    if (e.target.closest('.card-delete') || e.target.closest('.resize-handle')) return;

    setMaximizedCard(card.id);
  };

  // Handle delete
  const handleDelete = (e) => {
    e.stopPropagation();
    deleteCard(card.id);
    saveToStorage();
  };

  // Handle right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  // Handle assign to group
  const handleAssignToGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    assignCardToGroup(card.id, groupId);
    saveToStorage();
    setNotification({ message: `Card added to "${group?.name}"`, type: 'success' });
    closeContextMenu();
  };

  // Handle remove from group
  const handleRemoveFromGroup = () => {
    removeCardFromGroup(card.id);
    saveToStorage();
    setNotification({ message: 'Card removed from group', type: 'info' });
    closeContextMenu();
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    if (contextMenu.show) {
      const handleClick = () => closeContextMenu();
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.show]);

  return (
    <>
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`card ${card.orientation}`}
      initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
      animate={{
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: {
          type: 'spring',
          stiffness: 400 * (cardAnimationSpeed || 1),
          damping: 25,
          mass: 0.8 / (cardAnimationSpeed || 1)
        }
      }}
      exit={{
        scale: 0.3,
        opacity: 0,
        rotate: 5,
        transition: { duration: 0.2 / (cardAnimationSpeed || 1), ease: 'easeIn' }
      }}
      whileHover={{ boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className="card-content" ref={cardRef}>
        {card.mediaType === 'video' ? (
          <>
            <video
              src={card.mediaSrc}
              muted
              playsInline
              draggable="false"
              style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', WebkitUserDrag: 'none' }}
            />
            <div className="video-overlay">▶</div>
          </>
        ) : (
          <img
            src={card.mediaSrc}
            alt="Card media"
            draggable="false"
            style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', WebkitUserDrag: 'none' }}
          />
        )}
      </div>

      {/* Group indicators */}
      {cardIndicator === 'dot' && groupColor && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: groupColor,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 5,
          }}
          title={cardGroup?.name}
        />
      )}

      {cardIndicator === 'banner' && groupColor && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: groupColor,
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
            zIndex: 5,
          }}
          title={cardGroup?.name}
        />
      )}

      {cardIndicator === 'tint' && groupColor && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `${groupColor}22`,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 4,
          }}
        />
      )}

      <button className="card-delete" onClick={handleDelete}>
        ✕
      </button>

      <div
        className="resize-handle"
        onMouseDown={handleResizeStart}
        style={{ cursor: 'nwse-resize' }}
      />
    </motion.div>

    {/* Context Menu */}
    {contextMenu.show && (
      <div
        style={{
          position: 'fixed',
          left: contextMenu.x,
          top: contextMenu.y,
          backgroundColor: '#2a2a2a',
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 10000,
          minWidth: 180,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid #3a3a3a',
          color: '#888',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Assign to Group
        </div>

        {/* Groups list */}
        {groups.length === 0 ? (
          <div style={{ padding: '12px', color: '#666', fontSize: 13, textAlign: 'center' }}>
            No groups yet
          </div>
        ) : (
          groups.map(group => (
            <button
              key={group.id}
              onClick={() => handleAssignToGroup(group.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: card.groupId === group.id ? '#3a3a3a' : 'transparent',
                color: '#e0e0e0',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => e.target.style.background = '#3a3a3a'}
              onMouseLeave={(e) => e.target.style.background = card.groupId === group.id ? '#3a3a3a' : 'transparent'}
            >
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: group.style.color,
                flexShrink: 0,
              }} />
              <span style={{ flex: 1 }}>{group.name}</span>
              {card.groupId === group.id && <span style={{ color: '#27ae60' }}>✓</span>}
            </button>
          ))
        )}

        {/* Remove from group option */}
        {card.groupId && (
          <>
            <div style={{ borderTop: '1px solid #3a3a3a', margin: '4px 0' }} />
            <button
              onClick={handleRemoveFromGroup}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: 'transparent',
                color: '#e74c3c',
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => e.target.style.background = '#3a3a3a'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <span>✕</span>
              <span>Remove from group</span>
            </button>
          </>
        )}
      </div>
    )}
    </>
  );
};

export default Card;
