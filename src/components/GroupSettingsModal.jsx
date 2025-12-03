import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { darkShadows, borderRadius, colors } from '../lib/theme';
import { modalOverlay, modalContent } from '../lib/animations';

/**
 * GroupSettingsModal - Modal for configuring group visual settings
 * Allows users to customize colors, boundaries, card indicators, and inner layout
 */
const GroupSettingsModal = () => {
  const groups = useStore(state => state.groups);
  const editingGroupId = useStore(state => state.editingGroupId);
  const groupSettingsModalOpen = useStore(state => state.groupSettingsModalOpen);
  const setGroupSettingsModalOpen = useStore(state => state.setGroupSettingsModalOpen);
  const setEditingGroupId = useStore(state => state.setEditingGroupId);
  const updateGroup = useStore(state => state.updateGroup);
  const groupColors = useStore(state => state.groupColors);
  const saveToStorage = useStore(state => state.saveToStorage);

  const group = groups.find(g => g.id === editingGroupId);

  // Local state for editing
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3498db');
  const [showHeader, setShowHeader] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [boundaryStyle, setBoundaryStyle] = useState('dashed');
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.05);
  const [cardIndicator, setCardIndicator] = useState('dot');
  const [innerLayout, setInnerLayout] = useState('free');

  // Initialize local state when group changes
  useEffect(() => {
    if (group) {
      setName(group.name);
      setColor(group.style.color);
      setShowHeader(group.style.showHeader);
      setShowBoundary(group.style.showBoundary);
      setBoundaryStyle(group.style.boundaryStyle);
      setBackgroundOpacity(group.style.backgroundOpacity);
      setCardIndicator(group.style.cardIndicator);
      setInnerLayout(group.innerLayout);
    }
  }, [group]);

  const handleClose = () => {
    setGroupSettingsModalOpen(false);
    setEditingGroupId(null);
  };

  const handleApply = () => {
    if (!group) return;

    updateGroup(group.id, {
      name: name.trim() || group.name,
      style: {
        ...group.style,
        color,
        showHeader,
        showBoundary,
        boundaryStyle,
        backgroundOpacity,
        cardIndicator,
      },
      innerLayout,
    });

    saveToStorage();
    handleClose();
  };

  if (!groupSettingsModalOpen || !group) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={modalOverlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
      >
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#2a2a2a',
            borderRadius: borderRadius.xl,
            boxShadow: darkShadows['2xl'],
            width: 420,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #3a3a3a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 18, fontWeight: 600 }}>
              Group Settings
            </h3>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: 24,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '20px' }}>
            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Part 1: Introduction"
                style={inputStyle}
              />
            </div>

            {/* Color */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {groupColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: borderRadius.md,
                      backgroundColor: c,
                      border: color === c ? '3px solid white' : '2px solid transparent',
                      cursor: 'pointer',
                      boxShadow: color === c ? darkShadows.md : 'none',
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: borderRadius.md,
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title="Custom color"
                />
              </div>
            </div>

            {/* Card Indicator */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Card Indicator</label>
              <p style={{ margin: '0 0 8px', color: '#888', fontSize: 12 }}>
                How cards show they belong to this group
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { value: 'dot', label: '● Dot', icon: '●' },
                  { value: 'border', label: '▢ Border', icon: '▢' },
                  { value: 'banner', label: '▔ Banner', icon: '▔' },
                  { value: 'tint', label: '◧ Tint', icon: '◧' },
                  { value: 'none', label: '○ None', icon: '○' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCardIndicator(option.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: borderRadius.md,
                      backgroundColor: cardIndicator === option.value ? color : '#3a3a3a',
                      border: 'none',
                      color: cardIndicator === option.value ? 'white' : '#aaa',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Container Settings */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Container</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showHeader}
                    onChange={(e) => setShowHeader(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: color }}
                  />
                  <span style={{ color: '#e0e0e0', fontSize: 14 }}>Show header</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showBoundary}
                    onChange={(e) => setShowBoundary(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: color }}
                  />
                  <span style={{ color: '#e0e0e0', fontSize: 14 }}>Show boundary</span>
                </label>

                {showBoundary && (
                  <div style={{ marginLeft: 28 }}>
                    <label style={{ ...labelStyle, fontSize: 12, marginBottom: 6 }}>Border Style</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['solid', 'dashed', 'dotted'].map((style) => (
                        <button
                          key={style}
                          onClick={() => setBoundaryStyle(style)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: borderRadius.sm,
                            backgroundColor: boundaryStyle === style ? '#3a3a3a' : 'transparent',
                            border: `2px ${style} ${boundaryStyle === style ? color : '#666'}`,
                            color: '#e0e0e0',
                            cursor: 'pointer',
                            fontSize: 12,
                            textTransform: 'capitalize',
                          }}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ ...labelStyle, fontSize: 12 }}>
                    Background Opacity: {Math.round(backgroundOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="0.3"
                    step="0.01"
                    value={backgroundOpacity}
                    onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: color }}
                  />
                </div>
              </div>
            </div>

            {/* Inner Layout */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Inner Layout</label>
              <p style={{ margin: '0 0 8px', color: '#888', fontSize: 12 }}>
                How cards arrange within this group
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'free', label: 'Free', icon: '⬚' },
                  { value: 'grid', label: 'Grid', icon: '⊞' },
                  { value: 'line', label: 'Line', icon: '═' },
                  { value: 'circle', label: 'Circle', icon: '○' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setInnerLayout(option.value)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: borderRadius.md,
                      backgroundColor: innerLayout === option.value ? color : '#3a3a3a',
                      border: 'none',
                      color: innerLayout === option.value ? 'white' : '#aaa',
                      cursor: 'pointer',
                      fontSize: 13,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Preview</label>
              <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: borderRadius.md,
                padding: 16,
                position: 'relative',
              }}>
                {/* Mini group preview */}
                <div style={{
                  backgroundColor: `${color}${Math.round(backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
                  border: showBoundary ? `2px ${boundaryStyle} ${color}` : 'none',
                  borderRadius: borderRadius.md,
                  overflow: 'hidden',
                }}>
                  {showHeader && (
                    <div style={{
                      backgroundColor: color,
                      padding: '6px 10px',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {name || 'Group Name'}
                    </div>
                  )}
                  <div style={{ padding: 12, display: 'flex', gap: 8 }}>
                    {/* Mini cards */}
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 40,
                          height: 30,
                          backgroundColor: '#3a3a3a',
                          borderRadius: 4,
                          position: 'relative',
                          border: cardIndicator === 'border' ? `2px solid ${color}` : 'none',
                          background: cardIndicator === 'tint' ? `linear-gradient(${color}22, ${color}22), #3a3a3a` : '#3a3a3a',
                        }}
                      >
                        {cardIndicator === 'dot' && (
                          <div style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: color,
                          }} />
                        )}
                        {cardIndicator === 'banner' && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            backgroundColor: color,
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #3a3a3a',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
          }}>
            <button
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                borderRadius: borderRadius.md,
                backgroundColor: '#3a3a3a',
                border: 'none',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              style={{
                padding: '10px 24px',
                borderRadius: borderRadius.md,
                backgroundColor: color,
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Apply
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  color: '#e0e0e0',
  fontSize: 14,
  fontWeight: 500,
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  backgroundColor: '#1a1a1a',
  border: '1px solid #3a3a3a',
  borderRadius: borderRadius.md,
  color: '#e0e0e0',
  fontSize: 14,
  outline: 'none',
};

export default GroupSettingsModal;
