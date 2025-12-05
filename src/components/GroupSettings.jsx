import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import useStore from '../store/useStore';

const GroupSettings = ({ isOpen, onClose }) => {
  const groupSettings = useStore(state => state.groupSettings);
  const setGroupSettings = useStore(state => state.setGroupSettings);
  const updateGroupColorPalette = useStore(state => state.updateGroupColorPalette);
  const saveToStorage = useStore(state => state.saveToStorage);

  const [editingColorIndex, setEditingColorIndex] = useState(null);

  const handleSettingChange = (key, value) => {
    setGroupSettings({ [key]: value });
    saveToStorage();
  };

  const handleColorChange = (index, color) => {
    updateGroupColorPalette(index, color);
    saveToStorage();
  };

  const borderStyles = [
    { value: 'dashed', label: 'Dashed' },
    { value: 'solid', label: 'Solid' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'none', label: 'None' },
  ];

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
            className="group-settings-dialog"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#2a2a2a',
              borderRadius: 12,
              padding: 0,
              minWidth: 420,
              maxWidth: 500,
              maxHeight: '85vh',
              overflowY: 'auto',
              zIndex: 10001,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #3a3a3a',
              position: 'sticky',
              top: 0,
              backgroundColor: '#2a2a2a',
              zIndex: 1,
            }}>
              <h2 style={{ margin: 0, color: '#e0e0e0', fontSize: 18 }}>Group Settings</h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: 24,
                  cursor: 'pointer',
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
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

            {/* Body */}
            <div style={{ padding: '16px 20px' }}>
              {/* Thumbnail View Section */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#aaa', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Thumbnail View
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Thumbnail Size: {groupSettings.thumbnailSize}px
                  </label>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="5"
                    value={groupSettings.thumbnailSize}
                    onChange={(e) => handleSettingChange('thumbnailSize', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 11 }}>
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Thumbnail Gap: {groupSettings.thumbnailGap}px
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="16"
                    step="2"
                    value={groupSettings.thumbnailGap}
                    onChange={(e) => handleSettingChange('thumbnailGap', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                </div>
              </div>

              {/* Expanded View Section */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#aaa', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Expanded View
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Max Card Width: {groupSettings.expandedCardMaxWidth}px
                  </label>
                  <input
                    type="range"
                    min="150"
                    max="400"
                    step="25"
                    value={groupSettings.expandedCardMaxWidth}
                    onChange={(e) => handleSettingChange('expandedCardMaxWidth', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Card Spacing: {groupSettings.expandedCardSpacing}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={groupSettings.expandedCardSpacing}
                    onChange={(e) => handleSettingChange('expandedCardSpacing', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Expansion Multiplier: {groupSettings.expansionMultiplier}x
                  </label>
                  <input
                    type="range"
                    min="1.5"
                    max="3"
                    step="0.25"
                    value={groupSettings.expansionMultiplier}
                    onChange={(e) => handleSettingChange('expansionMultiplier', parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                  <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                    How much the group grows when expanded
                  </div>
                </div>
              </div>

              {/* Appearance Section */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#aaa', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Appearance
                </h3>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Background Blur: {groupSettings.backgroundBlur}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="2"
                    value={groupSettings.backgroundBlur}
                    onChange={(e) => handleSettingChange('backgroundBlur', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Default Background Opacity: {Math.round(groupSettings.defaultBackgroundOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.05"
                    value={groupSettings.defaultBackgroundOpacity}
                    onChange={(e) => handleSettingChange('defaultBackgroundOpacity', parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Animation Speed: {groupSettings.animationSpeed === 0.5 ? 'Slow' : groupSettings.animationSpeed === 1 ? 'Normal' : groupSettings.animationSpeed === 1.5 ? 'Fast' : 'Very Fast'}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.5"
                    value={groupSettings.animationSpeed}
                    onChange={(e) => handleSettingChange('animationSpeed', parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 11 }}>
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                    <span>Very Fast</span>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                    Fullscreen Title Duration: {groupSettings.fullscreenTitleDuration === 0 ? 'Always Visible' : `${groupSettings.fullscreenTitleDuration}s`}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={groupSettings.fullscreenTitleDuration}
                    onChange={(e) => handleSettingChange('fullscreenTitleDuration', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#667eea' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 11 }}>
                    <span>Always</span>
                    <span>5s</span>
                    <span>10s</span>
                  </div>
                  <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                    How long the group title shows when viewing cards fullscreen
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 8, fontSize: 14 }}>
                    Default Border Style
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {borderStyles.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => handleSettingChange('defaultBorderStyle', value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: groupSettings.defaultBorderStyle === value ? '#667eea' : '#3a3a3a',
                          border: 'none',
                          borderRadius: 6,
                          color: groupSettings.defaultBorderStyle === value ? 'white' : '#aaa',
                          cursor: 'pointer',
                          fontSize: 13,
                          transition: 'all 0.2s',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Default Size Section */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#aaa', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Default New Group Size
                </h3>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                      Width: {groupSettings.defaultWidth}px
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="500"
                      step="25"
                      value={groupSettings.defaultWidth}
                      onChange={(e) => handleSettingChange('defaultWidth', parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#667eea' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#e0e0e0', marginBottom: 6, fontSize: 14 }}>
                      Height: {groupSettings.defaultHeight}px
                    </label>
                    <input
                      type="range"
                      min="150"
                      max="400"
                      step="25"
                      value={groupSettings.defaultHeight}
                      onChange={(e) => handleSettingChange('defaultHeight', parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#667eea' }}
                    />
                  </div>
                </div>
              </div>

              {/* Color Palette Section */}
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ color: '#aaa', fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase' }}>
                  Color Palette (for new groups)
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {groupSettings.colorPalette.map((color, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <button
                        onClick={() => setEditingColorIndex(editingColorIndex === index ? null : index)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          border: editingColorIndex === index ? '3px solid white' : '2px solid #444',
                          backgroundColor: color,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title={`Color ${index + 1}: ${color}`}
                      />
                      {editingColorIndex === index && (
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleColorChange(index, e.target.value)}
                          style={{
                            position: 'absolute',
                            top: 44,
                            left: 0,
                            width: 60,
                            height: 30,
                            border: 'none',
                            cursor: 'pointer',
                            zIndex: 10,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ color: '#666', fontSize: 11, marginTop: 8 }}>
                  Click a color to edit it. New groups cycle through these colors.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #3a3a3a',
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#2a2a2a',
            }}>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
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

export default GroupSettings;
