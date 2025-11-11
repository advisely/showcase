import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const MaximizedView = () => {
  const maximizedCard = useStore(state => state.maximizedCard);
  const cards = useStore(state => state.cards);
  const setMaximizedCard = useStore(state => state.setMaximizedCard);
  const cardBackdropOpacity = useStore(state => state.cardBackdropOpacity);

  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  const card = cards.find(c => c.id === maximizedCard);

  useEffect(() => {
    if (!card) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [card]);

  const handleClose = () => {
    setMaximizedCard(null);
    setScale(1);
  };

  if (!card) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="maximized-view"
        style={{ backgroundColor: `rgba(0, 0, 0, ${cardBackdropOpacity})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target.classList.contains('maximized-view')) {
            handleClose();
          }
        }}
      >
        <motion.div
          className="maximized-content"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="close-btn"
            onClick={handleClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>

          <motion.div
            ref={containerRef}
            className="maximized-media-container"
            animate={{ scale }}
            transition={{ duration: 0.2 }}
          >
            {card.mediaType === 'video' ? (
              <video
                src={card.mediaSrc}
                controls
                autoPlay
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                }}
              />
            ) : (
              <img
                src={card.mediaSrc}
                alt="Maximized view"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  borderRadius: '8px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                }}
              />
            )}
          </motion.div>

          <div className="zoom-indicator">Scroll to zoom</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaximizedView;
