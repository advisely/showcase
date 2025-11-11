import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const LayoutCustomizationMenu = () => {
  const layoutMenuOpen = useStore(state => state.layoutMenuOpen);
  const layoutMenuPosition = useStore(state => state.layoutMenuPosition);
  const layoutSettings = useStore(state => state.layoutSettings);
  const setLayoutSettings = useStore(state => state.setLayoutSettings);
  const setLayoutMenuOpen = useStore(state => state.setLayoutMenuOpen);

  const [strokeWidth, setStrokeWidth] = useState(layoutSettings.strokeWidth || 4);
  const [selectedColor, setSelectedColor] = useState(layoutSettings.color || 'rgba(0, 255, 255, 0.8)');
  const [customColorInput, setCustomColorInput] = useState('');
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Preset colors
  const presetColors = [
    { name: 'Cyan', value: 'rgba(0, 255, 255, 0.8)' },
    { name: 'Yellow', value: 'rgba(255, 215, 0, 0.9)' },
    { name: 'Magenta', value: 'rgba(255, 0, 255, 0.8)' },
    { name: 'Lime', value: 'rgba(50, 205, 50, 0.8)' },
    { name: 'Orange', value: 'rgba(255, 140, 0, 0.8)' },
    { name: 'Purple', value: 'rgba(147, 51, 234, 0.8)' },
    { name: 'Red', value: 'rgba(239, 68, 68, 0.8)' },
    { name: 'Blue', value: 'rgba(59, 130, 246, 0.8)' },
  ];

  // Update local state when settings change
  useEffect(() => {
    setStrokeWidth(layoutSettings.strokeWidth || 4);
    setSelectedColor(layoutSettings.color || 'rgba(0, 255, 255, 0.8)');
  }, [layoutSettings]);

  // Handle slider drag
  const handleSliderMouseDown = () => {
    setIsDraggingSlider(true);
  };

  useEffect(() => {
    if (!isDraggingSlider) return;

    const handleMouseMove = (e) => {
      const slider = document.getElementById('thickness-slider');
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newWidth = Math.round(1 + percentage * 19); // 1 to 20
      setStrokeWidth(newWidth);
      setLayoutSettings({ strokeWidth: newWidth });
    };

    const handleMouseUp = () => {
      setIsDraggingSlider(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSlider, setLayoutSettings]);

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setLayoutSettings({ color });
  };

  const handleCustomColorSubmit = () => {
    if (customColorInput.trim()) {
      // Support hex, rgb, rgba formats
      let color = customColorInput.trim();

      // Convert hex to rgba if needed
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        color = `rgba(${r}, ${g}, ${b}, 0.8)`;
      }

      setSelectedColor(color);
      setLayoutSettings({ color });
      setCustomColorInput('');
    }
  };

  const handleClose = () => {
    setLayoutMenuOpen(false);
  };

  if (!layoutMenuOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998
        }}
        onClick={handleClose}
      />

      {/* Menu */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            left: `${layoutMenuPosition.x}px`,
            top: `${layoutMenuPosition.y}px`,
            background: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            minWidth: '280px',
            color: '#e0e0e0',
            userSelect: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>

          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
            Customize Layout Guide
          </h3>

          {/* Thickness Slider */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#b0b0b0' }}>
              Thickness: {strokeWidth}px
            </label>
            <div
              id="thickness-slider"
              onMouseDown={handleSliderMouseDown}
              style={{
                position: 'relative',
                width: '100%',
                height: '32px',
                background: '#1a1a1a',
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px'
              }}
            >
              {/* Track */}
              <div
                style={{
                  position: 'absolute',
                  left: '4px',
                  right: '4px',
                  height: '4px',
                  background: '#444',
                  borderRadius: '2px'
                }}
              />
              {/* Fill */}
              <div
                style={{
                  position: 'absolute',
                  left: '4px',
                  width: `calc(${((strokeWidth - 1) / 19) * 100}% - 8px)`,
                  height: '4px',
                  background: selectedColor,
                  borderRadius: '2px'
                }}
              />
              {/* Thumb */}
              <div
                style={{
                  position: 'absolute',
                  left: `calc(${((strokeWidth - 1) / 19) * 100}% - 12px)`,
                  width: '24px',
                  height: '24px',
                  background: selectedColor,
                  borderRadius: '50%',
                  border: '3px solid #2a2a2a',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  cursor: 'grab'
                }}
              />
            </div>
          </div>

          {/* Color Presets */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#b0b0b0' }}>
              Preset Colors
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {presetColors.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleColorSelect(preset.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    background: preset.value,
                    border: selectedColor === preset.value ? '3px solid white' : '2px solid #444',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedColor === preset.value ? '0 0 8px rgba(255, 255, 255, 0.3)' : 'none'
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#b0b0b0' }}>
              Custom Color (hex/rgb/rgba)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomColorSubmit()}
                placeholder="#FF00FF or rgba(...)"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: '#1a1a1a',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#e0e0e0',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleCustomColorSubmit}
                style={{
                  padding: '8px 16px',
                  background: '#667eea',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Preview */}
          <div style={{ marginTop: '16px', padding: '12px', background: '#1a1a1a', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>Preview:</div>
            <div
              style={{
                width: '100%',
                height: `${strokeWidth}px`,
                background: selectedColor,
                borderRadius: `${strokeWidth / 2}px`
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default LayoutCustomizationMenu;
