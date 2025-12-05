import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const FileMenu = ({ isOpen, onClose, onNew, onLoad, onSave, onSaveAs, onExport, buttonRef }) => {
  const menuRef = useRef(null);
  const saveItemRef = useRef(null);
  const [isSaveSubmenuOpen, setIsSaveSubmenuOpen] = useState(false);
  const autoSaveEnabled = useStore(state => state.autoSaveEnabled);
  const setAutoSaveEnabled = useStore(state => state.setAutoSaveEnabled);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        onClose();
        setIsSaveSubmenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
        setIsSaveSubmenuOpen(false);
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

  // Reset submenu when main menu closes
  useEffect(() => {
    if (!isOpen) {
      setIsSaveSubmenuOpen(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          className="file-menu"
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* New */}
          <motion.button
            className="file-menu-item"
            onClick={() => {
              onNew();
              onClose();
            }}
            whileHover={{ backgroundColor: '#3a3a3a' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="file-menu-icon">📄</span>
            <span className="file-menu-title">New</span>
            <span className="file-menu-shortcut">Ctrl+N</span>
          </motion.button>

          <div className="file-menu-divider" />

          {/* Load */}
          <motion.button
            className="file-menu-item"
            onClick={() => {
              onLoad();
              onClose();
            }}
            whileHover={{ backgroundColor: '#3a3a3a' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="file-menu-icon">📂</span>
            <span className="file-menu-title">Load</span>
            <span className="file-menu-shortcut">Ctrl+O</span>
          </motion.button>

          <div className="file-menu-divider" />

          {/* Save (with submenu) */}
          <div
            ref={saveItemRef}
            className="file-menu-item-wrapper"
            onMouseEnter={() => setIsSaveSubmenuOpen(true)}
            onMouseLeave={() => setIsSaveSubmenuOpen(false)}
          >
            <motion.button
              className="file-menu-item file-menu-item-with-submenu"
              whileHover={{ backgroundColor: '#3a3a3a' }}
            >
              <span className="file-menu-icon">💾</span>
              <span className="file-menu-title">Save</span>
              <span className="file-menu-arrow">▶</span>
            </motion.button>

            {/* Save Submenu */}
            <AnimatePresence>
              {isSaveSubmenuOpen && (
                <motion.div
                  className="file-submenu"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.button
                    className="file-menu-item"
                    onClick={() => {
                      onSave();
                      onClose();
                    }}
                    whileHover={{ backgroundColor: '#3a3a3a' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="file-menu-icon">💾</span>
                    <div className="file-menu-text">
                      <div className="file-menu-title">Save</div>
                      <div className="file-menu-desc">Use current name</div>
                    </div>
                    <span className="file-menu-shortcut">Ctrl+S</span>
                  </motion.button>

                  <div className="file-menu-divider" />

                  <motion.button
                    className="file-menu-item"
                    onClick={() => {
                      onSaveAs();
                      onClose();
                    }}
                    whileHover={{ backgroundColor: '#3a3a3a' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="file-menu-icon">✏️</span>
                    <div className="file-menu-text">
                      <div className="file-menu-title">Save As</div>
                      <div className="file-menu-desc">Choose new name</div>
                    </div>
                    <span className="file-menu-shortcut">Ctrl+Shift+S</span>
                  </motion.button>

                  <div className="file-menu-divider" />

                  {/* Auto-Save Toggle */}
                  <div
                    className="file-menu-item"
                    onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="file-menu-icon">{autoSaveEnabled ? '🔄' : '⏸️'}</span>
                    <div className="file-menu-text" style={{ flex: 1 }}>
                      <div className="file-menu-title">Auto-Save</div>
                      <div className="file-menu-desc">{autoSaveEnabled ? 'Enabled' : 'Disabled'}</div>
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
          </div>

          <div className="file-menu-divider" />

          {/* Export */}
          <motion.button
            className="file-menu-item"
            onClick={() => {
              onExport();
              onClose();
            }}
            whileHover={{ backgroundColor: '#3a3a3a' }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="file-menu-icon">📦</span>
            <span className="file-menu-title">Export ZIP</span>
            <span className="file-menu-shortcut">Ctrl+E</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileMenu;
