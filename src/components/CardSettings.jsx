import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const CardSettings = ({ isOpen, onClose }) => {
  const cardBackdropOpacity = useStore(state => state.cardBackdropOpacity);
  const setCardBackdropOpacity = useStore(state => state.setCardBackdropOpacity);
  const cardAnimationSpeed = useStore(state => state.cardAnimationSpeed);
  const setCardAnimationSpeed = useStore(state => state.setCardAnimationSpeed);
  const saveToStorage = useStore(state => state.saveToStorage);

  const handleOpacityChange = (e) => {
    const value = parseFloat(e.target.value);
    setCardBackdropOpacity(value);
    saveToStorage();
  };

  const handleAnimationSpeedChange = (e) => {
    const value = parseFloat(e.target.value);
    setCardAnimationSpeed(value);
    saveToStorage();
  };

  const getSpeedLabel = (speed) => {
    if (speed === 0.5) return 'Slow';
    if (speed === 1) return 'Normal';
    if (speed === 1.5) return 'Fast';
    return 'Very Fast';
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
            className="card-settings-dialog"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="card-settings-header">
              <h2>Card Settings</h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  position: 'static'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#444';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#888';
                }}
              >
                ×
              </button>
            </div>
            <div className="card-settings-body">
              <div className="setting-group">
                <label htmlFor="backdrop-opacity">
                  Backdrop Opacity (when maximized)
                </label>
                <div className="slider-container">
                  <input
                    id="backdrop-opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={cardBackdropOpacity}
                    onChange={handleOpacityChange}
                    className="opacity-slider"
                  />
                  <span className="opacity-value">
                    {Math.round(cardBackdropOpacity * 100)}%
                  </span>
                </div>
                <div className="setting-hint">
                  Controls how dark the background becomes when a card is maximized
                </div>
              </div>

              <div className="preview-container">
                <div className="preview-label">Preview:</div>
                <div className="backdrop-preview" style={{
                  backgroundColor: `rgba(0, 0, 0, ${cardBackdropOpacity})`
                }}>
                  <div className="preview-card">
                    Maximized Card
                  </div>
                </div>
              </div>

              <div className="setting-group" style={{ marginTop: 24 }}>
                <label htmlFor="animation-speed">
                  Animation Speed: {getSpeedLabel(cardAnimationSpeed)}
                </label>
                <div className="slider-container">
                  <input
                    id="animation-speed"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.5"
                    value={cardAnimationSpeed}
                    onChange={handleAnimationSpeedChange}
                    className="opacity-slider"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 11, marginTop: 4 }}>
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                  <span>Very Fast</span>
                </div>
                <div className="setting-hint">
                  Controls how fast cards animate when appearing/disappearing
                </div>
              </div>
            </div>
            <div className="card-settings-footer">
              <motion.button
                className="btn btn-success"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CardSettings;
