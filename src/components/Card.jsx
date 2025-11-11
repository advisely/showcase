import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import useStore from '../store/useStore';

const Card = ({ card }) => {
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

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: card
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    position: 'absolute',
    left: card.position?.x || 0,
    top: card.position?.y || 0,
    width: size.width,
    height: size.height,
    cursor: isDragging ? 'grabbing' : 'move',
    zIndex: isDragging ? 1000 : 1
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
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="video-overlay">▶</div>
          </>
        ) : (
          <img
            src={card.mediaSrc}
            alt="Card media"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

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
