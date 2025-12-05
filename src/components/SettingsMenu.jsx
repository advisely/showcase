import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

const SettingsMenu = ({ isOpen, onClose, onBackgroundSettings, onCardSettings, onGroupSettings, buttonRef }) => {
  const menuRef = useRef(null);

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
          className="settings-menu"
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <motion.button
            className="settings-menu-item"
            onClick={() => {
              onBackgroundSettings();
              onClose();
            }}
            whileHover={{ backgroundColor: '#3a3a3a' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="settings-menu-icon">🎨</span>
            <div className="settings-menu-text">
              <div className="settings-menu-title">Background Settings</div>
              <div className="settings-menu-desc">Color, image & effects</div>
            </div>
          </motion.button>

          <div className="settings-menu-divider" />

          <motion.button
            className="settings-menu-item"
            onClick={() => {
              onCardSettings();
              onClose();
            }}
            whileHover={{ backgroundColor: '#3a3a3a' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="settings-menu-icon">🃏</span>
            <div className="settings-menu-text">
              <div className="settings-menu-title">Card Settings</div>
              <div className="settings-menu-desc">Backdrop opacity</div>
            </div>
          </motion.button>

          <div className="settings-menu-divider" />

          <motion.button
            className="settings-menu-item"
            onClick={() => {
              onGroupSettings();
              onClose();
            }}
            whileHover={{ backgroundColor: '#3a3a3a' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="settings-menu-icon">📑</span>
            <div className="settings-menu-text">
              <div className="settings-menu-title">Group Settings</div>
              <div className="settings-menu-desc">Thumbnails, expansion & colors</div>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
