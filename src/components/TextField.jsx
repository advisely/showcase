import { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const TextField = ({ textField, zIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(textField.text);
  const inputRef = useRef(null);
  const interactionMode = useStore(state => state.interactionMode);
  const zoomLevel = useStore(state => state.zoomLevel);
  const updateTextField = useStore(state => state.updateTextField);
  const deleteTextField = useStore(state => state.deleteTextField);
  const setEditingTextField = useStore(state => state.setEditingTextField);
  const saveToStorage = useStore(state => state.saveToStorage);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: textField.id,
    data: textField,
    disabled: interactionMode !== 'cursor' || isEditing
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (interactionMode === 'cursor' && !isEditing && !isDragging) {
      // Single click: Edit text content
      setIsEditing(true);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (interactionMode === 'cursor') {
      // Double click: Open style properties menu
      setEditingTextField(textField);
      // Trigger opening the expression menu (will be handled by the parent)
      window.dispatchEvent(new CustomEvent('openExpressionMenu'));
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editText !== textField.text) {
      updateTextField(textField.id, { text: editText });
      saveToStorage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditText(textField.text);
      setIsEditing(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteTextField(textField.id);
    saveToStorage();
  };

  // Base position (canvas coordinates)
  const baseX = textField.position?.x || 0;
  const baseY = textField.position?.y || 0;

  // Drag offset needs to be scaled down to canvas coordinates for proper cursor tracking
  // When parent is scaled by zoomLevel, moving X screen pixels requires X/zoomLevel canvas pixels
  const dragOffsetX = (transform?.x || 0) / zoomLevel;
  const dragOffsetY = (transform?.y || 0) / zoomLevel;

  const x = baseX + dragOffsetX;
  const y = baseY + dragOffsetY;

  const style = {
    position: 'absolute',
    left: x + 'px',
    top: y + 'px',
    zIndex: isDragging ? 1000 : zIndex,
    cursor: interactionMode === 'cursor' ? (isDragging ? 'grabbing' : 'move') : 'default',
    padding: '8px 12px',
    minWidth: '100px',
    userSelect: isEditing ? 'text' : 'none',
    transition: isDragging ? 'none' : 'left 0.2s, top 0.2s',
    pointerEvents: interactionMode === 'hand' ? 'none' : 'auto'
  };

  const textStyle = {
    fontFamily: textField.font,
    fontSize: `${textField.fontSize}px`,
    color: textField.color,
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={!isEditing && interactionMode === 'cursor' ? { scale: 1.02 } : {}}
    >
      {/* Delete button */}
      <button
        className="card-delete"
        onClick={handleDelete}
        style={{
          opacity: isEditing ? 0 : undefined,
          pointerEvents: isEditing ? 'none' : 'auto'
        }}
        title="Delete text field"
      >
        ×
      </button>

      {isEditing ? (
        <textarea
          ref={inputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            ...textStyle,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid #667eea',
            borderRadius: '4px',
            padding: '8px',
            outline: 'none',
            resize: 'both',
            minWidth: '200px',
            minHeight: '60px',
            width: '100%'
          }}
          rows={3}
        />
      ) : (
        <div
          style={{
            ...textStyle,
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '4px',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {textField.text}
        </div>
      )}
    </motion.div>
  );
};

export default TextField;
