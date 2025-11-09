import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CardData } from '../types';
import { useStore } from '../store/useStore';

interface CardProps {
  card: CardData;
}

export default function Card({ card }: CardProps) {
  const updateCard = useStore((state) => state.updateCard);
  const deleteCard = useStore((state) => state.deleteCard);
  const bringToFront = useStore((state) => state.bringToFront);
  const setMaximizedCard = useStore((state) => state.setMaximizedCard);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle') ||
        (e.target as HTMLElement).closest('.delete-btn')) {
      return;
    }

    bringToFront(card.id);
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - card.position.x,
      y: e.clientY - card.position.y,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    bringToFront(card.id);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: card.size.width,
      height: card.size.height,
    };
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing &&
        !(e.target as HTMLElement).closest('.resize-handle') &&
        !(e.target as HTMLElement).closest('.delete-btn')) {
      setMaximizedCard(card.id);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const x = e.clientX - dragStartPos.current.x;
        const y = e.clientY - dragStartPos.current.y;
        updateCard(card.id, { position: { x, y } });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;
        const newWidth = Math.max(100, resizeStartPos.current.width + deltaX);
        const newHeight = Math.max(100, resizeStartPos.current.height + deltaY);
        updateCard(card.id, { size: { width: newWidth, height: newHeight } });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, card.id, updateCard]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`absolute rounded-lg shadow-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 hover:border-blue-500 transition-colors group ${
        isDragging ? 'cursor-grabbing' : 'cursor-move'
      }`}
      style={{
        left: card.position.x,
        top: card.position.y,
        width: card.size.width,
        height: card.size.height,
        zIndex: card.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Card Content */}
      <div className="w-full h-full relative">
        {card.mediaType === 'video' ? (
          <>
            <video
              src={card.mediaSrc}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center text-slate-900 text-2xl">
                ▶
              </div>
            </div>
          </>
        ) : (
          <img
            src={card.mediaSrc}
            alt="Card content"
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}
      </div>

      {/* Delete Button */}
      <button
        className="delete-btn absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-lg font-bold shadow-lg z-10"
        onClick={(e) => {
          e.stopPropagation();
          deleteCard(card.id);
        }}
      >
        ✕
      </button>

      {/* Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-blue-500" />
      </div>
    </motion.div>
  );
}
