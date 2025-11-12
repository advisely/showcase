import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { calculatePositionsForMultipleCards } from '../utils/position';

const OrientationModal = () => {
  const isModalOpen = useStore(state => state.isModalOpen);
  const pendingFiles = useStore(state => state.pendingFiles);
  const cards = useStore(state => state.cards);
  const zoomLevel = useStore(state => state.zoomLevel);
  const panX = useStore(state => state.panX);
  const panY = useStore(state => state.panY);
  const setModalOpen = useStore(state => state.setModalOpen);
  const setPendingFiles = useStore(state => state.setPendingFiles);
  const reserveCardIds = useStore(state => state.reserveCardIds);
  const setVideoFile = useStore(state => state.setVideoFile);
  const saveToStorage = useStore(state => state.saveToStorage);

  const handleOrientationSelect = (orientation) => {
    if (pendingFiles.length === 0) {
      setModalOpen(false);
      return;
    }

    // Reserve card IDs upfront to prevent duplicate IDs when processing multiple files
    const reservedIds = reserveCardIds(pendingFiles.length);

    // Calculate card dimensions based on orientation
    const cardWidth = orientation === 'landscape' ? 300 : 200;
    const cardHeight = orientation === 'landscape' ? 200 : 300;
    const cardSize = { width: cardWidth, height: cardHeight };

    // Calculate viewport center in canvas coordinates (accounting for pan and zoom)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 100; // Account for toolbar
    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;

    // Convert viewport center to canvas coordinates
    const canvasCenterX = (viewportCenterX - panX) / zoomLevel;
    const canvasCenterY = (viewportCenterY - panY) / zoomLevel;

    // Target position (center of canvas view, adjusted for card size)
    const basePosition = {
      x: canvasCenterX - cardWidth / 2,
      y: canvasCenterY - cardHeight / 2
    };

    // Calculate non-overlapping positions for all new cards
    console.log('[OrientationModal] Calculating positions:', {
      fileCount: pendingFiles.length,
      basePosition,
      cardSize,
      existingCardsCount: cards.length,
      existingCards: cards.map(c => ({ id: c.id, pos: c.position, size: c.size }))
    });

    const positions = calculatePositionsForMultipleCards(
      pendingFiles.length,
      basePosition,
      cardSize,
      cards
    );

    console.log('[OrientationModal] Calculated positions:', positions);

    // Process all pending files sequentially to ensure collision detection works
    let processedCount = 0;

    pendingFiles.forEach((file, index) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();

      reader.onload = (e) => {
        const cardData = {
          id: reservedIds[index], // Use pre-reserved ID
          orientation,
          mediaType: isVideo ? 'video' : 'image',
          mediaSrc: e.target.result,
          videoFilename: isVideo ? file.name : null,
          position: positions[index], // Use collision-free position
          size: cardSize,
          timestamp: Date.now()
        };

        console.log(`[OrientationModal] Adding card ${index}:`, {
          id: cardData.id,
          position: cardData.position,
          size: cardData.size
        });

        // Add card directly to store without generating a new ID
        useStore.setState((state) => ({
          cards: [...state.cards, cardData]
        }));

        // Store video file reference
        if (isVideo) {
          setVideoFile(reservedIds[index], file);
        }

        // Increment counter and save only after all files are processed
        processedCount++;
        if (processedCount === pendingFiles.length) {
          saveToStorage();
        }
      };

      reader.readAsDataURL(file);
    });

    // Close modal and clear pending files
    setModalOpen(false);
    setPendingFiles([]);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setPendingFiles([]);
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Select Card Orientation</h2>

            <div className="orientation-options">
              <motion.button
                className="orientation-btn"
                onClick={() => handleOrientationSelect('landscape')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="orientation-preview landscape" />
                <span>Landscape</span>
              </motion.button>

              <motion.button
                className="orientation-btn"
                onClick={() => handleOrientationSelect('portrait')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="orientation-preview portrait" />
                <span>Portrait</span>
              </motion.button>
            </div>

            <motion.button
              className="btn btn-secondary"
              onClick={handleCancel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrientationModal;
