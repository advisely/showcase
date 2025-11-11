import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const SaveDialog = ({ isOpen, onClose, onSave, currentName, title = 'Save Presentation' }) => {
  const [name, setName] = useState(currentName || 'Untitled Presentation');

  useEffect(() => {
    if (isOpen) {
      setName(currentName || 'Untitled Presentation');
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      onSave(trimmedName);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="save-dialog"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="save-dialog-header">
              <h2>{title}</h2>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="save-dialog-body">
                <label htmlFor="presentation-name">Presentation Name:</label>
                <input
                  id="presentation-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter presentation name"
                  autoFocus
                  maxLength={100}
                />
              </div>
              <div className="save-dialog-footer">
                <motion.button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="btn btn-success"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SaveDialog;
