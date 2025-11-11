import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const LayoutGuides = () => {
  const activeLayout = useStore(state => state.activeLayout);
  const cards = useStore(state => state.cards);
  const background = useStore(state => state.background);

  if (!activeLayout || cards.length === 0) return null;

  // Smart color detection - get contrasting color based on background
  const getContrastColor = () => {
    let bgColor = background.color || '#2c3e50';

    // If background has an image, use a bright contrasting color
    if (background.image) {
      return 'rgba(255, 215, 0, 0.9)'; // Gold color for images
    }

    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // If background is dark, use bright color; if light, use dark color
    if (luminance < 0.5) {
      // Dark background - use bright cyan/yellow
      return 'rgba(0, 255, 255, 0.8)'; // Cyan
    } else {
      // Light background - use dark purple/blue
      return 'rgba(75, 0, 130, 0.8)'; // Indigo
    }
  };

  const guideColor = getContrastColor();

  const renderCircleGuide = () => {
    const centerX = 800;
    const centerY = 400;
    const radius = 300;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '2000px',
          height: '1000px',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'visible'
        }}
      >
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={guideColor}
          strokeWidth="4"
          strokeDasharray="15,10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={10}
          fill={guideColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    );
  };

  const renderLineGuide = () => {
    const padding = 100;
    const y = 400;
    const startX = padding;
    const endX = 1600 - padding;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '2000px',
          height: '1000px',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'visible'
        }}
      >
        <motion.line
          x1={startX}
          y1={y}
          x2={endX}
          y2={y}
          stroke={guideColor}
          strokeWidth="4"
          strokeDasharray="15,10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </svg>
    );
  };

  const renderCurveGuide = () => {
    const width = 1600;
    const height = 800;
    const padding = 100;
    const points = [];

    // Generate curve points
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = padding + (width - 2 * padding) * t;
      const y = height / 2 + Math.sin(t * Math.PI) * (height / 3);
      points.push(`${x},${y}`);
    }

    const pathD = `M ${points.join(' L ')}`;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '2000px',
          height: '1000px',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'visible'
        }}
      >
        <motion.path
          d={pathD}
          fill="none"
          stroke={guideColor}
          strokeWidth="4"
          strokeDasharray="15,10"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </svg>
    );
  };

  const renderGridGuide = () => {
    const cols = Math.ceil(Math.sqrt(cards.length));
    const rows = Math.ceil(cards.length / cols);
    const spacing = 50;
    const cardWidth = 300;
    const cardHeight = 200;

    const totalWidth = cols * (cardWidth + spacing);
    const totalHeight = rows * (cardHeight + spacing);
    const startX = (1600 - totalWidth) / 2;
    const startY = (800 - totalHeight) / 2;

    const gridCells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        if (index < cards.length) {
          const x = startX + col * (cardWidth + spacing);
          const y = startY + row * (cardHeight + spacing);
          gridCells.push({ x, y, key: `${row}-${col}` });
        }
      }
    }

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '2000px',
          height: '1000px',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'visible'
        }}
      >
        {gridCells.map((cell, index) => (
          <motion.rect
            key={cell.key}
            x={cell.x}
            y={cell.y}
            width={cardWidth}
            height={cardHeight}
            fill="none"
            stroke={guideColor}
            strokeWidth="3"
            strokeDasharray="15,10"
            rx="12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
          />
        ))}
      </svg>
    );
  };

  return (
    <AnimatePresence>
      {activeLayout === 'circle' && renderCircleGuide()}
      {activeLayout === 'line' && renderLineGuide()}
      {activeLayout === 'curve' && renderCurveGuide()}
      {activeLayout === 'grid' && renderGridGuide()}
    </AnimatePresence>
  );
};

export default LayoutGuides;
