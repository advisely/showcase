import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import useStore from '../store/useStore';
import { darkShadows, borderRadius } from '../lib/theme';
import { springTransition } from '../lib/animations';

/**
 * GroupContainer - A draggable, resizable container for organizing cards
 * Can represent Parts, Chapters, Sections, or any user-defined grouping
 */
const GroupContainer = ({ group, zIndex = 1 }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const nameInputRef = useRef(null);

  const updateGroup = useStore(state => state.updateGroup);
  const deleteGroup = useStore(state => state.deleteGroup);
  const selectedGroupId = useStore(state => state.selectedGroupId);
  const setSelectedGroupId = useStore(state => state.setSelectedGroupId);
  const setEditingGroupId = useStore(state => state.setEditingGroupId);
  const setGroupSettingsModalOpen = useStore(state => state.setGroupSettingsModalOpen);
  const arrangeCardsInGroup = useStore(state => state.arrangeCardsInGroup);
  const saveToStorage = useStore(state => state.saveToStorage);
  const zoomLevel = useStore(state => state.zoomLevel);
  const cards = useStore(state => state.cards);

  const isSelected = selectedGroupId === group.id;
  const cardCount = cards.filter(c => c.groupId === group.id).length;

  // Draggable setup for moving the group
  const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
    id: group.id,
    data: { type: 'group' },
  });

  // Droppable setup for receiving cards
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: group.id,
    data: { type: 'group', groupId: group.id },
  });

  // Combine refs for both draggable and droppable
  const setNodeRef = (node) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  // Calculate position with drag transform
  const x = (group.position?.x || 0) + ((transform?.x || 0) / zoomLevel);
  const y = (group.position?.y || 0) + ((transform?.y || 0) / zoomLevel);

  // Style based on group settings
  const { style } = group;
  const bgColor = style.backgroundColor || `${style.color}${Math.round(style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`;

  // Handle resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - resizeStart.x) / zoomLevel;
      const deltaY = (e.clientY - resizeStart.y) / zoomLevel;

      const newWidth = Math.max(200, resizeStart.width + deltaX);
      const newHeight = Math.max(150, resizeStart.height + deltaY);

      updateGroup(group.id, {
        size: { width: newWidth, height: newHeight }
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      saveToStorage();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, zoomLevel, group.id, updateGroup, saveToStorage]);

  // Focus input when editing name
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: group.size.width,
      height: group.size.height,
    });
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedGroupId(isSelected ? null : group.id);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    setEditName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (editName.trim() && editName !== group.name) {
      updateGroup(group.id, { name: editName.trim() });
      saveToStorage();
    } else {
      setEditName(group.name);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditName(group.name);
      setIsEditingName(false);
    }
  };

  const handleOpenSettings = (e) => {
    e.stopPropagation();
    setEditingGroupId(group.id);
    setGroupSettingsModalOpen(true);
  };

  const handleToggleCollapse = (e) => {
    e.stopPropagation();
    updateGroup(group.id, { collapsed: !group.collapsed });
    saveToStorage();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (cardCount > 0) {
      if (!confirm(`Delete "${group.name}"? ${cardCount} cards will become ungrouped.`)) {
        return;
      }
    }
    deleteGroup(group.id);
    saveToStorage();
  };

  const handleArrangeCards = (layout) => {
    arrangeCardsInGroup(group.id, layout);
    saveToStorage();
  };

  // Border style based on settings
  const getBorderStyle = () => {
    if (!style.showBoundary) return 'none';
    switch (style.boundaryStyle) {
      case 'solid': return `2px solid ${style.color}`;
      case 'dashed': return `2px dashed ${style.color}`;
      case 'dotted': return `2px dotted ${style.color}`;
      default: return 'none';
    }
  };

  if (group.collapsed) {
    // Collapsed view - just show header
    return (
      <motion.div
        ref={setNodeRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={springTransition}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 200,
          height: 40,
          backgroundColor: style.color,
          borderRadius: borderRadius.md,
          boxShadow: darkShadows.md,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: zIndex + (isDragging ? 1000 : 0),
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
        }}
        {...attributes}
        {...listeners}
        onClick={handleSelect}
      >
        <span style={{ color: 'white', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {group.name}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
          {cardCount}
        </span>
        <button
          onClick={handleToggleCollapse}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 4,
            padding: '2px 6px',
            cursor: 'pointer',
            color: 'white',
            fontSize: 14,
          }}
        >
          +
        </button>
      </motion.div>
    );
  }

  // Visual feedback for drop target
  const dropHighlight = isOver ? `0 0 0 4px ${style.color}, 0 0 20px ${style.color}66` : '';
  const combinedShadow = isSelected
    ? `0 0 0 3px ${style.color}`
    : isOver
      ? dropHighlight
      : darkShadows.sm;

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: isOver ? 1.02 : 1,
        boxShadow: combinedShadow,
      }}
      transition={springTransition}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: group.size.width,
        height: group.size.height,
        backgroundColor: isOver ? `${style.color}22` : bgColor,
        border: isOver ? `3px solid ${style.color}` : getBorderStyle(),
        borderRadius: borderRadius.lg,
        zIndex: zIndex + (isDragging ? 1000 : 0),
        pointerEvents: 'auto',
      }}
      onClick={handleSelect}
    >
      {/* Header */}
      {style.showHeader && (
        <div
          {...attributes}
          {...listeners}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: style.color,
            borderTopLeftRadius: borderRadius.lg - 2,
            borderTopRightRadius: borderRadius.lg - 2,
            cursor: isDragging ? 'grabbing' : 'grab',
            gap: 8,
          }}
        >
          {/* Color indicator */}
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.3)',
              border: '2px solid rgba(255,255,255,0.5)',
            }}
          />

          {/* Name */}
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 4,
                padding: '4px 8px',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                outline: 'none',
              }}
            />
          ) : (
            <span
              onDoubleClick={handleDoubleClick}
              style={{
                flex: 1,
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {group.name}
            </span>
          )}

          {/* Card count */}
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={handleOpenSettings}
              title="Settings"
              style={headerButtonStyle}
            >
              ⚙️
            </button>
            <button
              onClick={handleToggleCollapse}
              title="Collapse"
              style={headerButtonStyle}
            >
              −
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              style={headerButtonStyle}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Quick layout buttons (visible when selected) */}
      {isSelected && cardCount > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: -36,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 4,
            backgroundColor: '#2a2a2a',
            padding: '4px 8px',
            borderRadius: borderRadius.md,
            boxShadow: darkShadows.md,
          }}
        >
          <button onClick={() => handleArrangeCards('grid')} style={layoutButtonStyle} title="Grid">⊞</button>
          <button onClick={() => handleArrangeCards('line')} style={layoutButtonStyle} title="Line">═</button>
          <button onClick={() => handleArrangeCards('circle')} style={layoutButtonStyle} title="Circle">○</button>
        </div>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 20,
          height: 20,
          cursor: 'se-resize',
          background: `linear-gradient(135deg, transparent 50%, ${style.color} 50%)`,
          borderBottomRightRadius: borderRadius.lg - 2,
          opacity: isSelected ? 1 : 0.5,
        }}
      />

      {/* Drop zone indicator */}
      {!style.showHeader && (
        <div
          {...attributes}
          {...listeners}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 30,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        />
      )}
    </motion.div>
  );
};

const headerButtonStyle = {
  background: 'rgba(255,255,255,0.2)',
  border: 'none',
  borderRadius: 4,
  padding: '2px 6px',
  cursor: 'pointer',
  color: 'white',
  fontSize: 14,
  transition: 'background 0.2s',
};

const layoutButtonStyle = {
  background: '#3a3a3a',
  border: 'none',
  borderRadius: 4,
  padding: '4px 8px',
  cursor: 'pointer',
  color: '#e0e0e0',
  fontSize: 14,
  transition: 'background 0.2s',
};

export default GroupContainer;
