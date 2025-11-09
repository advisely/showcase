import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function MaximizedView() {
  const maximizedCardId = useStore((state) => state.maximizedCardId);
  const setMaximizedCard = useStore((state) => state.setMaximizedCard);
  const cards = useStore((state) => state.cards);

  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const card = cards.find((c) => c.id === maximizedCardId);

  useEffect(() => {
    if (!maximizedCardId) {
      setScale(1);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [maximizedCardId]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (maximizedCardId) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => Math.max(0.5, Math.min(3, prev + delta)));
      }
    };

    const container = containerRef.current;
    if (container && maximizedCardId) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [maximizedCardId]);

  const handleClose = () => {
    setMaximizedCard(null);
  };

  return (
    <AnimatePresence>
      {maximizedCardId && card && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold transition-colors z-10"
          >
            ✕
          </button>

          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            style={{ transform: `scale(${scale})` }}
          >
            {card.mediaType === 'video' ? (
              <video
                ref={videoRef}
                src={card.mediaSrc}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              />
            ) : (
              <img
                src={card.mediaSrc}
                alt="Maximized content"
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              />
            )}
          </motion.div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
            Scroll to zoom • {Math.round(scale * 100)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
