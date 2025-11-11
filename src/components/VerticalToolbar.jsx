import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const VerticalToolbar = () => {
  const zoomLevel = useStore(state => state.zoomLevel);
  const interactionMode = useStore(state => state.interactionMode);
  const setZoom = useStore(state => state.setZoom);
  const resetView = useStore(state => state.resetView);
  const toggleInteractionMode = useStore(state => state.toggleInteractionMode);
  const saveToStorage = useStore(state => state.saveToStorage);

  const handleZoomIn = () => {
    setZoom(zoomLevel + 0.2);
    saveToStorage();
  };

  const handleZoomOut = () => {
    setZoom(zoomLevel - 0.2);
    saveToStorage();
  };

  const handleRefocus = () => {
    resetView();
    saveToStorage();
  };

  const handleToggleMode = () => {
    toggleInteractionMode();
    saveToStorage();
  };

  return (
    <motion.div
      className="vertical-toolbar"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <motion.button
        className="toolbar-icon-btn"
        onClick={handleToggleMode}
        title={interactionMode === 'cursor' ? 'Switch to Hand Mode' : 'Switch to Cursor Mode'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: interactionMode === 'hand' ? '#667eea' : '#3a3a3a',
          color: interactionMode === 'hand' ? 'white' : '#e0e0e0'
        }}
      >
        <span style={{ fontSize: '20px' }}>{interactionMode === 'cursor' ? '👆' : '✋'}</span>
      </motion.button>

      <motion.button
        className="toolbar-icon-btn"
        onClick={handleZoomIn}
        title="Zoom In"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>+</span>
      </motion.button>

      <motion.button
        className="toolbar-icon-btn"
        onClick={handleZoomOut}
        title="Zoom Out"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>−</span>
      </motion.button>

      <motion.button
        className="toolbar-icon-btn"
        onClick={handleRefocus}
        title="Refocus"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>⊙</span>
      </motion.button>

      <div className="zoom-level-display" title={`Zoom: ${Math.round(zoomLevel * 100)}%`}>
        {Math.round(zoomLevel * 100)}%
      </div>
    </motion.div>
  );
};

export default VerticalToolbar;
