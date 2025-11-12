import { create } from 'zustand';
import debounce from 'lodash.debounce';
import { savePresentation, loadPresentation } from '../utils/storage';

const useStore = create((set, get) => ({
  // State
  cards: [],
  textFields: [],
  currentCardId: 0,
  currentTextFieldId: 0,
  editingTextField: null,
  videoFiles: new Map(),
  background: {
    color: '#2c3e50',
    image: null,
    mode: 'color', // 'color', 'gradient', 'image'
    gradientColor: '#34495e',
    gradientAngle: 135,
    opacity: 0.3, // Overlay opacity for images
    blur: 0 // Blur amount in pixels (0-20)
  },
  zoomLevel: 1,
  panX: 0,
  panY: 0,
  interactionMode: 'cursor', // 'cursor' or 'hand'
  activeLayout: null, // 'circle', 'line', 'curve', 'grid', 'snake', or null
  layoutSettings: {
    strokeWidth: 4,
    color: 'rgba(0, 255, 255, 0.8)'
  },
  layoutMenuOpen: false,
  layoutMenuPosition: { x: 0, y: 0 },
  selectedOrientation: null,
  pendingFiles: [],
  isModalOpen: false,
  maximizedCard: null,
  cardBackdropOpacity: 0.9, // Opacity of backdrop when card is maximized (0-1)
  backgroundMenuOpen: false,
  isSaving: false,
  lastSaved: null,
  lastSavedFileName: null, // Track the name of the last saved file
  storageError: null,
  projectName: 'Untitled Presentation', // Default project name
  notification: null, // { message, type: 'info' | 'success' | 'warning' }

  // Actions
  addCard: (cardData) => {
    const state = get();
    const newCard = {
      id: `card-${state.currentCardId}`,
      ...cardData,
      timestamp: Date.now()
    };

    set({
      cards: [...state.cards, newCard],
      currentCardId: state.currentCardId + 1
    });

    return newCard;
  },

  // Reserve multiple card IDs upfront for batch operations
  reserveCardIds: (count) => {
    const state = get();
    const startId = state.currentCardId;
    set({ currentCardId: state.currentCardId + count });
    return Array.from({ length: count }, (_, i) => `card-${startId + i}`);
  },

  updateCard: (cardId, updates) => set((state) => ({
    cards: state.cards.map(card =>
      card.id === cardId ? { ...card, ...updates } : card
    )
  })),

  deleteCard: (cardId) => set((state) => {
    // Clean up video file reference
    const newVideoFiles = new Map(state.videoFiles);
    newVideoFiles.delete(cardId);

    return {
      cards: state.cards.filter(card => card.id !== cardId),
      videoFiles: newVideoFiles
    };
  }),

  addTextField: (textData) => {
    const state = get();
    const newTextField = {
      id: `text-${state.currentTextFieldId}`,
      ...textData,
      timestamp: Date.now()
    };

    set({
      textFields: [...state.textFields, newTextField],
      currentTextFieldId: state.currentTextFieldId + 1
    });

    return newTextField;
  },

  updateTextField: (textFieldId, updates) => set((state) => ({
    textFields: state.textFields.map(textField =>
      textField.id === textFieldId ? { ...textField, ...updates } : textField
    )
  })),

  deleteTextField: (textFieldId) => set((state) => ({
    textFields: state.textFields.filter(textField => textField.id !== textFieldId)
  })),

  setEditingTextField: (textField) => set({ editingTextField: textField }),

  setBackground: (background) => set({ background }),

  setZoom: (zoomLevel) => set({
    zoomLevel: Math.max(0.5, Math.min(3, zoomLevel))
  }),

  setPan: (panX, panY) => set({ panX, panY }),

  resetView: () => set({ zoomLevel: 1, panX: 0, panY: 0 }),

  setInteractionMode: (mode) => set({ interactionMode: mode }),

  toggleInteractionMode: () => set((state) => ({
    interactionMode: state.interactionMode === 'cursor' ? 'hand' : 'cursor'
  })),

  setActiveLayout: (layout) => set({ activeLayout: layout }),

  setLayoutSettings: (settings) => set((state) => ({
    layoutSettings: { ...state.layoutSettings, ...settings }
  })),

  setLayoutMenuOpen: (isOpen) => set({ layoutMenuOpen: isOpen }),

  setLayoutMenuPosition: (position) => set({ layoutMenuPosition: position }),

  setSelectedOrientation: (orientation) => set({ selectedOrientation: orientation }),

  setPendingFiles: (files) => set({ pendingFiles: files }),

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  setMaximizedCard: (cardId) => set({ maximizedCard: cardId }),

  setVideoFile: (cardId, file) => set((state) => {
    const newVideoFiles = new Map(state.videoFiles);
    newVideoFiles.set(cardId, file);
    return { videoFiles: newVideoFiles };
  }),

  setProjectName: (name) => set({ projectName: name }),

  setCardBackdropOpacity: (opacity) => set({ cardBackdropOpacity: opacity }),

  setBackgroundMenuOpen: (isOpen) => set({ backgroundMenuOpen: isOpen }),

  setNotification: (notification) => {
    set({ notification });
    // Auto-clear after 3 seconds
    if (notification) {
      setTimeout(() => set({ notification: null }), 3000);
    }
  },

  // Utility: Calculate optimal card size to prevent overlap
  // FINITE layouts (circle, grid): Shrink cards as more are added
  // INFINITE layouts (line, curve, snake): Keep size, extend canvas
  calculateOptimalCardSize: (cardCount, layoutType, availableSpace, minSpacing = 30) => {
    if (cardCount === 0) return { width: 300, height: 200 };

    const defaultWidth = 300;
    const defaultHeight = 200;
    let optimalWidth = defaultWidth;
    let optimalHeight = defaultHeight;

    switch (layoutType) {
      case 'circle': {
        // FINITE: Circle has fixed radius, must shrink cards
        // Dynamically increase radius slightly, but still shrink for many cards
        const baseRadius = 300;
        const maxRadius = 500; // Maximum circle size before aggressive shrinking
        const radius = Math.min(maxRadius, baseRadius + (cardCount - 5) * 10);

        // Calculate arc length per card (accounting for card diagonal)
        const cardDiagonal = Math.sqrt(defaultWidth * defaultWidth + defaultHeight * defaultHeight);
        const circumference = 2 * Math.PI * radius;
        const spacePerCard = circumference / cardCount;
        const requiredSpace = cardDiagonal + minSpacing;

        if (spacePerCard < requiredSpace) {
          // Aggressive scaling for finite circle
          const scale = Math.max(0.15, (spacePerCard - minSpacing) / cardDiagonal);
          optimalWidth = Math.round(defaultWidth * scale);
          optimalHeight = Math.round(defaultHeight * scale);
        }
        break;
      }

      case 'grid': {
        // FINITE: Grid is bounded by viewport, must shrink cards
        const cols = Math.ceil(Math.sqrt(cardCount));
        const rows = Math.ceil(cardCount / cols);
        const availableWidth = availableSpace?.width || 1600;
        const availableHeight = availableSpace?.height || 800;

        const maxCardWidth = (availableWidth - (cols + 1) * minSpacing) / cols;
        const maxCardHeight = (availableHeight - (rows + 1) * minSpacing) / rows;

        // Always shrink to fit grid
        const widthScale = maxCardWidth / defaultWidth;
        const heightScale = maxCardHeight / defaultHeight;
        const scale = Math.max(0.15, Math.min(widthScale, heightScale));

        optimalWidth = Math.round(defaultWidth * scale);
        optimalHeight = Math.round(defaultHeight * scale);
        break;
      }

      case 'line': {
        // INFINITE: Line extends horizontally, keep cards at full size
        // No vertical variation, so no overlap possible with proper spacing
        optimalWidth = defaultWidth;
        optimalHeight = defaultHeight;
        break;
      }

      case 'curve':
      case 'snake': {
        // SEMI-INFINITE: Extends horizontally but has vertical variation
        // Need to check if wave amplitude causes overlap
        const cardSpacing = 350; // Horizontal spacing
        const amplitude = layoutType === 'curve' ? 200 : 150; // Vertical wave amplitude

        // Calculate if cards would overlap considering both dimensions
        // At closest vertical approach (wave peaks), cards need enough space
        const minVerticalGap = 50; // Minimum gap between cards
        const requiredVerticalSpace = defaultHeight + minVerticalGap;

        // If wave amplitude is too small for card height, shrink cards
        if (amplitude * 2 < requiredVerticalSpace) {
          const scale = Math.max(0.5, (amplitude * 2 - minVerticalGap) / defaultHeight);
          optimalWidth = Math.round(defaultWidth * scale);
          optimalHeight = Math.round(defaultHeight * scale);
        } else {
          // Keep full size if wave has enough vertical space
          optimalWidth = defaultWidth;
          optimalHeight = defaultHeight;
        }
        break;
      }
    }

    return { width: Math.round(optimalWidth), height: Math.round(optimalHeight) };
  },

  // Layout algorithms
  arrangeInCircle: () => {
    const state = get();
    if (state.cards.length === 0) return;

    const centerX = 800; // Approximate playfield center
    const centerY = 400;

    // FINITE: Dynamic radius that grows with card count (up to max)
    const baseRadius = 300;
    const maxRadius = 500;
    const radius = Math.min(maxRadius, baseRadius + (state.cards.length - 5) * 10);
    const angleStep = (2 * Math.PI) / state.cards.length;

    // Calculate optimal size to prevent overlap
    const optimalSize = get().calculateOptimalCardSize(
      state.cards.length,
      'circle',
      { width: 1600, height: 800 }
    );

    // Check if cards were resized
    const wasResized = optimalSize.width < 300 || optimalSize.height < 200;

    const updatedCards = state.cards.map((card, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle) - optimalSize.width / 2;
      const y = centerY + radius * Math.sin(angle) - optimalSize.height / 2;

      return {
        ...card,
        position: { x, y },
        size: optimalSize // Apply optimal size
      };
    });

    set({ cards: updatedCards, activeLayout: 'circle' });

    // Show notification if cards were auto-resized
    if (wasResized) {
      get().setNotification({
        message: `${state.cards.length} cards fit in circle. Cards auto-resized - use zoom to see details.`,
        type: 'info'
      });
    }
  },

  arrangeInCurve: () => {
    const state = get();
    if (state.cards.length === 0) return;

    const height = 800;
    const padding = 100;
    const cardSpacing = 350; // Fixed spacing between cards
    const amplitude = 200; // Wave amplitude (matches calculation)

    // Calculate optimal size (may shrink if wave causes overlap)
    const optimalSize = get().calculateOptimalCardSize(
      state.cards.length,
      'curve',
      { width: 1600, height }
    );

    const wasResized = optimalSize.width < 300 || optimalSize.height < 200;

    // SEMI-INFINITE: Extend horizontally, sine wave follows
    const totalWidth = padding + (state.cards.length * cardSpacing);

    const updatedCards = state.cards.map((card, index) => {
      const x = padding + (index * cardSpacing);
      // Sine wave - 2 complete waves across all cards
      const t = index / Math.max(1, state.cards.length - 1);
      const y = height / 2 + Math.sin(t * Math.PI * 2) * amplitude - optimalSize.height / 2;

      return {
        ...card,
        position: { x, y },
        size: optimalSize
      };
    });

    set({ cards: updatedCards, activeLayout: 'curve' });

    if (wasResized) {
      get().setNotification({
        message: `Cards auto-resized for curve. Use zoom to see details.`,
        type: 'info'
      });
    } else if (state.cards.length > 5) {
      get().setNotification({
        message: `Curve extended for ${state.cards.length} cards. Use hand mode to pan.`,
        type: 'info'
      });
    }
  },

  arrangeInGrid: () => {
    const state = get();
    if (state.cards.length === 0) return;

    const cols = Math.ceil(Math.sqrt(state.cards.length));
    const rows = Math.ceil(state.cards.length / cols);
    const spacing = 50;

    // Calculate optimal size to prevent overlap
    const optimalSize = get().calculateOptimalCardSize(
      state.cards.length,
      'grid',
      { width: 1600, height: 800 }
    );

    const wasResized = optimalSize.width < 300 || optimalSize.height < 200;

    const totalWidth = cols * (optimalSize.width + spacing);
    const totalHeight = rows * (optimalSize.height + spacing);
    const startX = (1600 - totalWidth) / 2;
    const startY = (800 - totalHeight) / 2;

    const updatedCards = state.cards.map((card, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (optimalSize.width + spacing);
      const y = startY + row * (optimalSize.height + spacing);

      return {
        ...card,
        position: { x, y },
        size: optimalSize
      };
    });

    set({ cards: updatedCards, activeLayout: 'grid' });

    if (wasResized) {
      get().setNotification({
        message: `Cards auto-resized to prevent overlap. Use zoom to see details.`,
        type: 'info'
      });
    }
  },

  arrangeInLine: () => {
    const state = get();
    if (state.cards.length === 0) return;

    const height = 800;
    const padding = 100;
    const cardSpacing = 350; // Fixed spacing between cards (card width + gap)

    // Calculate optimal size (will keep full size for infinite layouts)
    const optimalSize = get().calculateOptimalCardSize(
      state.cards.length,
      'line',
      { width: 1600, height }
    );

    const wasResized = optimalSize.width < 300 || optimalSize.height < 200;

    // INFINITE: Extend horizontally as needed
    const totalWidth = padding + (state.cards.length * cardSpacing);

    const updatedCards = state.cards.map((card, index) => {
      const x = padding + (index * cardSpacing);
      const y = height / 2 - optimalSize.height / 2;

      return {
        ...card,
        position: { x, y },
        size: optimalSize
      };
    });

    set({ cards: updatedCards, activeLayout: 'line' });

    if (wasResized) {
      get().setNotification({
        message: `Cards auto-resized to prevent overlap. Use zoom to see details.`,
        type: 'info'
      });
    } else if (state.cards.length > 5) {
      get().setNotification({
        message: `Line extended for ${state.cards.length} cards. Use hand mode to pan.`,
        type: 'info'
      });
    }
  },

  arrangeInSnake: () => {
    const state = get();
    if (state.cards.length === 0) return;

    const height = 800;
    const padding = 100;
    const cardSpacing = 350; // Fixed spacing between cards
    const amplitude = 150; // Wave amplitude
    const frequency = 0.5; // Wave frequency - 0.5 means 2 cards per wave cycle

    // Calculate optimal size (will keep full size for infinite layouts)
    const optimalSize = get().calculateOptimalCardSize(
      state.cards.length,
      'snake',
      { width: 1600, height }
    );

    const wasResized = optimalSize.width < 300 || optimalSize.height < 200;

    // INFINITE: Extend horizontally with continuous snake pattern
    const totalWidth = padding + (state.cards.length * cardSpacing);

    const updatedCards = state.cards.map((card, index) => {
      const x = padding + (index * cardSpacing);

      // Continuous snake pattern based on position, not normalized
      const y = height / 2 +
        amplitude * Math.sin(index * frequency * Math.PI * 2) -
        optimalSize.height / 2;

      return {
        ...card,
        position: { x, y },
        size: optimalSize
      };
    });

    set({ cards: updatedCards, activeLayout: 'snake' });

    if (wasResized) {
      get().setNotification({
        message: `Cards auto-resized to prevent overlap. Use zoom to see details.`,
        type: 'info'
      });
    } else if (state.cards.length > 5) {
      get().setNotification({
        message: `Snake extended for ${state.cards.length} cards. Use hand mode to pan.`,
        type: 'info'
      });
    }
  },

  // Save/Load functionality
  saveToStorage: debounce(async (customFileName = null) => {
    const state = get();

    set({ isSaving: true, storageError: null });

    try {
      const data = {
        background: state.background,
        cards: state.cards.map(card => ({
          ...card,
          // Don't save video files to storage, only metadata
          mediaSrc: card.mediaType === 'video' ? null : card.mediaSrc
        })),
        textFields: state.textFields,
        zoomLevel: state.zoomLevel,
        panX: state.panX,
        panY: state.panY,
        activeLayout: state.activeLayout,
        layoutSettings: state.layoutSettings,
        timestamp: Date.now()
      };

      await savePresentation('current', data);

      set({
        isSaving: false,
        lastSaved: Date.now(),
        lastSavedFileName: customFileName || 'Auto Save',
        storageError: null
      });
    } catch (error) {
      console.error('Save failed:', error);
      set({
        isSaving: false,
        storageError: error.message
      });
    }
  }, 1000), // Debounce for 1 second

  loadFromStorage: async () => {
    try {
      const data = await loadPresentation('current');

      if (data) {
        set({
          cards: data.cards || [],
          textFields: data.textFields || [],
          background: data.background || { color: '#2c3e50', image: null },
          zoomLevel: data.zoomLevel || 1,
          panX: data.panX || 0,
          panY: data.panY || 0,
          activeLayout: data.activeLayout || null,
          layoutSettings: data.layoutSettings || { strokeWidth: 4, color: 'rgba(0, 255, 255, 0.8)' },
          currentCardId: (data.cards?.length || 0),
          currentTextFieldId: (data.textFields?.length || 0)
        });

        return true;
      }
    } catch (error) {
      console.error('Load failed:', error);
      set({ storageError: error.message });
    }

    return false;
  },

  clearAll: () => set({
    cards: [],
    textFields: [],
    currentCardId: 0,
    currentTextFieldId: 0,
    videoFiles: new Map(),
    background: { color: '#2c3e50', image: null },
    zoomLevel: 1,
    panX: 0,
    panY: 0,
    maximizedCard: null,
    lastSaved: null,
    lastSavedFileName: null,
    storageError: null
  })
}));

export default useStore;
