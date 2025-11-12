import { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const FONT_OPTIONS = [
  { name: 'Sans-serif', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { name: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { name: 'Monospace', value: '"Courier New", Consolas, monospace' },
  { name: 'Cursive', value: '"Brush Script MT", cursive' },
  { name: 'Fantasy', value: 'Impact, fantasy' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
];

const SIZE_OPTIONS = [12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96, 128];

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  '#0088ff', '#ff0088', '#88ff00', '#888888', '#444444',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd'
];

const ExpressionMenu = ({ isOpen, buttonRef, onClose, editingTextField = null }) => {
  const [selectedFont, setSelectedFont] = useState(
    editingTextField ? FONT_OPTIONS.find(f => f.value === editingTextField.font) || FONT_OPTIONS[0] : FONT_OPTIONS[0]
  );
  const [selectedSize, setSelectedSize] = useState(editingTextField?.fontSize || 32);
  const [textColor, setTextColor] = useState(editingTextField?.color || '#ffffff');
  const addTextField = useStore(state => state.addTextField);
  const updateTextField = useStore(state => state.updateTextField);
  const saveToStorage = useStore(state => state.saveToStorage);

  if (!isOpen) return null;

  const handleAddTextField = () => {
    if (editingTextField) {
      // Update existing text field
      updateTextField(editingTextField.id, {
        font: selectedFont.value,
        fontSize: selectedSize,
        color: textColor
      });
    } else {
      // Add new text field in the center of the playfield
      addTextField({
        text: 'Double-click to edit',
        font: selectedFont.value,
        fontSize: selectedSize,
        color: textColor,
        position: { x: 600, y: 300 }
      });
    }
    saveToStorage();
    onClose();
  };

  return (
    <>
      {/* Backdrop to close menu when clicking outside */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999
        }}
        onClick={onClose}
      />

      <motion.div
        className="expression-menu"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          background: '#2a2a2a',
          border: '1px solid #444',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          padding: '16px',
          minWidth: '400px',
          maxWidth: '500px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px 0', color: '#e0e0e0', fontSize: '16px' }}>
          {editingTextField ? 'Edit Text Properties' : 'Text Properties'}
        </h3>

        {/* Add/Update Text Button */}
        <motion.button
          className="btn btn-primary"
          onClick={handleAddTextField}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            marginBottom: '16px',
            justifyContent: 'center',
            fontSize: '16px',
            padding: '12px'
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>T</span>
          {editingTextField ? ' Update Text Field' : ' Add Text Field'}
        </motion.button>

        {/* Font Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
            Font Family
          </label>
          <select
            value={selectedFont.value}
            onChange={(e) => {
              const font = FONT_OPTIONS.find(f => f.value === e.target.value);
              setSelectedFont(font);
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1e1e1e',
              border: '1px solid #444',
              borderRadius: '6px',
              color: '#e0e0e0',
              fontSize: '14px',
              fontFamily: selectedFont.value,
              cursor: 'pointer'
            }}
          >
            {FONT_OPTIONS.map((font) => (
              <option
                key={font.value}
                value={font.value}
                style={{ fontFamily: font.value }}
              >
                {font.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Preview */}
        <div style={{
          marginBottom: '16px',
          padding: '20px',
          background: '#1e1e1e',
          border: '1px solid #444',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontFamily: selectedFont.value,
            fontSize: `${selectedSize}px`,
            color: textColor,
            lineHeight: '1.2'
          }}>
            Sample Text
          </div>
        </div>

        {/* Size Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
            Font Size: {selectedSize}px
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
            gap: '8px'
          }}>
            {SIZE_OPTIONS.map((size) => (
              <motion.button
                key={size}
                onClick={() => setSelectedSize(size)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '8px',
                  background: selectedSize === size ? '#667eea' : '#3a3a3a',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: selectedSize === size ? '600' : '400'
                }}
              >
                {size}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
            Text Color
          </label>

          {/* Color Presets */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: '6px',
            marginBottom: '12px'
          }}>
            {COLOR_PRESETS.map((color) => (
              <motion.button
                key={color}
                onClick={() => setTextColor(color)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: color,
                  border: textColor === color ? '2px solid #667eea' : '1px solid #444',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: textColor === color ? '0 0 0 2px rgba(102, 126, 234, 0.3)' : 'none'
                }}
                title={color}
              />
            ))}
          </div>

          {/* Custom Color Picker */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{
                width: '50px',
                height: '40px',
                border: '1px solid #444',
                borderRadius: '6px',
                cursor: 'pointer',
                background: 'transparent'
              }}
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#1e1e1e',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#e0e0e0',
                fontSize: '14px'
              }}
              placeholder="Custom color (e.g., #ff0000)"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ExpressionMenu;
