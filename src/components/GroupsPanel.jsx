import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { darkShadows, borderRadius, colors } from '../lib/theme';
import { fadeInLeft, staggerContainer, staggerItem, springTransition } from '../lib/animations';

/**
 * GroupsPanel - Sidebar for managing groups (Parts, Chapters, Sections, etc.)
 * Allows creating, reordering, and navigating between groups
 */
const GroupsPanel = () => {
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const groups = useStore(state => state.groups);
  const cards = useStore(state => state.cards);
  const groupsPanelOpen = useStore(state => state.groupsPanelOpen);
  const setGroupsPanelOpen = useStore(state => state.setGroupsPanelOpen);
  const addGroup = useStore(state => state.addGroup);
  const selectedGroupId = useStore(state => state.selectedGroupId);
  const setSelectedGroupId = useStore(state => state.setSelectedGroupId);
  const panToGroup = useStore(state => state.panToGroup);
  const reorderGroups = useStore(state => state.reorderGroups);
  const saveToStorage = useStore(state => state.saveToStorage);

  // Count cards per group
  const getCardCount = (groupId) => {
    return cards.filter(c => c.groupId === groupId).length;
  };

  const ungroupedCount = cards.filter(c => !c.groupId).length;

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup({ name: newGroupName.trim() });
      setNewGroupName('');
      setIsAddingGroup(false);
      saveToStorage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddGroup();
    } else if (e.key === 'Escape') {
      setIsAddingGroup(false);
      setNewGroupName('');
    }
  };

  const handleGroupClick = (groupId) => {
    setSelectedGroupId(groupId);
    panToGroup(groupId);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, toIndex) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (fromIndex !== toIndex) {
      reorderGroups(fromIndex, toIndex);
      saveToStorage();
    }
  };

  // Sort groups by order
  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setGroupsPanelOpen(!groupsPanelOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          left: groupsPanelOpen ? 260 : 10,
          top: 70,
          width: 36,
          height: 36,
          borderRadius: borderRadius.md,
          backgroundColor: '#2a2a2a',
          border: 'none',
          color: '#e0e0e0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: darkShadows.md,
          zIndex: 1001,
          transition: 'left 0.3s ease',
          fontSize: 18,
        }}
        title={groupsPanelOpen ? 'Close Groups Panel' : 'Open Groups Panel'}
      >
        {groupsPanelOpen ? '◀' : '📑'}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {groupsPanelOpen && (
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              left: 0,
              top: 60,
              bottom: 0,
              width: 250,
              backgroundColor: '#1a1a1a',
              borderRight: '1px solid #3a3a3a',
              boxShadow: darkShadows.lg,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #3a3a3a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, color: '#e0e0e0', fontSize: 16, fontWeight: 600 }}>
                Groups
              </h3>
              <button
                onClick={() => setIsAddingGroup(true)}
                style={{
                  background: colors.primary,
                  border: 'none',
                  borderRadius: borderRadius.sm,
                  padding: '4px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                + Add
              </button>
            </div>

            {/* Add Group Input */}
            <AnimatePresence>
              {isAddingGroup && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #3a3a3a',
                    overflow: 'hidden',
                  }}
                >
                  <input
                    type="text"
                    placeholder="Group name (e.g., Part 1, Chapter 1)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #3a3a3a',
                      borderRadius: borderRadius.sm,
                      color: '#e0e0e0',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={handleAddGroup}
                      disabled={!newGroupName.trim()}
                      style={{
                        flex: 1,
                        padding: '6px',
                        backgroundColor: newGroupName.trim() ? colors.primary : '#3a3a3a',
                        border: 'none',
                        borderRadius: borderRadius.sm,
                        color: 'white',
                        cursor: newGroupName.trim() ? 'pointer' : 'not-allowed',
                        fontSize: 13,
                      }}
                    >
                      Create
                    </button>
                    <button
                      onClick={() => { setIsAddingGroup(false); setNewGroupName(''); }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#3a3a3a',
                        border: 'none',
                        borderRadius: borderRadius.sm,
                        color: '#aaa',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Groups List */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px',
              }}
            >
              {sortedGroups.length === 0 ? (
                <div style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: '#888',
                  fontSize: 14,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📑</div>
                  <p style={{ margin: 0 }}>No groups yet</p>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: '#666' }}>
                    Create groups to organize your cards into Parts, Chapters, or Sections
                  </p>
                </div>
              ) : (
                sortedGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    variants={staggerItem}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={() => handleGroupClick(group.id)}
                    whileHover={{ backgroundColor: '#2a2a2a' }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      marginBottom: 4,
                      borderRadius: borderRadius.md,
                      cursor: 'pointer',
                      backgroundColor: selectedGroupId === group.id ? '#3a3a3a' : 'transparent',
                      border: selectedGroupId === group.id ? `1px solid ${group.style.color}` : '1px solid transparent',
                      transition: 'background-color 0.2s, border 0.2s',
                    }}
                  >
                    {/* Drag handle */}
                    <span style={{ cursor: 'grab', marginRight: 8, color: '#666' }}>☰</span>

                    {/* Color dot */}
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: group.style.color,
                      marginRight: 10,
                      flexShrink: 0,
                    }} />

                    {/* Name */}
                    <span style={{
                      flex: 1,
                      color: '#e0e0e0',
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {group.name}
                    </span>

                    {/* Card count */}
                    <span style={{
                      backgroundColor: '#2a2a2a',
                      color: '#888',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: 12,
                    }}>
                      {getCardCount(group.id)}
                    </span>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* Ungrouped Section */}
            {ungroupedCount > 0 && (
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #3a3a3a',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#666',
                  border: '2px dashed #888',
                }} />
                <span style={{ flex: 1, color: '#888', fontSize: 14 }}>
                  Ungrouped
                </span>
                <span style={{
                  backgroundColor: '#2a2a2a',
                  color: '#888',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 12,
                }}>
                  {ungroupedCount}
                </span>
              </div>
            )}

            {/* Footer with tips */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #3a3a3a',
              backgroundColor: '#1f1f1f',
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: 11, lineHeight: 1.4 }}>
                💡 Drag cards into groups on the canvas, or right-click a card to assign it.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GroupsPanel;
