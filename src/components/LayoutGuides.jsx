import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const LayoutGuides = () => {
  const activeLayout = useStore(state => state.activeLayout);
  const cards = useStore(state => state.cards);
  const background = useStore(state => state.background);
  const layoutSettings = useStore(state => state.layoutSettings);
  const setLayoutMenuOpen = useStore(state => state.setLayoutMenuOpen);
  const setLayoutMenuPosition = useStore(state => state.setLayoutMenuPosition);

  if (!activeLayout || cards.length === 0) return null;

  // Smart color detection - get contrasting color based on background
  const getContrastColor = () => {
    // Use custom color from settings if available
    if (layoutSettings.color) {
      return layoutSettings.color;
    }

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
  const strokeWidth = layoutSettings.strokeWidth || 4;

  // Handle guide click to open customization menu
  const handleGuideClick = (e) => {
    e.stopPropagation();
    setLayoutMenuPosition({ x: e.clientX, y: e.clientY });
    setLayoutMenuOpen(true);
  };

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
          pointerEvents: 'auto',
          zIndex: 1,
          overflow: 'visible',
          cursor: 'pointer'
        }}
        onClick={handleGuideClick}
      >
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={guideColor}
          strokeWidth={strokeWidth}
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
    // DYNAMIC: Calculate bounds from actual card positions
    const margin = 100;

    // Find min/max X and average Y from cards
    const minX = Math.min(...cards.map(c => c.position?.x || 0));
    const maxX = Math.max(...cards.map(c => (c.position?.x || 0) + (c.size?.width || 300)));
    const avgY = cards.reduce((sum, c) => sum + ((c.position?.y || 0) + ((c.size?.height || 200) / 2)), 0) / cards.length;

    const startX = minX - margin;
    const endX = maxX + margin;
    const y = avgY;

    // Dynamically size SVG to cover all cards
    const svgWidth = endX - startX + margin * 2;
    const svgHeight = 1000; // Keep height fixed for vertical range

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: startX - margin,
          width: `${svgWidth}px`,
          height: `${svgHeight}px`,
          pointerEvents: 'auto',
          zIndex: 1,
          overflow: 'visible',
          cursor: 'pointer'
        }}
        onClick={handleGuideClick}
      >
        <motion.line
          x1={margin}
          y1={y}
          x2={svgWidth - margin}
          y2={y}
          stroke={guideColor}
          strokeWidth={strokeWidth}
          strokeDasharray="15,10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        {/* Start marker - circle */}
        <motion.circle
          cx={margin}
          cy={y}
          r={8}
          fill={guideColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
        {/* End marker - X */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <line
            x1={svgWidth - margin - 10}
            y1={y - 10}
            x2={svgWidth - margin + 10}
            y2={y + 10}
            stroke={guideColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={svgWidth - margin + 10}
            y1={y - 10}
            x2={svgWidth - margin - 10}
            y2={y + 10}
            stroke={guideColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    );
  };

  const renderCurveGuide = () => {
    // DYNAMIC: Calculate bounds from actual card positions
    const margin = 100;
    const amplitude = 200; // Must match store's arrangeInCurve amplitude

    // Find min/max X and average Y from cards
    const minX = Math.min(...cards.map(c => c.position?.x || 0));
    const maxX = Math.max(...cards.map(c => (c.position?.x || 0) + (c.size?.width || 300)));
    const avgY = cards.reduce((sum, c) => sum + ((c.position?.y || 0) + ((c.size?.height || 200) / 2)), 0) / cards.length;

    const startX = minX - margin;
    const endX = maxX + margin;
    const totalWidth = endX - startX;

    // Generate curve points dynamically across actual card span
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = margin + totalWidth * t;
      const y = avgY + Math.sin(t * Math.PI * 2) * amplitude;
      points.push(`${x},${y}`);
    }

    const pathD = `M ${points.join(' L ')}`;

    // Start and end markers
    const startMarkerX = margin;
    const startMarkerY = avgY;
    const endMarkerX = margin + totalWidth;
    const endMarkerY = avgY;

    const svgWidth = totalWidth + margin * 2;
    const svgHeight = 1000;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: startX - margin,
          width: `${svgWidth}px`,
          height: `${svgHeight}px`,
          pointerEvents: 'auto',
          zIndex: 1,
          overflow: 'visible',
          cursor: 'pointer'
        }}
        onClick={handleGuideClick}
      >
        <motion.path
          d={pathD}
          fill="none"
          stroke={guideColor}
          strokeWidth={strokeWidth}
          strokeDasharray="15,10"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        {/* Start marker - circle */}
        <motion.circle
          cx={startMarkerX}
          cy={startMarkerY}
          r={8}
          fill={guideColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
        {/* End marker - X */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <line
            x1={endMarkerX - 10}
            y1={endMarkerY - 10}
            x2={endMarkerX + 10}
            y2={endMarkerY + 10}
            stroke={guideColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={endMarkerX + 10}
            y1={endMarkerY - 10}
            x2={endMarkerX - 10}
            y2={endMarkerY + 10}
            stroke={guideColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </motion.g>
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
          pointerEvents: 'auto',
          zIndex: 1,
          overflow: 'visible',
          cursor: 'pointer'
        }}
        onClick={handleGuideClick}
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
            strokeWidth={strokeWidth}
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

  const renderSnakeGuide = () => {
    // DYNAMIC: Calculate bounds from actual card positions
    const margin = 100;
    const amplitude = 150; // Must match store's arrangeInSnake amplitude
    const frequency = 0.5; // Must match store's snake frequency (0.5 = 2 cards per wave)

    // Find min/max X and average Y from cards
    const minX = Math.min(...cards.map(c => c.position?.x || 0));
    const maxX = Math.max(...cards.map(c => (c.position?.x || 0) + (c.size?.width || 300)));
    const avgY = cards.reduce((sum, c) => sum + ((c.position?.y || 0) + ((c.size?.height || 200) / 2)), 0) / cards.length;

    const startX = minX - margin;
    const endX = maxX + margin;
    const totalWidth = endX - startX;

    // Calculate number of points based on actual width (denser for longer paths)
    const numPoints = Math.max(100, Math.floor(totalWidth / 10));
    const points = [];

    // Generate snake pattern points - continuous wave based on position
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = margin + totalWidth * t;
      // Match the store's snake formula: index-based sine wave
      const cardIndex = (i / numPoints) * cards.length;
      const y = avgY + amplitude * Math.sin(cardIndex * frequency * Math.PI * 2);
      points.push(`${x},${y}`);
    }

    const pathD = `M ${points.join(' L ')}`;

    // Start and end markers
    const startMarkerX = margin;
    const startMarkerY = avgY;
    const endMarkerX = margin + totalWidth;
    const endMarkerY = avgY + amplitude * Math.sin((cards.length - 1) * frequency * Math.PI * 2);

    const svgWidth = totalWidth + margin * 2;
    const svgHeight = 1000;

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: startX - margin,
          width: `${svgWidth}px`,
          height: `${svgHeight}px`,
          pointerEvents: 'auto',
          zIndex: 1,
          overflow: 'visible',
          cursor: 'pointer'
        }}
        onClick={handleGuideClick}
      >
        <motion.path
          d={pathD}
          fill="none"
          stroke={guideColor}
          strokeWidth={strokeWidth}
          strokeDasharray="15,10"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
        {/* Start marker - circle */}
        <motion.circle
          cx={startMarkerX}
          cy={startMarkerY}
          r={8}
          fill={guideColor}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
        {/* End marker - X */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <line
            x1={endMarkerX - 10}
            y1={endMarkerY - 10}
            x2={endMarkerX + 10}
            y2={endMarkerY + 10}
            stroke={guideColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={endMarkerX + 10}
            y1={endMarkerY - 10}
            x2={endMarkerX - 10}
            y2={endMarkerY + 10}
            stroke={guideColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    );
  };

  return (
    <AnimatePresence>
      {activeLayout === 'circle' && renderCircleGuide()}
      {activeLayout === 'line' && renderLineGuide()}
      {activeLayout === 'curve' && renderCurveGuide()}
      {activeLayout === 'grid' && renderGridGuide()}
      {activeLayout === 'snake' && renderSnakeGuide()}
    </AnimatePresence>
  );
};

export default LayoutGuides;
