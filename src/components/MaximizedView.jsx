import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const MaximizedView = () => {
  const maximizedCard = useStore(state => state.maximizedCard);
  const cards = useStore(state => state.cards);
  const groups = useStore(state => state.groups);
  const setMaximizedCard = useStore(state => state.setMaximizedCard);
  const cardBackdropOpacity = useStore(state => state.cardBackdropOpacity);
  const groupSettings = useStore(state => state.groupSettings);

  const [scale, setScale] = useState(1);
  const [showGroupInfo, setShowGroupInfo] = useState(true);
  const containerRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const card = cards.find(c => c.id === maximizedCard);

  // Get cards in the same group for navigation
  const groupCards = card?.groupId
    ? cards.filter(c => c.groupId === card.groupId)
    : [];
  const currentIndex = groupCards.findIndex(c => c.id === card?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < groupCards.length - 1;
  const groupName = card?.groupId
    ? groups.find(g => g.id === card.groupId)?.name
    : null;

  // Navigation handlers
  const goToPrev = useCallback(() => {
    if (hasPrev) {
      setMaximizedCard(groupCards[currentIndex - 1].id);
      setScale(1);
    }
  }, [hasPrev, groupCards, currentIndex, setMaximizedCard]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      setMaximizedCard(groupCards[currentIndex + 1].id);
      setScale(1);
    }
  }, [hasNext, groupCards, currentIndex, setMaximizedCard]);

  // Auto-hide group info based on settings
  useEffect(() => {
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Only set timer if there are group cards and duration > 0
    if (groupCards.length > 1 && groupSettings.fullscreenTitleDuration > 0) {
      // Show the info when card changes
      setShowGroupInfo(true);

      // Set timeout to hide
      hideTimeoutRef.current = setTimeout(() => {
        setShowGroupInfo(false);
      }, groupSettings.fullscreenTitleDuration * 1000);
    } else if (groupCards.length > 1 && groupSettings.fullscreenTitleDuration === 0) {
      // Always visible
      setShowGroupInfo(true);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [maximizedCard, groupCards.length, groupSettings.fullscreenTitleDuration]);

  useEffect(() => {
    if (!card) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    // Keyboard navigation for group cards
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        setMaximizedCard(null);
        setScale(1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [card, goToPrev, goToNext, setMaximizedCard]);

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

          {/* Navigation arrows for group cards - positioned outside the media */}
          {groupCards.length > 1 && (
            <>
              {/* Left arrow */}
              {hasPrev && (
                <motion.button
                  className="nav-arrow nav-arrow-left"
                  onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: 'fixed',
                    left: 30,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 28,
                    fontWeight: 'bold',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    zIndex: 10001,
                  }}
                >
                  ‹
                </motion.button>
              )}

              {/* Right arrow */}
              {hasNext && (
                <motion.button
                  className="nav-arrow nav-arrow-right"
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    position: 'fixed',
                    right: 30,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.15)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 28,
                    fontWeight: 'bold',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                    zIndex: 10001,
                  }}
                >
                  ›
                </motion.button>
              )}

              {/* Group info and card counter - positioned below the card */}
              <AnimatePresence>
                {showGroupInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: 'fixed',
                      bottom: 80,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '10px 20px',
                      borderRadius: 25,
                      color: 'white',
                      fontSize: 14,
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      zIndex: 10001,
                    }}
                  >
                    <span style={{ opacity: 0.8 }}>{groupName}</span>
                    <span style={{
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.2)',
                      padding: '4px 12px',
                      borderRadius: 12,
                    }}>
                      {currentIndex + 1} / {groupCards.length}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="zoom-indicator">
            {groupCards.length > 1 ? 'Scroll to zoom • ← → to navigate' : 'Scroll to zoom'}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaximizedView;
