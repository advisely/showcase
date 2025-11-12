/**
 * Utility functions for positioning and collision detection
 */

/**
 * Check if two rectangles overlap
 */
export const rectanglesOverlap = (rect1, rect2, buffer = 10) => {
  return !(
    rect1.x + rect1.width + buffer < rect2.x ||
    rect2.x + rect2.width + buffer < rect1.x ||
    rect1.y + rect1.height + buffer < rect2.y ||
    rect2.y + rect2.height + buffer < rect1.y
  );
};

/**
 * Check if a position overlaps with any existing cards
 */
export const isPositionOccupied = (position, size, cards, buffer = 10) => {
  const newRect = {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height
  };

  return cards.some(card => {
    const existingRect = {
      x: card.position?.x || 0,
      y: card.position?.y || 0,
      width: card.size?.width || 300,
      height: card.size?.height || 200
    };

    return rectanglesOverlap(newRect, existingRect, buffer);
  });
};

/**
 * Find a non-overlapping position near the target position
 * Uses a spiral pattern to search outward from the target
 */
export const findNonOverlappingPosition = (targetPosition, size, cards, maxAttempts = 50) => {
  // If no cards exist, use target position
  if (cards.length === 0) {
    return targetPosition;
  }

  // Check if target position is already free
  if (!isPositionOccupied(targetPosition, size, cards)) {
    return targetPosition;
  }

  // Search in a spiral pattern
  const step = Math.max(size.width, size.height) / 2; // Half card size
  let angle = 0;
  let radius = step;

  for (let i = 0; i < maxAttempts; i++) {
    // Calculate position in spiral
    const x = targetPosition.x + Math.cos(angle) * radius;
    const y = targetPosition.y + Math.sin(angle) * radius;

    const testPosition = { x, y };

    // Check if this position is free
    if (!isPositionOccupied(testPosition, size, cards)) {
      return testPosition;
    }

    // Move to next position in spiral
    angle += Math.PI / 4; // 45 degree increments
    if (angle >= 2 * Math.PI) {
      angle = 0;
      radius += step; // Expand spiral
    }
  }

  // If no free position found, offset significantly from target
  return {
    x: targetPosition.x + size.width + 50,
    y: targetPosition.y
  };
};

/**
 * Calculate smart positions for multiple cards to avoid overlap
 */
export const calculatePositionsForMultipleCards = (count, basePosition, size, cards) => {
  console.log('[calculatePositionsForMultipleCards] Called with:', {
    count,
    basePosition,
    size,
    cardsCount: cards.length
  });

  const positions = [];
  let currentPosition = { ...basePosition };

  for (let i = 0; i < count; i++) {
    // Create a temporary cards array that includes both existing cards and already-calculated positions
    const tempCards = [
      ...cards,
      ...positions.map((pos, idx) => ({
        position: pos,
        size,
        id: `temp-${idx}`
      }))
    ];

    console.log(`[calculatePositionsForMultipleCards] Finding position for card ${i}:`, {
      currentPosition,
      tempCardsCount: tempCards.length
    });

    // Find non-overlapping position
    const freePosition = findNonOverlappingPosition(
      currentPosition,
      size,
      tempCards
    );

    console.log(`[calculatePositionsForMultipleCards] Found position for card ${i}:`, freePosition);

    positions.push(freePosition);

    // Next card starts offset from this one
    currentPosition = {
      x: freePosition.x + 50,
      y: freePosition.y + 50
    };
  }

  console.log('[calculatePositionsForMultipleCards] Final positions:', positions);
  return positions;
};
