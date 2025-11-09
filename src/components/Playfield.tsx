import { useRef, useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import Card from './Card';

export default function Playfield() {
  const cards = useStore((state) => state.cards);
  const background = useStore((state) => state.background);
  const setViewport = useStore((state) => state.setViewport);
  const playfieldRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Update viewport info in store
  const updateViewport = useCallback(() => {
    if (playfieldRef.current) {
      setViewport({
        scrollLeft: playfieldRef.current.scrollLeft,
        scrollTop: playfieldRef.current.scrollTop,
        width: playfieldRef.current.clientWidth,
        height: playfieldRef.current.clientHeight,
      });
    }
  }, [setViewport]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === playfieldRef.current) {
      setIsPanning(true);
      panStart.current = {
        x: e.pageX,
        y: e.pageY,
        scrollLeft: playfieldRef.current.scrollLeft,
        scrollTop: playfieldRef.current.scrollTop,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning && playfieldRef.current) {
        const dx = e.pageX - panStart.current.x;
        const dy = e.pageY - panStart.current.y;
        playfieldRef.current.scrollLeft = panStart.current.scrollLeft - dx;
        playfieldRef.current.scrollTop = panStart.current.scrollTop - dy;
        updateViewport();
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
      updateViewport();
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, updateViewport]);

  // Track viewport on mount and resize
  useEffect(() => {
    updateViewport();

    const handleScroll = () => {
      updateViewport();
    };

    const handleResize = () => {
      updateViewport();
    };

    const playfield = playfieldRef.current;
    if (playfield) {
      playfield.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (playfield) {
        playfield.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [updateViewport]);

  const backgroundStyle: React.CSSProperties = {
    backgroundColor: background.color || '#2c3e50',
    backgroundImage: background.image ? `url(${background.image})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div
      ref={playfieldRef}
      className={`flex-1 overflow-auto relative ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      style={backgroundStyle}
    >
      {/* Large canvas area */}
      <div className="relative min-w-[3000px] min-h-[3000px]">
        <AnimatePresence>
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
