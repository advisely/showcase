import { useRef, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import Card from './Card';

export default function Playfield() {
  const cards = useStore((state) => state.cards);
  const background = useStore((state) => state.background);
  const playfieldRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

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
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

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
