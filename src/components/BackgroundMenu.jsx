import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const BackgroundMenu = () => {
  const background = useStore(state => state.background);
  const setBackground = useStore(state => state.setBackground);
  const saveToStorage = useStore(state => state.saveToStorage);

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(background.image ? 'image' : 'color'); // 'color', 'gradient', 'image'
  const [opacity, setOpacity] = useState(background.opacity || 0.3);
  const [blur, setBlur] = useState(background.blur || 0);
  const [color1, setColor1] = useState(background.color || '#2c3e50');
  const [color2, setColor2] = useState(background.gradientColor || '#34495e');
  const [gradientAngle, setGradientAngle] = useState(background.gradientAngle || 135);

  const imageInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const color2PickerRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackground({
        ...background,
        image: event.target.result,
        opacity: opacity ?? 0.3, // Ensure opacity has a default value
        mode: 'image'
      });
      setMode('image');
      saveToStorage();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setBackground({
      ...background,
      image: null,
      mode: 'color'
    });
    setMode('color');
    saveToStorage();
  };

  const handleColorChange = (newColor) => {
    setColor1(newColor);
    setBackground({
      ...background,
      color: newColor,
      image: null,
      mode: 'color'
    });
    setMode('color');
    saveToStorage();
  };

  const handleGradientChange = () => {
    setBackground({
      ...background,
      color: color1,
      gradientColor: color2,
      gradientAngle,
      image: null,
      mode: 'gradient'
    });
    setMode('gradient');
    saveToStorage();
  };

  const handleOpacityChange = (newOpacity) => {
    setOpacity(newOpacity);
    setBackground({
      ...background,
      opacity: newOpacity
    });
    saveToStorage();
  };

  const handleBlurChange = (newBlur) => {
    setBlur(newBlur);
    setBackground({
      ...background,
      blur: newBlur
    });
    saveToStorage();
  };

  return (
    <>
      {/* Floating Background Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '240px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Background Settings"
      >
        🎨
      </motion.button>

      {/* Background Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25 }}
            style={{
              position: 'fixed',
              right: '240px',
              bottom: '90px',
              width: '320px',
              maxHeight: '70vh',
              background: '#2a2a2a',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              border: '1px solid #444',
              zIndex: 1000,
              overflowY: 'auto',
              color: '#e0e0e0'
            }}
          >
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>
              Background Settings
            </h3>

            {/* Mode Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#b0b0b0' }}>
                Background Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setMode('color')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: mode === 'color' ? '#667eea' : '#3a3a3a',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: mode === 'color' ? '600' : '400'
                  }}
                >
                  Color
                </button>
                <button
                  onClick={() => setMode('gradient')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: mode === 'gradient' ? '#667eea' : '#3a3a3a',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: mode === 'gradient' ? '600' : '400'
                  }}
                >
                  Gradient
                </button>
                <button
                  onClick={() => setMode('image')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: mode === 'image' ? '#667eea' : '#3a3a3a',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: mode === 'image' ? '600' : '400'
                  }}
                >
                  Image
                </button>
              </div>
            </div>

            {/* Color Mode */}
            {mode === 'color' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#b0b0b0' }}>
                  Background Color
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    ref={colorPickerRef}
                    type="color"
                    value={color1}
                    onChange={(e) => handleColorChange(e.target.value)}
                    style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={color1}
                    onChange={(e) => handleColorChange(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#1a1a1a',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      color: '#e0e0e0',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Gradient Mode */}
            {mode === 'gradient' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: '#b0b0b0' }}>
                  Gradient Colors
                </label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Color 1</div>
                    <input
                      type="color"
                      value={color1}
                      onChange={(e) => setColor1(e.target.value)}
                      style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Color 2</div>
                    <input
                      ref={color2PickerRef}
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#b0b0b0' }}>
                  Angle: {gradientAngle}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                  style={{ width: '100%', marginBottom: '12px' }}
                />

                <button
                  onClick={handleGradientChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#667eea',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  Apply Gradient
                </button>

                {/* Preview */}
                <div
                  style={{
                    marginTop: '12px',
                    height: '60px',
                    borderRadius: '8px',
                    background: `linear-gradient(${gradientAngle}deg, ${color1}, ${color2})`
                  }}
                />
              </div>
            )}

            {/* Image Mode */}
            {mode === 'image' && (
              <div style={{ marginBottom: '20px' }}>
                {background.image && (
                  <>
                    <div style={{ marginBottom: '12px' }}>
                      <img
                        src={background.image}
                        alt="Background preview"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid #444'
                        }}
                      />
                    </div>

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#b0b0b0' }}>
                      Overlay Opacity: {Math.round(opacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                      style={{ width: '100%', marginBottom: '16px' }}
                    />

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#b0b0b0' }}>
                      Background Blur: {blur}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={blur}
                      onChange={(e) => handleBlurChange(parseInt(e.target.value))}
                      style={{ width: '100%', marginBottom: '12px' }}
                    />
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>
                      Adjust opacity and blur to enhance readability
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleRemoveImage}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#e74c3c',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Remove Image
                      </button>
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#667eea',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Replace Image
                      </button>
                    </div>
                  </>
                )}

                {!background.image && (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '40px',
                      background: '#3a3a3a',
                      border: '2px dashed #666',
                      borderRadius: '8px',
                      color: '#e0e0e0',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}
                  >
                    📷 Click to Upload Image
                  </button>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackgroundMenu;
