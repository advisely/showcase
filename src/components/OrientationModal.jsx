import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const OrientationModal = () => {
  const isModalOpen = useStore(state => state.isModalOpen);
  const pendingFiles = useStore(state => state.pendingFiles);
  const setModalOpen = useStore(state => state.setModalOpen);
  const setPendingFiles = useStore(state => state.setPendingFiles);
  const addCard = useStore(state => state.addCard);
  const setVideoFile = useStore(state => state.setVideoFile);
  const saveToStorage = useStore(state => state.saveToStorage);

  const handleOrientationSelect = (orientation) => {
    if (pendingFiles.length === 0) {
      setModalOpen(false);
      return;
    }

    // Process all pending files
    pendingFiles.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();

      reader.onload = (e) => {
        const cardData = {
          orientation,
          mediaType: isVideo ? 'video' : 'image',
          mediaSrc: e.target.result,
          videoFilename: isVideo ? file.name : null,
          position: {
            x: Math.random() * 800 + 200, // Random position
            y: Math.random() * 400 + 100
          },
          size: {
            width: orientation === 'landscape' ? 300 : 200,
            height: orientation === 'landscape' ? 200 : 300
          }
        };

        const card = addCard(cardData);

        // Store video file reference
        if (isVideo) {
          setVideoFile(card.id, file);
        }
      };

      reader.readAsDataURL(file);
    });

    // Close modal and clear pending files
    setModalOpen(false);
    setPendingFiles([]);
    saveToStorage();
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
