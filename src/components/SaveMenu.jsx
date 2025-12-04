import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import useStore from '../store/useStore';

const SaveMenu = ({ isOpen, onClose, onSave, onSaveAs, buttonRef }) => {
  const menuRef = useRef(null);
  const autoSaveEnabled = useStore(state => state.autoSaveEnabled);
  const setAutoSaveEnabled = useStore(state => state.setAutoSaveEnabled);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, buttonRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="save-menu"
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <motion.button
            className="save-menu-item"
            onClick={() => {
              onSave();
              onClose();
            }}
            whileHover={{ backgroundColor: '#3a3a3a' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="save-menu-icon">💾</span>
            <div className="save-menu-text">
              <div className="save-menu-title">Save</div>
              <div className="save-menu-desc">Use current name</div>
            </div>
          </motion.button>

          <div className="save-menu-divider" />

          <motion.button
            className="save-menu-item"
            onClick={() => {
              onSaveAs();
              onClose();
            }}
            whileHover={{ backgroundColor: '#3a3a3a' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="save-menu-icon">✏️</span>
            <div className="save-menu-text">
              <div className="save-menu-title">Save As</div>
              <div className="save-menu-desc">Choose new name</div>
            </div>
          </motion.button>

          <div className="save-menu-divider" />

          {/* Auto-Save Toggle */}
          <div
            className="save-menu-item"
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            style={{ cursor: 'pointer' }}
          >
            <span className="save-menu-icon">{autoSaveEnabled ? '🔄' : '⏸️'}</span>
            <div className="save-menu-text" style={{ flex: 1 }}>
              <div className="save-menu-title">Auto-Save</div>
              <div className="save-menu-desc">{autoSaveEnabled ? 'Enabled' : 'Disabled'}</div>
            </div>
            {/* Toggle Switch */}
            <div
              style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                backgroundColor: autoSaveEnabled ? '#27ae60' : '#555',
                position: 'relative',
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: 2,
                  left: autoSaveEnabled ? 20 : 2,
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveMenu;
