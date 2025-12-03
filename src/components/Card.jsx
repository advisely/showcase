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

  const cardRef = useRef(null);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const updateCard = useStore(state => state.updateCard);
  const deleteCard = useStore(state => state.deleteCard);
  const setMaximizedCard = useStore(state => state.setMaximizedCard);
  const saveToStorage = useStore(state => state.saveToStorage);
  const zoomLevel = useStore(state => state.zoomLevel);
  const interactionMode = useStore(state => state.interactionMode);
  const groups = useStore(state => state.groups);

  // Find the group this card belongs to (if any)
  const cardGroup = card.groupId ? groups.find(g => g.id === card.groupId) : null;
  const groupColor = cardGroup?.style?.color;
  const cardIndicator = cardGroup?.style?.cardIndicator || 'none';

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: card,
    disabled: interactionMode === 'hand' // Disable dragging in hand mode
  });

  // Calculate real-time position during drag, compensating for playfield zoom
  const x = (card.position?.x || 0) + ((transform?.x || 0) / zoomLevel);
  const y = (card.position?.y || 0) + ((transform?.y || 0) / zoomLevel);

  // Apply border style for 'border' indicator
  const borderStyle = cardIndicator === 'border' && groupColor
    ? `3px solid ${groupColor}`
    : undefined;

  const style = {
    position: 'absolute',
    left: x + 'px',
    top: y + 'px',
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`card ${card.orientation}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}
      {...listeners}
      {...attributes}
      onClick={handleClick}
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
  );
};

export default Card;
